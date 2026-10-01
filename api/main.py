from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from core.exceptions import register_exception_handlers
from routers import auth,items


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  
from db.session import init_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    await init_db()
    yield


app = FastAPI(title="Ma Collection", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)
app.include_router(auth.router)
app.include_router(items.router)