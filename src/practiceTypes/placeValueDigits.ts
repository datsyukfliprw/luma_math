import { getDigitValueDistractorCandidates } from "../lib/placeValue/distractors";
import { generateDigitValueProblem } from "../lib/placeValue/generator";
import type { DigitValueProblem } from "../lib/placeValue/types";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";

const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
const CHOICE_COUNT = 4;

function buildChoices(problem: DigitValueProblem, rng: SeededRng): string[] {
  const distractors = rng
    .shuffle(getDigitValueDistractorCandidates(problem))
    .slice(0, CHOICE_COUNT - 1);

  return rng.shuffle([
    String(problem.correctAnswer),
    ...distractors.map(String),
  ]);
}

function buildSeed(options: PracticeGenerationOptions | undefined, mode: string): string {
  if (options?.seed !== undefined) return String(options.seed);
  const lessonId = options?.lesson?.lesson_id ?? "place_value_digits";
  return createPracticeSessionSeed(lessonId, "place_value_digits", mode);
}

function generateUniqueProblem(
  baseSeed: string,
  mode: string,
  index: number,
  usedKeys: Set<string>,
): PracticeProblem {
  for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
    const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
    const problem = generateDigitValueProblem(rng);

    if (!usedKeys.has(problem.problemKey)) {
      return {
        id: `place-value-digits-${mode}-${index + 1}`,
        questionText: `In the number ${problem.number}, what is the value of the ${problem.targetPlace} digit?`,
        correctAnswer: String(problem.correctAnswer),
        visualType: "multiple_choice",
        problemKey: problem.problemKey,
        visualData: { choices: buildChoices(problem, rng) },
      };
    }
  }

  throw new Error(
    `Could not generate a unique place_value_digits problem within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
  );
}

export function generatePlaceValueDigitsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const mode = options?.mode ?? "guided";
  const count = getPracticeProblemCount(options);
  const baseSeed = buildSeed(options, mode);
  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let index = 0; index < count; index += 1) {
    const problem = generateUniqueProblem(baseSeed, mode, index, usedKeys);
    usedKeys.add(problem.problemKey);
    problems.push(problem);
  }

  return problems;
}
