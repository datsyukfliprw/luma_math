import { describe, expect, it } from "vitest";
import { generateEqualGroupsProblems } from "./equalGroups";
import { generateEqualGroupsWithObjectsProblems } from "./equalGroupsWithObjects";
import { generateFactorProductProblems } from "./factorProduct";
import { generateRepeatedAdditionProblems } from "./repeatedAddition";
import { createPracticeSessionSeed } from "./random";
import { generateFactorsAndProductsProblems } from "./multiplicationTerms";
import { generateCountEqualGroupsProblems } from "./multiplicationEqualGroups";

describe("Unit 1 multiplication generator reuse", () => {
  it("keeps equal-groups products and identities sourced from the shared state", () => {
    const problems = generateEqualGroupsProblems({ mode: "guided" });
    for (const problem of problems.slice(0, 2)) {
      const groups = problem.visualData?.groups;
      const itemsPerGroup = problem.visualData?.itemsPerGroup;
      if (groups === undefined || itemsPerGroup === undefined) {
        throw new Error("Equal-groups problem omitted its canonical operands");
      }
      expect(Number(problem.correctAnswer)).toBe(groups * itemsPerGroup);
      expect(problem.problemKey).toContain(`g=${groups}:n=${itemsPerGroup}`);
    }
    expect(problems[0].problemKey).toContain("task=count-total");
  });

  it("reuses the shared state for repeated addition and object groups", () => {
    const repeated = generateRepeatedAdditionProblems({ count: 1 })[0];
    const objectGroups = generateEqualGroupsWithObjectsProblems({ count: 1 })[0];

    for (const problem of [repeated, objectGroups]) {
      const groups = problem.visualData?.groups;
      const itemsPerGroup = problem.visualData?.itemsPerGroup;
      const product = problem.visualData?.product;
      if (groups === undefined || itemsPerGroup === undefined || product === undefined) {
        throw new Error("Unit 1 group problem omitted canonical state");
      }
      expect(product).toBe(groups * itemsPerGroup);
      expect(problem.problemKey).toContain(`g=${groups}:n=${itemsPerGroup}`);
    }
  });

  it("reuses the shared fact for factor/product terms", () => {
    const problem = generateFactorProductProblems({ count: 1 })[0];
    const factorA = Number(problem.answerData?.factorA);
    const factorB = Number(problem.answerData?.factorB);
    const product = Number(problem.answerData?.product);

    expect(factorA * factorB).toBe(product);
    expect(problem.problemKey).toBe(`multiplication:terms:a=${factorA}:b=${factorB}:ask=both`);
  });

  it("uses one count-total identity across equal-groups adapters", () => {
    const objectProblem = generateEqualGroupsWithObjectsProblems({ seed: "object", count: 1 })[0];
    const countProblem = generateCountEqualGroupsProblems({ seed: "count", count: 12 }).find(
      (problem) => problem.visualData?.groups === 4 && problem.visualData.itemsPerGroup === 3,
    );

    expect(countProblem).toBeDefined();

    expect(objectProblem.problemKey).toBe(
      "multiplication:model:equal-groups:g=4:n=3:task=count-total",
    );
    expect(countProblem?.problemKey).toBe(
      "multiplication:model:equal-groups:g=4:n=3:task=count-total",
    );
  });

  it("derives fallback seeds from the lesson identity or practice type", () => {
    expect(generateFactorsAndProductsProblems({ lesson: { lesson_id: "terms-lesson" } })).toEqual(
      generateFactorsAndProductsProblems({
        seed: createPracticeSessionSeed("terms-lesson", "factors_and_products", "guided"),
      }),
    );
    expect(generateCountEqualGroupsProblems({ lesson: { lesson_id: "count-lesson" } })).toEqual(
      generateCountEqualGroupsProblems({
        seed: createPracticeSessionSeed("count-lesson", "count_equal_groups", "guided"),
      }),
    );
    expect(generateFactorsAndProductsProblems()).toEqual(
      generateFactorsAndProductsProblems({
        seed: createPracticeSessionSeed("factors_and_products", "factors_and_products", "guided"),
      }),
    );
    expect(generateCountEqualGroupsProblems()).toEqual(
      generateCountEqualGroupsProblems({
        seed: createPracticeSessionSeed("count_equal_groups", "count_equal_groups", "guided"),
      }),
    );
  });
});
