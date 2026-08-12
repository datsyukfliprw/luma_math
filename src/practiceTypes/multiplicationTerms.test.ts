import { describe, expect, it } from "vitest";
import { generateFactorsAndProductsProblems } from "./multiplicationTerms";

function parseTermsProblem(problem: ReturnType<typeof generateFactorsAndProductsProblems>[number]) {
  const match = problem.visualData?.equation?.match(/^(\d+) × (\d+) = (\d+)$/);
  if (!match) throw new Error(`Could not parse terms equation: ${problem.visualData?.equation}`);
  return { factorA: Number(match[1]), factorB: Number(match[2]), product: Number(match[3]) };
}

describe("factors_and_products practice adapter", () => {
  it("uses factor and product terminology and independently recovers the equation", () => {
    const problem = generateFactorsAndProductsProblems({ seed: "terms-contract", count: 1 })[0];
    const { factorA, factorB, product } = parseTermsProblem(problem);

    expect(problem.questionText).toContain("factors");
    expect(problem.questionText).toContain("product");
    expect(factorA * factorB).toBe(product);
    expect(problem.answerData).toEqual({
      factorA: String(factorA),
      factorB: String(factorB),
      product: String(product),
    });
  });

  it("offers unique term answers with exactly one complete identification", () => {
    const problem = generateFactorsAndProductsProblems({ seed: "terms-choices", count: 1 })[0];
    const { factorA, factorB, product } = parseTermsProblem(problem);
    const choices = problem.visualData?.choices ?? [];
    const correct = `${factorA},${factorB},${product}`;

    expect(new Set(choices).size).toBe(choices.length);
    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => choice === correct)).toHaveLength(1);
    expect(problem.correctAnswer).toBe(correct);
    expect(problem.correctAnswer.split(",").map(Number)).toEqual([factorA, factorB, product]);
    expect(factorA).toBeGreaterThanOrEqual(2);
    expect(factorB).toBeGreaterThanOrEqual(2);
  });

  it("preserves square facts while canonicalizing displayed factor order", () => {
    const problems = generateFactorsAndProductsProblems({ seed: "square-search", count: 36 });
    const square = problems.find((problem) => {
      const { factorA, factorB } = parseTermsProblem(problem);
      return factorA === factorB;
    });

    expect(square).toBeDefined();
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(problems.length);
  });

  it("does not emit commuted semantic duplicates and independently preserves the product", () => {
    const problems = generateFactorsAndProductsProblems({ seed: "unordered-session", count: 36 });
    const identities = problems.map((problem) => {
      const { factorA, factorB, product } = parseTermsProblem(problem);
      return `${Math.min(factorA, factorB)},${Math.max(factorA, factorB)},${product}`;
    });

    expect(new Set(identities).size).toBe(problems.length);
    for (const identity of identities) {
      const [factorA, factorB, product] = identity.split(",").map(Number);
      expect(factorA * factorB).toBe(product);
    }
  });

  it("fulfills requested counts and avoids duplicate canonical problems", () => {
    const problems = generateFactorsAndProductsProblems({ seed: "terms-session", count: 12 });

    expect(problems).toHaveLength(12);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(problems.length);
  });
});
