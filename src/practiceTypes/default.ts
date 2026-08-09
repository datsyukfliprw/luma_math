import type { Lesson } from "../data/curriculum";

type WarmupQuestion = NonNullable<Lesson["warmup"]>["questions"][number];
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { PracticeGenerationOptions, PracticeMode, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng } from "./random";

const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"];

const CATEGORICAL_CHOICE_SETS: readonly string[][] = [
  ["yes", "no"],
  ["true", "false"],
  ["add", "subtract"],
  ["addition", "subtraction"],
  ["greater", "less", "equal"],
  ["greater than", "less than", "equal to"],
  ["longer", "shorter"],
  ["heavier", "lighter"],
  ["more", "less"],
  ["more", "fewer"],
  ["higher", "lower"],
  ["before", "after"],
  ["am", "pm"],
  ["a.m.", "p.m."],
  ["numerator", "denominator"],
  ["product", "sum"],
  ["multiple", "factor"],
  ["even", "odd"],
];

const DEFAULT_CHOICE_COUNT = 4;

type ProblemSource = {
  prompt: string;
  correctAnswer: string;
  skill?: string;
};

type GeneratedProblem = {
  questionText: string;
  correctAnswer: string;
  visualType: "multiple_choice" | "text_entry";
  visualData?: { choices?: string[]; equation?: string };
  problemKey: string;
};

function getPlaceName(numberString: string, targetIndex: number): string {
  const fromRight = numberString.length - 1 - targetIndex;
  return PLACE_NAMES[fromRight] ?? "bold";
}

function buildSourcePrompt(question: WarmupQuestion): string {
  if (
    question.question_type === "target_digit_value" &&
    question.number !== undefined &&
    question.target_digit_index !== undefined
  ) {
    const place = getPlaceName(question.number, question.target_digit_index);
    return `In ${question.number}, what is the value of the ${place} digit?`;
  }
  return question.prompt;
}

function sourceKey(prompt: string, answer: string): string {
  return `${normalizeTextAnswer(prompt)}::${normalizeTextAnswer(answer)}`;
}

function parseNumericAnswer(answer: string): number | undefined {
  const normalized = normalizeNumericAnswer(answer);
  if (normalized === "") return undefined;
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }
  return undefined;
}

function parseFractionAnswer(
  answer: string,
): { numerator: number; denominator: number } | undefined {
  const trimmed = answer.trim();
  const match = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
  if (!match) return undefined;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  if (Number.isNaN(numerator) || Number.isNaN(denominator) || denominator <= 0) return undefined;
  return { numerator, denominator };
}

