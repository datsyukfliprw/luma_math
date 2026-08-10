import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";

const CUSTOMARY_LENGTH_LESSON = "g3-u34-w1-l1";
const QUARTER_INCH_LESSON = "g3-u34-w1-l2";
const WEIGHT_MASS_VOLUME_LESSON = "g3-u34-w1-l3";

const LENGTH_UNITS = ["inches", "feet", "yards"];
const WEIGHT_MASS_VOLUME_UNITS = [
  "ounces",
  "pounds",
  "grams",
  "kilograms",
  "cups",
  "pints",
  "quarts",
  "gallons",
  "liters",
  "milliliters",
];
const LENGTH_UNIT_CHOICES = ["inches", "feet", "yards", "centimeters", "meters"];

function getExperience(lessonId: string, attemptKey: string) {
  const exp = getResolvedTryItExperience(lessonId, { attemptKey });
  if (!exp) throw new Error(`No Try It experience resolved for ${lessonId}`);
  return exp;
}

describe("Unit 34 measurement Try It semantics", () => {
  describe("customary_length_units", () => {
    it("is deterministic for the same seed", () => {
      const a = getExperience(CUSTOMARY_LENGTH_LESSON, "cl-det-a");
      const b = getExperience(CUSTOMARY_LENGTH_LESSON, "cl-det-a");
      expect(JSON.stringify(a.problems)).toBe(JSON.stringify(b.problems));
    });

    it("has no duplicate problemKey within one attempt", () => {
      const exp = getExperience(CUSTOMARY_LENGTH_LESSON, "cl-dedup");
      const keys = exp.problems.map((p) => p.problemKey ?? p.id);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("varies problemKeys across seeds", () => {
      const allKeys: string[] = [];
      let count = 0;
      for (let i = 0; i < 5; i++) {
        const exp = getExperience(CUSTOMARY_LENGTH_LESSON, `cl-var-${i}`);
        count = exp.problems.length;
        allKeys.push(...exp.problems.map((p) => p.problemKey ?? p.id));
      }
      expect(new Set(allKeys).size).toBeGreaterThan(count);
    });

    it("covers choosing the unit, estimating length, and a combined form", () => {
      const forms = new Set<string>();
      for (let i = 0; i < 24; i++) {
        const exp = getExperience(CUSTOMARY_LENGTH_LESSON, `cl-forms-${i}`);
        for (const problem of exp.problems) {
          if (problem.parts.length === 1) {
            const part = problem.parts[0];
            if (LENGTH_UNITS.includes(part.correctAnswer)) {
              forms.add("choose_unit");
              expect(part.choices).toContain(part.correctAnswer);
              expect(part.choices?.every((c) => LENGTH_UNITS.includes(c))).toBe(true);
            } else if (!Number.isNaN(Number(part.correctAnswer))) {
              forms.add("estimate_length");
              expect(part.choices).toContain(part.correctAnswer);
              const unitMatch = problem.prompt.match(/how many (\w+) long/i);
              expect(unitMatch).toBeTruthy();
              expect(LENGTH_UNITS).toContain(unitMatch![1]);
            } else {
              throw new Error(`Unexpected single-part answer: ${part.correctAnswer}`);
            }
          } else if (problem.parts.length === 2) {
            forms.add("choose_and_estimate");
            const unitPart = problem.parts.find((p) => p.key === "unit");
            const estimatePart = problem.parts.find((p) => p.key === "estimate");
            expect(unitPart).toBeDefined();
            expect(LENGTH_UNITS).toContain(unitPart!.correctAnswer);
            expect(unitPart!.choices).toContain(unitPart!.correctAnswer);
            expect(estimatePart).toBeDefined();
            expect(Number(estimatePart!.correctAnswer)).not.toBeNaN();
            expect(estimatePart!.choices).toContain(estimatePart!.correctAnswer);
          } else {
            throw new Error(`Unexpected part count: ${problem.parts.length}`);
          }
        }
      }
      expect(forms.has("choose_unit")).toBe(true);
      expect(forms.has("estimate_length")).toBe(true);
      expect(forms.has("choose_and_estimate")).toBe(true);
    });

    it("problemKeys encode the scenario, unit, and form", () => {
      const exp = getExperience(CUSTOMARY_LENGTH_LESSON, "cl-key");
      for (const problem of exp.problems) {
        expect(problem.problemKey).toMatch(/^customary_length_units:/);
        expect(problem.problemKey).toMatch(/:(choose_unit|estimate_length|choose_and_estimate)/);
      }
    });
  });

  describe("quarter_inch_measurement", () => {
    it("is deterministic for the same seed and has no duplicate keys", () => {
      const a = getExperience(QUARTER_INCH_LESSON, "qi-det-a");
      const b = getExperience(QUARTER_INCH_LESSON, "qi-det-a");
      expect(JSON.stringify(a.problems)).toBe(JSON.stringify(b.problems));
      const keys = a.problems.map((p) => p.problemKey ?? p.id);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("varies problemKeys across seeds", () => {
      const allKeys: string[] = [];
      let count = 0;
      for (let i = 0; i < 5; i++) {
        const exp = getExperience(QUARTER_INCH_LESSON, `qi-var-${i}`);
        count = exp.problems.length;
        allKeys.push(...exp.problems.map((p) => p.problemKey ?? p.id));
      }
      expect(new Set(allKeys).size).toBeGreaterThan(count);
    });

    it("uses exact fractional strings, not decimals", () => {
      for (let i = 0; i < 24; i++) {
        for (const problem of getExperience(QUARTER_INCH_LESSON, `qi-frac-${i}`).problems) {
          const correct = problem.parts[0].correctAnswer;
          expect(correct).toMatch(
            /^(1 inch|([2-9]\d*|\d{2,}) inches|\d+ \d\/[24] inches|\d\/[24] inches)$/,
          );
          expect(correct).not.toContain(".");
          expect(problem.parts[0].choices).toContain(correct);
          for (const choice of problem.parts[0].choices ?? []) {
            expect(choice).toMatch(
              /^(1 inch|([2-9]\d*|\d{2,}) inches|\d+ \d\/[24] inches|\d\/[24] inches)$/,
            );
            expect(choice).not.toContain(".");
          }
        }
      }
    });

    it("renders exactly 1 whole inch as '1 inch'", () => {
      let found = false;
      for (let i = 0; i < 200; i++) {
        const exp = getExperience(QUARTER_INCH_LESSON, `qi-one-inch-${i}`);
        for (const problem of exp.problems) {
          if (problem.parts[0].correctAnswer === "1 inch") {
            found = true;
            expect(problem.parts[0].choices).toContain("1 inch");
          }
        }
        if (found) break;
      }
      expect(found).toBe(true);
    });

    it("includes non-whole inch answers across seeds", () => {
      let seenNonWhole = false;
      for (let i = 0; i < 24; i++) {
        for (const problem of getExperience(QUARTER_INCH_LESSON, `qi-nw-${i}`).problems) {
          if (problem.parts[0].correctAnswer.includes("/")) {
            seenNonWhole = true;
          }
        }
      }
      expect(seenNonWhole).toBe(true);
    });

    it("describes ruler marks unambiguously and avoids the old quarter-inch conversion wording", () => {
      for (let i = 0; i < 12; i++) {
        for (const problem of getExperience(QUARTER_INCH_LESSON, `qi-amb-${i}`).problems) {
          const prompt = problem.prompt.toLowerCase();
          expect(prompt).toMatch(/ruler|mark|between/);
          expect(prompt).not.toMatch(/quarter-inches long\.?\s*how many inches is that/);
        }
      }
    });

    it("problemKeys encode the measurement, object, and form", () => {
      const exp = getExperience(QUARTER_INCH_LESSON, "qi-key");
      for (const problem of exp.problems) {
        expect(problem.problemKey).toMatch(/^quarter_inch_measurement:/);
        expect(problem.problemKey).toMatch(/:quarter_inch_(mark|between)/);
      }
    });
  });

  describe("choose_weight_mass_volume_units", () => {
    it("is deterministic for the same seed and has no duplicate keys", () => {
      const a = getExperience(WEIGHT_MASS_VOLUME_LESSON, "wmv-det-a");
      const b = getExperience(WEIGHT_MASS_VOLUME_LESSON, "wmv-det-a");
      expect(JSON.stringify(a.problems)).toBe(JSON.stringify(b.problems));
      const keys = a.problems.map((p) => p.problemKey ?? p.id);
      expect(new Set(keys).size).toBe(keys.length);
    });

    it("varies problemKeys across seeds", () => {
      const allKeys: string[] = [];
      let count = 0;
      for (let i = 0; i < 5; i++) {
        const exp = getExperience(WEIGHT_MASS_VOLUME_LESSON, `wmv-var-${i}`);
        count = exp.problems.length;
        allKeys.push(...exp.problems.map((p) => p.problemKey ?? p.id));
      }
      expect(new Set(allKeys).size).toBeGreaterThan(count);
    });

    it("never uses length scenarios or length units", () => {
      for (let i = 0; i < 24; i++) {
        for (const problem of getExperience(WEIGHT_MASS_VOLUME_LESSON, `wmv-length-${i}`)
          .problems) {
          const prompt = problem.prompt.toLowerCase();
          for (const lengthWord of ["inches", "feet", "yards", "centimeters", "meters"]) {
            expect(prompt).not.toContain(lengthWord);
          }
          expect(prompt).not.toMatch(/\blength\b/);

          for (const part of problem.parts) {
            for (const choice of part.choices ?? []) {
              expect(LENGTH_UNIT_CHOICES).not.toContain(choice);
            }
          }
        }
      }
    });

    it("uses reasonable weight, mass, or volume units for each scenario", () => {
      for (let i = 0; i < 24; i++) {
        for (const problem of getExperience(WEIGHT_MASS_VOLUME_LESSON, `wmv-reasonable-${i}`)
          .problems) {
          const correct = problem.parts[0].correctAnswer;
          expect(WEIGHT_MASS_VOLUME_UNITS).toContain(correct);

          for (const part of problem.parts) {
            for (const choice of part.choices ?? []) {
              expect(WEIGHT_MASS_VOLUME_UNITS).toContain(choice);
            }
          }

          expect(problem.prompt).toMatch(/weight|mass|liquid volume/);
          expect(problem.prompt).not.toMatch(/\blength\b/);
        }
      }
    });

    it("problemKeys encode the scenario, unit, and form", () => {
      const exp = getExperience(WEIGHT_MASS_VOLUME_LESSON, "wmv-key");
      for (const problem of exp.problems) {
        expect(problem.problemKey).toMatch(/^choose_weight_mass_volume_units:/);
        expect(problem.problemKey).toMatch(/:unit/);
      }
    });
  });
});
