import {
  generateEstimationProblem,
  generateRoundingProblem,
  roundToPlace,
} from "../lib/placeValue/rounding";
import type {
  EstimationProblem,
  RoundingPracticeType,
  RoundingProblem,
} from "../lib/placeValue/types";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";

const CHOICE_COUNT = 4;
const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
type RoundingType = RoundingPracticeType | "estimate_reasonable";

function buildSeed(options: PracticeGenerationOptions | undefined, practiceType: RoundingType, mode: string): string {
  if (options?.seed !== undefined) return String(options.seed);
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return createPracticeSessionSeed(lessonId, practiceType, mode);
}

function addCandidate(candidates: Set<number>, candidate: number, correct: number): void {
  if (Number.isFinite(candidate) && candidate >= 0 && candidate !== correct) {
    candidates.add(candidate);
  }
}

function buildRoundingChoices(problem: RoundingProblem, rng: SeededRng): string[] {
  const candidates = new Set<number>();
  const lower = problem.correctAnswer - problem.targetPlace;
  const upper = problem.correctAnswer + problem.targetPlace;
  addCandidate(candidates, lower, problem.correctAnswer);
  addCandidate(candidates, upper, problem.correctAnswer);
  addCandidate(candidates, roundToPlace(problem.number - 1, problem.targetPlace), problem.correctAnswer);
  addCandidate(candidates, roundToPlace(problem.number + 1, problem.targetPlace), problem.correctAnswer);
  addCandidate(candidates, problem.correctAnswer + problem.targetPlace / 2, problem.correctAnswer);

  while (candidates.size < CHOICE_COUNT - 1) {
    addCandidate(candidates, problem.correctAnswer + problem.targetPlace * (candidates.size + 2), problem.correctAnswer);
  }

  return rng.shuffle([
    String(problem.correctAnswer),
    ...rng.shuffle([...candidates]).slice(0, CHOICE_COUNT - 1).map(String),
  ]);
}

function buildEstimationChoices(problem: EstimationProblem, rng: SeededRng): string[] {
  const exact = problem.operation === "addition" ? problem.left + problem.right : problem.left - problem.right;
  const roundedLeft = roundToPlace(problem.left, problem.targetPlace);
  const roundedRight = roundToPlace(problem.right, problem.targetPlace);
  const candidates = new Set<number>();
  addCandidate(candidates, exact, problem.correctAnswer);
  addCandidate(candidates, problem.operation === "addition" ? roundedLeft + problem.right : roundedLeft - problem.right, problem.correctAnswer);
  addCandidate(candidates, problem.operation === "addition" ? problem.left + roundedRight : problem.left - roundedRight, problem.correctAnswer);
  addCandidate(candidates, problem.correctAnswer + problem.targetPlace, problem.correctAnswer);
  addCandidate(candidates, problem.correctAnswer - problem.targetPlace, problem.correctAnswer);

  while (candidates.size < CHOICE_COUNT - 1) {
    addCandidate(candidates, problem.correctAnswer + problem.targetPlace * (candidates.size + 2), problem.correctAnswer);
  }

  return rng.shuffle([
    String(problem.correctAnswer),
    ...rng.shuffle([...candidates]).slice(0, CHOICE_COUNT - 1).map(String),
  ]);
}

function adaptRoundingProblem(
  problem: RoundingProblem,
  practiceType: RoundingPracticeType,
  mode: string,
  rng: SeededRng,
  index: number,
): PracticeProblem {
  return {
    id: `${practiceType}-${mode}-${index + 1}`,
    questionText: `Round ${problem.number.toLocaleString("en-US")} to the nearest ${problem.targetPlace.toLocaleString("en-US")}.`,
    correctAnswer: String(problem.correctAnswer),
    visualType: "multiple_choice",
    problemKey: problem.problemKey,
    visualData: { choices: buildRoundingChoices(problem, rng) },
  };
}

function adaptEstimationProblem(problem: EstimationProblem, mode: string, rng: SeededRng, index: number): PracticeProblem {
  const symbol = problem.operation === "addition" ? "+" : "−";
  return {
    id: `estimate_reasonable-${mode}-${index + 1}`,
    questionText: `Estimate ${problem.left} ${symbol} ${problem.right} by rounding to the nearest ${problem.targetPlace}.`,
    correctAnswer: String(problem.correctAnswer),
    visualType: "multiple_choice",
    problemKey: problem.problemKey,
    visualData: { choices: buildEstimationChoices(problem, rng) },
  };
}

export function generateRoundingProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  const practiceType = (options?.lesson?.practice_type ?? "round_ten") as RoundingType;
  const mode = options?.mode ?? "guided";
  const count = getPracticeProblemCount(options);
  const baseSeed = buildSeed(options, practiceType, mode);
  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let index = 0; index < count; index += 1) {
    for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
      const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
      const mathematical = practiceType === "estimate_reasonable"
        ? generateEstimationProblem(rng)
        : generateRoundingProblem(practiceType, rng);
      if (usedKeys.has(mathematical.problemKey)) continue;
      const problem = practiceType === "estimate_reasonable"
        ? adaptEstimationProblem(mathematical as EstimationProblem, mode, rng, index)
        : adaptRoundingProblem(mathematical as RoundingProblem, practiceType, mode, rng, index);
      usedKeys.add(problem.problemKey);
      problems.push(problem);
      break;
    }
    if (problems.length !== index + 1) {
      throw new Error(`Could not generate a unique rounding problem for ${practiceType}`);
    }
  }

  return problems;
}
