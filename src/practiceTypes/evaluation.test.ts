import { describe, it, expect } from "vitest";
import { generateEvaluationProblems } from "./evaluation";
import { EvaluationGenerationError } from "./evaluationError";
import { findCurriculumLessonById } from "../lib/curriculumLoader";
import { getAllCurricula } from "../data/curriculum";
import { derivePracticeSeed } from "./random";
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

  it("generates Unit 9 using the exact multiplication generators", () => {
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
    expect(visualTypes).toContain("equal_groups");
    expect(visualTypes).toContain("factor_product");
    expect(visualTypes).toContain("multiple_choice");
  });

  it.each([
    [
      "g3-u13-w1-eval",
      ["division_sharing", "division_counting_groups", "write_division_equations", "division_with_1_and_0"],
    ],
    [
      "g3-u14-w1-eval",
      ["division_arrays", "division_number_line", "fact_families", "multiplication_for_division"],
    ],
    ["g3-u15-w1-eval", ["multiply_by_6", "divide_by_6", "multiply_by_7", "divide_by_7"]],
    ["g3-u16-w1-eval", ["multiply_by_8", "divide_by_8", "multiply_by_9", "divide_by_9"]],
    [
      "g3-u17-w1-eval",
      ["mixed_multiplication_facts", "missing_factors", "missing_numbers_division", "choose_strategy"],
    ],
    [
      "g3-u8-w1-eval",
      ["choose_operation", "estimate_then_solve", "one_step_word_problems", "two_step_unknowns"],
    ],
    [
      "g3-u18-w1-eval",
      ["equal_group_array_problems", "strip_models", "equations_with_unknowns", "two_step_mult_div_patterns"],
    ],
    [
      "g3-u26-w1-eval",
      ["equal_unequal_parts", "halves_thirds_fourths", "sixths_eighths", "name_unit_fractions"],
    ],
    [
      "g3-u27-w1-eval",
      ["numerator_meaning", "denominator_meaning", "fraction_bars", "area_models_and_stories"],
    ],
    [
      "g3-u28-w1-eval",
      ["zero_to_one_interval", "partition_number_lines", "locate_unit_fractions_number_line", "locate_non_unit_fractions_number_line"],
    ],
    [
      "g3-u29-w1-eval",
      ["equivalence_same_amount", "fraction_strips_equivalence", "area_models_equivalence", "generate_explain_equivalent"],
    ],
    [
      "g3-u30-w1-eval",
      ["same_location_number_line", "find_equivalents_number_line", "graph_equivalent_fractions", "connect_models_number_lines_equations"],
    ],
    [
      "g3-u31-w1-eval",
      ["compare_like_denominators_models", "compare_like_denominators_number_line", "use_comparison_symbols", "comparison_word_problems_like_denominators"],
    ],
    [
      "g3-u32-w1-eval",
      ["compare_like_numerators_models", "compare_like_numerators_number_line", "same_whole_fractions", "compare_explain_fractions"],
    ],
  ] as const)("balances generator-backed review in %s", (lessonId, reviewTypes) => {
    const lesson = getEvaluationLesson(lessonId);
    const problems = generateEvaluationProblems({ lesson, seed: `evaluation-${lessonId}` });

    expect(problems).toHaveLength(8);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(8);

    const counts = new Map<string, number>();
    for (const problem of problems) {
      const reviewType = problem.problemKey.split("-")[5];
      counts.set(reviewType, (counts.get(reviewType) ?? 0) + 1);
    }

    expect(new Set(counts.keys())).toEqual(new Set(reviewTypes));
    for (const reviewType of reviewTypes) {
      expect(counts.get(reviewType)).toBe(2);
    }
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

  it("produces the identical Unit 4 evaluation when the same seed is supplied twice", () => {
    const lesson = getEvaluationLesson("g3-u4-w1-eval");
    const runA = generateEvaluationProblems({ lesson, seed: "unit4-stable" });
    const runB = generateEvaluationProblems({ lesson, seed: "unit4-stable" });

    expect(runA).toHaveLength(runB.length);
    expect(JSON.stringify(runA)).toBe(JSON.stringify(runB));
  });

  it("produces different Addition problems for Unit 4 when given different seeds", () => {
    const lesson = getEvaluationLesson("g3-u4-w1-eval");
    const runA = generateEvaluationProblems({ lesson, seed: "unit4-seed-a" });
    const runB = generateEvaluationProblems({ lesson, seed: "unit4-seed-b" });

    expect(runA).toHaveLength(runB.length);

    const differs = runA.some((problemA, index) => {
      const problemB = runB[index];
      return (
        problemA.problemKey !== problemB.problemKey ||
        problemA.questionText !== problemB.questionText ||
        problemA.correctAnswer !== problemB.correctAnswer
      );
    });

    expect(differs).toBe(true);
  });

  it("produces the identical Unit 4 evaluation when no seed is omitted twice", () => {
    const lesson = getEvaluationLesson("g3-u4-w1-eval");
    const runA = generateEvaluationProblems({ lesson });
    const runB = generateEvaluationProblems({ lesson });

    expect(runA).toHaveLength(runB.length);
    expect(JSON.stringify(runA)).toBe(JSON.stringify(runB));
  });

  it("derives distinct child seeds for each review type in an evaluation", () => {
    const parentSeed = "parent-42";
    const lessonId = "g3-u4-w1-eval";
    const reviewTypes = [
      "addition_number_line",
      "addition_expanded_form",
      "addition_compensation",
      "addition_no_regroup",
    ];

    const seeds = reviewTypes.map((reviewType) =>
      derivePracticeSeed(parentSeed, "evaluation", lessonId, reviewType),
    );

    expect(new Set(seeds).size).toBe(seeds.length);
  });
});
