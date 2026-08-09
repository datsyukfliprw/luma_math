import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import {
  subtractionFamilyConfigs,
  type SubtractionFamilyConfig,
  type SubtractionRepresentation,
} from "./familyConfigs";

const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;
const MAX_PAIR_GENERATION_ATTEMPTS = 500;

function getDigit(n: number, place: number): number {
  return Math.floor(n / 10 ** place) % 10;
}

function maxDigitCount(a: number, b: number): number {
  return Math.max(String(a).length, String(b).length);
}

/**
 * Returns true if column `place` requires borrowing from the next higher place.
 * The simulation includes any borrow from lower-order columns.
 */
export function hasBorrowAtPlace(minuend: number, subtrahend: number, place: number): boolean {
  let borrow = 0;
  for (let p = 0; p <= place; p += 1) {
    const m = getDigit(minuend, p) - borrow;
    const s = getDigit(subtrahend, p);
    if (m < s) {
      if (p === place) return true;
      borrow = 1;
    } else {
      borrow = 0;
    }
  }
  return false;
}

/**
 * Returns true if any column of the subtraction requires borrowing.
 */
export function hasAnyBorrow(minuend: number, subtrahend: number): boolean {
  let borrow = 0;
  const maxPlace = maxDigitCount(minuend, subtrahend);
  for (let p = 0; p < maxPlace; p += 1) {
    const m = getDigit(minuend, p) - borrow;
    const s = getDigit(subtrahend, p);
    if (m < s) return true;
    borrow = 0;
  }
  return false;
}

export function decomposeByPlace(n: number): number[] {
  const parts: number[] = [];
  const s = String(n);
  for (let i = 0; i < s.length; i += 1) {
    const digit = Number(s[i]);
    if (digit === 0) continue;
    const place = s.length - 1 - i;
    parts.push(digit * 10 ** place);
  }
  return parts;
}

function formatMissingDigitNumber(n: number, position: number): string {
  const s = String(n);
  const leftIndex = s.length - 1 - position;
  if (leftIndex < 0) return `${s}__`;
  return `${s.slice(0, leftIndex)}_${s.slice(leftIndex + 1)}`;
}

function digitwiseSmallerFromLarger(a: number, b: number): number {
  let result = 0;
  const maxPlace = maxDigitCount(a, b);
  for (let p = 0; p < maxPlace; p += 1) {
    result += Math.abs(getDigit(a, p) - getDigit(b, p)) * 10 ** p;
  }
  return result;
}

function generateDistractorDifference(
  difference: number,
  minuend: number,
  subtrahend: number,
  rng: SeededRng,
): number {
  const candidates = new Set<number>();
  for (const offset of [1, -1, 10, -10, 100, -100]) {
    candidates.add(difference + offset);
  }
  candidates.add(minuend);
  candidates.add(subtrahend);
  candidates.add(digitwiseSmallerFromLarger(minuend, subtrahend));

  if (hasBorrowAtPlace(minuend, subtrahend, 0)) {
    candidates.add(difference + 10);
    candidates.add(difference - 10);
  }
  if (hasBorrowAtPlace(minuend, subtrahend, 1)) {
    candidates.add(difference + 100);
    candidates.add(difference - 100);
  }

  const valid = [...candidates].filter(
    (n) => Number.isFinite(n) && n >= 0 && n <= 999 && n !== difference,
  );
  if (valid.length > 0) return rng.pick(valid);
  return difference + 1;
}

export function determineErrorType(
  difference: number,
  claimedDifference: number,
  minuend: number,
  subtrahend: number,
): string {
  if (claimedDifference === difference) return "correct";
  const diff = claimedDifference - difference;

  if (hasBorrowAtPlace(minuend, subtrahend, 0) && diff === 10) return "forgot_ones_borrow";
  if (hasBorrowAtPlace(minuend, subtrahend, 1) && diff === 100) return "forgot_tens_borrow";

  if (claimedDifference === minuend || claimedDifference === subtrahend) return "used_operand";
  if (Math.abs(diff) === 1) return "off_by_one";
  if (Math.abs(diff) === 10) return "off_by_ten";
  if (Math.abs(diff) === 100) return "off_by_hundred";
  if (claimedDifference === digitwiseSmallerFromLarger(minuend, subtrahend)) {
    return "subtracted_smaller_from_larger";
  }
  return "subtraction_error";
}

