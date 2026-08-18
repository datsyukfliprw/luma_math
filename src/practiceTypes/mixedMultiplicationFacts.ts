import {
  enumerateMixedFactStates,
  getMixedFactMisconceptionCandidates,
  mixedFactProblemKey,
  type MixedFactState,
} from "../lib/multiplication/mixedFacts";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

const PRACTICE_TYPE = "mixed_multiplication_facts";

const MIXED_FACT_STATE_SPACE = enumerateMixedFactStates();

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

function buildChoices(state: MixedFactState, rng: ReturnType<typeof createSeededRng>): string[] {
  const product = state.product;
  const distractors = getMixedFactMisconceptionCandidates(state).slice(0, 3);
  if (distractors.length < 3) {
    throw new Error("Mixed multiplication facts did not provide enough distractors");
  }

  return rng.shuffle([String(product), ...distractors.map(String)]);
}

function makeProblem(
  state: MixedFactState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const swap = rng.nextInt(0, 1) === 1;
  const displayedFactorA = swap ? state.factorB : state.factorA;
  const displayedFactorB = swap ? state.factorA : state.factorB;
  const equation = `${displayedFactorA} × ${displayedFactorB} = ?`;

  return {
    id: `mixed-multiplication-facts-${mode}-${index + 1}`,
    questionText: `What is ${displayedFactorA} × ${displayedFactorB}?`,
    correctAnswer: String(state.product),
    visualType: "multiple_choice",
    problemKey: mixedFactProblemKey(state),
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

function isZeroFact(state: MixedFactState): boolean {
  return state.factorA === 0 || state.factorB === 0;
}

function isOneFact(state: MixedFactState): boolean {
  return (state.factorA === 1 || state.factorB === 1) && state.factorA !== 0 && state.factorB !== 0;
}

function isTwoThroughNineFact(state: MixedFactState): boolean {
  return state.factorA >= 2 && state.factorB >= 2;
}

function selectCanonicalStates(
  count: number,
  rng: ReturnType<typeof createSeededRng>,
): MixedFactState[] {
  if (count === 1) {
    return [rng.pick(MIXED_FACT_STATE_SPACE)];
  }

  const shuffled = rng.shuffle(MIXED_FACT_STATE_SPACE);

  const zeroFact = shuffled.find(isZeroFact);
  const oneFact = shuffled.find(isOneFact);

  if (!zeroFact || !oneFact) {
    throw new RangeError(
      "Mixed multiplication fact state space is missing required 0-factor or 1-factor evidence",
    );
  }

  const remaining = shuffled.filter((state) => state !== zeroFact && state !== oneFact);
  const twoThroughNine = remaining.filter(isTwoThroughNineFact);
  const otherZeroOne = remaining.filter((state) => !isTwoThroughNineFact(state));

  const restCount = Math.max(0, count - 2);
  const rest =
    restCount <= twoThroughNine.length
      ? twoThroughNine.slice(0, restCount)
      : [...twoThroughNine, ...otherZeroOne.slice(0, restCount - twoThroughNine.length)];

  return rng.shuffle([zeroFact, oneFact, ...rest]);
}

export function generateMixedMultiplicationFactsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);

  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }

  if (count > MIXED_FACT_STATE_SPACE.length) {
    throw new RangeError("Requested count exceeds mixed multiplication fact state space");
  }

  if (count === 0) {
    return [];
  }

  const rng = createSeededRng(getSeed(options));
  const mode = options?.mode ?? "guided";
  const states = selectCanonicalStates(count, rng);

  return states.map((state, index) => makeProblem(state, index, mode, rng));
}
