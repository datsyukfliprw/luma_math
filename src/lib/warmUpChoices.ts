import { normalizeNumericAnswer, normalizeTextAnswer } from "./answerValidation";
import type { WarmUpQuestion } from "../types/warmup";

function choiceKey(value: string): string {
  const numeric = normalizeNumericAnswer(value);

  if (numeric.length > 0 && !Number.isNaN(Number(numeric))) {
    return `n:${numeric}`;
  }

  return `t:${normalizeTextAnswer(value)}`;
}

function uniqueChoices(values: string[]): string[] {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = choiceKey(value);
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function stableShuffle(values: string[], seed: string): string[] {
  return [...values].sort(
    (left, right) =>
      hashString(`${seed}:${left}`) - hashString(`${seed}:${right}`),
  );
}

function formatNumber(value: number, useCommas: boolean): string {
  if (!Number.isInteger(value)) {
    return String(value);
  }

  return useCommas ? value.toLocaleString("en-US") : String(value);
}

function extractPromptNumbers(prompt: string): number[] {
  const matches = prompt.match(/\d[\d,]*/g) ?? [];

  return matches
    .map((value) => Number(value.replaceAll(",", "")))
    .filter((value) => Number.isFinite(value));
}

function numericStep(value: number): number {
  const absolute = Math.abs(value);

  if (absolute === 0) {
    return 1;
  }

  if (Number.isInteger(value)) {
    if (absolute >= 1000 && value % 1000 === 0) return 1000;
    if (absolute >= 100 && value % 100 === 0) return 100;
    if (absolute >= 10 && value % 10 === 0) return 10;
    if (absolute >= 10000) return 100;
    if (absolute >= 1000) return 10;
  }

  return 1;
}

function buildNumericChoices(question: WarmUpQuestion): string[] | null {
  const normalized = normalizeNumericAnswer(question.correct_answer);

  if (normalized.length === 0 || Number.isNaN(Number(normalized))) {
    return null;
  }

  const correctValue = Number(normalized);
  const useCommas =
    question.correct_answer.includes(",") || Math.abs(correctValue) >= 1000;
  const step = numericStep(correctValue);

  const promptCandidates = extractPromptNumbers(question.prompt)
    .filter((value) => value !== correctValue)
    .sort(
      (left, right) =>
        Math.abs(left - correctValue) - Math.abs(right - correctValue),
    );

  const candidates = uniqueChoices(
    [
      question.correct_answer,
      ...promptCandidates.map((value) => formatNumber(value, useCommas)),
      formatNumber(correctValue - step, useCommas),
      formatNumber(correctValue + step, useCommas),
      formatNumber(correctValue - 1, useCommas),
      formatNumber(correctValue + 1, useCommas),
    ].filter((value) => {
      const numericValue = Number(value.replaceAll(",", ""));
      return Number.isFinite(numericValue) && numericValue >= 0;
    }),
  );

  if (candidates.length < 3) {
    return null;
  }

  return stableShuffle(
    [question.correct_answer, ...candidates.filter((value) => choiceKey(value) !== choiceKey(question.correct_answer)).slice(0, 2)],
    question.id,
  );
}

function buildFractionChoices(question: WarmUpQuestion): string[] | null {
  const match = question.correct_answer.trim().match(/^(\d+)\s*\/\s*(\d+)$/);

  if (!match) {
    return null;
  }

  const numerator = Number(match[1]);
  const denominator = Number(match[2]);

  if (denominator <= 0) {
    return null;
  }

  const candidateNumerators = [
    numerator - 1,
    numerator + 1,
    numerator - 2,
    numerator + 2,
    0,
    denominator,
  ].filter(
    (value) =>
      value >= 0 &&
      value <= denominator &&
      value !== numerator,
  );

  const distractors = uniqueChoices(
    candidateNumerators.map((value) => `${value}/${denominator}`),
  ).slice(0, 2);

  if (distractors.length < 2) {
    return null;
  }

  return stableShuffle(
    [question.correct_answer, ...distractors],
    question.id,
  );
}

function buildBooleanChoices(answer: string): string[] | null {
  const normalized = normalizeTextAnswer(answer);

  if (normalized === "yes" || normalized === "no") {
    return normalized === "yes" ? ["Yes", "No"] : ["No", "Yes"];
  }

  if (normalized === "true" || normalized === "false") {
    return normalized === "true" ? ["True", "False"] : ["False", "True"];
  }

  return null;
}

const CATEGORY_CHOICES: Record<string, string[]> = {
  add: ["Add", "Subtract"],
  subtract: ["Add", "Subtract"],
  greater: ["Greater", "Less", "Equal"],
  less: ["Greater", "Less", "Equal"],
  equal: ["Greater", "Less", "Equal"],
  product: ["Product", "Factor", "Sum"],
  factor: ["Factor", "Product", "Sum"],
  same: ["Same", "Different", "Not enough information"],
  undefined: ["Undefined", "0", "The dividend"],
};

function buildCategoryChoices(answer: string, questionId: string): string[] | null {
  const normalized = normalizeTextAnswer(answer);
  const candidates = CATEGORY_CHOICES[normalized];

  if (!candidates) {
    return null;
  }

  return stableShuffle(candidates, questionId);
}

function authoredChoices(question: WarmUpQuestion): string[] | null {
  if (!question.choices || question.choices.length < 2) {
    return null;
  }

  const choices = uniqueChoices(question.choices);
  const correctKey = choiceKey(question.correct_answer);

  if (!choices.some((choice) => choiceKey(choice) === correctKey)) {
    return null;
  }

  return stableShuffle(choices, question.id);
}

/**
 * Grade-level interaction policy:
 * - K-3: prefer tap/select choices when safe choices can be generated.
 * - Grade 4+: use authored choices when present, otherwise preserve text entry.
 *
 * Complex text responses remain text entry even in K-3 when generating
 * trustworthy distractors would require guessing at the lesson semantics.
 */
export function getWarmUpChoices(
  question: WarmUpQuestion,
  gradeLevel: number,
): string[] | null {
  const explicit = authoredChoices(question);

  if (explicit) {
    return explicit;
  }

  if (gradeLevel >= 4) {
    return null;
  }

  return (
    buildBooleanChoices(question.correct_answer) ??
    buildFractionChoices(question) ??
    buildNumericChoices(question) ??
    buildCategoryChoices(question.correct_answer, question.id)
  );
}
