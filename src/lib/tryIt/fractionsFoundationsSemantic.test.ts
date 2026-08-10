import { describe, expect, it } from "vitest";
import { fractionsFoundationsFamily } from "./families/fractionsFoundations";
import { createSeededRng } from "../../practiceTypes/random";
import type { TryItFamilyContext } from "./types";
import type { Lesson } from "../../data/curriculum/curriculumSchema";

const FRACTION_PRACTICE_TYPES = [
  "equal_unequal_parts",
  "halves_thirds_fourths",
  "sixths_eighths",
  "name_unit_fractions",
  "numerator_meaning",
  "denominator_meaning",
  "fraction_bars",
  "area_models_and_stories",
] as const;

const ALLOWED_DENOMINATORS: Record<string, number[]> = {
  halves_thirds_fourths: [2, 3, 4],
  sixths_eighths: [6, 8],
  name_unit_fractions: [2, 3, 4, 5, 6, 8],
};

const DENOMINATOR_NAMES: Record<number, string> = {
  2: "halves",
  3: "thirds",
  4: "fourths",
  5: "fifths",
  6: "sixths",
  8: "eighths",
};

function makeContext(practiceType: string, count = 10, seed = "test"): TryItFamilyContext {
  const rng = createSeededRng(seed);
  return {
    lessonId: `test-${practiceType}`,
    lesson: { objective: "Test objective" } as unknown as Lesson,
    family: "fractions_foundations",
    practiceType,
    attemptKey: seed,
    rng,
    usedKeys: new Set(),
    count,
  };
}

function parseFraction(value: string): { numerator: number; denominator: number } | undefined {
  const match = value.match(/^(\d+)\/(\d+)$/);
  if (!match) return undefined;
  return { numerator: Number(match[1]), denominator: Number(match[2]) };
}

function extractModelNumbers(
  prompt: string,
): { numerator: number; denominator: number } | undefined {
  const denMatch = prompt.match(/into (\d+) equal/);
  const numMatch = prompt.match(
    /(\d+)\s+(?:part|piece|slice|section)(?:s|\(s\))?\s+(?:are|is|have|has)/,
  );
  if (!denMatch) return undefined;

  const denominator = Number(denMatch[1]);
  const numerator = numMatch ? Number(numMatch[1]) : 1;
  return { numerator, denominator };
}

function extractSectionMeasurements(
  prompt: string,
): { total: number; parts: number; widths: number[] } | undefined {
  const totalMatch = prompt.match(/is (\d+) units long/);
  const partsMatch = prompt.match(/(\d+) sections/);
  const widthsMatch = prompt.match(/widths are: ([\d,\s]+) units/);
  if (!totalMatch || !partsMatch || !widthsMatch) return undefined;

  const total = Number(totalMatch[1]);
  const parts = Number(partsMatch[1]);
  const widths = widthsMatch[1].split(",").map((s) => Number(s.trim()));
  return { total, parts, widths };
}

