import { describe, expect, it } from "vitest";
import { getCurriculum, type Lesson } from "../data/curriculum";
import {
  generateProblemsForPracticeType,
  isRegisteredPracticeType,
} from "./registry";
import {
  evaluationReviewTypeAliases,
  resolveEvaluationReviewSource,
} from "./evaluationReviewResolver";

function getGrade3Lessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (let unitNumber = 1; unitNumber <= 36; unitNumber += 1) {
    const unit = getCurriculum(3, unitNumber);
    expect(unit, `Grade 3 Unit ${unitNumber} should be registered`).toBeDefined();
    for (const week of unit?.weeks ?? []) {
      lessons.push(...week.lessons);
    }
  }
  return lessons;
}

function expectValidProblemSet(problems: ReturnType<typeof generateProblemsForPracticeType>) {
  expect(problems.length).toBeGreaterThan(0);
  expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(problems.length);

  for (const problem of problems) {
    expect(problem.questionText.length).toBeGreaterThan(0);
    expect(problem.problemKey.length).toBeGreaterThan(0);
    expect(String(problem.correctAnswer).length).toBeGreaterThan(0);

    const choices = problem.visualData?.choices;
    if (!choices) continue;

    expect(new Set(choices).size).toBe(choices.length);
    expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
  }
}

describe("Grade 3 generator completion", () => {
  it("keeps all 144 regular lessons intentionally generator-backed", () => {
    const lessons = getGrade3Lessons().filter((lesson) => lesson.lesson_type === "lesson");

    expect(lessons).toHaveLength(144);
    expect(new Set(lessons.map((lesson) => lesson.practice_type)).size).toBe(143);

    for (const lesson of lessons) {
      expect(isRegisteredPracticeType(lesson.practice_type), lesson.lesson_id).toBe(true);

      const seed = `grade3-completion:${lesson.lesson_id}`;
      const first = generateProblemsForPracticeType(lesson.practice_type, {
        mode: "guided",
        lesson,
        seed,
      });
      const replay = generateProblemsForPracticeType(lesson.practice_type, {
        mode: "guided",
        lesson,
        seed,
      });

      expectValidProblemSet(first);
      expect(replay).toEqual(first);
    }
  });

  it("keeps all 36 evaluations exact, specialized, balanced, and deterministic", () => {
    const evaluations = getGrade3Lessons().filter(
      (lesson) => lesson.lesson_type === "evaluation",
    );

    expect(evaluations).toHaveLength(36);
    expect(evaluationReviewTypeAliases).toEqual({});
    expect(evaluations.flatMap((lesson) => lesson.review_types ?? [])).toHaveLength(144);

    for (const evaluation of evaluations) {
      const evaluationLessonId = evaluation.lesson_id ?? "";
      const reviewTypes = evaluation.review_types ?? [];
      expect(reviewTypes.length).toBeGreaterThan(0);

      for (const reviewType of reviewTypes) {
        const resolved = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
        expect(resolved.generatorPracticeType).toBe(reviewType);
        expect(resolved.resolution).toBe("specialized");
      }

      const expectedCount =
        evaluation.quiz_question_count ?? evaluation.practice_block?.question_count ?? 9;
      const seed = `grade3-evaluation-completion:${evaluationLessonId}`;
      const first = generateProblemsForPracticeType(evaluation.practice_type, {
        mode: "guided",
        lesson: evaluation,
        seed,
      });
      const replay = generateProblemsForPracticeType(evaluation.practice_type, {
        mode: "guided",
        lesson: evaluation,
        seed,
      });

      expect(first).toHaveLength(expectedCount);
      expectValidProblemSet(first);
      expect(replay).toEqual(first);

      const counts = reviewTypes.map(
        (reviewType) =>
          first.filter((problem) =>
            problem.problemKey.startsWith(
              `evaluation-${evaluationLessonId}-${reviewType}-`,
            ),
          ).length,
      );
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
  });
});
