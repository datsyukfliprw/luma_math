import { describe, it, expect } from "vitest";
import { generateEvaluationProblems } from "./evaluation";
import { EvaluationGenerationError } from "./evaluationError";
import { findCurriculumLessonById } from "../lib/curriculumLoader";
import { getAllCurricula } from "../data/curriculum";
import type { Lesson } from "../data/curriculum";

function getEvaluationLesson(lessonId: string): Lesson {
  const found = findCurriculumLessonById(lessonId);
  if (!found) throw new Error(`Missing test fixture: ${lessonId}`);
  return found.lesson;
}

describe("generateEvaluationProblems", () => {
  it("generates Unit 1 Week 1 with all four multiplication review types", () => {
    const lesson = getEvaluationLesson("g3-u1-w1-eval");
    const problems = generateEvaluationProblems({ lesson });

    expect(problems).toHaveLength(8);

    const reviewTypes = new Set(problems.map((p) => p.problemKey.split("-")[5]));
    expect(reviewTypes).toEqual(
      new Set([
        "equal_groups",
        "repeated_addition_to_multiplication",
        "factor_product_identification",
        "equal_groups_with_objects",
      ]),
    );

    const firstRound = problems.slice(0, 4).map((p) => p.problemKey.split("-")[5]);
    expect(firstRound).toEqual([
      "equal_groups",
      "repeated_addition_to_multiplication",
      "factor_product_identification",
      "equal_groups_with_objects",
    ]);
  });

  it("uses specialized multiplication generators for Unit 1", () => {
    const lesson = getEvaluationLesson("g3-u1-w1-eval");
    const problems = generateEvaluationProblems({ lesson });

    const visualTypes = new Set(problems.map((p) => p.visualType));
    expect(visualTypes).toContain("equal_groups");
    expect(visualTypes).toContain("repeated_addition");
    expect(visualTypes).toContain("factor_product");
  });

  it("generates Unit 9 using aliases for count_equal_groups, factors_and_products, and draw_multiplication", () => {
    const lesson = getEvaluationLesson("g3-u9-w1-eval");
    const problems = generateEvaluationProblems({ lesson });

    expect(problems).toHaveLength(8);

    const reviewTypes = new Set(problems.map((p) => p.problemKey.split("-")[5]));
    expect(reviewTypes).toEqual(
      new Set([
        "count_equal_groups",
        "repeated_addition_to_multiplication",
        "factors_and_products",
        "draw_multiplication",
      ]),
    );

    const visualTypes = new Set(problems.map((p) => p.visualType));
    expect(visualTypes).toContain("equal_groups"); // count_equal_groups alias
    expect(visualTypes).toContain("factor_product"); // factors_and_products alias
    expect(visualTypes).toContain("array_rows_columns"); // draw_multiplication alias
  });

  it("falls back to canonical lesson content for units with no specialized generator", () => {
    const lesson = getEvaluationLesson("g3-u2-w1-eval");
    const problems = generateEvaluationProblems({ lesson });

    expect(problems).toHaveLength(8);
    expect(problems[0].visualType).toBe("multiple_choice");
    expect(problems.every((p) => p.questionText.length > 0 && p.correctAnswer.length > 0)).toBe(
      true,
    );
  });

  it("produces the configured question count for every Grade 3 evaluation", () => {
    const grade3 = getAllCurricula().filter((c) => c.grade_level === 3);

    for (const unit of grade3) {
      for (const week of unit.weeks) {
        const lesson = week.lessons.find((l: Lesson) => l.lesson_type === "evaluation");
        if (!lesson) continue;

        const expected = lesson.quiz_question_count ?? lesson.practice_block?.question_count ?? 0;
        const problems = generateEvaluationProblems({ lesson });
        expect(problems).toHaveLength(expected);
      }
    }
  });

  it("produces unique problem keys within an evaluation", () => {
    const lesson = getEvaluationLesson("g3-u1-w1-eval");
    const problems = generateEvaluationProblems({ lesson });
    const keys = new Set(problems.map((p) => p.problemKey));
    expect(keys.size).toBe(problems.length);
  });

  it("throws an EvaluationGenerationError for a review type with no source lesson", () => {
    const lesson = {
      ...getEvaluationLesson("g3-u1-w1-eval"),
      review_types: ["nonsense_type"],
    };

    expect(() => generateEvaluationProblems({ lesson })).toThrow(EvaluationGenerationError);
  });

  it("throws an EvaluationGenerationError for a missing evaluation lesson_id", () => {
    const lesson = { ...getEvaluationLesson("g3-u1-w1-eval"), lesson_id: undefined };
    expect(() => generateEvaluationProblems({ lesson })).toThrow(EvaluationGenerationError);
  });
});
