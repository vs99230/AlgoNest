import unittest
from unittest.mock import patch

from app.data.problems_seed import get_seed_problems
from app.judge import simple_judge
from app.models.schemas import ProblemDetail


class JudgeHarnessTests(unittest.IsolatedAsyncioTestCase):
    async def test_hidden_tests_are_not_in_problem_detail_response(self):
        problem = get_seed_problems()[0]
        response = ProblemDetail(**problem).model_dump()
        self.assertNotIn("hiddenTests", response)

    async def test_all_seeded_examples_build_for_each_language(self):
        for problem in get_seed_problems():
            method, params = simple_judge._method_signature(problem)
            for language in ("python", "javascript", "cpp", "java"):
                self.assertTrue(problem.get("hiddenTests"), problem["slug"])
                for example in problem["examples"] + problem["hiddenTests"]:
                    bindings = simple_judge._split_assignments(example["input"])
                    args = [
                        bindings["adjList"] if name == "node" and "adjList" in bindings else bindings[name]
                        for name in params
                    ]
                    source = simple_judge._build_source(
                        problem,
                        language,
                        problem["starterCode"][language],
                        method,
                        params,
                        args,
                    )
                    self.assertTrue(source, f"Empty {language} harness for {problem['slug']}")

    async def test_run_uses_public_examples_and_submit_includes_hidden_tests(self):
        problem = next(p for p in get_seed_problems() if p["slug"] == "two-sum")
        expected = problem["examples"][0]["output"]
        hidden_expected = problem["hiddenTests"][0]["output"]

        with patch.object(
            simple_judge, "_run_case",
            side_effect=[
                {"status": {"id": 3}, "stdout": expected},
                {"status": {"id": 3}, "stdout": expected},
                {"status": {"id": 3}, "stdout": hidden_expected},
            ],
        ) as run_case:
            run_result = await simple_judge.judge_run(
                problem, "python", problem["starterCode"]["python"]
            )
            self.assertEqual(len(run_result["cases"]), len(problem["examples"]))
            self.assertEqual(run_case.call_count, len(problem["examples"]))

            submit_result = await simple_judge.judge_submit(
                problem, "python", problem["starterCode"]["python"]
            )
            self.assertEqual(submit_result["status"], "Accepted")
            self.assertEqual(
                submit_result["total"],
                len(problem["examples"]) + len(problem["hiddenTests"]),
            )
            self.assertEqual(submit_result["passed"], submit_result["total"])

    async def test_hidden_test_failure_rejects_submission(self):
        problem = next(p for p in get_seed_problems() if p["slug"] == "two-sum")
        with patch.object(
            simple_judge, "_run_case",
            side_effect=[
                {"status": {"id": 3}, "stdout": problem["examples"][0]["output"]},
                {"status": {"id": 3}, "stdout": "[-1,-1]"},
            ],
        ):
            result = await simple_judge.judge_submit(
                problem, "python", problem["starterCode"]["python"]
            )
        self.assertEqual(result["status"], "Wrong Answer")
        self.assertEqual(result["passed"], len(problem["examples"]))
        self.assertEqual(result["total"], len(problem["examples"]) + len(problem["hiddenTests"]))

    async def test_each_problem_can_be_accepted_from_its_expected_output(self):
        for problem in get_seed_problems():
            result = {
                "status": {"id": 3, "description": "Accepted"},
                "stdout": problem["examples"][0]["output"],
                "time": "0.01",
                "memory": 1024,
            }
            with self.subTest(problem=problem["slug"]), patch.object(
                simple_judge, "_run_case", return_value=result
            ):
                judged = await simple_judge.judge_run(
                    problem, "python", problem["starterCode"]["python"]
                )
                self.assertEqual(judged["status"], "Accepted")
                self.assertEqual(len(judged["cases"]), len(problem["examples"]))

    async def test_wrong_compile_and_runtime_verdicts_are_preserved(self):
        problem = next(p for p in get_seed_problems() if p["slug"] == "two-sum")
        statuses = (
            ({"id": 3, "description": "Accepted"}, "[-1,-1]", None, "Wrong Answer"),
            ({"id": 6, "description": "Compilation Error"}, "", "compile failed", "Compile Error"),
            ({"id": 7, "description": "Runtime Error"}, "", "runtime failed", "Runtime Error"),
        )
        for status, stdout, error, expected_status in statuses:
            result = {
                "status": status,
                "stdout": stdout,
                "compile_output": error if status["id"] == 6 else None,
                "stderr": error if status["id"] == 7 else None,
                "time": "0.01",
                "memory": 1024,
            }
            with self.subTest(expected=expected_status), patch.object(
                simple_judge, "_run_case", return_value=result
            ):
                judged = await simple_judge.judge_run(problem, "python", "class Solution: pass")
                self.assertEqual(judged["status"], expected_status)


if __name__ == "__main__":
    unittest.main()
