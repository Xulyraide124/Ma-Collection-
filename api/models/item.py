from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titre: str = Field(index=True, unique=True)
    categorie: str = Field(index=True)
    description: str
    image_url: str
    annee: int
    auteur: str
    nb_pages: int