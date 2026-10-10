# API Ma Collection

API REST FastAPI (accès asynchrone, SQLModel, PostgreSQL via asyncpg). La procédure de lancement complète est dans le [README racine](../README.md).

## Lancement rapide

```bash
python -m venv .venv
# activer le venv, puis :
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

Documentation interactive : http://localhost:8000/docs

## Structure

```
api/
├── main.py            # assemblage de l'application (aucune route)
├── seed.py            # peuplement idempotent du catalogue
├── books_data.py      # les 50 livres du catalogue
├── core/              # configuration (.env), sécurité (bcrypt, JWT), handlers d'erreur
├── db/                # engine asynchrone, session (dépendance avec yield), création des tables
├── models/            # tables SQLModel : User, Item, CollectionEntry
├── schemas/           # schémas Pydantic d'entrée et de sortie
├── dependencies/      # get_current_user, pagination
└── routers/           # auth, items, collection
```

## Routes

| Méthode | Route | Description | Codes |
|---|---|---|---|
| POST | `/auth/register` | Créer un compte | 201, 409, 422 |
| POST | `/auth/login` | Se connecter, reçoit un token | 200, 401 |
| GET | `/auth/me` | Utilisateur courant | 200, 401 |
| GET | `/items` | Catalogue : `q` (2 caractères min.), `categorie`, `page`, `limit` (1 à 50) | 200, 422 |
| GET | `/items/{item_id}` | Fiche d'un livre | 200, 404 |
| GET | `/me/collection` | Ma collection : `statut`, `tri` (date ou note) | 200, 401 |
| POST | `/me/collection` | Ajouter un livre | 201, 401, 404, 409 |
| PATCH | `/me/collection/{entry_id}` | Modifier une entrée | 200, 401, 404 |
| DELETE | `/me/collection/{entry_id}` | Retirer une entrée | 204, 401, 404 |
| GET | `/me/stats` | Total, répartition par statut, note moyenne | 200, 401 |

Les routes `/me/*` exigent l'en-tête `Authorization: Bearer <token>`.

Toutes les erreurs ont le même format :

```json
{ "erreur": { "code": 404, "message": "Item introuvable" } }
```

## Points techniques

- **Session de base** : `get_session` ouvre et ferme la session avec `yield`. `get_current_user` dépend de `get_session` (dépendance imbriquée).
- **Idempotence du seed** : seuls les titres absents de la base sont insérés ; la colonne `titre` est aussi unique.
- **Doublon de collection** : contrôle explicite (409) et contrainte unique `(user_id, item_id)` en base.
- **Propriétaire** : chaque requête sur une entrée filtre sur `user_id`. Une entrée appartenant à un autre utilisateur renvoie 404.
- **Schémas** : le hash du mot de passe n'apparaît dans aucun `response_model`.
- **CORS** : uniquement `http://localhost:5173`.
