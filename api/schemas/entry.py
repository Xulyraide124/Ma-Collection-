from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from schemas.item import ItemRead

Statut = Literal["a_decouvrir", "en_cours", "termine"]


class EntryCreate(BaseModel):
    item_id: int
    statut: Statut
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=1000)


class EntryUpdate(BaseModel):
    statut: Statut | None = None
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = Field(default=None, max_length=1000)


class EntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    statut: Statut
    note: int | None
    commentaire: str | None
    date_ajout: datetime
    item: ItemRead


class StatsRead(BaseModel):
    total: int
    par_statut: dict[str, int]
    note_moyenne: float | None