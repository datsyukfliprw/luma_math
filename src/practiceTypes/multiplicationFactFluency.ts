import {
  createFixedFactorFactState,
  FIXED_FACTOR_FACT_RANGES,
  fixedFactorForPracticeType,
  fixedFactorFactProblemKey,
  getFixedFactorFactMisconceptionCandidates,
  type FixedFactorFactPracticeType,
} from "../lib/multiplication/factFluency";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export { FIXED_FACTOR_FACT_PRACTICE_TYPES } from "../lib/multiplication/factFluency";
export type { FixedFactorFactPracticeType } from "../lib/multiplication/factFluency";

function getSeed(
  practiceType: FixedFactorFactPracticeType,
  options: PracticeGenerationOptions | undefined,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;

  const lessonCount = options?.lesson?.practice_block?.question_count;
  if (typeof lessonCount === "number" && lessonCount > 0) return lessonCount;

  return getPracticeProblemCount(options);
}

function buildChoices(
  state: ReturnType<typeof createFixedFactorFactState>,
  rng: ReturnType<typeof createSeededRng>,
): string[] {
  const distractors = getFixedFactorFactMisconceptionCandidates(state).slice(0, 3);
  if (distractors.length < 3) {
    throw new Error("Fixed-factor fact fluency did not provide enough distractors");
  }

  return rng.shuffle([String(state.product), ...distractors.map(String)]);
}

function makeProblem(
  practiceType: FixedFactorFactPracticeType,
  state: ReturnType<typeof createFixedFactorFactState>,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const displayedFactorA = rng.nextInt(0, 1) === 0 ? state.fixedFactor : state.otherFactor;
  const displayedFactorB = displayedFactorA === state.fixedFactor ? state.otherFactor : state.fixedFactor;
  const equation = `${displayedFactorA} × ${displayedFactorB} = ?`;

  return {
    id: `${practiceType}-${mode}-${index + 1}`,
    questionText: `What is ${equation}`,
    correctAnswer: String(state.product),
    visualType: "multiple_choice",
    problemKey: fixedFactorFactProblemKey(state),
    visualData: {
      equation,
      factors: [displayedFactorA, displayedFactorB],
      choices: buildChoices(state, rng),
    },
    answerData: {
      factorA: String(displayedFactorA),
      factorB: String(displayedFactorB),
      product: String(state.product),
    },
  };
}

export function generateFixedFactorFactFluencyProblems(
  practiceType: FixedFactorFactPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
  const range = FIXED_FACTOR_FACT_RANGES[practiceType];
  const stateCount = range.max - range.min + 1;
  if (count > stateCount) {
    throw new RangeError("Requested count exceeds fixed-factor fact state space");
  }

  const rng = createSeededRng(getSeed(practiceType, options));
  const fixedFactor = fixedFactorForPracticeType(practiceType);
  const states = [];
  for (let otherFactor = range.min; otherFactor <= range.max; otherFactor += 1) {
    states.push(createFixedFactorFactState(fixedFactor, otherFactor));
  }

  return rng.shuffle(states).slice(0, count).map((state, index) =>
    makeProblem(practiceType, state, index, options?.mode ?? "guided", rng),
  );
}

export const generateMultiplicationFactFluencyProblems = generateFixedFactorFactFluencyProblems;
export const generateMultiplicationFactsProblems = generateFixedFactorFactFluencyProblems;
