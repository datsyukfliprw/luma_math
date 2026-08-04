import { describe, it, expect } from "vitest";
import { buildEvaluationPlan } from "./evaluationPlan";

describe("buildEvaluationPlan", () => {
  it("distributes 8 questions across 4 review types evenly", () => {
    const plan = buildEvaluationPlan(["A", "B", "C", "D"], 8);
    expect(plan).toEqual([
      { reviewType: "A", count: 2 },
      { reviewType: "B", count: 2 },
      { reviewType: "C", count: 2 },
      { reviewType: "D", count: 2 },
    ]);
  });

  it("distributes 10 questions across 4 review types with 3, 3, 2, 2", () => {
    const plan = buildEvaluationPlan(["A", "B", "C", "D"], 10);
    const counts = plan.map((entry) => entry.count).sort((a, b) => b - a);
    expect(counts).toEqual([3, 3, 2, 2]);
    expect(plan.reduce((sum, entry) => sum + entry.count, 0)).toBe(10);
  });

  it("distributes 3 questions across 4 review types with one zero", () => {
    const plan = buildEvaluationPlan(["A", "B", "C", "D"], 3);
    expect(plan.reduce((sum, entry) => sum + entry.count, 0)).toBe(3);
    expect(plan.filter((entry) => entry.count === 1)).toHaveLength(3);
    expect(plan.filter((entry) => entry.count === 0)).toHaveLength(1);
  });

  it("rotates extra questions based on rotation offset", () => {
    const plan0 = buildEvaluationPlan(["A", "B", "C", "D"], 10, 0);
    const plan2 = buildEvaluationPlan(["A", "B", "C", "D"], 10, 2);

    expect(plan0[0].count).toBe(3);
    expect(plan0[1].count).toBe(3);
    expect(plan0[2].count).toBe(2);
    expect(plan0[3].count).toBe(2);

    expect(plan2[0].count).toBe(2);
    expect(plan2[1].count).toBe(2);
    expect(plan2[2].count).toBe(3);
    expect(plan2[3].count).toBe(3);
  });

  it("rejects an empty review type list", () => {
    expect(() => buildEvaluationPlan([], 8)).toThrow("No review types configured");
  });

  it("rejects a non-positive question count", () => {
    expect(() => buildEvaluationPlan(["A", "B"], 0)).toThrow("positive");
    expect(() => buildEvaluationPlan(["A", "B"], -1)).toThrow("positive");
  });
});
