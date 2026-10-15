<div align="center">

AlgoNest

Practice. Solve. Grow.

A full-stack coding practice platform where developers can explore algorithm problems, write code, and evaluate solutions with an automated judging workflow.

Live Demo · Backend API · API Docs · GitHub Repository

</div>

Overview

AlgoNest is a LeetCode-inspired coding practice platform built to make algorithm practice accessible through a single web application. Users can browse coding problems, read problem statements, write solutions in the editor, and submit code for evaluation.

The project includes a React-based frontend, a Python FastAPI backend, MongoDB for persistent problem data, and an online code-judging integration. It is deployed publicly, with automated CI checks for backend tests and frontend builds.

Features

Problem library — Browse a curated collection of coding problems.

Problem details — View descriptions, examples, constraints, difficulty, and topic tags.

Code editor — Write and edit solutions in the browser.

Code execution and judging — Run or submit solutions through the connected judging workflow.

Test-case evaluation — Check solutions against examples and hidden test cases.

User accounts — Authentication-related frontend and backend modules.

Progress-oriented pages — Includes areas such as profile, submissions, leaderboard, and contests.

Persistent problem data — Problem records are served from MongoDB.

REST API — Frontend and backend communicate through API endpoints.

Automated checks — GitHub Actions runs backend tests and verifies that the frontend builds.

Live deployment — Public frontend and backend deployments.

Availability of individual pages or features may depend on the current deployment configuration.

Live Links

Resource

Link

Frontend application

https://algonest-platform.netlify.app/

Backend service

https://algonest-293u.onrender.com/

Interactive API documentation

https://algonest-293u.onrender.com/docs

Problems API

https://algonest-293u.onrender.com/api/problems

Source code

https://github.com/vs99230/AlgoNest

Technology Stack

Layer

Technologies

Frontend

React, Vite, Tailwind CSS, Monaco Editor

Backend

Python, FastAPI, Uvicorn

Database

MongoDB Atlas

Code judging

Judge0-compatible judging integration / configured judge service

API

REST, JSON

Testing

pytest, frontend production build

CI

GitHub Actions

Deployment

Netlify (frontend), Render (backend)

Version control

Git and GitHub

Architecture

                    ┌──────────────────────────┐
                    │        User / Browser    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │ React + Vite Frontend    │
                    │ Tailwind CSS + Editor    │
                    └────────────┬─────────────┘
                                 │ HTTPS / REST API
                                 ▼
                    ┌──────────────────────────┐
                    │ Python FastAPI Backend   │
                    ├──────────────────────────┤
                    │ Auth / Problems /        │
                    │ Submissions / Users      │
                    └───────┬──────────┬───────┘
                            │          │
                            ▼          ▼
                 ┌────────────────┐  ┌────────────────┐
                 │ MongoDB Atlas  │  │ Judge Service  │
                 │ Problem data   │  │ Code evaluation│
                 └────────────────┘  └────────────────┘

Request flow

A user opens AlgoNest and selects a problem.

The frontend requests problem data from the FastAPI backend.

The backend reads the problem information from MongoDB.

The user writes a solution and submits it.

The backend sends the code to the configured judging service or judging workflow.

The result is returned to the frontend for display.

Repository Structure

AlgoNest/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── routers/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   ├── seed_db.py
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── .gitignore
└── README.md

The tree above highlights the main areas of the project; individual files may vary as the application evolves.

Run Locally

Prerequisites

Install the following before starting:

Python 3.11 or a compatible supported Python version

Node.js and npm

A MongoDB database (MongoDB Atlas or a local MongoDB instance)

Credentials/configuration for the code-judging provider, if required

1. Clone the repository

git clone https://github.com/vs99230/AlgoNest.git
cd AlgoNest

2. Configure the backend

Open a terminal in the backend folder:

cd backend
python -m venv venv

Activate the virtual environment.

Windows PowerShell

.\venv\Scripts\Activate.ps1

macOS / Linux

source venv/bin/activate

Install backend dependencies:

pip install -r requirements.txt

Create a local .env file from the example:

Windows PowerShell

Copy-Item .env.example .env

macOS / Linux

cp .env.example .env

Update the values in backend/.env:

MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=algonest
JWT_SECRET=replace_with_a_long_random_secret
JWT_ALGORITHM=HS256
JWT_EXPIRES_MINUTES=10080
CORS_ORIGINS=http://localhost:5173,http://localhost:4173
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_API_HOST=

