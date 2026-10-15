"""Throwaway end-to-end test: boots the real FastAPI app with an in-memory
#
# Dev-only verification script (not part of the running app). Requires:
#   pip install mongomock mongomock-motor httpx
# Run from the backend/ directory: ./venv/bin/python dev/verify_endpoints.py
mongomock-motor database instead of a real MongoDB connection, seeds it with
the real problem data, and exercises every endpoint exactly as the frontend
would. Not part of the deliverable — for verification only.
"""
import asyncio
import os
import sys

os.environ.setdefault("MONGODB_URI", "mongodb://localhost:27017")
os.environ.setdefault("JWT_SECRET", "test-secret-for-local-verification-only")

from mongomock_motor import AsyncMongoMockClient

# Patch the database module BEFORE importing app.main, so every router's
# Depends(get_database) resolves to the in-memory mock.
import app.core.database as database_module

_mock_client = AsyncMongoMockClient()
_mock_db = _mock_client["algonest_test"]


def _fake_connect():
    pass


def _fake_close():
    pass


def _fake_get_database():
    return _mock_db


database_module.connect_to_mongo = _fake_connect
database_module.close_mongo_connection = _fake_close
database_module.get_database = _fake_get_database

# Also patch the name imported into deps.py / routers (they did `from
# app.core.database import get_database`, binding it at import time).
import app.core.deps as deps_module
import app.routers.auth as auth_module
import app.routers.problems as problems_module
import app.routers.submissions as submissions_module
import app.routers.users as users_module

for mod in (deps_module, auth_module, problems_module, submissions_module, users_module):
    mod.get_database = _fake_get_database

from fastapi.testclient import TestClient
from app.main import app
from app.data.problems_seed import get_seed_problems

client = TestClient(app)

failures = []


def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" -- {detail}" if detail and not condition else ""))
    if not condition:
        failures.append(label)


async def seed():
    for p in get_seed_problems():
        await _mock_db.problems.update_one({"slug": p["slug"]}, {"$set": p}, upsert=True)


asyncio.run(seed())

# ---------- health ----------
r = client.get("/health")
check("GET /health -> 200", r.status_code == 200, r.text)

# ---------- problems list ----------
r = client.get("/problems")
check("GET /problems -> 200", r.status_code == 200, r.text)
problems = r.json()
check("GET /problems -> 100 problems", len(problems) == 100, f"got {len(problems)}")
check("GET /problems -> summary shape", set(problems[0].keys()) == {"id", "slug", "title", "difficulty", "tags", "acceptance"}, str(problems[0].keys()))

# ---------- problem detail ----------
r = client.get("/problems/two-sum")
check("GET /problems/two-sum -> 200", r.status_code == 200, r.text)
detail = r.json()
check("problem detail has starterCode for all 4 languages", set(detail["starterCode"].keys()) == {"python", "javascript", "cpp", "java"})
check("problem detail has examples", len(detail["examples"]) >= 1)

r = client.get("/problems/does-not-exist")
check("GET /problems/{bad-slug} -> 404", r.status_code == 404, r.text)

# ---------- signup / login ----------
r = client.post("/auth/signup", json={"username": "tester1", "email": "tester1@example.com", "password": "password123"})
check("POST /auth/signup -> 201", r.status_code == 201, r.text)
signup_data = r.json()
check("signup response has token + user", "token" in signup_data and "user" in signup_data, str(signup_data))
check("signup user.joinedAt is an int (epoch ms)", isinstance(signup_data["user"]["joinedAt"], int), str(signup_data["user"]))
token1 = signup_data["token"]

r = client.post("/auth/signup", json={"username": "tester1", "email": "other@example.com", "password": "password123"})
check("duplicate username -> 409", r.status_code == 409, r.text)

r = client.post("/auth/signup", json={"username": "tester2", "email": "tester1@example.com", "password": "password123"})
check("duplicate email -> 409", r.status_code == 409, r.text)

r = client.post("/auth/login", json={"email": "tester1@example.com", "password": "wrongpass"})
check("wrong password -> 401", r.status_code == 401, r.text)

r = client.post("/auth/login", json={"email": "tester1@example.com", "password": "password123"})
check("correct login -> 200", r.status_code == 200, r.text)
token1 = r.json()["token"]

auth_headers = {"Authorization": f"Bearer {token1}"}

