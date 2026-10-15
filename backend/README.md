# AlgoNest Backend

FastAPI backend for AlgoNest (LeetCode-style practice app), matching the frontend's `src/services/*.js` API contract exactly. Uses MongoDB Atlas (cloud) as the database and Judge0 for isolated code execution.

## 1. Prerequisites

- Python 3.11+
- A MongoDB Atlas cluster (free tier is fine) — create one at https://www.mongodb.com/cloud/atlas, create a database user, and allow network access from your IP (or `0.0.0.0/0` for quick testing).

## 2. Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the env template and fill in your Atlas connection string:

```bash
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=algonest
JWT_SECRET=change-this-to-a-long-random-string
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=10080
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
```

- `JWT_SECRET`: set this to any long random string (don't keep the placeholder).
- `CORS_ORIGINS`: comma-separated list of frontend origins allowed to call this API. Add your deployed frontend URL here too, once you have one.

## 3. Seed the database

Populates the `problems` collection with the 100 starter problems (safe to re-run — it upserts by slug):

```bash
python seed_db.py
```

## 4. Run the server

```bash
uvicorn app.main:app --reload
```

The API is now at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## 5. Connecting the frontend

The frontend uses the backend by default. Set `VITE_API_URL=http://localhost:8000/api` if the backend is hosted elsewhere. `VITE_USE_MOCK=true` enables local dummy data only; Run and Submit are disabled because mock mode cannot safely execute code.

## 6. API contract

All timestamps are **epoch milliseconds** (integers), not ISO strings.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Create account. Returns `{ token, user }`. 409 on duplicate email/username. |
| POST | `/auth/login` | – | Returns `{ token, user }`. 401 on bad credentials. |
| GET | `/problems` | – | List of problem summaries, sorted by id. |
| GET | `/problems/{slug}` | – | Full problem detail. 404 if not found. |
| POST | `/problems/{slug}/run` | – | Run code against public example cases. Not persisted. Works for guests. |
| POST | `/problems/{slug}/submit` | required | Run code against public example cases and persist a submission. |
| GET | `/users/me/solved` | required | List of solved problem slugs. |
| GET | `/users/me/profile` | required | Stats, streak, activity heatmap data, recent submissions. |
| GET | `/leaderboard` | optional | Ranked list of all users by points; `isYou` set if authenticated. |
| GET | `/health` | – | Liveness check. |

Auth: send `Authorization: Bearer <token>` for protected routes.

## 7. Judge

The backend runs submitted solutions in Judge0's isolated execution environment and compares their output with each problem's example output. By default it uses the public Judge0 CE endpoint (`https://ce.judge0.com`). To use another instance, set `JUDGE0_API_URL`; for a RapidAPI-hosted instance, also set `JUDGE0_API_KEY` and `JUDGE0_API_HOST`.

Run executes the public examples. Submit executes the public examples plus question-specific hidden tests, and reports totals across both. Hidden tests are kept out of the problem-detail API response. Judge0 receives submitted source code, so use an endpoint you trust for private code. The Judge0 adapter builds language-specific harnesses for seeded tests, including list, tree, graph, and in-place mutation inputs. Re-run `python seed_db.py` after updating the seed data so hidden tests and corrected starter signatures reach MongoDB; note that the script also deletes problem slugs absent from the seed data.

## 8. Project layout

```
app/
  core/        config, database, security (JWT/bcrypt), streak calc, constants, auth deps
  models/      Pydantic schemas + date helpers
  data/        seed problem data + starter code generator
  judge/       Judge0 execution adapter and example harness
  routers/     auth, problems, submissions, users/leaderboard
  main.py      app factory, CORS, lifespan (Mongo connect + indexes)
seed_db.py     one-off/rerunnable problem seeding script
dev/           developer-only verification script (not required to run the app)
```

## 9. Dev-only verification (optional)

`dev/verify_endpoints.py` runs a full end-to-end check of every endpoint against an in-memory MongoDB fake (no real Atlas connection needed). Not required to run the app — only useful if you're modifying backend code and want a quick sanity check.

```bash
pip install mongomock mongomock-motor httpx
python dev/verify_endpoints.py
```
