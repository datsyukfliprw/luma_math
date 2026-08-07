import type { Lesson } from "../../data/curriculum";
import type { QuickCheck, QuickCheckQuestion, QuickCheckVisual } from "./schema";
import { createSeededRng, type SeededRng } from "../../practiceTypes/random";
import { normalizeNumericAnswer } from "../answerValidation";

export type QuickCheckGeneratorOptions = {
  seed?: string;
};

const MASCOT_PATTERNS = /\b(luma|spark|charge|boost|energy)\b/gi;

function hasMascotLanguage(value: string): boolean {
  return MASCOT_PATTERNS.test(value);
}

function removeMascotLanguage(value: string): string {
  return value.replace(MASCOT_PATTERNS, "").replace(/\s+/g, " ").trim();
}

function ensureNeutral(value: string): string {
  return hasMascotLanguage(value) ? removeMascotLanguage(value) : value;
}

function buildQuickCheckSeed(lesson: Lesson): string {
  return `quickcheck:${lesson.lesson_id ?? lesson.lesson_title}`;
}

export function generateQuickCheckForLesson(
  lesson: Lesson,
  options?: QuickCheckGeneratorOptions,
): QuickCheck | undefined {
  if (lesson.lesson_type !== "lesson") return undefined;
  if (!lesson.warmup || !lesson.learn || !lesson.try_it) return undefined;

  // Optional authored override stored directly on the curriculum lesson.
  if (lesson.quick_check) return lesson.quick_check;

  const seed = options?.seed ?? buildQuickCheckSeed(lesson);
  const rng = createSeededRng(seed);

  const direct = buildDirectQuestion(lesson, rng);
  const conceptual = buildConceptualQuestion(lesson, rng);
  const reasoning = buildReasoningQuestion(lesson, rng);

  return {
    title: "Quick Check",
    subtitle: `Comprehension check for ${ensureNeutral(lesson.lesson_title)}`,
    passingScore: 3,
    questions: [direct, conceptual, reasoning],
  };
}

function buildQuestionId(lesson: Lesson, role: string): string {
  const base = lesson.lesson_id ?? lesson.lesson_title;
  return `${base}-qc-${role}`;
}

function baseFeedback(hint: string, success: string, explanation?: string) {
  return {
    hint: ensureNeutral(hint),
    success: ensureNeutral(success),
    explanation: explanation ? ensureNeutral(explanation) : undefined,
  };
}

function extractNumbers(input: string): number[] {
  const digitsOnly = input.replace(/[,]/g, "").match(/\d+/g);
  if (!digitsOnly) return [];
  return digitsOnly.map(Number).filter((n) => Number.isFinite(n));
}

function parseFractions(input: string): Array<{ numerator: number; denominator: number }> {
  const matches = input.match(/(\d+)\s*\/\s*(\d+)/g);
  if (!matches) return [];
  return matches.map((m) => {
    const [num, den] = m.split("/").map((s) => Number(s.trim()));
    return { numerator: num, denominator: den };
  });
}

function parseClockTime(value: string): { hour: number; minute: number } | undefined {
  const cleaned = value.replace(/\s/g, "");
  const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 12 || minute >= 60) return undefined;
  return { hour, minute };
}

const PLACE_NAMES = [
  "ones",
  "tens",
  "hundreds",
  "thousands",
  "ten_thousands",
  "hundred_thousands",
] as const;

type PlaceName = (typeof PLACE_NAMES)[number];

function getPlaceName(digitCount: number, indexFromLeft: number): PlaceName {
  const placeIndex = digitCount - indexFromLeft - 1;
  return PLACE_NAMES[placeIndex] ?? "ones";
}

function getPlaceValue(number: string, indexFromLeft: number): number {
  const digits = number.replace(/,/g, "");
  const digit = Number(digits[indexFromLeft]);
  if (Number.isNaN(digit)) return 0;
  const placeIndex = digits.length - indexFromLeft - 1;
  return digit * 10 ** placeIndex;
}

function getDigitAt(number: string, indexFromLeft: number): string | undefined {
  const digits = number.replace(/,/g, "");
  return digits[indexFromLeft];
}

