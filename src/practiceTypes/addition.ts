import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import {
  additionFamilyConfigs,
  type AdditionFamilyConfig,
  type AdditionRepresentation,
} from "./familyConfigs";

const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
const MAX_ADDEND_GENERATION_ATTEMPTS = 500;

function getDigit(n: number, place: number): number {
  return Math.floor(n / 10 ** place) % 10;
}

function getColumnSum(addends: number[], place: number, carry: number): number {
  return addends.reduce((sum, a) => sum + getDigit(a, place), 0) + carry;
}

function maxDigitCount(addends: number[]): number {
  return Math.max(...addends.map((a) => String(a).length));
}

/**
 * Returns true if column `place` produces a carry-out into the next higher place.
 * The simulation includes any carry-in from lower-order columns.
 *
 * - place 0 (ones): ones sum creates a carry into tens.
 * - place 1 (tens): tens sum, including any ones carry-in, creates a carry into hundreds.
 */
export function hasCarryOutAtPlace(addends: number[], place: number): boolean {
  let carry = 0;
  for (let p = 0; p <= place; p += 1) {
    const total = getColumnSum(addends, p, carry);
    carry = Math.floor(total / 10);
  }
  return carry > 0;
}

/**
 * Returns true if any column of the addends produces a carry-out.
 * Used for the "no regrouping" requirement: a problem passes only when
 * every column sum (including carry-in) is less than 10.
 */
export function hasAnyCarryOut(addends: number[]): boolean {
  let carry = 0;
  const maxPlace = maxDigitCount(addends);
  for (let p = 0; p < maxPlace; p += 1) {
    const total = getColumnSum(addends, p, carry);
    if (total >= 10) return true;
    carry = Math.floor(total / 10);
  }
  return false;
}

function getEffectiveRange(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
): { min: number; max: number } {
  if (config.compensation) {
    const max = mode === "guided" ? 400 : config.operandRange.max;
    return { min: config.operandRange.min, max };
  }

  const cap = config.addendCount === 3 ? 299 : 399;
  const max = mode === "guided" ? Math.min(config.operandRange.max, cap) : config.operandRange.max;
  return { min: config.operandRange.min, max };
}

function generateCompensationAddends(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
): number[] {
  const maxTarget = Math.floor(range.max / 100) * 100;
  if (maxTarget < 100) {
    throw new Error("Compensation target max is too small");
  }

  for (let attempt = 0; attempt < MAX_ADDEND_GENERATION_ATTEMPTS; attempt += 1) {
    const targetHundreds = rng.nextInt(1, maxTarget / 100);
    const target = targetHundreds * 100;
    const r = rng.nextInt(1, 4);
    const a = target - r;
    const b = rng.nextInt(10, 99);
    const sum = a + b;

    if (resultRange && (sum < resultRange.min || sum > resultRange.max)) continue;
    return [a, b];
  }

  throw new Error("Could not generate compensation addends");
}

function generateAddends(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
): number[] {
  const range = getEffectiveRange(config, mode);

  if (config.compensation) {
    return generateCompensationAddends(range, config.resultRange, rng);
  }

  for (let attempt = 0; attempt < MAX_ADDEND_GENERATION_ATTEMPTS; attempt += 1) {
    const addends = Array.from({ length: config.addendCount }, () =>
      rng.nextInt(range.min, range.max),
    );
    const sum = addends.reduce((a, b) => a + b, 0);

    if (config.resultRange && (sum < config.resultRange.min || sum > config.resultRange.max)) {
      continue;
    }

    if (config.regrouping === "none" && hasAnyCarryOut(addends)) continue;

    if (config.regrouping === "required") {
      if (config.requiredColumn === "ones" && !hasCarryOutAtPlace(addends, 0)) continue;
      if (config.requiredColumn === "tens" && !hasCarryOutAtPlace(addends, 1)) continue;
      if (!config.requiredColumn && !hasAnyCarryOut(addends)) continue;
    }

    return addends;
  }

  throw new Error(
    `Could not generate addends for ${config.practiceType} (${mode ?? "guided"}) within ${MAX_ADDEND_GENERATION_ATTEMPTS} attempts`,
  );
}

function getAllowedRepresentations(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
): AdditionRepresentation[] {
  if (mode === "guided") {
    if (config.representations.includes("direct")) return ["direct"];
    if (config.representations.includes("missing_digit")) return ["missing_digit"];
    return [config.representations[0]];
  }

  if (mode === "challenge") {
    const preferred: AdditionRepresentation[] = [
      "error_identification",
      "missing_addend",
      "missing_digit",
      "property",
      "balanced_equation",
      "word_problem",
      "direct",
    ];
    const allowed = preferred.filter((r) => config.representations.includes(r));
    return allowed.length > 0 ? allowed : [...config.representations];
  }

  return config.representations.filter((r) => r !== "error_identification");
}

