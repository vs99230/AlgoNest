from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.models.schemas import ProblemDetail, ProblemSummary

router = APIRouter(prefix="/problems", tags=["problems"])


@router.get("", response_model=list[ProblemSummary])
async def list_problems(db: AsyncIOMotorDatabase = Depends(get_database)):
    cursor = db.problems.find({}, sort=[("id", 1)])
    return [
        ProblemSummary(
            id=doc["id"],
            slug=doc["slug"],
            title=doc["title"],
            difficulty=doc["difficulty"],
            tags=doc["tags"],
            acceptance=doc["acceptance"],
        )
        async for doc in cursor
    ]


@router.get("/{slug}", response_model=ProblemDetail)
async def get_problem(slug: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    doc = await db.problems.find_one({"slug": slug})
    if doc is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Problem not found.")
    return ProblemDetail(**{k: v for k, v in doc.items() if k != "_id"})
