from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.deps import get_current_user
from app.judge.simple_judge import judge_run, judge_submit
from app.models.common import now_utc
from app.models.schemas import RunResult, RunSubmitRequest, SubmitResult

router = APIRouter(prefix="/problems", tags=["submissions"])


async def _get_problem_or_404(db: AsyncIOMotorDatabase, slug: str) -> dict:
    problem = await db.problems.find_one({"slug": slug})
    if problem is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Problem not found.")
    return problem


@router.post("/{slug}/run", response_model=RunResult)
async def run_code(
    slug: str,
    payload: RunSubmitRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Running code does not require login (matches the frontend: Run works for
    guests, only Submit prompts a login modal) and is never persisted."""
    problem = await _get_problem_or_404(db, slug)
    result = await judge_run(problem, payload.language, payload.code)
    return RunResult(**result)


@router.post("/{slug}/submit", response_model=SubmitResult)
async def submit_code(
    slug: str,
    payload: RunSubmitRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: dict = Depends(get_current_user),
):
    problem = await _get_problem_or_404(db, slug)
    result = await judge_submit(problem, payload.language, payload.code)

    await db.submissions.insert_one(
        {
            "userId": user["_id"],
            "problemSlug": slug,
            "status": result["status"],
            "language": payload.language,
            "runtimeMs": result["runtimeMs"],
            "memoryMb": result["memoryMb"],
            "submittedAt": now_utc(),
        }
    )

    return SubmitResult(**result)