function selectRepresentation(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
): AdditionRepresentation {
  const allowed = getAllowedRepresentations(config, mode);
  return rng.pick(allowed);
}

function buildBaseKey(
  _practiceType: string,
  mode: "guided" | "independent" | "challenge" | undefined,
  lessonId: string,
): string {
  return `addition:${lessonId}:${mode ?? "guided"}`;
}

function buildBaseSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: string,
  mode: "guided" | "independent" | "challenge" | undefined,
  lessonId: string,
): string {
  if (options?.seed !== undefined) return String(options.seed);
  // Omitted seed: deterministic fallback derived only from stable identifiers.
  // No timestamps, no Math.random, no browser globals, no mutable global state.
  return createPracticeSessionSeed(lessonId, practiceType, mode ?? "guided");
}

function buildNumericChoices(
  correct: number,
  contextValues: number[],
  rng: SeededRng,
  choiceCount = 4,
): string[] {
  const distractors = new Set<number>();
  const tryAdd = (n: number) => {
    if (Number.isFinite(n) && n >= 0 && n <= 999 && n !== correct) {
      distractors.add(n);
    }
  };

  const offsets = [1, -1, 2, -2, 10, -10, 11, -11, 20, -20, 100, -100, 50, -50];
  for (const offset of offsets) tryAdd(correct + offset);
  for (const value of contextValues) tryAdd(value);

  let extra = 3;
  while (distractors.size < choiceCount - 1 && extra <= 500) {
    tryAdd(correct + extra);
    tryAdd(correct - extra);
    extra += 1;
  }

  const picked = rng.shuffle([...distractors]).slice(0, choiceCount - 1);
  const choices = [String(correct), ...picked.map(String)];
  return rng.shuffle(choices);
}

function buildDigitChoices(correctDigit: number, rng: SeededRng): string[] {
  const distractors: string[] = [];
  for (let d = 0; d <= 9; d += 1) {
    if (d !== correctDigit) distractors.push(String(d));
  }
  const picked = rng.shuffle(distractors).slice(0, 3);
  const choices = [String(correctDigit), ...picked];
  return rng.shuffle(choices);
}

function buildTrueFalseChoices(_correct: "true" | "false", rng: SeededRng): string[] {
  const choices = ["True", "False"];
  return rng.shuffle(choices);
}

function sortAddends(addends: number[]): number[] {
  return [...addends].sort((a, b) => a - b);
}

function questionTextForRepresentation(
  representation: AdditionRepresentation,
  config: AdditionFamilyConfig,
): string {
  switch (representation) {
    case "direct":
      return `${config.skillLabel}.`;
    case "missing_addend":
      return "Find the missing addend.";
    case "word_problem":
      return "";
    case "missing_digit":
      return "Find the missing digit.";
    case "balanced_equation":
      return "Is this equation true or false?";
    case "property":
      return "Is this equation true or false?";
    case "error_identification":
      return "Is this equation correct?";
    default:
      return config.skillLabel;
  }
}

function formatDirectEquation(addends: number[]): string {
  return `${addends.join(" + ")} = ?`;
}

function formatMissingAddendEquation(addends: number[], hiddenIndex: number, sum: number): string {
  const parts = addends.map((a, i) => (i === hiddenIndex ? "__" : String(a)));
  return `${parts.join(" + ")} = ${sum}`;
}

function formatMissingDigitNumber(n: number, position: number): string {
  const s = String(n);
  const leftIndex = s.length - 1 - position;
  if (leftIndex < 0) return `${s}__`;
  return `${s.slice(0, leftIndex)}_${s.slice(leftIndex + 1)}`;
}

function makeDirectProblem(
  addends: number[],
  sum: number,
  config: AdditionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const equation = formatDirectEquation(sorted);

  return {
    problemKey: `${baseKey}:direct:${sorted.join("+")}`,
    questionText: questionTextForRepresentation("direct", config),
    correctAnswer: String(sum),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(sum, sorted, rng),
    },
  };
}