# ---------- run (no auth required) ----------
real_two_sum_code = (
    "from typing import List\n\n"
    "class Solution:\n"
    "    def twoSum(self, nums: List[int], target: int) -> List[int]:\n"
    "        seen = {}\n"
    "        for i, n in enumerate(nums):\n"
    "            complement = target - n\n"
    "            if complement in seen:\n"
    "                return [seen[complement], i]\n"
    "            seen[n] = i\n"
    "        return []\n"
)
r = client.post("/problems/two-sum/run", json={"language": "python", "code": real_two_sum_code})
check("POST run (no auth) -> 200", r.status_code == 200, r.text)
run_data = r.json()
check("run with real code -> Accepted", run_data["status"] == "Accepted", str(run_data))

r = client.post("/problems/two-sum/run", json={"language": "python", "code": "from typing import List\n\nclass Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your solution here\n        pass\n"})
check("run with unchanged starter -> Wrong Answer", r.json()["status"] == "Wrong Answer", r.text)

# ---------- submit (requires auth) ----------
r = client.post("/problems/two-sum/submit", json={"language": "python", "code": "x = 1"})
check("submit without auth -> 401", r.status_code == 401, r.text)

r = client.post(
    "/problems/two-sum/submit",
    json={"language": "python", "code": "class Solution:\n    def twoSum(self, nums, target):\n        seen = {}\n        for i, n in enumerate(nums):\n            if target - n in seen:\n                return [seen[target-n], i]\n            seen[n] = i\n"},
    headers=auth_headers,
)
check("submit with auth + real code -> 200 Accepted", r.status_code == 200 and r.json()["status"] == "Accepted", r.text)

# ---------- solved ----------
r = client.get("/users/me/solved", headers=auth_headers)
check("GET solved -> 200", r.status_code == 200, r.text)
check("solved includes two-sum", "two-sum" in r.json(), r.text)

r = client.get("/users/me/solved")
check("GET solved without auth -> 401", r.status_code == 401, r.text)

# ---------- profile ----------
r = client.get("/users/me/profile", headers=auth_headers)
check("GET profile -> 200", r.status_code == 200, r.text)
profile = r.json()
check("profile stats.totalSolved == 1", profile["stats"]["totalSolved"] == 1, str(profile["stats"]))
check("profile stats.points == 10 (one Easy solved)", profile["stats"]["points"] == 10, str(profile["stats"]))
check("profile streak.current >= 1", profile["streak"]["current"] >= 1, str(profile["streak"]))
check("profile recentSubmissions non-empty", len(profile["recentSubmissions"]) == 1, str(profile["recentSubmissions"]))
check("profile activity has today's date key", len(profile["activity"]) == 1, str(profile["activity"]))

# ---------- leaderboard ----------
r = client.get("/leaderboard")
check("GET leaderboard (no auth) -> 200", r.status_code == 200, r.text)
board = r.json()
check("leaderboard has 1 row (1 user)", len(board) == 1, str(board))
check("leaderboard row rank == 1", board[0]["rank"] == 1, str(board))

r = client.get("/leaderboard", headers=auth_headers)
check("leaderboard with auth marks isYou", r.json()[0]["isYou"] is True, str(r.json()))

# second user for leaderboard ranking test
r = client.post("/auth/signup", json={"username": "tester2", "email": "tester2@example.com", "password": "password123"})
token2 = r.json()["token"]
r = client.post(
    "/problems/valid-parentheses/submit",
    json={"language": "python", "code": "class Solution:\n    def isValid(self, s):\n        stack = []\n        pairs = {')':'(', ']':'[', '}':'{'}\n        for c in s:\n            if c in pairs:\n                if not stack or stack.pop() != pairs[c]:\n                    return False\n            else:\n                stack.append(c)\n        return not stack\n"},
    headers={"Authorization": f"Bearer {token2}"},
)
check("second user submit -> Accepted", r.json()["status"] == "Accepted", r.text)

r = client.get("/leaderboard")
board = r.json()
check("leaderboard now has 2 rows", len(board) == 2, str(board))
check("leaderboard sorted by points desc", board[0]["points"] >= board[1]["points"], str(board))

print()
if failures:
    print(f"{len(failures)} FAILURE(S):")
    for f in failures:
        print(f"  - {f}")
    sys.exit(1)
else:
    print(f"All {len(problems)} problems seeded, all endpoint checks PASSED.")
