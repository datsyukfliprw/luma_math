import { describe, it, expect } from "vitest";
import { getAllCurricula } from "../curriculum";
import { generateProblemsForPracticeType } from "../../practiceTypes/registry";
import type { PracticeProblem } from "../../practiceTypes/types";

const SUPPORTED_VISUAL_TYPES = new Set<PracticeProblem["visualType"]>([
  "equal_groups",
  "repeated_addition",
  "factor_product",
  "array_rows_columns",
  "multiple_choice",
  "text_entry",
  "fair_sharing",
  "mistake_check",
]);

describe("Grade 3 evaluation coverage", () => {
  const grade3 = getAllCurricula().filter((c) => c.grade_level === 3);
  const evaluationLessons = grade3.flatMap((unit) =>
    unit.weeks.flatMap((week) =>
      week.lessons
        .filter((lesson) => lesson.lesson_type === "evaluation")
        .map((lesson) => ({ unit: unit.unit_number, week: week.week_number, lesson })),
    ),
  );

  it("discovers all 36 Grade 3 evaluation lessons", () => {
    expect(evaluationLessons).toHaveLength(36);
  });

  it.each(evaluationLessons.map((entry) => [entry.unit, entry.lesson.lesson_id, entry.lesson]))(
    "Unit %s evaluation %s generates its configured question count",
    (_unit, _lessonId, lesson) => {
      const expectedCount =
        lesson.quiz_question_count ?? lesson.practice_block?.question_count ?? 0;
      expect(lesson.review_types).toBeDefined();
      expect((lesson.review_types as string[]).length).toBeGreaterThan(0);
      expect(expectedCount).toBeGreaterThan(0);

      let problems: PracticeProblem[] = [];
      expect(() => {
        problems = generateProblemsForPracticeType(lesson.practice_type, { lesson });
      }).not.toThrow();

      expect(problems).toHaveLength(expectedCount);

      const keys = new Set<string>();
      for (const problem of problems) {
        expect(problem.problemKey).toBeTruthy();
        expect(keys.has(problem.problemKey)).toBe(false);
        keys.add(problem.problemKey);

        expect(problem.questionText).toBeTruthy();
        expect(problem.correctAnswer).toBeTruthy();
        expect(SUPPORTED_VISUAL_TYPES.has(problem.visualType)).toBe(true);
      }
    },
  );
});