function shuffleChoices<T>(choices: T[], correct: T, rng: SeededRng): T[] {
  const unique = [...new Set([...choices, correct])];
  const shuffled = rng.shuffle(unique);
  return shuffled;
}

function buildNumericDistractors(correct: number, rng: SeededRng, count = 2): number[] {
  const distractors = new Set<number>();

  const addDistractor = (n: number) => {
    if (Number.isFinite(n) && n >= 0 && n !== correct && n <= Math.max(correct * 5, 30)) {
      distractors.add(n);
    }
  };

  const candidates = [
    correct + 1,
    correct - 1,
    correct + 10,
    correct - 10,
    correct + 100,
    correct - 100,
    correct * 2,
    Math.floor(correct / 2),
    Math.abs(correct),
    Number(String(correct).split("").reverse().join("")),
  ];

  for (const n of candidates) addDistractor(n);

  const result = rng.shuffle([...distractors]);
  return result.slice(0, count);
}

function buildChoicesForAnswer(
  correct: string,
  rng: SeededRng,
  extras: string[] = [],
  answerType: "numeric" | "text" = "numeric",
): string[] {
  const numeric = normalizeNumericAnswer(correct);
  const value = Number(numeric);

  if (answerType === "numeric" && !Number.isNaN(value)) {
    const distractorValues = buildNumericDistractors(value, rng, 2);
    return shuffleChoices(distractorValues.map(String), correct, rng).slice(0, 4);
  }

  const all = [correct, ...extras].filter((c) => c !== correct);
  const selected = rng.shuffle(all).slice(0, 2);
  return shuffleChoices(selected, correct, rng).slice(0, 4);
}

function buildVisualFromExample(lesson: Lesson): QuickCheckVisual | undefined {
  const example = lesson.learn?.example;
  if (!example) return undefined;

  const { visual_type, groups, items_per_group, equation, prompt } = example;

  if ((visual_type === "groups" || visual_type === "strip") && groups > 0 && items_per_group >= 0) {
    return { type: "equal_groups", groups, itemsPerGroup: items_per_group };
  }

  if (visual_type === "array" && groups > 0 && items_per_group > 0) {
    return { type: "array", rows: groups, columns: items_per_group };
  }

  if (visual_type === "number_line") {
    const numbers =
      extractNumbers(equation).length > 0 ? extractNumbers(equation) : extractNumbers(prompt);
    const product = numbers[numbers.length - 1] ?? 0;
    const jumpSize =
      items_per_group > 0 ? items_per_group : product > 0 && groups > 0 ? product / groups : 1;
    const jumps = groups > 0 ? Array.from({ length: groups }, () => jumpSize) : undefined;
    return { type: "number_line", start: 0, end: product, jumps, mark: product };
  }

  if (
    visual_type === "place_value_chart" ||
    visual_type === "place_value" ||
    visual_type === "number_words" ||
    visual_type === "expanded_form"
  ) {
    const numbers = extractNumbers(prompt);
    const number = numbers.length > 0 ? String(numbers[0]) : "";
    const targetIndex = 0;
    const highlightedPlace = getPlaceName(number.length, targetIndex);
    return { type: "place_value_chart", number, highlightedPlace };
  }

  if (visual_type === "base_ten_blocks") {
    const numbers = extractNumbers(prompt);
    const value = numbers[0] ?? 0;
    const thousands = Math.floor(value / 1000) % 10;
    const hundreds = Math.floor(value / 100) % 10;
    const tens = Math.floor(value / 10) % 10;
    const ones = value % 10;
    return { type: "base_ten_blocks", thousands, hundreds, tens, ones };
  }

  if (visual_type === "clock" || visual_type === "time") {
    const timeFromEquation = parseClockTime(equation);
    const timeFromPrompt = extractNumbers(prompt);
    if (timeFromEquation) {
      return { type: "clock", hour: timeFromEquation.hour, minute: timeFromEquation.minute };
    }
    if (timeFromPrompt.length >= 2) {
      const [hour, minute] = timeFromPrompt;
      if (hour <= 12 && minute < 60) {
        return { type: "clock", hour, minute };
      }
    }
  }

  if (visual_type === "shape" || visual_type === "grid") {
    return {
      type: "shape",
      kind: groups === 3 ? "triangle" : groups === 4 ? "quadrilateral" : "quadrilateral",
    };
  }

  if (
    visual_type === "fraction_bar" ||
    visual_type === "fraction_strip" ||
    visual_type === "area_model"
  ) {
    const fractions =
      parseFractions(equation).length > 0 ? parseFractions(equation) : parseFractions(prompt);
    if (fractions.length > 0) {
      return {
        type: "fraction_bar",
        numerator: fractions[0].numerator,
        denominator: fractions[0].denominator,
      };
    }
  }

  if (visual_type === "line_plot") {
    const numbers = extractNumbers(prompt);
    const values = numbers.length > 0 ? numbers : [0];
    return { type: "line_plot", values, scale: 1 };
  }

  if (visual_type === "graph" || visual_type === "bar_model") {
    const numbers = extractNumbers(prompt);
    const categories = numbers.slice(0, 4).map((value, index) => ({
      label: String.fromCharCode(65 + index),
      value,
    }));
    return { type: "bar_graph", categories };
  }

  return undefined;
}

