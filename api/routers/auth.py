from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from core.security import create_access_token, hash_password, verify_password
from db.session import get_session
from dependencies.auth import get_current_user
from models.user import User
from schemas.user import Token, UserCreate, UserLogin, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un compte",
    responses={409: {"description": "Email déjà utilisé"}},
)
async def register(
    data: UserCreate, session: AsyncSession = Depends(get_session)
) -> User:
    email = data.email.lower()
    existant = await session.execute(select(User).where(User.email == email))
    if existant.scalar_one_or_none() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Email déjà utilisé")

    user = User(email=email, hashed_password=hash_password(data.password))
    session.add(user)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Email déjà utilisé")
    await session.refresh(user)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Se connecter",
    responses={401: {"description": "Identifiants invalides"}},
)
async def login(
    data: UserLogin, session: AsyncSession = Depends(get_session)
) -> Token:
    result = await session.execute(
        select(User).where(User.email == data.email.lower())
    )
    user = result.scalar_one_or_none()
    if user is None or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identifiants invalides")
    return Token(access_token=create_access_token(user.id))


@router.get(
    "/me",
    response_model=UserRead,
    summary="Utilisateur courant",
    responses={401: {"description": "Non authentifié"}},
)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user