function makeMissingAddendProblem(
  addends: number[],
  sum: number,
  config: AdditionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const hiddenIndex = rng.nextInt(0, sorted.length - 1);
  const hiddenValue = sorted[hiddenIndex];
  const equation = formatMissingAddendEquation(sorted, hiddenIndex, sum);

  return {
    problemKey: `${baseKey}:missing_addend:${sorted.join("+")}=${sum}:hidden=${hiddenValue}`,
    questionText: questionTextForRepresentation("missing_addend", config),
    correctAnswer: String(hiddenValue),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(hiddenValue, [...sorted, sum], rng),
    },
  };
}

const WORD_PROBLEM_TEMPLATES = [
  "A box has {a} {noun} and another box has {b} {noun}. How many {noun} are there in all?",
  "There are {a} {noun} on one shelf and {b} {noun} on another. How many {noun} are there altogether?",
  "Maya has {a} {noun}. Her friend gives her {b} more. How many {noun} does Maya have now?",
];

const WORD_PROBLEM_NOUNS = ["apples", "books", "stickers", "marbles", "crayons", "pencils"];

function makeWordProblem(
  addends: number[],
  sum: number,
  _config: AdditionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const [a, b] = sorted;
  const template = rng.pick(WORD_PROBLEM_TEMPLATES);
  const noun = rng.pick(WORD_PROBLEM_NOUNS);
  const questionText = template
    .replaceAll("{a}", String(a))
    .replaceAll("{b}", String(b))
    .replaceAll("{noun}", noun);

  return {
    problemKey: `${baseKey}:word:${a}+${b}`,
    questionText,
    correctAnswer: String(sum),
    visualType: "multiple_choice",
    visualData: {
      equation: `${a} + ${b} = ?`,
      choices: buildNumericChoices(sum, sorted, rng),
    },
  };
}

function makeMissingDigitProblem(
  addends: number[],
  sum: number,
  config: AdditionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const targetOptions: Array<{ value: number; isSum: boolean; index: number }> = [
    { value: sorted[0], isSum: false, index: 0 },
    { value: sorted[1], isSum: false, index: 1 },
    { value: sum, isSum: true, index: 2 },
  ];
  const target = rng.pick(targetOptions);

  const valueDigits = String(target.value).length;
  const position = rng.nextInt(0, valueDigits - 1);
  const hiddenDigit = getDigit(target.value, position);
  const displayValue = formatMissingDigitNumber(target.value, position);

  let equation: string;
  if (target.isSum) {
    equation = `${sorted[0]} + ${sorted[1]} = ${displayValue}`;
  } else if (target.index === 0) {
    equation = `${displayValue} + ${sorted[1]} = ${sum}`;
  } else {
    equation = `${sorted[0]} + ${displayValue} = ${sum}`;
  }

  return {
    problemKey: `${baseKey}:missing_digit:${sorted.join("+")}=${sum}:op=${target.index}:pos=${position}:value=${hiddenDigit}`,
    questionText: questionTextForRepresentation("missing_digit", config),
    correctAnswer: String(hiddenDigit),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildDigitChoices(hiddenDigit, rng),
    },
  };
}

function makeBalancedEquationProblem(
  addends: number[],
  sum: number,
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const [a, b] = sorted;
  const range = getEffectiveRange(config, mode);
  const isTrue = rng.next() < 0.5;
  let equation: string;
  let correctAnswer: "true" | "false";

  if (isTrue) {
    const minC = Math.max(range.min, sum - range.max);
    const maxC = Math.min(range.max, sum - range.min);

    if (minC <= maxC) {
      const c = rng.nextInt(Math.max(minC, 1), maxC);
      const d = sum - c;

      if (d >= range.min && d <= range.max && c !== 0 && d !== 0) {
        equation = `${a} + ${b} = ${c} + ${d}`;
      } else {
        equation = `${a} + ${b} = ${b} + ${a}`;
      }
    } else {
      equation = `${a} + ${b} = ${b} + ${a}`;
    }
    correctAnswer = "true";
  } else {
    const deltas = rng.shuffle([1, -1, 10, -10]);
    let falseSecond: number | undefined;

    for (const delta of deltas) {
      const forward = b + delta;
      if (forward >= range.min && forward <= range.max && forward !== b && forward !== a) {
        falseSecond = forward;
        break;
      }
      const backward = b - delta;
      if (backward >= range.min && backward <= range.max && backward !== b && backward !== a) {
        falseSecond = backward;
        break;
      }
    }

    if (falseSecond === undefined) {
      if (b - 1 >= range.min && b - 1 !== a) {
        falseSecond = b - 1;
      } else if (b + 1 <= range.max) {
        falseSecond = b + 1;
      } else {
        falseSecond = range.min === a ? range.min + 1 : range.min;
      }
    }

    equation = `${a} + ${b} = ${b} + ${falseSecond}`;
    correctAnswer = "false";
  }

  return {
    problemKey: `${baseKey}:balanced:${equation}:${correctAnswer}`,
    questionText: questionTextForRepresentation("balanced_equation", config),
    correctAnswer,
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildTrueFalseChoices(correctAnswer, rng),
    },
  };
}

