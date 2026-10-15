from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import close_mongo_connection, connect_to_mongo, get_database
from app.routers import auth, problems, submissions, users


async def _ensure_indexes() -> None:
    db = get_database()
    await db.users.create_index("email", unique=True)
    await db.users.create_index("username", unique=True)
    await db.problems.create_index("slug", unique=True)
    await db.problems.create_index("id", unique=True)
    await db.submissions.create_index([("userId", 1), ("status", 1)])
    await db.submissions.create_index([("userId", 1), ("submittedAt", -1)])


@asynccontextmanager
async def lifespan(app: FastAPI):
    connect_to_mongo()
    await _ensure_indexes()
    yield
    close_mongo_connection()


app = FastAPI(title="AlgoNest API", version="1.0.0", lifespan=lifespan)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(problems.router, prefix="/api")
app.include_router(submissions.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
