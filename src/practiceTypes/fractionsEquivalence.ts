import {
  areEquivalentFractions,
  createProperFractionState,
  formatFraction,
  fractionPairProblemKey,
  fractionProblemKey,
  reduceFraction,
  scaleFraction,
  type FractionState,
} from "../lib/fractions/core";
import { createSeededRng, type SeededRng } from "./random";
import {
  buildUniqueFractionProblems,
  equivalentTargetChoices,
  getFractionSeed,
  getFractionTargetCount,
  nonEquivalentFractionChoices,
  numberChoices,
  stringChoices,
} from "./fractionsShared";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const FRACTION_EQUIVALENCE_PRACTICE_TYPES = [
  "zero_to_one_interval",
  "partition_number_lines",
  "locate_unit_fractions_number_line",
  "locate_non_unit_fractions_number_line",
  "equivalence_same_amount",
  "fraction_strips_equivalence",
  "area_models_equivalence",
  "generate_explain_equivalent",
  "same_location_number_line",
  "find_equivalents_number_line",
  "graph_equivalent_fractions",
  "connect_models_number_lines_equations",
] as const;

export type FractionEquivalencePracticeType =
  (typeof FRACTION_EQUIVALENCE_PRACTICE_TYPES)[number];

type PairState = { base: FractionState; equivalent: FractionState; multiplier: number };

function randomProperFraction(rng: SeededRng, unitOnly = false, nonUnitOnly = false): FractionState {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const denominator = rng.nextInt(unitOnly ? 2 : 3, 8);
    const numerator = unitOnly ? 1 : rng.nextInt(nonUnitOnly ? 2 : 1, denominator - 1);
    if (numerator < denominator) return createProperFractionState(numerator, denominator);
  }
  throw new Error("Could not generate a proper fraction");
}

function randomEquivalentPair(rng: SeededRng): PairState {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const base = randomProperFraction(rng);
    const multiplier = rng.nextInt(2, 3);
    const equivalent = scaleFraction(base, multiplier);
    if (equivalent.denominator <= 12) return { base, equivalent, multiplier };
  }
  throw new Error("Could not generate an equivalent fraction pair within Grade 3 bounds");
}

function randomNonEquivalentFraction(base: FractionState, rng: SeededRng): FractionState {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const candidate = randomProperFraction(rng);
    if (!areEquivalentFractions(base, candidate)) return candidate;
  }
  throw new Error("Could not generate a non-equivalent fraction");
}

function makeNumberLineFoundationProblems(
  practiceType:
    | "zero_to_one_interval"
    | "partition_number_lines"
    | "locate_unit_fractions_number_line"
    | "locate_non_unit_fractions_number_line",
  options: PracticeGenerationOptions | undefined,
): PracticeProblem[] {
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return buildUniqueFractionProblems(count, 700, (index) => {
    const state = practiceType === "locate_unit_fractions_number_line"
      ? randomProperFraction(rng, true)
      : practiceType === "locate_non_unit_fractions_number_line"
        ? randomProperFraction(rng, false, true)
        : randomProperFraction(rng);
    const fraction = formatFraction(state);
    let questionText: string;
    let correctAnswer: string;
    let task: string;
    let choices: string[];

    if (practiceType === "partition_number_lines") {
      questionText = `A number line from 0 to 1 needs to show ${fraction}. Into how many equal intervals should the whole be partitioned?`;
      correctAnswer = String(state.denominator);
      task = "partition-interval";
      choices = numberChoices(state.denominator, 2, 8, rng);
    } else if (practiceType === "locate_unit_fractions_number_line") {
      questionText = `A number line from 0 to 1 is divided into ${state.denominator} equal intervals. Which fraction is the first tick after 0?`;
      correctAnswer = fraction;
      task = "locate-unit";
      choices = nonEquivalentFractionChoices(state, rng);
    } else if (practiceType === "locate_non_unit_fractions_number_line") {
      questionText = `A number line from 0 to 1 is divided into ${state.denominator} equal intervals. Which fraction is ${state.numerator} ticks after 0?`;
      correctAnswer = fraction;
      task = "locate-non-unit";
      choices = nonEquivalentFractionChoices(state, rng);
    } else {
      questionText = `A number line from 0 to 1 is divided into ${state.denominator} equal intervals. Which fraction is ${state.numerator} interval${state.numerator === 1 ? "" : "s"} from 0?`;
      correctAnswer = fraction;
      task = "identify-position";
      choices = nonEquivalentFractionChoices(state, rng);
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, task),
      visualData: {
        start: 0,
        endpoint: 1,
        jumpCount: state.numerator,
        jumpSize: state.denominator,
        equation: fraction,
        choices,
      },
    };
  });
}

