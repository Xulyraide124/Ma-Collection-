import asyncio
import json
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from sqlalchemy import select

import models  # noqa: F401
from books_data import BOOKS
from db.session import SessionLocal, init_db
from models.item import Item


def _get_cover_url(titre: str) -> str:
    """Cherche la couverture via Open Library, sinon retourne une image par défaut."""
    try:
        url = f"https://openlibrary.org/search.json?q={quote_plus(titre)}&limit=1"
        req = Request(url, headers={"User-Agent": "MaCollection/1.0"})
        with urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode("utf-8"))
            docs = data.get("docs", [])
            if docs and "cover_i" in docs[0]:
                return f"https://covers.openlibrary.org/b/id/{docs[0]['cover_i']}-L.jpg"
    except (OSError, ValueError):
        pass
    return f"https://placehold.co/300x450?text={quote_plus(titre)}"


async def seed() -> None:
    await init_db()
    async with SessionLocal() as session:
        result = await session.execute(select(Item.titre))
        existants: set[str] = set(result.scalars().all())

        nouveaux: list[Item] = []
        for b in BOOKS:
            if b["titre"] in existants:
                continue
            livre = {**b, "image_url": _get_cover_url(str(b["titre"]))}
            nouveaux.append(Item(**livre))

        session.add_all(nouveaux)
        await session.commit()
    print(f"{len(nouveaux)} livre(s) ajouté(s), {len(existants)} déjà présent(s).")


if __name__ == "__main__":
    asyncio.run(seed())