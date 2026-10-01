from pydantic import BaseModel, ConfigDict


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titre: str
    categorie: str
    description: str
    image_url: str
    annee: int
    auteur: str
    nb_pages: int


class ItemPage(BaseModel):
    total: int
    page: int
    limit: int
    results: list[ItemRead]