import {
  enumerateUnknownFactorStates,
  createUnknownFactorState,
  getUnknownFactorAnswer,
  getUnknownFactorMisconceptionCandidates,
  UNKNOWN_FACTOR_POSITIONS,
  unknownFactorProblemKey,
  type UnknownFactorState,
} from "../lib/multiplication/unknownFactors";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

const PRACTICE_TYPE = "missing_factors";

function getSeed(options: PracticeGenerationOptions | undefined): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? PRACTICE_TYPE;
  return options?.seed ?? createPracticeSessionSeed(lessonId, PRACTICE_TYPE, mode);
}

function buildChoices(state: UnknownFactorState, rng: ReturnType<typeof createSeededRng>): string[] {
  const correct = getUnknownFactorAnswer(state);
  const distractors = getUnknownFactorMisconceptionCandidates(state).slice(0, 3);
  if (distractors.length < 3) {
    throw new Error("Unknown-factor core did not provide enough distractors");
  }

  return rng.shuffle([String(correct), ...distractors.map(String)]);
}

function makeProblem(
  canonicalState: UnknownFactorState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const unknownPosition = UNKNOWN_FACTOR_POSITIONS[rng.nextInt(0, UNKNOWN_FACTOR_POSITIONS.length - 1)];
  const state = unknownPosition === "left"
    ? createUnknownFactorState(canonicalState.missingFactor, canonicalState.knownFactor, unknownPosition)
    : createUnknownFactorState(canonicalState.knownFactor, canonicalState.missingFactor, unknownPosition);
  const correct = getUnknownFactorAnswer(state);
  const equation = state.unknownPosition === "left"
    ? `? × ${state.factorB} = ${state.product}`
    : `${state.factorA} × ? = ${state.product}`;

  return {
    id: `missing-factors-${mode}-${index + 1}`,
    questionText: `Find the missing factor: ${equation}`,
    correctAnswer: String(correct),
    visualType: "multiple_choice",
    problemKey: unknownFactorProblemKey(state),
    visualData: {
      equation,
      choices: buildChoices(state, rng),
    },
    answerData: {
      factorA: String(state.factorA),
      factorB: String(state.factorB),
      product: String(state.product),
    },
  };
}

export function generateMissingFactorsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options));
  const count = getPracticeProblemCount(options);
  const states = enumerateUnknownFactorStates();

  if (count > states.length) {
    throw new RangeError("Requested count exceeds unknown-factor state space");
  }

  return rng.shuffle(states).slice(0, count).map((state, index) =>
    makeProblem(state, index, options?.mode ?? "guided", rng),
  );
}

export const generateMultiplicationMissingFactorsProblems = generateMissingFactorsProblems;