function buildDirectQuestion(lesson: Lesson, rng: SeededRng): QuickCheckQuestion {
  if (!lesson.warmup) {
    throw new Error("Cannot build direct Quick Check question without warmup data");
  }

  const warmupQuestion = lesson.warmup.questions[0];

  if (
    warmupQuestion.question_type === "target_digit_value" &&
    warmupQuestion.number !== undefined &&
    warmupQuestion.target_digit_index !== undefined
  ) {
    const number = warmupQuestion.number;
    const index = warmupQuestion.target_digit_index;
    const digit = getDigitAt(number, index) ?? "";
    const place = getPlaceName(number.length, index);
    const value = getPlaceValue(number, index);

    const prompt = ensureNeutral(`What is the value of the ${place} digit in ${number}?`);
    const correct = String(value);
    const distractors = [
      String(digit),
      String(value * 10),
      String(value / 10),
      String(value * 100),
    ].filter((d) => d !== correct && Number.isFinite(Number(d)));
    const choices = shuffleChoices(rng.shuffle(distractors).slice(0, 2), correct, rng).slice(0, 4);

    return {
      id: buildQuestionId(lesson, "direct"),
      role: "direct",
      prompt,
      interaction: {
        type: "multiple_choice",
        choices: choices.map((c) => ({ label: c, value: c })),
        correctAnswer: correct,
      },
      visual: {
        type: "place_value_chart",
        number,
        highlightedPlace: place,
      },
      feedback: baseFeedback(
        warmupQuestion.hint,
        `Great! The ${place} digit in ${number} is worth ${correct}.`,
      ),
      topicTag: warmupQuestion.skill,
      skill: warmupQuestion.skill,
    };
  }

  const prompt = ensureNeutral(warmupQuestion.prompt);
  const correct = warmupQuestion.correct_answer;
  const answerType: "numeric" | "text" = /^\d+$/.test(normalizeNumericAnswer(correct))
    ? "numeric"
    : "text";

  const extraChoices = lesson.warmup.questions
    .slice(1)
    .map((q) => q.correct_answer)
    .filter(Boolean);

  const choices = buildChoicesForAnswer(correct, rng, extraChoices, answerType);

  return {
    id: buildQuestionId(lesson, "direct"),
    role: "direct",
    prompt,
    interaction: {
      type: "multiple_choice",
      choices: choices.map((c) => ({ label: c, value: c })),
      correctAnswer: correct,
    },
    visual: buildVisualFromExample(lesson),
    feedback: baseFeedback(warmupQuestion.hint, `Nice work! ${correct} is correct.`),
    topicTag: warmupQuestion.skill,
    skill: warmupQuestion.skill,
  };
}

function makeFalseEquation(equation: string, rng: SeededRng): string {
  const numbers = extractNumbers(equation);

  if (numbers.length === 0) {
    // Place-value sentences may not contain raw numbers; try replacing place words.
    return equation
      .replace(/hundreds/g, "tens")
      .replace(/thousands/g, "hundreds")
      .replace(/tens/g, "ones");
  }

  const targetIndex = rng.nextInt(0, numbers.length - 1);
  const target = numbers[targetIndex];
  const falseValue = buildNumericDistractors(target, rng, 1)[0] ?? target + 1;

  // Replace only the first occurrence of the target number to keep it deterministic-ish.
  const asString = String(target);
  const falseString = String(falseValue);
  const regex = new RegExp(`\\b${asString}\\b`);
  return equation.replace(regex, falseString);
}