function makePropertyProblem(
  addends: number[],
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const [a, b] = sorted;
  const isAssociative = rng.next() < 0.5;
  let equation: string;
  let correctAnswer: "true" | "false";

  if (isAssociative) {
    const range = getEffectiveRange(config, mode);
    const maxC = Math.min(range.max, 999 - a - b);

    if (maxC < range.min) {
      // Not enough room for a third addend while keeping the total within grade-3 bounds;
      // fall back to the commutative property form.
      equation = `${a} + ${b} = ${b} + ${a}`;
      correctAnswer = "true";
    } else {
      const c = rng.nextInt(range.min, Math.max(range.min, maxC));
      const isTrue = rng.next() < 0.5;

      if (isTrue) {
        equation = `(${a} + ${b}) + ${c} = ${a} + (${b} + ${c})`;
        correctAnswer = "true";
      } else {
        const deltas = rng.shuffle([1, -1, 10, -10]);
        let d: number | undefined;

        for (const delta of deltas) {
          const forward = c + delta;
          if (forward >= range.min && forward <= range.max && forward !== c) {
            d = forward;
            break;
          }
          const backward = c - delta;
          if (backward >= range.min && backward <= range.max && backward !== c) {
            d = backward;
            break;
          }
        }

        if (d === undefined) {
          d = c === range.min ? c + 1 : c - 1;
        }

        equation = `(${a} + ${b}) + ${c} = ${a} + (${b} + ${d})`;
        correctAnswer = "false";
      }
    }
  } else {
    const range = getEffectiveRange(config, mode);
    const isTrue = rng.next() < 0.5;

    if (isTrue) {
      equation = `${a} + ${b} = ${b} + ${a}`;
      correctAnswer = "true";
    } else {
      const deltas = rng.shuffle([1, -1, 10, -10]);
      let falseSecond: number | undefined;

      for (const delta of deltas) {
        const forward = b + delta;
        if (forward >= range.min && forward <= range.max && forward !== b && forward !== a) {
          falseSecond = forward;
          break;
        }
        const backward = b - delta;
        if (backward >= range.min && backward <= range.max && backward !== b && backward !== a) {
          falseSecond = backward;
          break;
        }
      }

      if (falseSecond === undefined) {
        if (b - 1 >= range.min && b - 1 !== a) {
          falseSecond = b - 1;
        } else if (b + 1 <= range.max) {
          falseSecond = b + 1;
        } else {
          falseSecond = range.min === a ? range.min + 1 : range.min;
        }
      }

      equation = `${a} + ${b} = ${b} + ${falseSecond}`;
      correctAnswer = "false";
    }
  }

  return {
    problemKey: `${baseKey}:property:${equation}:${correctAnswer}`,
    questionText: questionTextForRepresentation("property", config),
    correctAnswer,
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildTrueFalseChoices(correctAnswer, rng),
    },
  };
}

function generateDistractorSum(sum: number, addends: number[], rng: SeededRng): number {
  const candidates = new Set<number>();
  for (const offset of [1, -1, 10, -10, 100, -100]) {
    candidates.add(sum + offset);
  }
  for (const a of addends) candidates.add(a);

  const valid = [...candidates].filter((n) => n >= 0 && n <= 999 && n !== sum);
  if (valid.length > 0) return rng.pick(valid);
  return sum + 1;
}

function getReasonText(type: string): string {
  switch (type) {
    case "correct":
      return "The addition is correct.";
    case "off_by_one":
      return "The student was off by one.";
    case "off_by_ten":
      return "The student made a place-value mistake (off by 10).";
    case "off_by_hundred":
      return "The student made a place-value mistake (off by 100).";
    case "used_operand":
      return "The student wrote one of the addends instead of the sum.";
    case "forgot_ones_carry":
      return "The student forgot to regroup the ones.";
    case "forgot_tens_carry":
      return "The student forgot to regroup the tens.";
    default:
      return "The student added a place value incorrectly.";
  }
}

