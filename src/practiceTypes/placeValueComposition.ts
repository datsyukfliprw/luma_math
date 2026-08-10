import {
  generatePlaceValueCompositionProblem,
  getPlaceValueCompositionDistractorCandidates,
  type BaseTenModelProblem,
  type PlaceValueCompositionProblem,
  type PlaceValueCompositionType,
  type PlaceValuePuzzleProblem,
} from "../lib/placeValue/placeValueComposition";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";

const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
const CHOICE_COUNT = 4;

function isPlaceValueCompositionType(value: string | undefined): value is PlaceValueCompositionType {
  return value === "base_ten_models" || value === "place_value_puzzles";
}

function getPracticeType(
  options: PracticeGenerationOptions | undefined,
  requestedType?: PlaceValueCompositionType,
): PlaceValueCompositionType {
  if (requestedType) return requestedType;
  return isPlaceValueCompositionType(options?.lesson?.practice_type)
    ? options.lesson.practice_type
    : "base_ten_models";
}

function buildSeed(
  options: PracticeGenerationOptions | undefined,
  type: PlaceValueCompositionType,
  mode: string,
): string {
  if (options?.seed !== undefined) return String(options.seed);
  const lessonId = options?.lesson?.lesson_id ?? type;
  return createPracticeSessionSeed(lessonId, type, mode);
}

function formatBlockCount(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatBaseTenBlocks(problem: BaseTenModelProblem): string {
  const labels: Record<BaseTenModelProblem["blocks"][number]["place"], [string, string]> = {
    ones: ["unit cube", "unit cubes"],
    tens: ["ten rod", "ten rods"],
    hundreds: ["hundred flat", "hundred flats"],
    thousands: ["thousand cube", "thousand cubes"],
  };
  const lastRelevantIndex = problem.blocks.findLastIndex((block) => block.count > 0);
  const blocks = problem.blocks
    .slice(0, lastRelevantIndex + 1)
    .reverse()
    .map((block) => {
      const [singular, plural] = labels[block.place];
      return formatBlockCount(block.count, singular, plural);
    });

  return blocks.join(", ").replace(/, ([^,]+)$/, " and $1");
}

function formatPlaceValueClues(problem: PlaceValuePuzzleProblem): string {
  const labels: Record<PlaceValuePuzzleProblem["clues"][number]["place"], [string, string]> = {
    ones: ["one", "ones"],
    tens: ["ten", "tens"],
    hundreds: ["hundred", "hundreds"],
    thousands: ["thousand", "thousands"],
    "ten-thousands": ["ten-thousand", "ten-thousands"],
  };

  return problem.clues
    .slice()
    .reverse()
    .map((clue) => {
      const [singular, plural] = labels[clue.place];
      return formatBlockCount(clue.digit, singular, plural);
    })
    .join(", ")
    .replace(/, ([^,]+)$/, " and $1");
}

function buildChoices(problem: PlaceValueCompositionProblem, rng: SeededRng): string[] {
  const distractors = rng
    .shuffle(getPlaceValueCompositionDistractorCandidates(problem))
    .slice(0, CHOICE_COUNT - 1)
    .map(String);
  const choices = rng.shuffle([String(problem.correctAnswer), ...distractors]);

  if (choices.length !== CHOICE_COUNT || new Set(choices).size !== CHOICE_COUNT) {
    throw new Error(`Could not build four unique ${problem.form} choices`);
  }
  return choices;
}

function adaptProblem(
  problem: PlaceValueCompositionProblem,
  mode: string,
  index: number,
  rng: SeededRng,
): PracticeProblem {
  const questionText = problem.form === "base_ten_models"
    ? `What number is shown by ${formatBaseTenBlocks(problem)}?`
    : `Build the number with ${formatPlaceValueClues(problem)}.`;

  return {
    id: `place-value-composition-${problem.form}-${mode}-${index + 1}`,
    questionText,
    correctAnswer: String(problem.correctAnswer),
    visualType: "multiple_choice",
    problemKey: problem.problemKey,
    visualData: { choices: buildChoices(problem, rng) },
  };
}

export function generatePlaceValueCompositionProblems(
  options?: PracticeGenerationOptions,
  requestedType?: PlaceValueCompositionType,
): PracticeProblem[] {
  const mode = options?.mode ?? "guided";
  const type = getPracticeType(options, requestedType);
  const count = getPracticeProblemCount(options);
  const baseSeed = buildSeed(options, type, mode);
  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let index = 0; index < count; index += 1) {
    let generated: PracticeProblem | undefined;

    for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
      const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
      const mathematical = generatePlaceValueCompositionProblem(type, rng);
      if (usedKeys.has(mathematical.problemKey)) continue;

      // Claim the mathematical identity before consuming RNG for choices.
      usedKeys.add(mathematical.problemKey);
      generated = adaptProblem(mathematical, mode, index, rng);
      break;
    }

    if (!generated) {
      throw new Error(
        `Could not generate a unique ${type} problem within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
      );
    }
    problems.push(generated);
  }

  return problems;
}

export function generateBaseTenModelsProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generatePlaceValueCompositionProblems(options, "base_ten_models");
}

export function generatePlaceValuePuzzlesProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generatePlaceValueCompositionProblems(options, "place_value_puzzles");
}
