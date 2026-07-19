import { describe, expect, it } from "vitest";
import { generateEvaluationProblems } from "../evaluation";

describe("generateEvaluationProblems", () => {
  it("returns 9 mixed problems by default", () => {
    const problems = generateEvaluationProblems();
    expect(problems).toHaveLength(9);
  });

  it("prefixes ids and problem keys with the review type", () => {
    for (const problem of generateEvaluationProblems()) {
      expect(problem.id).toMatch(/^evaluation-/);
      expect(problem.problemKey).toMatch(/^evaluation-/);
    }
  });

  it("respects an explicit quiz_question_count", () => {
    const problems = generateEvaluationProblems({ lesson: { quiz_question_count: 4 } });
    expect(problems).toHaveLength(4);
  });

  it("falls back to practice_block question_count when quiz count is absent", () => {
    const problems = generateEvaluationProblems({
      lesson: { practice_block: { question_count: 6 } },
    });
    expect(problems).toHaveLength(6);
  });

  it("interleaves the provided review types round-robin", () => {
    const problems = generateEvaluationProblems({
      lesson: {
        quiz_question_count: 4,
        review_types: ["equal_groups", "factor_product_identification"],
      },
    });
    expect(problems).toHaveLength(4);
    expect(problems[0].id).toContain("equal_groups");
    expect(problems[1].id).toContain("factor_product_identification");
    expect(problems[2].id).toContain("equal_groups");
    expect(problems[3].id).toContain("factor_product_identification");
  });

  it("returns no problems when all requested review types are unknown", () => {
    const problems = generateEvaluationProblems({
      lesson: { review_types: ["not_a_real_type"] },
    });
    expect(problems).toEqual([]);
  });

  it("ignores an empty review_types list and uses the defaults", () => {
    const problems = generateEvaluationProblems({ lesson: { review_types: [] } });
    expect(problems).toHaveLength(9);
  });
});
