import { describe, expect, it } from "vitest";
import {
  areEquivalentFractions,
  compareFractions,
  comparisonSymbol,
  createFractionState,
  formatFraction,
  gcd,
} from "../lib/fractions/core";
import {
  FRACTION_FOUNDATIONS_PRACTICE_TYPES,
  generateFractionFoundationsProblems,
  type FractionFoundationsPracticeType,
} from "./fractionsFoundations";
import {
  FRACTION_EQUIVALENCE_PRACTICE_TYPES,
  generateFractionEquivalenceProblems,
  type FractionEquivalencePracticeType,
} from "./fractionsEquivalence";
import {
  COMPARING_FRACTIONS_PRACTICE_TYPES,
  generateComparingFractionsProblems,
  type ComparingFractionsPracticeType,
} from "./comparingFractions";
import { practiceRegistry } from "./registry";
import type { PracticeProblem } from "./types";

const ALL_FRACTION_PRACTICE_TYPES = [
  ...FRACTION_FOUNDATIONS_PRACTICE_TYPES,
  ...FRACTION_EQUIVALENCE_PRACTICE_TYPES,
  ...COMPARING_FRACTIONS_PRACTICE_TYPES,
] as const;

function generate(practiceType: string, seed: string): PracticeProblem[] {
  if ((FRACTION_FOUNDATIONS_PRACTICE_TYPES as readonly string[]).includes(practiceType)) {
    return generateFractionFoundationsProblems(practiceType as FractionFoundationsPracticeType, {
      count: 6,
      seed,
    });
  }
  if ((FRACTION_EQUIVALENCE_PRACTICE_TYPES as readonly string[]).includes(practiceType)) {
    return generateFractionEquivalenceProblems(practiceType as FractionEquivalencePracticeType, {
      count: 6,
      seed,
    });
  }
  return generateComparingFractionsProblems(practiceType as ComparingFractionsPracticeType, {
    count: 6,
    seed,
  });
}

function parseState(key: string) {
  const match = key.match(/:n=(\d+):d=(\d+):task=/);
  if (!match) throw new Error(`Missing fraction state in key: ${key}`);
  return createFractionState(Number(match[1]), Number(match[2]));
}

function parsePair(key: string) {
  const match = key.match(/:a=(\d+)\/(\d+):b=(\d+)\/(\d+):task=/);
  if (!match) throw new Error(`Missing fraction pair in key: ${key}`);
  return {
    a: createFractionState(Number(match[1]), Number(match[2])),
    b: createFractionState(Number(match[3]), Number(match[4])),
  };
}

function parseFraction(text: string) {
  const match = text.match(/^(\d+)\/(\d+)$/);
  if (!match) throw new Error(`Expected fraction answer, got: ${text}`);
  return createFractionState(Number(match[1]), Number(match[2]));
}

