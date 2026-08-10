import type { SeededRng } from "../../practiceTypes/random";

export type ExpandedFormPracticeType = "expanded_form" | "expanded_form_large";

export type ExpandedFormDirection = "standard_to_expanded" | "expanded_to_standard";

export const EXPANDED_FORM_RANGES: Record<
  ExpandedFormPracticeType,
  { min: number; max: number }
> = {
  expanded_form: { min: 10, max: 9_999 },
  expanded_form_large: { min: 1_000, max: 100_000 },
};

export type ExpandedFormTerm = {
  digit: number;
  placeValue: number;
  value: number;
};

export type ExpandedFormProblem = {
  form: "expanded_form";
  practiceType: ExpandedFormPracticeType;
  sourceNumber: number;
  direction: ExpandedFormDirection;
  terms: ExpandedFormTerm[];
  expandedForm: string;
  standardForm: string;
  correctAnswer: string;
  problemKey: string;
};

function decomposeNonZeroTerms(number: number): ExpandedFormTerm[] {
  const terms: ExpandedFormTerm[] = [];
  for (let placeValue = 1; number >= placeValue; placeValue *= 10) {
    const digit = Math.floor(number / placeValue) % 10;
    if (digit !== 0) terms.unshift({ digit, placeValue, value: digit * placeValue });
  }
  return terms;
}

export function formatExpandedForm(terms: readonly ExpandedFormTerm[]): string {
  return terms.map((term) => term.value.toLocaleString("en-US")).join(" + ");
}

function getExpandedFormSourceNumber(
  practiceType: ExpandedFormPracticeType,
  rng: SeededRng,
): number {
  if (practiceType === "expanded_form") {
    const digitLength = rng.nextInt(2, 4);
    return rng.nextInt(10 ** (digitLength - 1), 10 ** digitLength - 1);
  }

  if (rng.nextInt(0, 9) === 0) return 100_000;
  const digitLength = rng.nextInt(4, 5);
  return rng.nextInt(10 ** (digitLength - 1), 10 ** digitLength - 1);
}

export function createExpandedFormProblem(
  practiceType: ExpandedFormPracticeType,
  sourceNumber: number,
  direction: ExpandedFormDirection,
): ExpandedFormProblem {
  const range = EXPANDED_FORM_RANGES[practiceType];
  if (!Number.isInteger(sourceNumber) || sourceNumber < range.min || sourceNumber > range.max) {
    throw new RangeError(
      `${practiceType} supports whole numbers from ${range.min} through ${range.max}`,
    );
  }

  const terms = decomposeNonZeroTerms(sourceNumber);
  const expandedForm = formatExpandedForm(terms);
  return {
    form: "expanded_form",
    practiceType,
    sourceNumber,
    direction,
    terms,
    expandedForm,
    standardForm: String(sourceNumber),
    correctAnswer: direction === "standard_to_expanded" ? expandedForm : String(sourceNumber),
    problemKey: `expanded_form:${sourceNumber}:${direction}`,
  };
}

export function generateExpandedFormProblem(
  practiceType: ExpandedFormPracticeType,
  rng: SeededRng,
): ExpandedFormProblem {
  return createExpandedFormProblem(
    practiceType,
    getExpandedFormSourceNumber(practiceType, rng),
    rng.pick(["standard_to_expanded", "expanded_to_standard"] as const),
  );
}

export type NumberWordPracticeType = "number_words" | "reading_large_numbers";

export type NumberWordDirection = "number_to_words" | "words_to_number";

export const NUMBER_WORD_RANGES: Record<
  NumberWordPracticeType,
  { min: number; max: number }
> = {
  number_words: { min: 10, max: 9_999 },
  reading_large_numbers: { min: 1_000, max: 100_000 },
};

const DIRECTIONS: readonly NumberWordDirection[] = ["number_to_words", "words_to_number"];

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
] as const;

const TEENS = [
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
] as const;

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
] as const;

export type NumberWordProblem = {
  form: "number_words";
  practiceType: NumberWordPracticeType;
  sourceNumber: number;
  direction: NumberWordDirection;
  wordForm: string;
  correctAnswer: string;
  problemKey: string;
};

function formatBelowThousand(number: number): string {
  if (number < 10) return ONES[number];
  if (number < 20) return TEENS[number - 10];
  if (number < 100) {
    const tens = Math.floor(number / 10);
    const ones = number % 10;
    return ones === 0 ? TENS[tens] : `${TENS[tens]}-${ONES[ones]}`;
  }

  const hundreds = Math.floor(number / 100);
  const remainder = number % 100;
  return remainder === 0
    ? `${ONES[hundreds]} hundred`
    : `${ONES[hundreds]} hundred ${formatBelowThousand(remainder)}`;
}

export function formatNumberWords(number: number): string {
  if (!Number.isInteger(number) || number < 0 || number > 100_000) {
    throw new RangeError("Number words support whole numbers from 0 through 100,000");
  }
  if (number < 1_000) return formatBelowThousand(number);

  const thousands = Math.floor(number / 1_000);
  const remainder = number % 1_000;
  const thousandsForm = `${formatBelowThousand(thousands)} thousand`;
  return remainder === 0
    ? thousandsForm
    : `${thousandsForm}, ${formatBelowThousand(remainder)}`;
}

function getSourceNumber(
  practiceType: NumberWordPracticeType,
  rng: SeededRng,
): number {
  if (practiceType === "number_words") {
    const digitLength = rng.nextInt(2, 4);
    return rng.nextInt(10 ** (digitLength - 1), 10 ** digitLength - 1);
  }

  // Keep the exact curriculum boundary as an explicit generated case while
  // otherwise covering both the thousands and ten-thousands domains.
  if (rng.nextInt(0, 9) === 0) return 100_000;
  const digitLength = rng.nextInt(4, 5);
  return rng.nextInt(10 ** (digitLength - 1), 10 ** digitLength - 1);
}

export function createNumberWordProblem(
  practiceType: NumberWordPracticeType,
  sourceNumber: number,
  direction: NumberWordDirection,
): NumberWordProblem {
  const range = NUMBER_WORD_RANGES[practiceType];
  if (!Number.isInteger(sourceNumber) || sourceNumber < range.min || sourceNumber > range.max) {
    throw new RangeError(
      `${practiceType} supports whole numbers from ${range.min} through ${range.max}`,
    );
  }

  const wordForm = formatNumberWords(sourceNumber);
  return {
    form: "number_words",
    practiceType,
    sourceNumber,
    direction,
    wordForm,
    correctAnswer: direction === "number_to_words" ? wordForm : String(sourceNumber),
    problemKey: `number_words:${sourceNumber}:${direction}`,
  };
}

export function generateNumberWordProblem(
  practiceType: NumberWordPracticeType,
  rng: SeededRng,
): NumberWordProblem {
  return createNumberWordProblem(practiceType, getSourceNumber(practiceType, rng), rng.pick(DIRECTIONS));
}
