from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.session import get_session
from dependencies.pagination import Pagination, get_pagination
from models.item import Item
from schemas.item import ItemPage, ItemRead

router = APIRouter(prefix="/items", tags=["catalogue"])


@router.get(
    "",
    response_model=ItemPage,
    summary="Lister et rechercher les livres du catalogue",
    responses={422: {"description": "Paramètres invalides"}},
)
async def list_items(
    q: str | None = Query(None, min_length=2, description="Mot-clé (titre, auteur, description)"),
    categorie: str | None = Query(None, description="Filtrer par catégorie"),
    pagination: Pagination = Depends(get_pagination),
    session: AsyncSession = Depends(get_session),
) -> ItemPage:
    filtres = []
    if q:
        motif = f"%{q}%"
        filtres.append(
            or_(
                Item.titre.ilike(motif),
                Item.auteur.ilike(motif),
                Item.description.ilike(motif),
            )
        )
    if categorie:
        filtres.append(Item.categorie == categorie)

    total = await session.scalar(select(func.count()).select_from(Item).where(*filtres))
    result = await session.execute(
        select(Item)
        .where(*filtres)
        .order_by(Item.titre)
        .offset(pagination.offset)
        .limit(pagination.limit)
    )
    return ItemPage(
        total=total or 0,
        page=pagination.page,
        limit=pagination.limit,
        results=[ItemRead.model_validate(i) for i in result.scalars().all()],
    )


@router.get(
    "/{item_id}",
    response_model=ItemRead,
    summary="Fiche détaillée d'un livre",
    responses={404: {"description": "Item introuvable"}},
)
async def get_item(
    item_id: int, session: AsyncSession = Depends(get_session)
) -> Item:
    item = await session.get(Item, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item introuvable")
    return item