function getReasonText(type: string): string {
  switch (type) {
    case "correct":
      return "The subtraction is correct.";
    case "off_by_one":
      return "The student was off by one.";
    case "off_by_ten":
      return "The student made a place-value mistake (off by 10).";
    case "off_by_hundred":
      return "The student made a place-value mistake (off by 100).";
    case "used_operand":
      return "The student wrote one of the numbers instead of the difference.";
    case "forgot_ones_borrow":
      return "The student forgot to regroup the ones.";
    case "forgot_tens_borrow":
      return "The student forgot to regroup the tens.";
    case "subtracted_smaller_from_larger":
      return "The student subtracted the smaller digit from the larger digit regardless of position.";
    default:
      return "The student subtracted a place value incorrectly.";
  }
}

function buildReasonChoices(correctType: string, rng: SeededRng): string[] {
  const correctReason = getReasonText(correctType);
  const allTypes = [
    "off_by_one",
    "off_by_ten",
    "off_by_hundred",
    "used_operand",
    "forgot_ones_borrow",
    "forgot_tens_borrow",
    "subtracted_smaller_from_larger",
    "subtraction_error",
  ];
  const distractorTypes = allTypes.filter((t) => t !== correctType);
  const selectedDistractors = rng.shuffle(distractorTypes).slice(0, 2);
  const distractorReasons = selectedDistractors.map((t) => getReasonText(t));
  return rng.shuffle([correctReason, ...distractorReasons]);
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

function getEffectiveRange(
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
): { min: number; max: number } {
  if (config.compensation) {
    const max =
      mode === "guided" ? Math.min(config.operandRange.max, 499) : config.operandRange.max;
    return { min: config.operandRange.min, max };
  }

  if (config.acrossZeros) {
    return { min: config.operandRange.min, max: config.operandRange.max };
  }

  const cap = 499;
  const max = mode === "guided" ? Math.min(config.operandRange.max, cap) : config.operandRange.max;
  return { min: config.operandRange.min, max };
}

function inResultRange(
  value: number,
  resultRange: { min: number; max: number } | undefined,
): boolean {
  if (!resultRange) return true;
  return value >= resultRange.min && value <= resultRange.max;
}

function generateNoRegroupPair(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
  minSubtrahendParts = 1,
): [number, number] {
  for (let attempt = 0; attempt < MAX_PAIR_GENERATION_ATTEMPTS; attempt += 1) {
    const minuend = rng.nextInt(range.min, range.max);
    const aH = getDigit(minuend, 2);
    const aT = getDigit(minuend, 1);
    const aO = getDigit(minuend, 0);

    const bH = rng.nextInt(1, aH);
    const bT = rng.nextInt(0, aT);
    const bO = rng.nextInt(0, aO);
    if (bH === aH && bT === aT && bO === aO) continue;

    const subtrahend = bH * 100 + bT * 10 + bO;
    if (subtrahend < 100) continue;
    if (subtrahend >= minuend) continue;
    if (decomposeByPlace(subtrahend).length < minSubtrahendParts) continue;

    const difference = minuend - subtrahend;
    if (!inResultRange(difference, resultRange)) continue;

    return [minuend, subtrahend];
  }

  throw new Error("Could not generate a no-regroup subtraction pair");
}

function generateRegroupOnesPair(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
): [number, number] {
  for (let attempt = 0; attempt < MAX_PAIR_GENERATION_ATTEMPTS; attempt += 1) {
    const minuend = rng.nextInt(range.min, range.max);
    const aH = getDigit(minuend, 2);
    const aT = getDigit(minuend, 1);
    const aO = getDigit(minuend, 0);

    if (aO === 9 || aT < 1) continue;
    if (aH < 1) continue;

    const bH = rng.nextInt(1, aH);
    const bT = rng.nextInt(0, aT - 1);
    const bO = rng.nextInt(aO + 1, 9);
    const subtrahend = bH * 100 + bT * 10 + bO;
    if (subtrahend < 100 || subtrahend >= minuend) continue;

    const difference = minuend - subtrahend;
    if (!inResultRange(difference, resultRange)) continue;

    return [minuend, subtrahend];
  }

  throw new Error("Could not generate a regroup-ones subtraction pair");
}

function generateRegroupTensPair(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
): [number, number] {
  for (let attempt = 0; attempt < MAX_PAIR_GENERATION_ATTEMPTS; attempt += 1) {
    const minuend = rng.nextInt(range.min, range.max);
    const aH = getDigit(minuend, 2);
    const aT = getDigit(minuend, 1);
    const aO = getDigit(minuend, 0);

    if (aT === 9 || aH < 2) continue;

    const bH = rng.nextInt(1, aH - 1);
    const bT = rng.nextInt(aT + 1, 9);
    const bO = rng.nextInt(0, aO);
    const subtrahend = bH * 100 + bT * 10 + bO;
    if (subtrahend < 100 || subtrahend >= minuend) continue;

    const difference = minuend - subtrahend;
    if (!inResultRange(difference, resultRange)) continue;

    return [minuend, subtrahend];
  }

  throw new Error("Could not generate a regroup-tens subtraction pair");
}

function generateAcrossZerosPair(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
): [number, number] {
  for (let attempt = 0; attempt < MAX_PAIR_GENERATION_ATTEMPTS; attempt += 1) {
    const minuend = rng.nextInt(range.min, range.max);
    const aH = getDigit(minuend, 2);
    const aT = getDigit(minuend, 1);
    const aO = getDigit(minuend, 0);

    if (aT !== 0 || aH < 2) continue;

    const bH = rng.nextInt(1, aH - 1);
    const bT = rng.nextInt(0, 9);
    const bO = rng.nextInt(0, 9);
    if (aO >= bO && bT === 0) continue;

    const subtrahend = bH * 100 + bT * 10 + bO;
    if (subtrahend < 100 || subtrahend >= minuend) continue;

    const difference = minuend - subtrahend;
    if (!inResultRange(difference, resultRange)) continue;

    return [minuend, subtrahend];
  }

  throw new Error("Could not generate an across-zeros subtraction pair");
}

function generateCompensationPair(
  range: { min: number; max: number },
  resultRange: { min: number; max: number } | undefined,
  rng: SeededRng,
): [number, number] {
  const minTargetHundreds = 2; // keep the subtrahend at least 3-digit (>= 196)

  for (let attempt = 0; attempt < MAX_PAIR_GENERATION_ATTEMPTS; attempt += 1) {
    const minuend = rng.nextInt(range.min, range.max);
    const maxTarget = Math.floor(minuend / 100) * 100;
    const maxTargetHundreds = maxTarget / 100;

    if (maxTargetHundreds < minTargetHundreds) continue;

    const validTargets: number[] = [];
    for (let h = minTargetHundreds; h <= maxTargetHundreds; h += 1) {
      const target = h * 100;
      if (minuend - target >= 10) {
        validTargets.push(target);
      }
    }
    if (validTargets.length === 0) continue;

    const target = rng.pick(validTargets);
    const r = rng.nextInt(1, 4);
    const subtrahend = target - r;
    if (subtrahend < 100) continue;

    const difference = minuend - subtrahend;
    if (!inResultRange(difference, resultRange)) continue;

    return [minuend, subtrahend];
  }

  throw new Error("Could not generate a compensation subtraction pair");
}

function generatePair(
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
): [number, number] {
  const range = getEffectiveRange(config, mode);

  if (config.compensation) {
    return generateCompensationPair(range, config.resultRange, rng);
  }

  if (config.acrossZeros) {
    return generateAcrossZerosPair(range, config.resultRange, rng);
  }

  if (config.regrouping === "none") {
    const minSubtrahendParts =
      config.practiceType === "subtraction_number_line" ||
      config.practiceType === "subtraction_expanded_form"
        ? 2
        : 1;
    return generateNoRegroupPair(range, config.resultRange, rng, minSubtrahendParts);
  }

  if (config.regrouping === "required" && config.requiredColumn === "ones") {
    return generateRegroupOnesPair(range, config.resultRange, rng);
  }

  if (config.regrouping === "required" && config.requiredColumn === "tens") {
    return generateRegroupTensPair(range, config.resultRange, rng);
  }

  throw new Error(`No pair generator for ${config.practiceType}`);
}

function getAllowedRepresentations(
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
): SubtractionRepresentation[] {
  if (mode === "guided") {
    if (config.practiceType === "subtraction_number_line") return ["number_line_jumps"];
    if (config.practiceType === "subtraction_expanded_form") return ["expanded_form"];
    if (config.practiceType === "subtraction_compensation") return ["compensation"];
    if (config.practiceType === "subtraction_missing_digits") return ["missing_digit"];
    if (config.representations.includes("direct")) return ["direct"];
    return [config.representations[0]];
  }

  if (mode === "challenge") {
    const preferred: SubtractionRepresentation[] = [
      "error_identification",
      "missing_subtrahend",
      "missing_minuend",
      "missing_digit",
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
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
): SubtractionRepresentation {
  const allowed = getAllowedRepresentations(config, mode);
  return rng.pick(allowed);
}

function buildBaseKey(
  _practiceType: string,
  mode: "guided" | "independent" | "challenge" | undefined,
  lessonId: string,
): string {
  return `subtraction:${lessonId}:${mode ?? "guided"}`;
}

function buildBaseSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: string,
  mode: "guided" | "independent" | "challenge" | undefined,
  lessonId: string,
): string {
  if (options?.seed !== undefined) return String(options.seed);
  return createPracticeSessionSeed(lessonId, practiceType, mode ?? "guided");
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  const fromOptions = options?.count;
  if (typeof fromOptions === "number" && fromOptions > 0) return fromOptions;

  const fromBlock = options?.lesson?.practice_block?.question_count;
  if (typeof fromBlock === "number" && fromBlock > 0) return fromBlock;

  return getPracticeProblemCount(options);
}

function questionTextForRepresentation(
  representation: SubtractionRepresentation,
  config: SubtractionFamilyConfig,
): string {
  switch (representation) {
    case "direct":
      return `${config.skillLabel}.`;
    case "number_line_jumps":
      return "Solve using a number line.";
    case "expanded_form":
      return "Subtract using expanded form.";
    case "compensation":
      return "Subtract using compensation.";
    case "missing_subtrahend":
      return "Find the missing subtrahend.";
    case "missing_minuend":
      return "Find the missing minuend.";
    case "missing_difference":
      return "Find the missing difference.";
    case "missing_digit":
      return "Find the missing digit.";
    case "balanced_equation":
      return "Is this equation true or false?";
    case "error_identification":
      return "Is this equation correct?";
    case "word_problem":
      return "";
    default:
      return config.skillLabel;
  }
}

function makeNumberLineJumpsProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const jumps = decomposeByPlace(subtrahend);

  const useMissingJump = mode === "challenge" && jumps.length > 1 && rng.next() < 0.6;

  if (useMissingJump) {
    const hiddenIndex = rng.nextInt(0, jumps.length - 1);
    const hiddenJump = jumps[hiddenIndex];
    const displayedJumps = jumps.map((j, i) => (i === hiddenIndex ? "__" : String(j)));
    const equation = `${minuend} - ${displayedJumps.join(" - ")} = ${difference}`;

    return {
      problemKey: `${baseKey}:number_line:${minuend}-${subtrahend}:jumps=${jumps.join(",")}:hidden=${hiddenJump}`,
      questionText: "What jump is missing on the number line?",
      correctAnswer: String(hiddenJump),
      visualType: "multiple_choice",
      visualData: {
        equation,
        choices: buildNumericChoices(hiddenJump, [...jumps, difference], rng),
      },
    };
  }

  const equation = `${minuend} - ${jumps.join(" - ")} = ?`;

  return {
    problemKey: `${baseKey}:number_line:${minuend}-${subtrahend}:jumps=${jumps.join(",")}`,
    questionText: questionTextForRepresentation("number_line_jumps", config),
    correctAnswer: String(difference),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(difference, [minuend, subtrahend, ...jumps], rng),
    },
  };
}

function makeExpandedFormProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const maxPlace = Math.max(String(minuend).length, String(subtrahend).length);
  const terms: { value: number; text: string }[] = [];

  for (let p = maxPlace - 1; p >= 0; p -= 1) {
    const aPart = getDigit(minuend, p) * 10 ** p;
    const bPart = getDigit(subtrahend, p) * 10 ** p;
    if (aPart === 0 && bPart === 0) continue;
    const value = aPart - bPart;
    if (value === 0) continue;
    terms.push({ value, text: `(${aPart} - ${bPart})` });
  }

  const hideTerm = mode === "challenge" && terms.length > 1 && rng.next() < 0.6;

  if (hideTerm) {
    const hiddenIndex = rng.nextInt(0, terms.length - 1);
    const hidden = terms[hiddenIndex];
    const displayed = terms.map((t, i) => (i === hiddenIndex ? "__" : t.text));
    const equation = `${displayed.join(" + ")} = ${difference}`;

    return {
      problemKey: `${baseKey}:expanded_form:${minuend}-${subtrahend}:hidden=${hidden.value}`,
      questionText: "What place-value part is missing?",
      correctAnswer: String(hidden.value),
      visualType: "multiple_choice",
      visualData: {
        equation,
        choices: buildNumericChoices(
          hidden.value,
          terms.map((t) => t.value),
          rng,
        ),
      },
    };
  }

  const equation = `${terms.map((t) => t.text).join(" + ")} = ?`;

  return {
    problemKey: `${baseKey}:expanded_form:${minuend}-${subtrahend}`,
    questionText: questionTextForRepresentation("expanded_form", config),
    correctAnswer: String(difference),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(
        difference,
        [minuend, subtrahend, ...terms.map((t) => t.value)],
        rng,
      ),
    },
  };
}

function makeCompensationProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  // subtrahend = target - r, where target is the next higher round hundred.
  const target = Math.ceil(subtrahend / 100) * 100;
  const adjustment = target - subtrahend;
  const intermediate = minuend - target;

  const useTrueFalse = mode === "challenge" && rng.next() < 0.5;

  if (useTrueFalse) {
    const isTrue = rng.next() < 0.5;
    let shownAdjustment = adjustment;
    if (!isTrue) {
      const deltas = [1, -1, 10, -10].filter((d) => adjustment + d >= 0 && adjustment + d <= 999);
      shownAdjustment = adjustment + (deltas.length > 0 ? rng.pick(deltas) : 1);
    }
    const equation = `${minuend} - ${subtrahend} = ${intermediate} + ${shownAdjustment}`;
    const correctAnswer: "true" | "false" = isTrue ? "true" : "false";

    return {
      problemKey: `${baseKey}:compensation:${minuend}-${subtrahend}=${intermediate}+${shownAdjustment}:${correctAnswer}`,
      questionText: "Does this compensation equation give the correct difference?",
      correctAnswer,
      visualType: "multiple_choice",
      visualData: {
        equation,
        choices: buildTrueFalseChoices(correctAnswer, rng),
      },
    };
  }

  const equation = `${minuend} - ${subtrahend} = ${intermediate} + __`;

  return {
    problemKey: `${baseKey}:compensation:${minuend}-${subtrahend}=${intermediate}+${adjustment}`,
    questionText: questionTextForRepresentation("compensation", config),
    correctAnswer: String(adjustment),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(
        adjustment,
        [minuend, subtrahend, target, difference, intermediate],
        rng,
      ),
    },
  };
}

function makeDirectProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const equation = `${minuend} - ${subtrahend} = ?`;

  return {
    problemKey: `${baseKey}:direct:${minuend}-${subtrahend}`,
    questionText: questionTextForRepresentation("direct", config),
    correctAnswer: String(difference),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(difference, [minuend, subtrahend], rng),
    },
  };
}

function makeMissingSubtrahendProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const equation = `${minuend} - __ = ${difference}`;

  return {
    problemKey: `${baseKey}:missing_subtrahend:${minuend}-${subtrahend}=${difference}:hidden=${subtrahend}`,
    questionText: questionTextForRepresentation("missing_subtrahend", config),
    correctAnswer: String(subtrahend),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(subtrahend, [minuend, difference], rng),
    },
  };
}

function makeMissingMinuendProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const equation = `__ - ${subtrahend} = ${difference}`;

  return {
    problemKey: `${baseKey}:missing_minuend:${minuend}-${subtrahend}=${difference}:hidden=${minuend}`,
    questionText: questionTextForRepresentation("missing_minuend", config),
    correctAnswer: String(minuend),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(minuend, [subtrahend, difference], rng),
    },
  };
}

function makeMissingDifferenceProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const equation = `${minuend} - ${subtrahend} = __`;

  return {
    problemKey: `${baseKey}:missing_difference:${minuend}-${subtrahend}=${difference}:hidden=${difference}`,
    questionText: questionTextForRepresentation("missing_difference", config),
    correctAnswer: String(difference),
    visualType: "multiple_choice",
    visualData: {
      equation,
      choices: buildNumericChoices(difference, [minuend, subtrahend], rng),
    },
  };
}

