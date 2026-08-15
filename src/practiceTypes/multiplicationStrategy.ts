import {
  buildStrategyChoiceSet,
  enumerateStrategyStates,
  strategyProblemKey,
  type StrategyState,
} from "../lib/multiplication/factStrategies";
import { getPracticeProblemCount } from "./practiceModeCounts";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

const PRACTICE_TYPE = "choose_strategy";

function getSeed(options: PracticeGenerationOptions | undefined): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? PRACTICE_TYPE;
  return options?.seed ?? createPracticeSessionSeed(lessonId, PRACTICE_TYPE, mode);
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;

  const lessonCount = options?.lesson?.practice_block?.question_count;
  if (typeof lessonCount === "number" && lessonCount > 0) return lessonCount;

  return getPracticeProblemCount(options);
}

function makeProblem(
  state: StrategyState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const { choices, correctAnswer } = buildStrategyChoiceSet(state, rng);
  const equation = `${state.fact.factorA} × ${state.fact.factorB}`;

  return {
    id: `${PRACTICE_TYPE}-${mode}-${index + 1}`,
    questionText: `Which shown strategy correctly solves ${equation}?`,
    correctAnswer,
    visualType: "multiple_choice",
    problemKey: strategyProblemKey(state),
    visualData: {
      equation,
      factors: [state.fact.factorA, state.fact.factorB],
      choices,
    },
    answerData: {
      factorA: String(state.fact.factorA),
      factorB: String(state.fact.factorB),
      product: String(state.product),
    },
  };
}

export function generateMultiplicationStrategyProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }

  const states = enumerateStrategyStates();
  if (count > states.length) {
    throw new RangeError("Requested count exceeds multiplication strategy state space");
  }

  const rng = createSeededRng(getSeed(options));
  return rng.shuffle(states).slice(0, count).map((state, index) =>
    makeProblem(state, index, options?.mode ?? "guided", rng),
  );
}

export const generateChooseStrategyProblems = generateMultiplicationStrategyProblems;
