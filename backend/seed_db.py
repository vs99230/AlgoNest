
"""
Populate the MongoDB problems collection from app/data/problems_seed.py,
including Submit-only hidden tests.

- Upserts problems by slug.
- Removes old problems that are not in the current seed data.
- Verifies the final collection count.
"""

import asyncio

from app.core.database import (
    close_mongo_connection,
    connect_to_mongo,
    get_database,
)
from app.data.problems_seed import get_seed_problems


async def main() -> None:
    connect_to_mongo()

    try:
        db = get_database()
        problems = get_seed_problems()

        if not problems:
            raise ValueError("Seed data is empty. Nothing was uploaded.")

        slugs = [problem["slug"] for problem in problems]

        if len(slugs) != len(set(slugs)):
            raise ValueError("Duplicate slugs found in seed data.")

        missing_hidden_tests = [
            problem["slug"] for problem in problems if not problem.get("hiddenTests")
        ]
        if missing_hidden_tests:
            raise ValueError(
                "Missing hidden tests for seeded problems: "
                + ", ".join(missing_hidden_tests)
            )

        hidden_test_count = sum(len(problem["hiddenTests"]) for problem in problems)

        # Upload new problems and update existing ones, including hiddenTests.
        for problem in problems:
            await db.problems.update_one(
                {"slug": problem["slug"]},
                {"$set": problem},
                upsert=True,
            )

        # Remove old problems not included in the current seed data.
        result = await db.problems.delete_many(
            {"slug": {"$nin": slugs}}
        )

        count = await db.problems.count_documents({})

        print(f"Seed data processed: {len(problems)}")
        print(f"Hidden test cases synced: {hidden_test_count}")
        print(f"Old problems removed: {result.deleted_count}")
        print(f"Total problems in MongoDB: {count}")

        if count != len(problems):
            raise RuntimeError(
                f"Expected {len(problems)} problems, but found {count}."
            )

        print("MongoDB seeding completed successfully!")

    finally:
        close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(main())
