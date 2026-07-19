import { describe, expect, it } from "vitest";
import { generateProblemsForPracticeType } from "../registry";

const registeredTypes = [
  "equal_groups",
  "repeated_addition_to_multiplication",
  "factor_product_identification",
  "equal_groups_with_objects",
  "evaluation",
  "mixed_evaluation",
  "week_1_evaluation",
  "array_rows_columns",
  "commutative_property_matching",
  "draw_arrays",
  "valid_invalid_arrays",
  "week_2_evaluation",
  "fair_sharing_division",
];

describe("generateProblemsForPracticeType", () => {
  it.each(registeredTypes)("returns problems for the registered type %s", (type) => {
    const problems = generateProblemsForPracticeType(type);
    expect(problems.length).toBeGreaterThan(0);
    expect(problems[0]).toHaveProperty("id");
    expect(problems[0]).toHaveProperty("correctAnswer");
  });

  it("returns an empty array for an unknown practice type", () => {
    expect(generateProblemsForPracticeType("does_not_exist")).toEqual([]);
  });

  it("forwards options to the underlying generator", () => {
    const challenge = generateProblemsForPracticeType("equal_groups", { mode: "challenge" });
    expect(challenge.every((p) => p.visualType === "mistake_check")).toBe(true);
  });

  it("maps the evaluation aliases to the same generator output shape", () => {
    const mixed = generateProblemsForPracticeType("mixed_evaluation");
    const week1 = generateProblemsForPracticeType("week_1_evaluation");
    expect(mixed).toHaveLength(week1.length);
  });
});
