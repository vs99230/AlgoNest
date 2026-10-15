"""Pydantic request/response schemas. Response shapes match exactly what the
AlgoNest frontend's src/services/*.js files expect (the documented contract
above each service function there)."""

from pydantic import BaseModel, EmailStr, Field


# ---------- Auth ----------

class SignupRequest(BaseModel):
    username: str = Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    username: str
    email: str
    joinedAt: int  # epoch ms


class AuthResponse(BaseModel):
    token: str
    user: UserOut


# ---------- Problems ----------

class ProblemSummary(BaseModel):
    id: int
    slug: str
    title: str
    difficulty: str
    tags: list[str]
    acceptance: float


class ProblemExample(BaseModel):
    input: str
    output: str
    explanation: str | None = None


class ProblemDetail(ProblemSummary):
    description: list[str]
    examples: list[ProblemExample]
    constraints: list[str]
    starterCode: dict[str, str]


# ---------- Submissions ----------

class RunSubmitRequest(BaseModel):
    language: str
    code: str = Field(min_length=1, max_length=20_000)


class CaseResult(BaseModel):
    input: str
    expected: str
    output: str
    passed: bool


class RunResult(BaseModel):
    status: str
    runtimeMs: int
    memoryMb: float
    cases: list[CaseResult]
    error: str | None = None


class SubmitResult(BaseModel):
    status: str
    runtimeMs: int
    memoryMb: float
    passed: int
    total: int
    language: str
    error: str | None = None


class RecentSubmission(BaseModel):
    id: str
    problemSlug: str
    problemTitle: str
    status: str
    language: str
    runtimeMs: int
    memoryMb: float
    submittedAt: int  # epoch ms


# ---------- Profile / Leaderboard ----------

class DifficultyCounts(BaseModel):
    Easy: int
    Medium: int
    Hard: int


class ProfileStats(BaseModel):
    solved: DifficultyCounts
    totals: DifficultyCounts
    totalSolved: int
    totalProblems: int
    points: int


class StreakInfo(BaseModel):
    current: int
    longest: int


class ProfileResponse(BaseModel):
    user: UserOut
    stats: ProfileStats
    streak: StreakInfo
    activity: dict[str, int]  # "YYYY-MM-DD" -> submission count
    recentSubmissions: list[RecentSubmission]


class LeaderboardRow(BaseModel):
    rank: int
    username: str
    solved: int
    points: int
    streak: int
    isYou: bool | None = None


class ErrorResponse(BaseModel):
    detail: str
