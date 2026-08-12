import {
  associativePropertyKey,
  commutativePropertyKey,
  formatCommutativeEquation,
  formatGrouping,
  formatGroupingSolution,
  formatTurnaroundEquation,
  getAssociativeProductMisconceptionCandidates,
  getAssociativeRegroupingMisconceptionCandidates,
  getCommutativeEquationMisconceptionCandidates,
  getCommutativeProductMisconceptionCandidates,
  listAssociativeTriples,
  listCommutativePairs,
  otherGrouping,
  reverseCommutativePresentation,
  type AssociativeGrouping,
  type AssociativeState,
  type AssociativeTask,
  type CommutativeState,
  type CommutativeTask,
} from "../lib/multiplication/properties";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type Rng = ReturnType<typeof createSeededRng>;

const COMMUTATIVE_TASKS: CommutativeTask[] = ["equivalent-equation", "turnaround-product"];
const ASSOCIATIVE_TASKS: AssociativeTask[] = ["regroup-equivalent", "equal-product"];
const GROUPINGS: AssociativeGrouping[] = ["left", "right"];

function getSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: string,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function buildChoices(correct: string, distractors: string[], rng: Rng): string[] {
  const chosen = distractors.slice(0, 3);
  if (chosen.length < 3) throw new Error("Properties core did not provide enough distractors");
  return rng.shuffle([correct, ...chosen]);
}

/* -------------------------------------------------------------------------- */
/* Commutative property                                                        */
/* -------------------------------------------------------------------------- */

function makeCommutativeProblem(
  canonical: CommutativeState,
  task: CommutativeTask,
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  // Which factor is written first is presentation only — the key sorts the pair.
  const state = rng.next() < 0.5 ? canonical : reverseCommutativePresentation(canonical);
  const shown = formatCommutativeEquation(state);
  const turnaround = formatTurnaroundEquation(state);
  const isEquationTask = task === "equivalent-equation";

  const correctAnswer = isEquationTask ? turnaround : String(state.product);
  const distractors = isEquationTask
    ? getCommutativeEquationMisconceptionCandidates(state).map((candidate) => candidate.expression)
    : getCommutativeProductMisconceptionCandidates(state).map(String);

  const questionText = isEquationTask
    ? `You know ${shown}. Which equation shows the commutative property for the same two factors?`
    : `You know ${shown}. What is ${state.reversedA} × ${state.reversedB}?`;

  return {
    id: `commutative-multiplication-${mode}-${index + 1}`,
    questionText,
    correctAnswer,
    visualType: "multiple_choice",
    problemKey: commutativePropertyKey(state, task),
    visualData: {
      equation: shown,
      factors: [state.factorA, state.factorB],
      product: state.product,
      choices: buildChoices(correctAnswer, distractors, rng),
    },
    answerData: {
      factorA: String(state.reversedA),
      factorB: String(state.reversedB),
      product: String(state.product),
    },
  };
}

export function generateCommutativeMultiplicationProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "commutative_multiplication"));
  const count = getPracticeProblemCount(options);

  const candidates: Array<{ state: CommutativeState; task: CommutativeTask }> = [];
  for (const state of listCommutativePairs()) {
    for (const task of COMMUTATIVE_TASKS) candidates.push({ state, task });
  }

  const unique = [
    ...new Map(
      candidates.map((candidate) => [
        commutativePropertyKey(candidate.state, candidate.task),
        candidate,
      ]),
    ).values(),
  ];

  if (count > unique.length) {
    throw new RangeError("Requested count exceeds commutative property state space");
  }

  return rng
    .shuffle(unique)
    .slice(0, count)
    .map((candidate, index) =>
      makeCommutativeProblem(
        candidate.state,
        candidate.task,
        index,
        options?.mode ?? "guided",
        rng,
      ),
    );
}

/* -------------------------------------------------------------------------- */
/* Associative property                                                        */
/* -------------------------------------------------------------------------- */

function makeAssociativeProblem(
  state: AssociativeState,
  task: AssociativeTask,
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  // Which side of the single equivalence is shown first is presentation only.
  const shownGrouping = rng.pick(GROUPINGS);
  const targetGrouping = otherGrouping(shownGrouping);
  const shown = formatGrouping(state, shownGrouping);
  const target = formatGrouping(state, targetGrouping);
  const isRegroupTask = task === "regroup-equivalent";

  const correctAnswer = isRegroupTask ? target : String(state.product);
  const distractors = isRegroupTask
    ? getAssociativeRegroupingMisconceptionCandidates(state, targetGrouping).map(
        (candidate) => candidate.expression,
      )
    : getAssociativeProductMisconceptionCandidates(state).map(String);

  const questionText = isRegroupTask
    ? `Regroup ${shown} using the associative property. Which expression has the same three factors in the same order with the other grouping?`
    : `${formatGroupingSolution(state, shownGrouping)}. The same three factors regrouped are ${target}. What does ${target} equal?`;

  return {
    id: `associative-multiplication-${mode}-${index + 1}`,
    questionText,
    correctAnswer,
    visualType: "multiple_choice",
    problemKey: associativePropertyKey(state, task),
    visualData: {
      equation: `${formatGrouping(state, "left")} = ${formatGrouping(state, "right")}`,
      factors: [state.factorA, state.factorB, state.factorC],
      product: state.product,
      choices: buildChoices(correctAnswer, distractors, rng),
    },
    answerData: {
      product: String(state.product),
    },
  };
}

export function generateAssociativeMultiplicationProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "associative_multiplication"));
  const count = getPracticeProblemCount(options);

  const candidates: Array<{ state: AssociativeState; task: AssociativeTask }> = [];
  for (const state of listAssociativeTriples()) {
    for (const task of ASSOCIATIVE_TASKS) candidates.push({ state, task });
  }

  const unique = [
    ...new Map(
      candidates.map((candidate) => [
        associativePropertyKey(candidate.state, candidate.task),
        candidate,
      ]),
    ).values(),
  ];

  if (count > unique.length) {
    throw new RangeError("Requested count exceeds associative property state space");
  }

  return rng
    .shuffle(unique)
    .slice(0, count)
    .map((candidate, index) =>
      makeAssociativeProblem(
        candidate.state,
        candidate.task,
        index,
        options?.mode ?? "guided",
        rng,
      ),
    );
}