function buildConceptualQuestion(lesson: Lesson, rng: SeededRng): QuickCheckQuestion {
  if (!lesson.learn || !lesson.try_it) {
    throw new Error("Cannot build conceptual Quick Check question without learn and try_it data");
  }

  const example = lesson.learn.example;
  const tryIt = lesson.try_it;

  // Prefer the example equation as the canonical representation.
  const correctEquation = example.equation;
  const falseEquations: string[] = [];

  for (let i = 0; i < 6 && falseEquations.length < 3; i += 1) {
    const candidate = makeFalseEquation(correctEquation, rng);
    if (candidate !== correctEquation && !falseEquations.includes(candidate)) {
      falseEquations.push(candidate);
    }
  }

  const prompt = ensureNeutral(`Which statement matches what we learned?`);
  const choices = shuffleChoices(falseEquations, correctEquation, rng).slice(0, 4);

  const visual = buildVisualFromExample(lesson);

  return {
    id: buildQuestionId(lesson, "conceptual"),
    role: "conceptual",
    prompt,
    stem: ensureNeutral(example.prompt),
    interaction: {
      type: "multiple_choice",
      choices: choices.map((c) => ({ label: c, value: c })),
      correctAnswer: correctEquation,
    },
    visual,
    feedback: baseFeedback(
      tryIt.hint,
      `Yes! ${correctEquation} is the right way to think about it.`,
    ),
    topicTag: example.visual_type,
    skill: lesson.practice_type,
  };
}

function generateDistractor(correct: string, rng: SeededRng): string {
  const numeric = normalizeNumericAnswer(correct);
  const value = Number(numeric);

  if (!Number.isNaN(value)) {
    const distractor = buildNumericDistractors(value, rng, 1)[0];
    if (distractor !== undefined) return String(distractor);
    return String(value + 1);
  }

  const numbers = extractNumbers(correct);
  if (numbers.length > 0) {
    const targetIndex = rng.nextInt(0, numbers.length - 1);
    const target = numbers[targetIndex];
    const falseValue = buildNumericDistractors(target, rng, 1)[0] ?? target + 1;
    const newText = correct.replace(new RegExp(`\\b${target}\\b`), String(falseValue));
    if (newText !== correct) return newText;
  }

  return rng.pick(["0", "1", "none", "all", "always"]);
}

function makeFalseTryItStatement(
  tryIt: NonNullable<Lesson["try_it"]>,
  rng: SeededRng,
): { statement: string; correct: "yes" | "no" } {
  const prompt = ensureNeutral(tryIt.prompt);
  const correctAnswer = tryIt.correct_answer;

  let falseAnswer = generateDistractor(correctAnswer, rng);
  let attempt = 1;
  while (falseAnswer === correctAnswer && attempt < 10) {
    falseAnswer = generateDistractor(correctAnswer, rng);
    attempt += 1;
  }

  return {
    statement: `A student answered "${prompt}" with "${falseAnswer}".`,
    correct: "no",
  };
}

function buildReasoningQuestion(lesson: Lesson, rng: SeededRng): QuickCheckQuestion {
  if (!lesson.try_it) {
    throw new Error("Cannot build reasoning Quick Check question without try_it data");
  }

  const tryIt = lesson.try_it;
  const { statement, correct } = makeFalseTryItStatement(tryIt, rng);

  const correctAnswer = tryIt.correct_answer;
  const feedback =
    correct === "no"
      ? baseFeedback(
          tryIt.hint,
          `Not quite. The correct answer is "${correctAnswer}", not the student's answer.`,
        )
      : baseFeedback(tryIt.hint, `Yes, that is the correct answer.`);

  return {
    id: buildQuestionId(lesson, "reasoning"),
    role: "reasoning",
    prompt: "Is the student's answer correct?",
    stem: statement,
    interaction: {
      type: "mistake_detection",
      statement,
      correctAnswer: correct,
    },
    feedback,
    topicTag: lesson.practice_type,
    skill: lesson.practice_type,
  };
}