Keep .env private. Never commit database credentials, JWT secrets, or judging-provider API keys.

Start the backend from the backend directory:

uvicorn app.main:app --reload

The backend should be available at http://127.0.0.1:8000. Open http://127.0.0.1:8000/docs to inspect the API.

3. Configure the frontend

Open a second terminal from the repository root:

cd frontend
npm install

Create frontend/.env and configure the API base URL:

VITE_API_URL=http://127.0.0.1:8000/api
VITE_USE_MOCK=false

Start the Vite development server:

npm run dev

Open the local URL printed by Vite (typically http://localhost:5173).

Vite exposes variables prefixed with VITE_ to browser code. Never put private API keys or database credentials in frontend environment variables.

Environment Variables

Backend

Variable

Purpose

MONGODB_URI

MongoDB connection string

MONGODB_DB_NAME

Database name; currently algonest

JWT_SECRET

Secret used for signing JWTs

JWT_ALGORITHM

JWT signing algorithm

JWT_EXPIRES_MINUTES

Token expiry duration in minutes

CORS_ORIGINS

Comma-separated list of allowed frontend origins

JUDGE0_API_URL

Base URL of the configured judging service

JUDGE0_API_KEY

Optional provider API key, if required

JUDGE0_API_HOST

Optional provider host value, if required

Frontend

Variable

Purpose

VITE_API_URL

Backend API base URL, including /api

VITE_USE_MOCK

Controls whether mock data mode is enabled

Use the appropriate values for your local or deployed environment. For production, configure these values in the hosting provider's environment-variable settings.

API

The backend exposes a REST API. The full, current list of routes and schemas is available in the interactive documentation:

API documentation: https://algonest-293u.onrender.com/docs

Known endpoint:

Method

Endpoint

Purpose

GET

/api/problems

Returns the available problem list

The API documentation is the source of truth for request bodies, response schemas, authentication requirements, and any additional routes.

Testing

Backend tests

From the backend directory with the virtual environment activated:

python -m pytest -v

Frontend production build

From the frontend directory:

npm run build

Continuous integration

The GitHub Actions workflow in .github/workflows/ci.yml runs backend tests and checks that the frontend production build completes on the configured GitHub events.

Deployment

AlgoNest is deployed as two services:

Frontend: Netlify

Backend: Render

Database: MongoDB Atlas

When deploying or changing domains:

Set the frontend's VITE_API_URL to the deployed backend API base URL.

Set CORS_ORIGINS on the backend to include the exact frontend origin(s).

Add all backend secrets in the backend hosting provider's environment settings.

Redeploy after changing environment variables.

Verify /docs and /api/problems, then test problem loading and code submissions in the live frontend.

Adding More Problems

AlgoNest can be extended with additional problem records as long as the database schema and API expectations are preserved.

When adding a problem, ensure it includes the fields expected by the application, such as:

A unique ID and slug

Title and difficulty

Problem statement, examples, and constraints

Topic tags

Starter code or language templates, if used

Public examples and hidden test cases in the format expected by the judging workflow

Add new records using a safe, deliberate database update or migration process. Review seed_db.py before running it against any existing database because seed scripts can replace or remove records that are not present in the seed dataset. Never run destructive seed operations against production without a backup and an explicit review.

Security Notes

Keep .env files and production credentials out of Git.

Use a strong, unique JWT_SECRET.

Restrict MongoDB network access to trusted addresses where possible; avoid broad public network access for production.

Configure CORS with only the frontend origins that need access.

Never expose judging-provider keys in frontend code.

Do not run untrusted code on your own machine or server outside the intended, isolated judging workflow.

Current Project Status

Public frontend and backend deployments are available.

Problem data is served from MongoDB.

Backend tests and frontend build have been checked.

The code-judging workflow has been tested with example and hidden test cases.

Contributing

Contributions, bug reports, and suggestions are welcome.

Fork the repository.

Create a feature branch: git checkout -b feat/your-change.

Make and test your changes.

Commit your work: git commit -m "Describe your change".

Push the branch and open a pull request.

License

No license has been specified yet. Unless a license is added to this repository, the default copyright rules apply and reuse is not automatically permitted.

<div align="center">

Built with ❤️ for developers who love solving problems.

Live Demo · GitHub

</div>