function makeEquivalentPairProblems(
  practiceType: Exclude<
    FractionEquivalencePracticeType,
    | "zero_to_one_interval"
    | "partition_number_lines"
    | "locate_unit_fractions_number_line"
    | "locate_non_unit_fractions_number_line"
  >,
  options: PracticeGenerationOptions | undefined,
): PracticeProblem[] {
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const sameAmountSchedule = practiceType === "equivalence_same_amount"
    ? rng.shuffle(Array.from({ length: count }, (_, index) => index % 2 === 0))
    : [];

  return buildUniqueFractionProblems(count, 900, (index) => {
    const { base, equivalent, multiplier } = randomEquivalentPair(rng);
    const baseText = formatFraction(base);
    const equivalentText = formatFraction(equivalent);
    let questionText: string;
    let correctAnswer: string;
    let task: string;
    let choices: string[];
    let key: string;

    if (practiceType === "equivalence_same_amount") {
      const shouldBeEquivalent = sameAmountSchedule[index];
      const second = shouldBeEquivalent ? equivalent : randomNonEquivalentFraction(base, rng);
      const secondText = formatFraction(second);
      correctAnswer = shouldBeEquivalent ? "Equivalent" : "Not equivalent";
      questionText = `Do ${baseText} and ${secondText} name the same amount?`;
      task = "same-amount";
      choices = rng.shuffle(["Equivalent", "Not equivalent"]);
      key = fractionPairProblemKey(practiceType, base, second, task);
    } else if (practiceType === "generate_explain_equivalent") {
      correctAnswer = `${equivalentText}; multiply numerator and denominator by ${multiplier}`;
      questionText = `Which statement gives an equivalent fraction for ${baseText} and correctly explains how it was made?`;
      task = "generate-explain";
      choices = stringChoices(
        correctAnswer,
        [
          `${equivalentText}; add ${multiplier} to numerator and denominator`,
          `${base.numerator + multiplier}/${base.denominator + multiplier}; add ${multiplier} to numerator and denominator`,
          `${base.numerator * multiplier}/${base.denominator}; multiply only the numerator by ${multiplier}`,
          `${base.numerator}/${base.denominator * multiplier}; multiply only the denominator by ${multiplier}`,
        ],
        rng,
      );
      key = fractionPairProblemKey(practiceType, base, equivalent, task, `m=${multiplier}`);
    } else if (practiceType === "graph_equivalent_fractions") {
      const reduced = reduceFraction(base);
      correctAnswer = formatFraction(reduced);
      questionText = `${baseText} and ${equivalentText} land at the same location on a number line. Which simplest fraction names that shared location?`;
      task = "graph-shared-location";
      choices = nonEquivalentFractionChoices(reduced, rng);
      key = fractionPairProblemKey(practiceType, base, equivalent, task);
    } else if (practiceType === "connect_models_number_lines_equations") {
      const reduced = reduceFraction(base);
      correctAnswer = formatFraction(reduced);
      questionText = `A fraction strip, area model, number line, and the equation ${baseText} = ${equivalentText} show the same amount. Which simplest fraction names that amount?`;
      task = "connect-representations";
      choices = nonEquivalentFractionChoices(reduced, rng);
      key = fractionPairProblemKey(practiceType, base, equivalent, task);
    } else {
      correctAnswer = equivalentText;
      if (practiceType === "fraction_strips_equivalence") {
        questionText = `A ${baseText} fraction strip lines up exactly with a strip divided into ${equivalent.denominator} equal parts. Which fraction on the second strip has the same length?`;
        task = "strip-equivalent";
      } else if (practiceType === "area_models_equivalence") {
        questionText = `An area model has ${baseText} shaded. The same whole is repartitioned into ${equivalent.denominator} equal parts. Which fraction shades the same amount?`;
        task = "area-equivalent";
      } else if (practiceType === "same_location_number_line") {
        questionText = `Which fraction is at the same point as ${baseText} on a number line from 0 to 1?`;
        task = "same-location";
      } else if (practiceType === "find_equivalents_number_line") {
        questionText = `A number line is repartitioned into ${equivalent.denominator} equal intervals. Which fraction is at the same point as ${baseText}?`;
        task = "find-equivalent-location";
      } else {
        throw new Error(`Unhandled equivalence practice type: ${practiceType}`);
      }
      choices = equivalentTargetChoices(base, equivalent, rng);
      key = fractionPairProblemKey(practiceType, base, equivalent, task);
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: key,
      visualData: {
        equation: `${baseText} = ${equivalentText}`,
        sourceDescription: `${baseText} and ${equivalentText}`,
        choices,
      },
    };
  });
}

export function generateFractionEquivalenceProblems(
  practiceType: FractionEquivalencePracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  switch (practiceType) {
    case "zero_to_one_interval":
    case "partition_number_lines":
    case "locate_unit_fractions_number_line":
    case "locate_non_unit_fractions_number_line":
      return makeNumberLineFoundationProblems(practiceType, options);
    case "equivalence_same_amount":
    case "fraction_strips_equivalence":
    case "area_models_equivalence":
    case "generate_explain_equivalent":
    case "same_location_number_line":
    case "find_equivalents_number_line":
    case "graph_equivalent_fractions":
    case "connect_models_number_lines_equations":
      return makeEquivalentPairProblems(practiceType, options);
    default: {
      const exhaustive: never = practiceType;
      throw new Error(`Unknown fraction equivalence practice type: ${String(exhaustive)}`);
    }
  }
}
