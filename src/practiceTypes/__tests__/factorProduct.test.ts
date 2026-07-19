import { describe, expect, it } from "vitest";
import { generateFactorProductProblems } from "../factorProduct";

describe("generateFactorProductProblems", () => {
  it("generates 8 guided problems by default", () => {
    const problems = generateFactorProductProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "factor_product")).toBe(true);
  });

  it("records factors, product, and answer data consistently", () => {
    for (const problem of generateFactorProductProblems()) {
      const factors = problem.visualData?.factors ?? [];
      const [factorA, factorB] = factors;
      const product = factorA * factorB;

      expect(problem.visualData?.product).toBe(product);
      expect(problem.correctAnswer).toBe(`${factorA},${factorB},${product}`);
      expect(problem.answerData).toEqual({
        factorA: String(factorA),
        factorB: String(factorB),
        product: String(product),
      });
      expect(problem.visualData?.equation).toBe(`${factorA} × ${factorB} = ${product}`);
    }
  });

  it("generates 12 independent and 10 challenge problems", () => {
    expect(generateFactorProductProblems({ mode: "independent" })).toHaveLength(12);
    expect(generateFactorProductProblems({ mode: "challenge" })).toHaveLength(10);
  });
});
