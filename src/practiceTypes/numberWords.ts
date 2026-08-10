import {
  formatNumberWords,
  generateNumberWordProblem,
  NUMBER_WORD_RANGES,
  type NumberWordProblem,
  type NumberWordPracticeType,
} from "../lib/placeValue/numberForms";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";

const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
const CHOICE_COUNT = 4;

function getPracticeType(options?: PracticeGenerationOptions): NumberWordPracticeType {
  return options?.lesson?.practice_type === "reading_large_numbers"
    ? "reading_large_numbers"
    : "number_words";
}

function buildSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: NumberWordPracticeType,
  mode: string,
): string {
  if (options?.seed !== undefined) return String(options.seed);
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return createPracticeSessionSeed(lessonId, practiceType, mode);
}

function addCandidate(
  candidates: Set<number>,
  candidate: number,
  correct: number,
  max: number,
): void {
  if (Number.isInteger(candidate) && candidate >= 0 && candidate <= max && candidate !== correct) {
    candidates.add(candidate);
  }
}

function getDistractorNumbers(problem: NumberWordProblem): number[] {
  const candidates = new Set<number>();
  const { sourceNumber } = problem;
  const max = NUMBER_WORD_RANGES[problem.practiceType].max;

  for (const offset of [1, -1, 10, -10, 100, -100, 1_000, -1_000, 10_000, -10_000]) {
    addCandidate(candidates, sourceNumber + offset, sourceNumber, max);
  }

  const digits = String(sourceNumber).split("");
  for (let left = 0; left < digits.length; left += 1) {
    for (let right = left + 1; right < digits.length; right += 1) {
      const swapped = [...digits];
      [swapped[left], swapped[right]] = [swapped[right], swapped[left]];
      addCandidate(candidates, Number(swapped.join("")), sourceNumber, max);
    }
  }

  if (digits.includes("0")) {
    addCandidate(candidates, Number(digits.join("").replace("0", "")), sourceNumber, max);
  }

  for (let index = 0; index < digits.length; index += 1) {
    const digit = Number(digits[index]);
    if (digit === 0) continue;
    const place = 10 ** (digits.length - index - 1);
    addCandidate(candidates, sourceNumber - digit * place + digit * place * 10, sourceNumber, max);
    addCandidate(candidates, sourceNumber - digit * place + digit * Math.floor(place / 10), sourceNumber, max);
  }

  // The place-based candidates above are plentiful for the supported domains.
  // This bounded fallback keeps the four-choice contract safe at edge values.
  for (let offset = 1; candidates.size < CHOICE_COUNT - 1; offset += 1) {
    addCandidate(candidates, sourceNumber - offset, sourceNumber, max);
    addCandidate(candidates, sourceNumber + offset, sourceNumber, max);
  }

  return [...candidates];
}

function buildChoices(problem: NumberWordProblem, rng: SeededRng): string[] {
  const distractors = rng
    .shuffle(getDistractorNumbers(problem))
    .slice(0, CHOICE_COUNT - 1)
    .map((number) =>
      problem.direction === "number_to_words" ? formatNumberWords(number) : String(number),
    );
  const choices = [problem.correctAnswer, ...distractors];
  if (new Set(choices).size !== CHOICE_COUNT) {
    throw new Error("Could not build four unique number-word choices");
  }
  return rng.shuffle(choices);
}

function buildPracticeProblem(
  problem: NumberWordProblem,
  mode: string,
  index: number,
  rng: SeededRng,
): PracticeProblem {
  const questionText =
    problem.direction === "number_to_words"
      ? `Write ${problem.sourceNumber.toLocaleString("en-US")} in words.`
      : `What number is "${problem.wordForm}"?`;

  return {
    id: `number-words-${problem.practiceType}-${mode}-${index + 1}`,
    questionText,
    correctAnswer: problem.correctAnswer,
    visualType: "multiple_choice",
    problemKey: problem.problemKey,
    visualData: { choices: buildChoices(problem, rng) },
  };
}

export function generateNumberWordsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const mode = options?.mode ?? "guided";
  const practiceType = getPracticeType(options);
  const count = getPracticeProblemCount(options);
  const baseSeed = buildSeed(options, practiceType, mode);
  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let index = 0; index < count; index += 1) {
    let generated: PracticeProblem | undefined;
    for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
      const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
      const canonical = generateNumberWordProblem(practiceType, rng);
      if (usedKeys.has(canonical.problemKey)) continue;

      // Accept and record mathematical identity before consuming presentation RNG.
      usedKeys.add(canonical.problemKey);
      generated = buildPracticeProblem(canonical, mode, index, rng);
      break;
    }

    if (!generated) {
      throw new Error(
        `Could not generate a unique ${practiceType} problem within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
      );
    }
    problems.push(generated);
  }

  return problems;
}
