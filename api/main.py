from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, items, collection

app = FastAPI(title="Ma Collection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(collection.router)