const WORD_PROBLEM_TEMPLATES = [
  "There are {a} {noun}. {b} {noun} are taken away. How many {noun} are left?",
  "Maya has {a} {noun}. She gives {b} {noun} to her friend. How many {noun} does Maya have now?",
  "A box has {a} {noun}. {b} {noun} are removed. How many {noun} remain?",
];

const WORD_PROBLEM_NOUNS = ["apples", "books", "stickers", "marbles", "crayons", "pencils"];

function makeWordProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  _config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const template = rng.pick(WORD_PROBLEM_TEMPLATES);
  const noun = rng.pick(WORD_PROBLEM_NOUNS);
  const questionText = template
    .replaceAll("{a}", String(minuend))
    .replaceAll("{b}", String(subtrahend))
    .replaceAll("{noun}", noun);

  return {
    problemKey: `${baseKey}:word:${minuend}-${subtrahend}`,
    questionText,
    correctAnswer: String(difference),
    visualType: "multiple_choice",
    visualData: {
      equation: `${minuend} - ${subtrahend} = ?`,
      choices: buildNumericChoices(difference, [minuend, subtrahend], rng),
    },
  };
}

function makeMissingDigitProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const targets: Array<{ value: number; isDifference: boolean }> = [
    { value: minuend, isDifference: false },
    { value: subtrahend, isDifference: false },
    { value: difference, isDifference: true },
  ];
  const target = rng.pick(targets);

  const valueDigits = String(target.value).length;
  const position = rng.nextInt(0, valueDigits - 1);
  const hiddenDigit = getDigit(target.value, position);
  const displayValue = formatMissingDigitNumber(target.value, position);

  let equation: string;
  if (target.isDifference) {
    equation = `${minuend} - ${subtrahend} = ${displayValue}`;
  } else if (target.value === minuend) {
    equation = `${displayValue} - ${subtrahend} = ${difference}`;
  } else {
    equation = `${minuend} - ${displayValue} = ${difference}`;
  }

  return {
    problemKey: `${baseKey}:missing_digit:${minuend}-${subtrahend}=${difference}:op=${target.isDifference ? 2 : target.value === minuend ? 0 : 1}:pos=${position}:value=${hiddenDigit}`,
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
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const range = getEffectiveRange(config, mode);
  const isTrue = rng.next() < 0.5;
  let equation: string;
  let correctAnswer: "true" | "false";

  if (isTrue) {
    const minC = Math.max(range.min, difference + 1);
    const maxC = Math.min(range.max, 999);

    if (minC <= maxC) {
      const c = rng.nextInt(minC, maxC);
      const d = c - difference;

      if (d >= 1 && d <= 999) {
        equation = `${minuend} - ${subtrahend} = ${c} - ${d}`;
      } else {
        equation = `${minuend} - ${subtrahend} = ${minuend} - ${subtrahend}`;
      }
    } else {
      equation = `${minuend} - ${subtrahend} = ${minuend} - ${subtrahend}`;
    }
    correctAnswer = "true";
  } else {
    const minC = Math.max(range.min, difference + 1);
    const maxC = Math.min(range.max, 999);
    let c: number;
    let d: number;

    if (minC <= maxC) {
      c = rng.nextInt(minC, maxC);
      d = c - difference;
    } else {
      c = minuend;
      d = subtrahend;
    }

    const deltas = rng.shuffle([1, -1, 10, -10, 100, -100]);
    let falseD: number | undefined;

    for (const delta of deltas) {
      const forward = d + delta;
      if (forward >= 0 && forward <= 999 && forward !== d) {
        falseD = forward;
        break;
      }
      const backward = d - delta;
      if (backward >= 0 && backward <= 999 && backward !== d) {
        falseD = backward;
        break;
      }
    }

    if (falseD === undefined) {
      falseD = d === 0 ? d + 1 : d - 1;
    }

    equation = `${minuend} - ${subtrahend} = ${c} - ${falseD}`;
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

function makeErrorIdentificationProblem(
  minuend: number,
  subtrahend: number,
  difference: number,
  config: SubtractionFamilyConfig,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const isCorrect = rng.next() < 0.25;
  const claimedDifference = isCorrect
    ? difference
    : generateDistractorDifference(difference, minuend, subtrahend, rng);
  const errorType = determineErrorType(difference, claimedDifference, minuend, subtrahend);
  const correctJudgment: "yes" | "no" = isCorrect ? "yes" : "no";
  const correctReason = getReasonText(errorType);
  const equationToCheck = `${minuend} - ${subtrahend} = ${claimedDifference}`;

  return {
    problemKey: `${baseKey}:error:${minuend}-${subtrahend}=${claimedDifference}`,
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
          ? `Yes, ${minuend} - ${subtrahend} = ${difference}.`
          : `No, ${minuend} - ${subtrahend} = ${difference}, not ${claimedDifference}.`,
    },
  };
}

function generateProblem(
  config: SubtractionFamilyConfig,
  mode: "guided" | "independent" | "challenge" | undefined,
  rng: SeededRng,
  baseKey: string,
): Omit<PracticeProblem, "id"> {
  const representation = selectRepresentation(config, mode, rng);
  const [minuend, subtrahend] = generatePair(config, mode, rng);
  const difference = minuend - subtrahend;

  switch (representation) {
    case "direct":
      return makeDirectProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "number_line_jumps":
      return makeNumberLineJumpsProblem(
        minuend,
        subtrahend,
        difference,
        config,
        mode,
        rng,
        baseKey,
      );
    case "expanded_form":
      return makeExpandedFormProblem(minuend, subtrahend, difference, config, mode, rng, baseKey);
    case "compensation":
      return makeCompensationProblem(minuend, subtrahend, difference, config, mode, rng, baseKey);
    case "missing_subtrahend":
      return makeMissingSubtrahendProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "missing_minuend":
      return makeMissingMinuendProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "missing_difference":
      return makeMissingDifferenceProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "missing_digit":
      return makeMissingDigitProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "balanced_equation":
      return makeBalancedEquationProblem(
        minuend,
        subtrahend,
        difference,
        config,
        mode,
        rng,
        baseKey,
      );
    case "error_identification":
      return makeErrorIdentificationProblem(minuend, subtrahend, difference, config, rng, baseKey);
    case "word_problem":
      return makeWordProblem(minuend, subtrahend, difference, config, rng, baseKey);
    default:
      return makeDirectProblem(minuend, subtrahend, difference, config, rng, baseKey);
  }
}

function generateUniqueProblem(
  config: SubtractionFamilyConfig,
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
    `Could not generate a unique Subtraction problem for ${config.practiceType} within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
  );
}

export function generateSubtractionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = options?.lesson?.practice_type ?? "unknown";
  const config = subtractionFamilyConfigs[practiceType];

  if (!config) {
    throw new Error(`No Subtraction family configuration for practice type: ${practiceType}`);
  }

  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  const baseSeed = buildBaseSeed(options, practiceType, mode, lessonId);
  const baseKey = buildBaseKey(practiceType, mode, lessonId);
  const count = getTargetCount(options);

  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let i = 0; i < count; i += 1) {
    const problem = generateUniqueProblem(config, mode, baseSeed, baseKey, i, usedKeys);
    usedKeys.add(problem.problemKey);
    problems.push(problem);
  }

  return problems;
}
