import {
  areEquivalentFractions,
  createProperFractionState,
  formatFraction,
  type FractionState,
} from "../lib/fractions/core";
import { getPracticeProblemCount } from "./practiceModeCounts";
import { createPracticeSessionSeed, type SeededRng } from "./random";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export function getFractionSeed(
  practiceType: string,
  options: PracticeGenerationOptions | undefined,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

export function getFractionTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;
  const lessonCount = options?.lesson?.practice_block?.question_count;
  if (typeof lessonCount === "number" && lessonCount > 0) return lessonCount;
  return getPracticeProblemCount(options);
}

export function validateFractionCount(count: number): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
}

export function buildUniqueFractionProblems(
  count: number,
  maxAttempts: number,
  build: (index: number) => PracticeProblem,
): PracticeProblem[] {
  validateFractionCount(count);
  const result: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;

  while (result.length < count && attempts < maxAttempts) {
    attempts += 1;
    const problem = build(result.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    result.push(problem);
  }

  if (result.length < count) {
    throw new RangeError(`Could not generate ${count} unique fraction problems after ${maxAttempts} attempts`);
  }
  return result;
}

export function numberChoices(
  correct: number,
  min: number,
  max: number,
  rng: SeededRng,
  desired = 4,
): string[] {
  const candidates = Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => min + index)
    .filter((value) => value !== correct);
  const selected = rng.shuffle(candidates).slice(0, Math.max(0, desired - 1));
  return rng.shuffle([String(correct), ...selected.map(String)]);
}

export function stringChoices(
  correct: string,
  distractors: readonly string[],
  rng: SeededRng,
  desired = 4,
): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < desired - 1) {
    throw new Error(`Need ${desired - 1} unique distractors for ${correct}`);
  }
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, desired - 1)]);
}

export function nonEquivalentFractionChoices(
  correct: FractionState,
  rng: SeededRng,
  desired = 4,
): string[] {
  const correctText = formatFraction(correct);
  const choices = new Set<string>([correctText]);
  const candidates: FractionState[] = [];

  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      const candidate = createProperFractionState(numerator, denominator);
      if (!areEquivalentFractions(candidate, correct)) candidates.push(candidate);
    }
  }

  for (const candidate of rng.shuffle(candidates)) {
    if (choices.size >= desired) break;
    choices.add(formatFraction(candidate));
  }

  if (choices.size < desired) throw new Error("Not enough non-equivalent fraction distractors");
  return rng.shuffle([...choices]);
}

export function equivalentTargetChoices(
  base: FractionState,
  correct: FractionState,
  rng: SeededRng,
  desired = 4,
): string[] {
  const correctText = formatFraction(correct);
  const choices = new Set<string>([correctText]);
  const candidates: FractionState[] = [];

  for (let denominator = 2; denominator <= 12; denominator += 1) {
    for (let numerator = 1; numerator < denominator; numerator += 1) {
      const candidate = createProperFractionState(numerator, denominator);
      if (!areEquivalentFractions(candidate, base)) candidates.push(candidate);
    }
  }

  for (const candidate of rng.shuffle(candidates)) {
    if (choices.size >= desired) break;
    choices.add(formatFraction(candidate));
  }

  if (choices.size < desired) throw new Error("Not enough fraction equivalence distractors");
  return rng.shuffle([...choices]);
}