function formatNumberForDisplay(value: number): string {
  const formatted = Math.abs(value).toLocaleString("en-US");
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function formatFraction(numerator: number, denominator: number): string {
  return `${numerator}/${denominator}`;
}

function findCategoricalSet(answer: string): string[] | undefined {
  const normalized = normalizeTextAnswer(answer);
  for (const set of CATEGORICAL_CHOICE_SETS) {
    if (set.some((choice) => normalizeTextAnswer(choice) === normalized)) {
      return set;
    }
  }
  return undefined;
}

function makeNearbyValue(
  value: number,
  rng: { nextInt: (min: number, max: number) => number },
): number {
  const absValue = Math.abs(value);
  if (absValue === 0) {
    return rng.nextInt(1, 5) * (rng.nextInt(0, 1) === 0 ? 1 : -1);
  }

  if (Number.isInteger(value)) {
    const magnitude = 10 ** Math.floor(Math.log10(absValue));
    const smallerMagnitude = Math.max(1, magnitude / 10);

    const candidates = [
      value + 1,
      value - 1,
      value + 2,
      value - 2,
      value + 5,
      value - 5,
      value + 10,
      value - 10,
      value + smallerMagnitude,
      value - smallerMagnitude,
      value + magnitude,
      value - magnitude,
      value === 0 ? 0 : value * 2,
      value === 0 ? 0 : Math.floor(value / 2),
    ];

    const unique = [...new Set(candidates)].filter((n) => Number.isFinite(n) && n !== value);
    if (unique.length === 0) return value + 1;
    return unique[rng.nextInt(0, unique.length - 1)];
  }

  const base = Math.trunc(value);
  const candidates = [
    value + 0.1,
    value - 0.1,
    value + 0.25,
    value - 0.25,
    base,
    base + 1,
    base - 1,
  ];
  const unique = [...new Set(candidates.map((n) => Math.round(n * 100) / 100))].filter(
    (n) => Number.isFinite(n) && Math.abs(n - value) > 1e-9,
  );
  if (unique.length === 0) return Math.round((value + 0.5) * 100) / 100;
  return unique[rng.nextInt(0, unique.length - 1)];
}

function generateNumericDistractors(
  value: number,
  rng: { nextInt: (min: number, max: number) => number },
  choiceCount = DEFAULT_CHOICE_COUNT,
): string[] {
  const choices = new Set<string>();
  choices.add(formatNumberForDisplay(value));

  let attempts = 0;
  while (choices.size < choiceCount && attempts < choiceCount * 4) {
    attempts += 1;
    const candidate = makeNearbyValue(value, rng);
    choices.add(formatNumberForDisplay(candidate));
  }

  return Array.from(choices);
}

function makeFractionDistractor(
  numerator: number,
  denominator: number,
  rng: { nextInt: (min: number, max: number) => number },
): string {
  const strategies = [
    () => [numerator + 1, denominator],
    () => [numerator - 1, denominator],
    () => [numerator, denominator + 1],
    () => [numerator, denominator - 1],
    () => [numerator + rng.nextInt(1, 3), denominator + rng.nextInt(1, 3)],
    () => [numerator, denominator + rng.nextInt(2, 5)],
    () => [numerator + rng.nextInt(2, 5), denominator],
    () => [denominator, numerator],
  ];

  for (let i = 0; i < 20; i += 1) {
    const [n, d] = strategies[rng.nextInt(0, strategies.length - 1)]();
    if (d > 0 && n >= 0 && !(n === numerator && d === denominator)) {
      return formatFraction(n, d);
    }
  }

  return formatFraction(numerator + 1, denominator);
}

function generateFractionDistractors(
  numerator: number,
  denominator: number,
  rng: { nextInt: (min: number, max: number) => number },
  choiceCount = DEFAULT_CHOICE_COUNT,
): string[] {
  const correct = formatFraction(numerator, denominator);
  const choices = new Set<string>([correct]);

  let attempts = 0;
  while (choices.size < choiceCount && attempts < choiceCount * 6) {
    attempts += 1;
    const candidate = makeFractionDistractor(numerator, denominator, rng);
    if (candidate !== correct && /^-?\d+\/\d+$/.test(candidate)) {
      const [, d] = candidate.split("/").map(Number);
      if (d > 0) choices.add(candidate);
    }
  }

  return Array.from(choices);
}

function generateCategoricalChoices(set: string[]): string[] {
  return [...set];
}

function buildMultipleChoiceProblem(
  source: ProblemSource,
  choices: string[],
  problemKey: string,
  rng: { shuffle: <T>(items: readonly T[]) => T[] },
): GeneratedProblem {
  const distinctChoices = rng.shuffle([...new Set(choices)]);
  const visualData: { choices: string[]; equation?: string } = { choices: distinctChoices };
  return {
    questionText: source.prompt,
    correctAnswer: source.correctAnswer,
    visualType: "multiple_choice",
    visualData,
    problemKey,
  };
}

function buildTextEntryProblem(source: ProblemSource, problemKey: string): GeneratedProblem {
  return {
    questionText: source.prompt,
    correctAnswer: source.correctAnswer,
    visualType: "text_entry",
    visualData: { equation: source.prompt },
    problemKey,
  };
}

function determineProblemType(
  source: ProblemSource,
  rng: { nextInt: (min: number, max: number) => number; shuffle: <T>(items: readonly T[]) => T[] },
): GeneratedProblem {
  const problemKey = `default:${sourceKey(source.prompt, source.correctAnswer)}`;

  const categoricalSet = findCategoricalSet(source.correctAnswer);
  if (categoricalSet) {
    return buildMultipleChoiceProblem(
      source,
      generateCategoricalChoices(categoricalSet),
      problemKey,
      rng,
    );
  }

  const numeric = parseNumericAnswer(source.correctAnswer);
  if (numeric !== undefined) {
    return buildMultipleChoiceProblem(
      source,
      generateNumericDistractors(numeric, rng),
      problemKey,
      rng,
    );
  }

  const fraction = parseFractionAnswer(source.correctAnswer);
  if (fraction) {
    return buildMultipleChoiceProblem(
      source,
      generateFractionDistractors(fraction.numerator, fraction.denominator, rng),
      problemKey,
      rng,
    );
  }

  return buildTextEntryProblem(source, problemKey);
}

function buildFallbackSeed(lesson: Partial<Lesson>, mode: PracticeMode): string {
  const lessonId = lesson.lesson_id ?? "unknown";
  const practiceType = lesson.practice_type ?? "default";
  return createPracticeSessionSeed(lessonId, practiceType, mode);
}

export function generateDefaultPracticeProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const lesson = options?.lesson as Lesson | undefined;
  if (!lesson) return [];

  const block = lesson.practice_block;
  const rawCount = options?.count ?? block?.question_count;
  const count = rawCount && rawCount > 0 ? rawCount : 5;

  const sources: ProblemSource[] = [];

  if (lesson.warmup?.questions) {
    for (const question of lesson.warmup.questions) {
      sources.push({
        prompt: buildSourcePrompt(question),
        correctAnswer: question.correct_answer,
        skill: question.skill,
      });
    }
  }

  if (lesson.try_it) {
    sources.push({
      prompt: lesson.try_it.prompt,
      correctAnswer: lesson.try_it.correct_answer,
    });
  }

  if (sources.length === 0) return [];

  const deduped = new Map<string, ProblemSource>();
  for (const source of sources) {
    const key = sourceKey(source.prompt, source.correctAnswer);
    if (!deduped.has(key)) {
      deduped.set(key, source);
    }
  }

  const uniqueSources = [...deduped.values()];

  const mode = options?.mode ?? "guided";
  const seed = options?.seed ?? buildFallbackSeed(lesson, mode);
  const rng = createSeededRng(seed);
  const shuffled = rng.shuffle(uniqueSources);

  const selectedCount = Math.min(count, shuffled.length);
  const selectedSources = shuffled.slice(0, selectedCount);

  return selectedSources.map((source, index) => {
    const generated = determineProblemType(source, rng);
    return {
      id: `default-${index + 1}`,
      problemKey: generated.problemKey,
      questionText: generated.questionText,
      correctAnswer: generated.correctAnswer,
      visualType: generated.visualType,
      visualData: generated.visualData,
    };
  });
}
