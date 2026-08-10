import { describe, expect, it } from "vitest";
import { generateExpandedFormProblems } from "./expandedForm";

function parseExpandedTerms(expression: string): number[] {
  return expression.split(" + ").map((term) => Number(term.replaceAll(",", "")));
}

describe("expanded-form Practice adapter", () => {
  it("fulfills requested counts with unique canonical problems and choices", () => {
    for (const practiceType of ["expanded_form", "expanded_form_large"] as const) {
      const problems = generateExpandedFormProblems({
        seed: `count:${practiceType}`,
        count: 24,
        lesson: { practice_type: practiceType },
      });
      expect(problems).toHaveLength(24);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(24);
      for (const problem of problems) {
        const choices = problem.visualData?.choices ?? [];
        expect(choices).toHaveLength(4);
        expect(new Set(choices).size).toBe(4);
        expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
      }
    }
  });

  it("is deterministic for the same seed and varies across seeds", () => {
    const first = generateExpandedFormProblems({ seed: "same", count: 10 });
    const second = generateExpandedFormProblems({ seed: "same", count: 10 });
    const different = generateExpandedFormProblems({ seed: "different", count: 10 });

    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
  });

  it("renders semantically correct adapter answers in both directions for both domains", () => {
    for (const practiceType of ["expanded_form", "expanded_form_large"] as const) {
      const problems = generateExpandedFormProblems({
        seed: `semantic:${practiceType}`,
        count: 80,
        lesson: { practice_type: practiceType },
      });
      const directions = new Set<string>();

      for (const problem of problems) {
        const standardPrompt = problem.questionText.match(/^Write ([\d,]+) in expanded form\.$/);
        if (standardPrompt) {
          directions.add("standard_to_expanded");
          const sourceNumber = Number(standardPrompt[1].replaceAll(",", ""));
          const terms = parseExpandedTerms(problem.correctAnswer);

          expect(terms.every((term) => Number.isInteger(term) && term > 0)).toBe(true);
          expect(terms.every((term, index) => index === 0 || terms[index - 1] > term)).toBe(true);
          expect(terms.reduce((sum, term) => sum + term, 0)).toBe(sourceNumber);
          continue;
        }

        const expandedPrompt = problem.questionText.match(/^What number is (.+)\?$/);
        expect(expandedPrompt).not.toBeNull();
        directions.add("expanded_to_standard");
        const terms = parseExpandedTerms(expandedPrompt![1]);
        expect(terms.every((term) => Number.isInteger(term) && term > 0)).toBe(true);
        expect(problem.correctAnswer).toBe(
          String(terms.reduce((sum, term) => sum + term, 0)),
        );
      }

      expect(directions).toEqual(
        new Set(["standard_to_expanded", "expanded_to_standard"]),
      );
    }
  });
});
