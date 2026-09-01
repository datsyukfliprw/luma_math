import {
  createProperFractionState,
  formatFraction,
  fractionProblemKey,
} from "../lib/fractions/core";
import { createSeededRng } from "./random";
import {
  buildUniqueFractionProblems,
  getFractionSeed,
  getFractionTargetCount,
  nonEquivalentFractionChoices,
  numberChoices,
  stringChoices,
} from "./fractionsShared";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const FRACTION_FOUNDATIONS_PRACTICE_TYPES = [
  "equal_unequal_parts",
  "halves_thirds_fourths",
  "sixths_eighths",
  "name_unit_fractions",
  "numerator_meaning",
  "denominator_meaning",
  "fraction_bars",
  "area_models_and_stories",
] as const;

export type FractionFoundationsPracticeType =
  (typeof FRACTION_FOUNDATIONS_PRACTICE_TYPES)[number];

const SHAPES = ["circle", "rectangle", "square", "pizza", "chocolate bar"] as const;
const PARTITION_SHAPES = ["rectangle", "rectangular strip", "square"] as const;
const PART_COUNTS = [2, 3, 4, 5, 6, 8] as const;
const NAMES: Record<number, string> = {
  2: "halves",
  3: "thirds",
  4: "fourths",
  5: "fifths",
  6: "sixths",
  8: "eighths",
};
const STORY_CONTEXTS = [
  ["pizza", "slices", "have pepperoni"],
  ["garden", "sections", "have flowers"],
  ["poster", "sections", "are painted blue"],
  ["cake", "pieces", "have frosting"],
] as const;

function partitionDenominators(practiceType: FractionFoundationsPracticeType): readonly number[] {
  if (practiceType === "halves_thirds_fourths") return [2, 3, 4];
  if (practiceType === "sixths_eighths") return [6, 8];
  return PART_COUNTS;
}

function partitionAnswerChoices(denominator: number, rng: ReturnType<typeof createSeededRng>): string[] {
  const correct = `${denominator} equal parts; one part is 1/${denominator}`;
  const wrongDenominators = PART_COUNTS.filter((value) => value !== denominator);
  const distractors = rng.shuffle([...wrongDenominators]).slice(0, 3).map(
    (value, index) => index === 0
      ? `${value} equal parts; one part is 1/${value}`
      : index === 1
        ? `${denominator} equal parts; one part is 1/${value}`
        : `${value} equal parts; one part is 1/${denominator}`,
  );
  return stringChoices(correct, distractors, rng);
}

function sectionWidths(
  parts: number,
  equal: boolean,
  rng: ReturnType<typeof createSeededRng>,
): number[] {
  if (equal) {
    const width = rng.nextInt(2, 5);
    return Array.from({ length: parts }, () => width);
  }
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const widths = Array.from({ length: parts }, () => rng.nextInt(1, 4));
    if (new Set(widths).size > 1) return widths;
  }
  return Array.from({ length: parts }, (_, index) => (index === 0 ? 1 : 2));
}

function makeEqualUnequalProblems(
  options: PracticeGenerationOptions | undefined,
): PracticeProblem[] {
  const practiceType = "equal_unequal_parts";
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const schedule = rng.shuffle(Array.from({ length: count }, (_, index) => index % 2 === 0));
  const mode = options?.mode ?? "guided";

  return buildUniqueFractionProblems(count, 500, (index) => {
    const equal = schedule[index];
    const parts = rng.pick(PART_COUNTS);
    const widths = sectionWidths(parts, equal, rng);
    const total = widths.reduce((sum, width) => sum + width, 0);
    const correctAnswer = equal ? "Equal" : "Unequal";
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: `A strip is ${total} units long and divided into ${parts} sections with widths ${widths.join(", ")} units. Are the parts equal or unequal?`,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: `fraction:${practiceType}:parts=${parts}:widths=${widths.join(",")}:task=classify`,
      visualData: {
        sourceDescription: `${parts} sections with widths ${widths.join(", ")}`,
        choices: rng.shuffle(["Equal", "Unequal"]),
      },
    };
  });
}

function makePartitionProblems(
  practiceType: "halves_thirds_fourths" | "sixths_eighths",
  options: PracticeGenerationOptions | undefined,
): PracticeProblem[] {
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const denominators = partitionDenominators(practiceType);

  return buildUniqueFractionProblems(count, 500, (index) => {
    const denominator = rng.pick(denominators);
    const shape = rng.pick(PARTITION_SHAPES);
    const state = createProperFractionState(1, denominator);
    const name = NAMES[denominator];
    const correctAnswer = `${denominator} equal parts; one part is ${formatFraction(state)}`;
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: `Partition a ${shape} into ${name}. Which choice correctly tells how many equal parts to make and the fraction represented by one part?`,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, "partition-unit", `shape=${shape}`),
      visualData: {
        sourceDescription: `${shape} partitioned into ${name}`,
        choices: partitionAnswerChoices(denominator, rng),
      },
    };
  });
}

