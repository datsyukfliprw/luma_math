import {
  getScaledFactMisconceptionCandidates,
  getTenPatternMisconceptionCandidates,
  listScaledFactStates,
  listTenPatternStates,
  scaledFactProblemKey,
  tenPatternProblemKey,
  type ScaledFactState,
  type TenPatternState,
} from "../lib/multiplication/multiplesOfTen";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const MULTIPLES_OF_TEN_PRACTICE_TYPES = [
  "multiples_of_ten_basic_facts",
  "one_digit_by_multiples_of_ten",
  "multiples_of_ten_word_problems",
  "place_value_patterns",
] as const;

export type MultiplesOfTenPracticeType = (typeof MULTIPLES_OF_TEN_PRACTICE_TYPES)[number];
type Rng = ReturnType<typeof createSeededRng>;

const STORY_CONTEXTS = [
  { container: "box", containers: "boxes", item: "stickers" },
  { container: "tray", containers: "trays", item: "cookies" },
  { container: "pack", containers: "packs", item: "crayons" },
  { container: "shelf", containers: "shelves", item: "books" },
] as const;

function getSeed(
  practiceType: MultiplesOfTenPracticeType,
  options: PracticeGenerationOptions | undefined,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;
  return getPracticeProblemCount(options);
}

function buildChoices(correct: number, distractors: number[], rng: Rng): string[] {
  const uniqueDistractors = distractors.filter((candidate, index) => distractors.indexOf(candidate) === index);
  if (uniqueDistractors.length < 3) {
    throw new Error("Multiples-of-ten core did not provide enough unique distractors");
  }
  return rng.shuffle([String(correct), ...uniqueDistractors.slice(0, 3).map(String)]);
}

function scaledAnswerData(state: ScaledFactState) {
  return {
    factorA: String(state.oneDigit),
    factorB: String(state.multipleOfTen),
    product: String(state.scaledProduct),
  };
}

function makeBasicFactProblem(
  state: ScaledFactState,
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  const equation = `${state.oneDigit} × ${state.multipleOfTen} = ?`;
  return {
    id: `multiples-of-ten-basic-facts-${mode}-${index + 1}`,
    questionText: `Use the basic fact ${state.oneDigit} × ${state.tensDigit} = ${state.basicProduct}. What is ${equation}`,
    correctAnswer: String(state.scaledProduct),
    visualType: "multiple_choice",
    problemKey: scaledFactProblemKey(state, "connect"),
    visualData: {
      equation,
      factors: [state.oneDigit, state.multipleOfTen],
      product: state.scaledProduct,
      choices: buildChoices(state.scaledProduct, getScaledFactMisconceptionCandidates(state), rng),
    },
    answerData: scaledAnswerData(state),
  };
}

function makeScaffoldedProductProblem(
  state: ScaledFactState,
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  const equation = `${state.oneDigit} × ${state.multipleOfTen} = ?`;
  return {
    id: `one-digit-by-multiples-of-ten-${mode}-${index + 1}`,
    questionText: `Use the basic fact ${state.oneDigit} × ${state.tensDigit} = ${state.basicProduct}. Then use its one zero to solve ${equation}`,
    correctAnswer: String(state.scaledProduct),
    visualType: "multiple_choice",
    problemKey: scaledFactProblemKey(state, "product"),
    visualData: {
      equation,
      factors: [state.oneDigit, state.multipleOfTen],
      product: state.scaledProduct,
      choices: buildChoices(state.scaledProduct, getScaledFactMisconceptionCandidates(state), rng),
    },
    answerData: scaledAnswerData(state),
  };
}

function makeWordProblem(
  state: ScaledFactState,
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  const context = rng.pick(STORY_CONTEXTS);
  const container = state.oneDigit === 1 ? context.container : context.containers;
  const questionText = `There are ${state.oneDigit} ${container}. Each ${context.container} holds ${state.multipleOfTen} ${context.item}. How many ${context.item} are there altogether?`;
  const equation = `${state.oneDigit} × ${state.multipleOfTen} = ?`;
  return {
    id: `multiples-of-ten-word-problems-${mode}-${index + 1}`,
    questionText,
    correctAnswer: String(state.scaledProduct),
    visualType: "multiple_choice",
    problemKey: scaledFactProblemKey(state, "product"),
    visualData: {
      equation,
      factors: [state.oneDigit, state.multipleOfTen],
      product: state.scaledProduct,
      choices: buildChoices(state.scaledProduct, getScaledFactMisconceptionCandidates(state), rng),
    },
    answerData: scaledAnswerData(state),
  };
}

function makePatternProblem(state: TenPatternState, index: number, mode: string, rng: Rng): PracticeProblem {
  const terms = state.products.map((product, termIndex) =>
    `${state.oneDigit} × ${state.tensDigits[termIndex] * 10} = ${termIndex === state.missingIndex ? "?" : product}`,
  );
  const equation = terms.join(", ");
  const correct = state.products[state.missingIndex];
  return {
    id: `place-value-patterns-${mode}-${index + 1}`,
    questionText: `The first factor stays ${state.oneDigit}. Each second factor increases by 10, so each product increases by ${state.constantDifference}. Find the missing product: ${equation}`,
    correctAnswer: String(correct),
    visualType: "multiple_choice",
    problemKey: tenPatternProblemKey(state),
    visualData: {
      equation,
      factors: [state.oneDigit, state.tensDigits[state.missingIndex] * 10],
      product: correct,
      choices: buildChoices(correct, getTenPatternMisconceptionCandidates(state), rng),
    },
    answerData: {
      factorA: String(state.oneDigit),
      factorB: String(state.tensDigits[state.missingIndex] * 10),
      product: String(correct),
    },
  };
}

export function generateMultiplesOfTenProblems(
  practiceType: MultiplesOfTenPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }

  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  if (practiceType === "place_value_patterns") {
    const states = listTenPatternStates();
    if (count > states.length) throw new RangeError("Requested count exceeds ten-pattern state space");
    return rng.shuffle(states).slice(0, count).map((state, index) => makePatternProblem(state, index, mode, rng));
  }

  const states = listScaledFactStates();
  if (count > states.length) throw new RangeError("Requested count exceeds scaled-fact state space");
  return rng.shuffle(states).slice(0, count).map((state, index) => {
    if (practiceType === "multiples_of_ten_basic_facts") return makeBasicFactProblem(state, index, mode, rng);
    if (practiceType === "one_digit_by_multiples_of_ten") return makeScaffoldedProductProblem(state, index, mode, rng);
    return makeWordProblem(state, index, mode, rng);
  });
}

export const generateMultiplesOfTenBasicFactsProblems = (
  options?: PracticeGenerationOptions,
): PracticeProblem[] => generateMultiplesOfTenProblems("multiples_of_ten_basic_facts", options);
export const generateOneDigitByMultiplesOfTenProblems = (
  options?: PracticeGenerationOptions,
): PracticeProblem[] => generateMultiplesOfTenProblems("one_digit_by_multiples_of_ten", options);
export const generateMultiplesOfTenWordProblems = (
  options?: PracticeGenerationOptions,
): PracticeProblem[] => generateMultiplesOfTenProblems("multiples_of_ten_word_problems", options);
export const generatePlaceValuePatternsProblems = (
  options?: PracticeGenerationOptions,
): PracticeProblem[] => generateMultiplesOfTenProblems("place_value_patterns", options);
