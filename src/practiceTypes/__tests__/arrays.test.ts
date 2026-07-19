import { describe, expect, it } from "vitest";
import { generateArrayRowsColumnsProblems } from "../arrayRowsColumns";
import { generateDrawArraysProblems } from "../drawArrays";

const arrayGenerators = {
  arrayRowsColumns: generateArrayRowsColumnsProblems,
  drawArrays: generateDrawArraysProblems,
};

describe.each(Object.entries(arrayGenerators))("%s", (_name, generate) => {
  it("generates 8 guided problems by default", () => {
    const problems = generate();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "array_rows_columns")).toBe(true);
  });

  it("keeps rows, columns, product and answer data consistent", () => {
    for (const problem of generate({ mode: "independent" })) {
      const rows = problem.visualData?.rows ?? 0;
      const columns = problem.visualData?.columns ?? 0;
      const product = rows * columns;

      expect(problem.visualData?.product).toBe(product);
      expect(problem.correctAnswer).toBe(`${rows},${columns},${product}`);
      expect(problem.answerData).toEqual({
        rows: String(rows),
        columns: String(columns),
        product: String(product),
      });
      expect(problem.visualData?.equation).toBe(`${rows} × ${columns} = ${product}`);
    }
  });

  it("generates 12 independent and 10 challenge problems", () => {
    expect(generate({ mode: "independent" })).toHaveLength(12);
    expect(generate({ mode: "challenge" })).toHaveLength(10);
  });
});