function makeUnitFractionProblems(options: PracticeGenerationOptions | undefined): PracticeProblem[] {
  const practiceType = "name_unit_fractions";
  const count = getFractionTargetCount(options);
  if (count > PART_COUNTS.length) {
    throw new RangeError("Requested count exceeds unique unit-fraction state space");
  }
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return rng.shuffle([...PART_COUNTS]).slice(0, count).map((denominator, index) => {
    const state = createProperFractionState(1, denominator);
    const correctAnswer = formatFraction(state);
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: `A whole is divided into ${denominator} equal parts. What fraction names one part?`,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, "name-unit"),
      visualData: {
        choices: nonEquivalentFractionChoices(state, rng),
      },
    };
  });
}

function makeMeaningProblems(
  practiceType: "numerator_meaning" | "denominator_meaning",
  options: PracticeGenerationOptions | undefined,
): PracticeProblem[] {
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return buildUniqueFractionProblems(count, 500, (index) => {
    const denominator = rng.pick(PART_COUNTS);
    const numerator = rng.nextInt(1, denominator - 1);
    const state = createProperFractionState(numerator, denominator);
    const asksNumerator = practiceType === "numerator_meaning";
    const correct = asksNumerator ? numerator : denominator;
    const label = asksNumerator ? "numerator" : "denominator";
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: `A model has ${denominator} equal parts and ${numerator} shaded. In ${formatFraction(state)}, what does the ${label} tell you? Choose its value.`,
      correctAnswer: String(correct),
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, `identify-${label}`),
      visualData: {
        equation: formatFraction(state),
        choices: numberChoices(correct, 1, 8, rng),
      },
    };
  });
}

function makeFractionBarProblems(options: PracticeGenerationOptions | undefined): PracticeProblem[] {
  const practiceType = "fraction_bars";
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return buildUniqueFractionProblems(count, 500, (index) => {
    const denominator = rng.pick(PART_COUNTS);
    const numerator = rng.nextInt(1, denominator - 1);
    const state = createProperFractionState(numerator, denominator);
    const correctAnswer = formatFraction(state);
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: `A fraction bar is divided into ${denominator} equal sections and ${numerator} are shaded. What fraction of the bar is shaded?`,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, "name-shaded"),
      visualData: {
        sourceDescription: `${numerator} of ${denominator} equal bar sections shaded`,
        choices: nonEquivalentFractionChoices(state, rng),
      },
    };
  });
}

function makeAreaStoryProblems(options: PracticeGenerationOptions | undefined): PracticeProblem[] {
  const practiceType = "area_models_and_stories";
  const count = getFractionTargetCount(options);
  const rng = createSeededRng(getFractionSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const forms = rng.shuffle(Array.from({ length: count }, (_, index) => index % 2 === 0 ? "area" : "story"));

  return buildUniqueFractionProblems(count, 700, (index) => {
    const denominator = rng.pick(PART_COUNTS);
    const numerator = rng.nextInt(1, denominator - 1);
    const state = createProperFractionState(numerator, denominator);
    const form = forms[index];
    const correctAnswer = formatFraction(state);
    let questionText: string;
    if (form === "story") {
      const [whole, parts, feature] = rng.pick(STORY_CONTEXTS);
      questionText = `A ${whole} is divided into ${denominator} equal ${parts}. ${numerator} ${feature}. What fraction of the ${whole} has that feature?`;
    } else {
      const shape = rng.pick(SHAPES);
      questionText = `A ${shape} is divided into ${denominator} equal parts and ${numerator} are shaded. What fraction is shaded?`;
    }
    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer,
      visualType: "multiple_choice",
      problemKey: fractionProblemKey(practiceType, state, `represent-${form}`),
      visualData: {
        choices: nonEquivalentFractionChoices(state, rng),
      },
    };
  });
}

export function generateFractionFoundationsProblems(
  practiceType: FractionFoundationsPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  switch (practiceType) {
    case "equal_unequal_parts":
      return makeEqualUnequalProblems(options);
    case "halves_thirds_fourths":
    case "sixths_eighths":
      return makePartitionProblems(practiceType, options);
    case "name_unit_fractions":
      return makeUnitFractionProblems(options);
    case "numerator_meaning":
    case "denominator_meaning":
      return makeMeaningProblems(practiceType, options);
    case "fraction_bars":
      return makeFractionBarProblems(options);
    case "area_models_and_stories":
      return makeAreaStoryProblems(options);
    default: {
      const exhaustive: never = practiceType;
      throw new Error(`Unknown fraction foundations practice type: ${String(exhaustive)}`);
    }
  }
}