describe("fractionsFoundationsFamily semantic correctness", () => {
  it("generates both equal and unequal partition examples", () => {
    const problems = fractionsFoundationsFamily(makeContext("equal_unequal_parts", 20));
    const answers = new Set(problems.map((p) => p.parts[0].correctAnswer));
    expect(answers.has("Equal")).toBe(true);
    expect(answers.has("Unequal")).toBe(true);
  });

  it("does not reveal the equal/unequal classification in the prompt description", () => {
    const problems = fractionsFoundationsFamily(makeContext("equal_unequal_parts", 20));
    for (const problem of problems) {
      const description = problem.prompt.split("?")[0] ?? problem.prompt;
      expect(description).not.toMatch(/equal|unequal|different sizes|same size/i);
    }
  });

  it("makes the equal/unequal classification derivable from section measurements", () => {
    const problems = fractionsFoundationsFamily(makeContext("equal_unequal_parts", 20));
    for (const problem of problems) {
      const measurements = extractSectionMeasurements(problem.prompt);
      expect(measurements).toBeDefined();
      expect(measurements!.widths.length).toBe(measurements!.parts);
      expect(measurements!.widths.reduce((a, b) => a + b, 0)).toBe(measurements!.total);

      const allSame = measurements!.widths.every((w) => w === measurements!.widths[0]);
      const derived = allSame ? "Equal" : "Unequal";
      expect(problem.parts[0].correctAnswer).toBe(derived);
    }
  });

  it("partition lessons have both a count part and a unit-fraction part", () => {
    for (const practiceType of ["halves_thirds_fourths", "sixths_eighths"]) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      expect(problems.length).toBeGreaterThan(0);
      for (const problem of problems) {
        expect(problem.parts.length).toBe(2);

        const countPart = problem.parts[0];
        expect(countPart.label.toLowerCase()).toMatch(/how many equal parts/);
        const count = Number(countPart.correctAnswer);
        expect(ALLOWED_DENOMINATORS[practiceType]).toContain(count);
        expect(countPart.choices).toContain(String(count));

        const fractionPart = problem.parts[1];
        expect(fractionPart.label.toLowerCase()).toMatch(/what fraction is one part/);
        const fraction = parseFraction(fractionPart.correctAnswer);
        expect(fraction).toEqual({ numerator: 1, denominator: count });
        expect(fractionPart.choices).toContain(fractionPart.correctAnswer);

        expect(problem.prompt.toLowerCase()).toContain(DENOMINATOR_NAMES[count]);
      }
    }
  });

  it("uses denominators from the correct lesson set", () => {
    for (const practiceType of Object.keys(ALLOWED_DENOMINATORS)) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 30));
      for (const problem of problems) {
        let denominator: number;
        if (problem.parts.length === 2) {
          denominator = Number(problem.parts[0].correctAnswer);
        } else {
          const correct = parseFraction(problem.parts[0].correctAnswer);
          expect(correct).toBeDefined();
          denominator = correct!.denominator;
        }
        expect(ALLOWED_DENOMINATORS[practiceType]).toContain(denominator);
      }
    }
  });

  it("keeps unit-fraction answers as 1 over the total equal parts", () => {
    const unitTypes = ["halves_thirds_fourths", "sixths_eighths", "name_unit_fractions"];
    for (const practiceType of unitTypes) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      for (const problem of problems) {
        const fractionPart = problem.parts[problem.parts.length - 1];
        const correct = parseFraction(fractionPart.correctAnswer);
        expect(correct).toBeDefined();
        expect(correct!.numerator).toBe(1);
        expect(correct!.denominator).toBeGreaterThan(1);
      }
    }
  });

  it("makes generated representations match the fraction answer", () => {
    const modelTypes = [
      "name_unit_fractions",
      "fraction_bars",
      "area_models_and_stories",
      "numerator_meaning",
      "denominator_meaning",
    ];
    for (const practiceType of modelTypes) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      for (const problem of problems) {
        const model = extractModelNumbers(problem.prompt);
        expect(model).toBeDefined();

        if (practiceType === "numerator_meaning") {
          expect(problem.parts[0].correctAnswer).toBe(String(model!.numerator));
        } else if (practiceType === "denominator_meaning") {
          expect(problem.parts[0].correctAnswer).toBe(String(model!.denominator));
        } else {
          const correct = parseFraction(problem.parts[0].correctAnswer);
          expect(correct).toBeDefined();
          expect(correct!.numerator).toBe(model!.numerator);
          expect(correct!.denominator).toBe(model!.denominator);
        }
      }
    }
  });

  it("keeps numerator and denominator semantics correct", () => {
    const numeratorProblems = fractionsFoundationsFamily(makeContext("numerator_meaning", 20));
    for (const problem of numeratorProblems) {
      const model = extractModelNumbers(problem.prompt);
      expect(model).toBeDefined();
      expect(problem.parts[0].correctAnswer).toBe(String(model!.numerator));
    }

    const denominatorProblems = fractionsFoundationsFamily(makeContext("denominator_meaning", 20));
    for (const problem of denominatorProblems) {
      const model = extractModelNumbers(problem.prompt);
      expect(model).toBeDefined();
      expect(problem.parts[0].correctAnswer).toBe(String(model!.denominator));
    }
  });

  it("produces deterministic output for the same seed", () => {
    for (const practiceType of FRACTION_PRACTICE_TYPES) {
      const a = fractionsFoundationsFamily(makeContext(practiceType, 10, "seed-same"));
      const b = fractionsFoundationsFamily(makeContext(practiceType, 10, "seed-same"));
      expect(a).toEqual(b);
    }
  });

  it("produces no duplicate problemKeys within one attempt", () => {
    for (const practiceType of FRACTION_PRACTICE_TYPES) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      const keys = problems.map((p) => p.problemKey ?? p.id);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("fraction_bars use a fraction-bar model with a matching shaded representation", () => {
    const problems = fractionsFoundationsFamily(makeContext("fraction_bars", 20));
    for (const problem of problems) {
      expect(problem.prompt).toMatch(/fraction bar/i);
      expect(problem.prompt).not.toMatch(/candy|chocolate|granola|bread|sandwich/i);

      const model = extractModelNumbers(problem.prompt);
      expect(model).toBeDefined();

      const correct = parseFraction(problem.parts[0].correctAnswer);
      expect(correct).toBeDefined();
      expect(correct!.numerator).toBe(model!.numerator);
      expect(correct!.denominator).toBe(model!.denominator);

      const visualMatch = problem.prompt.match(/\[([█░\s]+)\]/);
      expect(visualMatch).toBeDefined();

      const symbols = visualMatch![1].trim().split(/\s+/);
      expect(symbols.length).toBe(model!.denominator);
      const shadedCount = symbols.filter((s) => s === "█").length;
      expect(shadedCount).toBe(model!.numerator);
    }
  });

  it("uses only proper fractions in choices", () => {
    for (const practiceType of FRACTION_PRACTICE_TYPES) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      for (const problem of problems) {
        for (const part of problem.parts) {
          for (const choice of part.choices ?? []) {
            const frac = parseFraction(choice);
            if (frac) {
              expect(frac.numerator).toBeLessThan(frac.denominator);
              expect(frac.denominator).toBeGreaterThan(1);
            }
          }
        }
      }
    }
  });

  it("includes exactly one correct choice per multiple-choice problem", () => {
    for (const practiceType of FRACTION_PRACTICE_TYPES) {
      const problems = fractionsFoundationsFamily(makeContext(practiceType, 20));
      for (const problem of problems) {
        for (const part of problem.parts) {
          const choices = part.choices;
          if (!choices || choices.length === 0) continue;
          const correctCount = choices.filter((c) => c === part.correctAnswer).length;
          expect(correctCount).toBe(1);
        }
      }
    }
  });

  it("name_unit_fractions stays a dedicated single-part naming form", () => {
    const problems = fractionsFoundationsFamily(makeContext("name_unit_fractions", 20));
    for (const problem of problems) {
      expect(problem.parts.length).toBe(1);
      expect(problem.prompt).toMatch(/unit fraction/i);
      const correct = parseFraction(problem.parts[0].correctAnswer);
      expect(correct).toBeDefined();
      expect(correct!.numerator).toBe(1);
    }
  });
});
