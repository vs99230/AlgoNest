from collections import defaultdict

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.constants import DIFFICULTIES, POINTS
from app.core.database import get_database
from app.core.deps import get_current_user, get_optional_user
from app.core.streak import calculate_streaks, to_date_key
from app.models.common import to_epoch_ms
from app.models.schemas import (
    DifficultyCounts,
    LeaderboardRow,
    ProfileResponse,
    ProfileStats,
    RecentSubmission,
    StreakInfo,
    UserOut,
)

router = APIRouter(tags=["users"])


async def _accepted_slugs_for_user(db: AsyncIOMotorDatabase, user_id) -> set[str]:
    cursor = db.submissions.find({"userId": user_id, "status": "Accepted"}, {"problemSlug": 1})
    return {doc["problemSlug"] async for doc in cursor}


async def _build_stats(db: AsyncIOMotorDatabase, user_id) -> ProfileStats:
    solved_slugs = await _accepted_slugs_for_user(db, user_id)

    solved = {level: 0 for level in DIFFICULTIES}
    totals = {level: 0 for level in DIFFICULTIES}

    async for problem in db.problems.find({}, {"slug": 1, "difficulty": 1}):
        difficulty = problem["difficulty"]
        if difficulty not in totals:
            continue
        totals[difficulty] += 1
        if problem["slug"] in solved_slugs:
            solved[difficulty] += 1

    total_solved = sum(solved.values())
    total_problems = sum(totals.values())
    points = sum(solved[level] * POINTS[level] for level in DIFFICULTIES)

    return ProfileStats(
        solved=DifficultyCounts(**solved),
        totals=DifficultyCounts(**totals),
        totalSolved=total_solved,
        totalProblems=total_problems,
        points=points,
    )


async def _points_and_solved_count(db: AsyncIOMotorDatabase, user_id) -> tuple[int, int]:
    """Cheaper variant of _build_stats for the leaderboard, which needs only the
    two numbers (not the full per-difficulty breakdown) for every user."""
    solved_slugs = await _accepted_slugs_for_user(db, user_id)
    if not solved_slugs:
        return 0, 0

    points = 0
    async for problem in db.problems.find({"slug": {"$in": list(solved_slugs)}}, {"difficulty": 1}):
        points += POINTS.get(problem["difficulty"], 0)
    return points, len(solved_slugs)


@router.get("/users/me/solved", response_model=list[str])
async def get_solved(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: dict = Depends(get_current_user),
):
    slugs = await _accepted_slugs_for_user(db, user["_id"])
    return sorted(slugs)


@router.get("/users/me/profile", response_model=ProfileResponse)
async def get_profile(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user: dict = Depends(get_current_user),
):
    stats = await _build_stats(db, user["_id"])

    submissions_cursor = db.submissions.find({"userId": user["_id"]}, sort=[("submittedAt", -1)])
    submissions = [doc async for doc in submissions_cursor]

    activity: dict[str, int] = defaultdict(int)
    for submission in submissions:
        activity[to_date_key(submission["submittedAt"])] += 1

    streak = calculate_streaks(list(activity.keys()))

    recent = submissions[:8]
    slugs_needed = {s["problemSlug"] for s in recent}
    titles: dict[str, str] = {}
    if slugs_needed:
        async for problem in db.problems.find({"slug": {"$in": list(slugs_needed)}}, {"slug": 1, "title": 1}):
            titles[problem["slug"]] = problem["title"]

    recent_submissions = [
        RecentSubmission(
            id=str(s["_id"]),
            problemSlug=s["problemSlug"],
            problemTitle=titles.get(s["problemSlug"], s["problemSlug"]),
            status=s["status"],
            language=s["language"],
            runtimeMs=s["runtimeMs"],
            memoryMb=s["memoryMb"],
            submittedAt=to_epoch_ms(s["submittedAt"]),
        )
        for s in recent
    ]

    return ProfileResponse(
        user=UserOut(
            id=str(user["_id"]),
            username=user["username"],
            email=user["email"],
            joinedAt=to_epoch_ms(user["joinedAt"]),
        ),
        stats=stats,
        streak=StreakInfo(**streak),
        activity=dict(activity),
        recentSubmissions=recent_submissions,
    )


@router.get("/leaderboard", response_model=list[LeaderboardRow])
async def get_leaderboard(
    db: AsyncIOMotorDatabase = Depends(get_database),
    current_user: dict | None = Depends(get_optional_user),
):
    # Per-user queries in a loop — fine for a classroom/demo-sized user base.
    # If this ever needs to scale, replace this function with a single
    # aggregation pipeline (submissions -> group by userId -> lookup problems).
    rows = []
    async for u in db.users.find({}, {"username": 1}):
        points, solved_count = await _points_and_solved_count(db, u["_id"])
        solved_slugs = await _accepted_slugs_for_user(db, u["_id"])
        activity_keys = set()
        async for s in db.submissions.find({"userId": u["_id"], "status": "Accepted"}, {"submittedAt": 1}):
            activity_keys.add(to_date_key(s["submittedAt"]))
        streak = calculate_streaks(list(activity_keys))

        rows.append(
            {
                "username": u["username"],
                "solved": solved_count,
                "points": points,
                "streak": streak["current"],
                "isYou": bool(current_user and u["_id"] == current_user["_id"]),
            }
        )

    rows.sort(key=lambda r: (-r["points"], -r["solved"], r["username"]))

    result: list[LeaderboardRow] = []
    current_rank = 0
    for index, row in enumerate(rows):
        if index == 0 or row["points"] != rows[index - 1]["points"]:
            current_rank = index + 1
        result.append(LeaderboardRow(rank=current_rank, **row))

    return result