describe("fraction generator families", () => {
  it("registers all 28 fraction practice types as specialized generators", () => {
    expect(ALL_FRACTION_PRACTICE_TYPES).toHaveLength(28);
    for (const practiceType of ALL_FRACTION_PRACTICE_TYPES) {
      expect(practiceRegistry[practiceType]).toBeDefined();
    }
  });

  it.each(ALL_FRACTION_PRACTICE_TYPES)(
    "%s replays deterministically with unique canonical keys and valid choices",
    (practiceType) => {
      const runA = generate(practiceType, `fraction-${practiceType}`);
      const runB = generate(practiceType, `fraction-${practiceType}`);
      expect(runA).toHaveLength(6);
      expect(JSON.stringify(runA)).toBe(JSON.stringify(runB));
      expect(new Set(runA.map((problem) => problem.problemKey)).size).toBe(6);
      for (const problem of runA) {
        expect(problem.problemKey.startsWith("fraction:")).toBe(true);
        const choices = problem.visualData?.choices ?? [];
        expect(choices.length).toBeGreaterThanOrEqual(2);
        expect(new Set(choices).size).toBe(choices.length);
        expect(choices).toContain(problem.correctAnswer);
      }
    },
  );

  it("keeps foundation answers faithful to numerator, denominator, and shaded fraction roles", () => {
    for (const practiceType of [
      "name_unit_fractions",
      "numerator_meaning",
      "denominator_meaning",
      "fraction_bars",
      "area_models_and_stories",
    ] as const) {
      for (const problem of generate(practiceType, `foundation-${practiceType}`)) {
        const state = parseState(problem.problemKey);
        if (practiceType === "numerator_meaning") {
          expect(problem.correctAnswer).toBe(String(state.numerator));
        } else if (practiceType === "denominator_meaning") {
          expect(problem.correctAnswer).toBe(String(state.denominator));
        } else {
          expect(problem.correctAnswer).toBe(formatFraction(state));
        }
      }
    }
  });

  it("classifies equal and unequal partitions from their learner-visible widths", () => {
    const problems = generate("equal_unequal_parts", "equal-unequal-semantic");
    expect(new Set(problems.map((problem) => problem.correctAnswer))).toEqual(
      new Set(["Equal", "Unequal"]),
    );
    for (const problem of problems) {
      const match = problem.problemKey.match(/:widths=([0-9,]+):task=/);
      if (!match) throw new Error(`Missing widths in key: ${problem.problemKey}`);
      const widths = match[1].split(",").map(Number);
      const equal = new Set(widths).size === 1;
      expect(problem.correctAnswer).toBe(equal ? "Equal" : "Unequal");
    }
  });

  it("uses denominator-sized equal partitions for halves through eighths", () => {
    for (const practiceType of ["halves_thirds_fourths", "sixths_eighths"] as const) {
      for (const problem of generate(practiceType, `partition-${practiceType}`)) {
        const state = parseState(problem.problemKey);
        expect(state.numerator).toBe(1);
        expect(problem.correctAnswer).toBe(
          `${state.denominator} equal parts; one part is 1/${state.denominator}`,
        );
      }
    }
  });

  it("keeps all equivalence tasks mathematically equivalent or explicitly non-equivalent", () => {
    for (const practiceType of FRACTION_EQUIVALENCE_PRACTICE_TYPES) {
      const problems = generate(practiceType, `equivalence-${practiceType}`);
      for (const problem of problems) {
        if ([
          "zero_to_one_interval",
          "partition_number_lines",
          "locate_unit_fractions_number_line",
          "locate_non_unit_fractions_number_line",
        ].includes(practiceType)) {
          const state = parseState(problem.problemKey);
          if (practiceType === "partition_number_lines") {
            expect(problem.correctAnswer).toBe(String(state.denominator));
          } else {
            expect(problem.correctAnswer).toBe(formatFraction(state));
          }
          continue;
        }

        const { a, b } = parsePair(problem.problemKey);
        if (practiceType === "equivalence_same_amount") {
          expect(problem.correctAnswer).toBe(
            areEquivalentFractions(a, b) ? "Equivalent" : "Not equivalent",
          );
          continue;
        }

        expect(areEquivalentFractions(a, b)).toBe(true);
        if (practiceType === "graph_equivalent_fractions" || practiceType === "connect_models_number_lines_equations") {
          const answer = parseFraction(problem.correctAnswer);
          expect(areEquivalentFractions(a, answer)).toBe(true);
          expect(gcd(answer.numerator, answer.denominator)).toBe(1);
        } else if (practiceType === "generate_explain_equivalent") {
          expect(problem.correctAnswer.startsWith(`${formatFraction(b)};`)).toBe(true);
        } else {
          expect(problem.correctAnswer).toBe(formatFraction(b));
        }
      }
    }
  });

  it("keeps every comparison answer aligned with exact fraction ordering", () => {
    for (const practiceType of COMPARING_FRACTIONS_PRACTICE_TYPES) {
      for (const problem of generate(practiceType, `compare-${practiceType}`)) {
        const { a, b } = parsePair(problem.problemKey);
        const larger = compareFractions(a, b) > 0 ? formatFraction(a) : formatFraction(b);

        if (practiceType === "use_comparison_symbols") {
          expect(problem.correctAnswer).toBe(comparisonSymbol(a, b));
        } else if (practiceType === "comparison_word_problems_like_denominators") {
          const match = problem.questionText.match(/^(\w+) ate .*?\. (\w+) ate /);
          if (!match) throw new Error(`Could not read names from: ${problem.questionText}`);
          expect(problem.correctAnswer).toBe(compareFractions(a, b) > 0 ? match[1] : match[2]);
        } else if (practiceType === "same_whole_fractions") {
          if (problem.problemKey.includes("sameWhole=false")) {
            expect(problem.correctAnswer).toContain("wholes are different sizes");
          } else {
            expect(problem.correctAnswer).toBe(larger);
          }
        } else if (practiceType === "compare_explain_fractions") {
          expect(problem.correctAnswer.startsWith(
            `${formatFraction(a)} ${comparisonSymbol(a, b)} ${formatFraction(b)};`,
          )).toBe(true);
        } else {
          expect(problem.correctAnswer).toBe(larger);
        }
      }
    }
  });
});
