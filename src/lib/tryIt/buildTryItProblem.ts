import type { ResolvedTryItProblem, TryItAnswerPart } from "./types";
import type { SeededRng } from "../../practiceTypes/random";

export type LabeledNoun = { singular: string; plural: string };

export function normalizeNoun(phrase: string): LabeledNoun {
  const trimmed = phrase.trim();
  const lower = trimmed.toLowerCase();

  if (lower.endsWith("ies")) {
    const beforeVowel = lower[lower.length - 4];
    if (beforeVowel && !/[aeiou]/.test(beforeVowel)) {
      return { singular: trimmed.slice(0, -3) + "y", plural: trimmed };
    }
  }

  if (lower.endsWith("ves")) {
    return { singular: trimmed.slice(0, -3) + "f", plural: trimmed };
  }

  if (lower.endsWith("es")) {
    const beforeEs = lower.slice(0, -2);
    if (/(s|x|z|ch|sh|o)$/.test(beforeEs)) {
      return { singular: trimmed.slice(0, -2), plural: trimmed };
    }
  }

  if (lower.endsWith("s")) {
    return { singular: trimmed.slice(0, -1), plural: trimmed };
  }

  return { singular: trimmed, plural: `${trimmed}s` };
}

export function parseLabeledNoun(label: string): LabeledNoun {
  const match = label.trim().match(/^(-?\d+)\s+(.+)$/);
  const phrase = match ? match[2].trim() : label.trim();
  return normalizeNoun(phrase);
}

export function buildNumberChoices(
  correct: number,
  min: number,
  max: number,
  rng: SeededRng,
  count = 3,
): string[] {
  const distractors = new Set<number>();

  const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, min, max, 1, 0];

  for (const n of candidates) {
    if (n >= min && n <= max && n !== correct) {
      distractors.add(n);
    }
  }

  let guard = 0;
  while (distractors.size < count - 1 && guard < 100) {
    guard += 1;
    const n = rng.nextInt(min, max);
    if (n !== correct) {
      distractors.add(n);
    }
  }

  const chosen = rng.shuffle([...distractors]).slice(0, count - 1);
  const all = [String(correct), ...chosen.map(String)];
  return rng.shuffle(all);
}

export function buildMultiplicationEquationChoices(
  groups: number,
  items: number,
  rng: SeededRng,
): string[] {
  const product = groups * items;
  const correct = `${groups} × ${items} = ${product}`;
  const choices = new Set<string>([correct]);

  if (groups !== items) {
    choices.add(`${items} × ${groups} = ${product}`);
  }

  const wrongA = `${groups} × ${items} = ${product + 1}`;
  const wrongB = `${groups} × ${items} = ${Math.max(0, product - 1)}`;
  const wrongC = `${items} × ${groups} = ${product + 1}`;

  const wrongs = rng.shuffle([wrongA, wrongB, wrongC]);
  for (const w of wrongs) {
    if (choices.size >= 3) break;
    choices.add(w);
  }

  return rng.shuffle([...choices]);
}

export function buildZeroOneEquationChoices(
  groups: number,
  inEach: 0 | 1,
  rng: SeededRng,
): string[] {
  const total = groups * inEach;
  const correct = `${groups} × ${inEach} = ${total}`;

  const wrongPool: string[] =
    inEach === 1
      ? [`${groups} × 0 = ${groups}`, `${groups} × 1 = 1`, `1 × 1 = ${groups}`]
      : [`${groups} × 1 = ${groups}`, `0 × 1 = ${groups}`, `1 × 0 = ${groups}`];

  const uniqueWrongs = rng.shuffle([...new Set(wrongPool)]).slice(0, 2);
  return rng.shuffle([correct, ...uniqueWrongs]);
}

export function mathProblemKey(
  family: string,
  groups: number | string,
  inEach: number | string,
  form: string,
  extra?: string,
): string {
  const g = Number(groups) || 0;
  const i = Number(inEach) || 0;
  const total = g * i;
  const suffix = extra ? `:${extra}` : "";
  return `${family}:${g}:${i}:${total}:${form}${suffix}`;
}

export function makeTryItProblem(options: {
  id: string;
  problemKey?: string;
  prompt: string;
  tip: string;
  successMessage: string;
  visualEmoji?: string;
  visualEmpty?: boolean;
  visualData?: { groups: number; itemsPerGroup: number };
  parts: TryItAnswerPart[];
}): ResolvedTryItProblem {
  return { ...options };
}

export function makeSinglePartTryItProblem(options: {
  id: string;
  problemKey?: string;
  prompt: string;
  correctAnswer: string;
  tip: string;
  successMessage?: string;
  visualData?: { groups: number; itemsPerGroup: number };
  visualEmoji?: string;
  visualEmpty?: boolean;
  choices?: string[];
}): ResolvedTryItProblem {
  const { id, problemKey, prompt, correctAnswer, tip, visualData, visualEmoji, visualEmpty } =
    options;

  return {
    id,
    problemKey,
    prompt,
    tip,
    successMessage: options.successMessage ?? "That’s right!",
    visualEmoji,
    visualEmpty,
    visualData,
    parts: [
      {
        key: "answer",
        label: "Your answer",
        correctAnswer,
        choices: options.choices,
      },
    ],
  };
}

export function buildNumericDistractors(correct: number, rng: SeededRng, count = 2): number[] {
  const distractors = new Set<number>();
  const candidates = [
    correct + 1,
    correct - 1,
    correct + 10,
    correct - 10,
    correct * 2,
    Math.floor(correct / 2),
    0,
    1,
  ];

  for (const n of candidates) {
    if (n !== correct && n >= 0) {
      distractors.add(n);
    }
  }

  let guard = 0;
  while (distractors.size < count && guard < 100) {
    guard += 1;
    const n = rng.nextInt(Math.max(0, correct - 20), correct + 20);
    if (n !== correct) {
      distractors.add(n);
    }
  }

  return rng.shuffle([...distractors]).slice(0, count);
}
