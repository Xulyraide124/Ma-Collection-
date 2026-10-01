# models/entry.py
from datetime import datetime, timezone

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

from models.item import Item


class CollectionEntry(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "item_id"),)

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    item_id: int = Field(foreign_key="item.id")
    statut: str = "a_decouvrir"
    note: int | None = Field(default=None, ge=1, le=5)
    commentaire: str | None = None
    date_ajout: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    item: Item = Relationship(sa_relationship_kwargs={"lazy": "selectin"})