function determineErrorType(sum: number, claimedSum: number, addends: number[]): string {
  if (claimedSum === sum) return "correct";
  const diff = claimedSum - sum;

  if (Math.abs(diff) === 1) return "off_by_one";
  if (Math.abs(diff) === 10) return "off_by_ten";
  if (Math.abs(diff) === 100) return "off_by_hundred";
  if (addends.includes(claimedSum)) return "used_operand";
  if (hasCarryOutAtPlace(addends, 0) && diff === -10) return "forgot_ones_carry";
  if (hasCarryOutAtPlace(addends, 1) && diff === -100) return "forgot_tens_carry";
  return "added_wrong_place";
}

function buildReasonChoices(correctType: string, rng: SeededRng): string[] {
  const correctReason = getReasonText(correctType);
  const allTypes = [
    "off_by_one",
    "off_by_ten",
    "off_by_hundred",
    "used_operand",
    "forgot_ones_carry",
    "forgot_tens_carry",
    "added_wrong_place",
  ];
  const distractorTypes = allTypes.filter((t) => t !== correctType);
  const selectedDistractors = rng.shuffle(distractorTypes).slice(0, 2);
  const distractorReasons = selectedDistractors.map((t) => getReasonText(t));
  return rng.shuffle([correctReason, ...distractorReasons]);
}

function makeErrorIdentificationProblem(
  addends: number[],
  sum: number,
  config: AdditionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const sorted = sortAddends(addends);
  const isCorrect = rng.next() < 0.25;
  const claimedSum = isCorrect ? sum : generateDistractorSum(sum, sorted, rng);
  const errorType = determineErrorType(sum, claimedSum, sorted);
  const correctJudgment: "yes" | "no" = isCorrect ? "yes" : "no";
  const correctReason = getReasonText(errorType);
  const equationToCheck = `${sorted.join(" + ")} = ${claimedSum}`;

  return {
    problemKey: `${baseKey}:error:${sorted.join("+")}=${claimedSum}`,
    questionText: questionTextForRepresentation("error_identification", config),
    correctAnswer: correctJudgment,
    visualType: "mistake_check",
    visualData: { equation: equationToCheck },
    challengeData: {
      equationToCheck,
      judgmentChoices: rng.shuffle(["yes", "no"] as const),
      correctJudgment,
      reasonChoices: buildReasonChoices(errorType, rng),
      correctReason,
      feedback:
        correctJudgment === "yes"
          ? `Yes, ${sorted.join(" + ")} = ${sum}.`
          : `No, ${sorted.join(" + ")} = ${sum}, not ${claimedSum}.`,
    },
  };
}

function generateProblem(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const representation = selectRepresentation(config, mode, rng);
  const addends = generateAddends(config, mode, rng);
  const sum = addends.reduce((a, b) => a + b, 0);

  switch (representation) {
    case "direct":
      return makeDirectProblem(addends, sum, config, rng, baseKey);
    case "missing_addend":
      return makeMissingAddendProblem(addends, sum, config, rng, baseKey);
    case "word_problem":
      return makeWordProblem(addends, sum, config, rng, baseKey);
    case "missing_digit":
      return makeMissingDigitProblem(addends, sum, config, rng, baseKey);
    case "balanced_equation":
      return makeBalancedEquationProblem(addends, sum, config, mode, rng, baseKey);
    case "property":
      return makePropertyProblem(addends, config, mode, rng, baseKey);
    case "error_identification":
      return makeErrorIdentificationProblem(addends, sum, config, rng, baseKey);
    default:
      return makeDirectProblem(addends, sum, config, rng, baseKey);
  }
}

function generateUniqueProblem(
  config: AdditionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  baseSeed: string,
  baseKey: string,
  index: number,
  usedKeys: Set<string>,
): PracticeProblem {
  for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
    const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
    const problem = generateProblem(config, mode, rng, baseKey);

    if (!usedKeys.has(problem.problemKey)) {
      return {
        ...problem,
        id: `${config.practiceType}-${mode ?? "guided"}-${index + 1}`,
      };
    }
  }

  throw new Error(
    `Could not generate a unique Addition problem for ${config.practiceType} within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
  );
}

export function generateAdditionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = options?.lesson?.practice_type ?? "unknown";
  const config = additionFamilyConfigs[practiceType];

  if (!config) {
    throw new Error(`No Addition family configuration for practice type: ${practiceType}`);
  }

  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  const baseSeed = buildBaseSeed(options, practiceType, mode, lessonId);
  const baseKey = buildBaseKey(practiceType, mode, lessonId);
  const count = getPracticeProblemCount(options);

  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let i = 0; i < count; i += 1) {
    const problem = generateUniqueProblem(config, mode, baseSeed, baseKey, i, usedKeys);
    usedKeys.add(problem.problemKey);
    problems.push(problem);
  }

  return problems;
}
