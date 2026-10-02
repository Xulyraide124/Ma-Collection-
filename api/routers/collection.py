from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import col

from db.session import get_session
from dependencies.auth import get_current_user
from models.entry import CollectionEntry
from models.item import Item
from models.user import User
from schemas.entry import EntryCreate, EntryRead, EntryUpdate, Statut, StatsRead

router = APIRouter(prefix="/me", tags=["collection"])

STATUTS: tuple[str, ...] = ("a_decouvrir", "en_cours", "termine")


async def _get_owned_entry(
    session: AsyncSession, entry_id: int, user_id: int
) -> CollectionEntry:
    """Récupère une entrée uniquement si elle appartient à l'utilisateur."""
    result = await session.execute(
        select(CollectionEntry)
        .where(CollectionEntry.id == entry_id, CollectionEntry.user_id == user_id)
        .execution_options(populate_existing=True)
    )
    entry = result.scalar_one_or_none()
    if entry is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Entrée introuvable")
    return entry


@router.get(
    "/collection",
    response_model=list[EntryRead],
    summary="Lister ma collection",
    responses={401: {"description": "Non authentifié"}},
)
async def list_collection(
    statut: Statut | None = Query(None, description="Filtrer par statut"),
    tri: Literal["date", "note"] = Query("date", description="Tri : date d'ajout ou note"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CollectionEntry]:
    stmt = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)
    if statut:
        stmt = stmt.where(CollectionEntry.statut == statut)
    if tri == "note":
        stmt = stmt.order_by(col(CollectionEntry.note).desc().nulls_last(), CollectionEntry.id)
    else:
        stmt = stmt.order_by(col(CollectionEntry.date_ajout).desc())
    result = await session.execute(stmt)
    return list(result.scalars().all())


@router.post(
    "/collection",
    response_model=EntryRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter un livre à ma collection",
    responses={
        401: {"description": "Non authentifié"},
        404: {"description": "Item inexistant"},
        409: {"description": "Item déjà présent dans la collection"},
    },
)
async def add_entry(
    data: EntryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CollectionEntry:
    if await session.get(Item, data.item_id) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item introuvable")

    deja = await session.execute(
        select(CollectionEntry.id).where(
            CollectionEntry.user_id == current_user.id,
            CollectionEntry.item_id == data.item_id,
        )
    )
    if deja.first() is not None:
        raise HTTPException(status.HTTP_409_CONFLICT, "Déjà dans votre collection")

    entry = CollectionEntry(user_id=current_user.id, **data.model_dump())
    session.add(entry)
    try:
        await session.commit()
    except IntegrityError:
        await session.rollback()
        raise HTTPException(status.HTTP_409_CONFLICT, "Déjà dans votre collection")
    return await _get_owned_entry(session, entry.id, current_user.id)


@router.patch(
    "/collection/{entry_id}",
    response_model=EntryRead,
    summary="Modifier une entrée de ma collection",
    responses={401: {"description": "Non authentifié"}, 404: {"description": "Entrée introuvable"}},
)
async def update_entry(
    entry_id: int,
    data: EntryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CollectionEntry:
    entry = await _get_owned_entry(session, entry_id, current_user.id)
    changes = data.model_dump(exclude_unset=True)
    if changes.get("statut") is None:
        changes.pop("statut", None)
    for champ, valeur in changes.items():
        setattr(entry, champ, valeur)
    session.add(entry)
    await session.commit()
    return await _get_owned_entry(session, entry_id, current_user.id)


@router.delete(
    "/collection/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une entrée de ma collection",
    responses={401: {"description": "Non authentifié"}, 404: {"description": "Entrée introuvable"}},
)
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    entry = await _get_owned_entry(session, entry_id, current_user.id)
    await session.delete(entry)
    await session.commit()


@router.get(
    "/stats",
    response_model=StatsRead,
    summary="Statistiques de ma collection",
    responses={401: {"description": "Non authentifié"}},
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StatsRead:
    rows = await session.execute(
        select(CollectionEntry.statut, func.count())
        .where(CollectionEntry.user_id == current_user.id)
        .group_by(CollectionEntry.statut)
    )
    par_statut: dict[str, int] = {s: 0 for s in STATUTS}
    par_statut.update({statut: nb for statut, nb in rows.all()})

    moyenne = await session.scalar(
        select(func.avg(CollectionEntry.note)).where(CollectionEntry.user_id == current_user.id)
    )
    return StatsRead(
        total=sum(par_statut.values()),
        par_statut=par_statut,
        note_moyenne=round(float(moyenne), 2) if moyenne is not None else None,
    )