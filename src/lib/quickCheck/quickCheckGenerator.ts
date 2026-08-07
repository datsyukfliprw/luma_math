import type { Lesson } from "../../data/curriculum";
import type {
  QuickCheck,
  QuickCheckFeedback,
  QuickCheckInteraction,
  QuickCheckQuestion,
  QuickCheckVisual,
} from "./schema";
import { createSeededRng, type SeededRng } from "../../practiceTypes/random";
import { normalizeNumericAnswer } from "../answerValidation";

export type QuickCheckGeneratorOptions = {
  seed?: string;
};

// Detection pattern: no global flag so `test` does not carry state.
const MASCOT_PATTERN = /\b(luma|spark|charge|boost|energy)\b/i;
// Replacement pattern: global so all occurrences are removed.
const MASCOT_PATTERN_GLOBAL = /\b(luma|spark|charge|boost|energy)\b/gi;

function hasMascotLanguage(value: string): boolean {
  return MASCOT_PATTERN.test(value);
}

function removeMascotLanguage(value: string): string {
  return value.replace(MASCOT_PATTERN_GLOBAL, "").replace(/\s+/g, " ").trim();
}

function ensureNeutral(value: string): string {
  return hasMascotLanguage(value) ? removeMascotLanguage(value) : value;
}

function neutralizeFeedback(feedback: QuickCheckFeedback): QuickCheckFeedback {
  return {
    hint: ensureNeutral(feedback.hint),
    success: ensureNeutral(feedback.success),
    explanation: feedback.explanation ? ensureNeutral(feedback.explanation) : undefined,
  };
}

function neutralizeInteraction(interaction: QuickCheckInteraction): QuickCheckInteraction {
  switch (interaction.type) {
    case "multiple_choice":
      return {
        ...interaction,
        choices: interaction.choices.map((c) => ({
          label: ensureNeutral(c.label),
          value: ensureNeutral(c.value),
        })),
      };
    case "text_entry":
      return {
        ...interaction,
        correctAnswer: ensureNeutral(interaction.correctAnswer),
        placeholder: interaction.placeholder ? ensureNeutral(interaction.placeholder) : undefined,
      };
    case "true_false":
      return interaction;
    case "mistake_detection":
      return {
        ...interaction,
        statement: ensureNeutral(interaction.statement),
        reasonChoices: interaction.reasonChoices?.map(ensureNeutral),
        correctReason: interaction.correctReason
          ? ensureNeutral(interaction.correctReason)
          : undefined,
      };
    default:
      return interaction;
  }
}

function neutralizeQuestion(question: QuickCheckQuestion): QuickCheckQuestion {
  return {
    ...question,
    prompt: ensureNeutral(question.prompt),
    stem: question.stem ? ensureNeutral(question.stem) : undefined,
    interaction: neutralizeInteraction(question.interaction),
    feedback: neutralizeFeedback(question.feedback),
    topicTag: question.topicTag ? ensureNeutral(question.topicTag) : undefined,
    skill: question.skill ? ensureNeutral(question.skill) : undefined,
  };
}

function neutralizeQuickCheck(quickCheck: QuickCheck): QuickCheck {
  return {
    ...quickCheck,
    title: ensureNeutral(quickCheck.title),
    subtitle: ensureNeutral(quickCheck.subtitle),
    questions: quickCheck.questions.map(neutralizeQuestion),
  };
}

function buildQuickCheckSeed(lesson: Lesson): string {
  return `quickcheck:${lesson.lesson_id ?? lesson.lesson_title}`;
}

export function generateQuickCheckForLesson(
  lesson: Lesson,
  options?: QuickCheckGeneratorOptions,
): QuickCheck | undefined {
  if (lesson.lesson_type !== "lesson") return undefined;

  // Authored curriculum Quick Check takes precedence and does not need
  // generator fallback sources.
  if (lesson.quick_check) return neutralizeQuickCheck(lesson.quick_check);

  if (!lesson.warmup || !lesson.learn || !lesson.try_it) return undefined;

  const seed = options?.seed ?? buildQuickCheckSeed(lesson);
  const rng = createSeededRng(seed);

  const direct = buildDirectQuestion(lesson, rng);
  const conceptual = buildConceptualQuestion(lesson, rng);
  const reasoning = buildReasoningQuestion(lesson, rng);

  return neutralizeQuickCheck({
    title: "Quick Check",
    subtitle: `Comprehension check for ${ensureNeutral(lesson.lesson_title)}`,
    passingScore: 3,
    questions: [direct, conceptual, reasoning],
  });
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
  const digitsOnly = input.replace(/[,\s]/g, "").match(/\d+/g);
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

function buildNumericDistractors(correct: number, rng: SeededRng, count = 3): number[] {
  const distractors = new Set<number>();

  const add = (n: number) => {
    if (
      Number.isFinite(n) &&
      n >= 0 &&
      n !== correct &&
      n <= 999 &&
      n <= Math.max(correct * 5, 30)
    ) {
      distractors.add(n);
    }
  };

  const candidates = [
    correct + 1,
    Math.max(0, correct - 1),
    correct + 10,
    Math.max(0, correct - 10),
    correct + 100,
    Math.max(0, correct - 100),
    correct * 2,
    Math.floor(correct / 2),
    Math.abs(correct),
    Number(String(correct).split("").reverse().join("")),
    correct + 2,
    correct + 5,
    correct + 20,
    Math.max(0, correct - 2),
    Math.max(0, correct - 5),
  ];

  for (const n of candidates) add(n);

  // Guaranteed fallback: adjacent whole numbers.
  let delta = 1;
  while (distractors.size < count && correct + delta <= 999) {
    add(correct + delta);
    delta += 1;
  }
  delta = 1;
  while (distractors.size < count && correct - delta >= 0) {
    add(correct - delta);
    delta += 1;
  }

  const result = rng.shuffle([...distractors]);
  return result.slice(0, count);
}

function isBooleanLike(
  value: string,
): { type: "true_false"; answer: "true" | "false" } | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes" || normalized === "true") return { type: "true_false", answer: "true" };
  if (normalized === "no" || normalized === "false") return { type: "true_false", answer: "false" };
  return undefined;
}

function buildFractionDistractors(
  numerator: number,
  denominator: number,
  rng: SeededRng,
  count = 3,
): string[] {
  const correctValue = numerator / denominator;
  const distractors: string[] = [];

  const candidates: Array<{ n: number; d: number }> = [
    { n: numerator + 1, d: denominator },
    { n: Math.max(0, numerator - 1), d: denominator },
    { n: numerator, d: denominator + 1 },
    { n: numerator, d: Math.max(1, denominator - 1) },
    { n: numerator + 2, d: denominator },
    { n: denominator, d: numerator },
  ];

  for (const { n, d } of candidates) {
    if (d === 0) continue;
    if (n === numerator && d === denominator) continue;
    if (n / d === correctValue) continue;
    if (distractors.some((existing) => existing === `${n}/${d}`)) continue;
    distractors.push(`${n}/${d}`);
  }

  return rng.shuffle(distractors).slice(0, count);
}

// Antonym / opposite map used to generate plausible distractors.
// Keys are lowercased. Replacements should be short, math-neutral phrases.
const ANTONYM_MAP: Record<string, string[]> = {
  big: ["small"],
  small: ["big"],
  bigger: ["smaller"],
  smaller: ["bigger"],
  larger: ["smaller"],
  more: ["less", "fewer"],
  less: ["more"],
  inside: ["outside", "around", "on"],
  outside: ["inside"],
  same: ["different", "opposite"],
  different: ["same"],
  equal: ["unequal", "different"],
  unequal: ["equal", "same"],
  shaded: ["unshaded", "white"],
  unshaded: ["shaded"],
  point: ["line", "place"],
  line: ["point"],
  feet: ["inches", "yards"],
  yards: ["inches", "feet"],
  inches: ["feet", "yards"],
  yard: ["inches", "feet"],
  foot: ["inches", "yards"],
  add: ["subtract"],
  subtract: ["add"],
  multiply: ["add", "divide"],
  divide: ["multiply"],
  true: ["false"],
  false: ["true"],
  yes: ["no"],
  no: ["yes"],
  always: ["sometimes", "never"],
  never: ["always", "sometimes"],
  all: ["some", "none"],
  none: ["all", "some"],
  parallel: ["not parallel", "crossing"],
  parallelogram: ["rectangle", "trapezoid", "quadrilateral"],
  quadrilateral: ["triangle", "rectangle", "parallelogram"],
  triangle: ["rectangle", "square", "quadrilateral"],
  pentagon: ["hexagon", "quadrilateral"],
  hexagon: ["pentagon", "octagon"],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceWord(text: string, word: string, replacement: string): string | undefined {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
  if (!regex.test(text)) return undefined;
  return text.replace(regex, replacement);
}

function applyMutations(
  source: string,
  mutations: Array<{ word: string; replacement: string }>,
): string {
  let result = source;
  for (const { word, replacement } of mutations) {
    const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "i");
    result = result.replace(regex, replacement);
  }
  return result;
}

function buildWordMutations(
  source: string,
  replacementMap: Map<string, string[]>,
  rng: SeededRng,
  maxMutations = 2,
): string[] {
  const words = [...source.matchAll(/\b[\w']+\b/g)].map((m) => m[0]);
  const availableMutations: Array<{ word: string; replacement: string }> = [];

  for (const word of words) {
    const lower = word.toLowerCase();
    const replacements = replacementMap.get(lower);
    if (!replacements) continue;
    for (const replacement of replacements) {
      availableMutations.push({ word, replacement });
    }
  }

  if (availableMutations.length === 0) return [];

  const results: string[] = [];

  // Single mutations.
  for (const mutation of availableMutations) {
    const mutated = replaceWord(source, mutation.word, mutation.replacement);
    if (mutated && mutated.toLowerCase() !== source.toLowerCase()) {
      results.push(mutated);
    }
  }

  // Multi-mutations (distinct words, distinct positions).
  if (maxMutations >= 2) {
    for (let i = 0; i < availableMutations.length; i += 1) {
      for (let j = i + 1; j < availableMutations.length; j += 1) {
        const a = availableMutations[i];
        const b = availableMutations[j];
        if (a.word.toLowerCase() === b.word.toLowerCase()) continue;

        const ordered =
          source.toLowerCase().indexOf(a.word.toLowerCase()) <=
          source.toLowerCase().indexOf(b.word.toLowerCase())
            ? [a, b]
            : [b, a];

        const mutated = applyMutations(source, ordered);
        if (mutated.toLowerCase() !== source.toLowerCase()) {
          results.push(mutated);
        }
      }
    }
  }

  return rng.shuffle(results);
}

function distinctWords(value: string): string[] {
  const words = value.toLowerCase().match(/\b[\w']+\b/g) ?? [];
  return [...new Set(words)].sort();
}

function isRedundantConceptualDistractor(candidate: string, correct: string): boolean {
  const candidateWords = distinctWords(candidate);
  const correctWords = distinctWords(correct);

  // Reject a distractor whose set of words is the same as the correct answer
  // (e.g. a simple reorder like "feet or yards" for "Yards or feet").
  if (
    candidateWords.length === correctWords.length &&
    candidateWords.every((w, i) => w === correctWords[i])
  ) {
    return true;
  }

  return false;
}

function buildAnswerChoices(
  correct: string,
  lesson: Lesson,
  rng: SeededRng,
):
  | { type: "multiple_choice"; choices: string[] }
  | { type: "true_false"; correctAnswer: "true" | "false" } {
  const normalized = normalizeNumericAnswer(correct);

  const booleanCheck = isBooleanLike(correct);
  if (booleanCheck) {
    return { type: "true_false", correctAnswer: booleanCheck.answer };
  }

  const fractions = parseFractions(correct);
  if (fractions.length > 0) {
    const { numerator, denominator } = fractions[0];
    const fractionDistractors = buildFractionDistractors(numerator, denominator, rng, 3);
    if (fractionDistractors.length >= 2) {
      const choices = shuffleChoices(fractionDistractors, correct, rng).slice(0, 4);
      return { type: "multiple_choice", choices };
    }
  }

  const value = Number(normalized);
  let distractors: string[];

  if (!Number.isNaN(value)) {
    distractors = buildNumericDistractors(value, rng, 3).map(String);
  } else {
    const antonymMap = new Map<string, string[]>(Object.entries(ANTONYM_MAP));
    const ordered: string[] = [];
    const seen = new Set<string>([correct.toLowerCase()]);

    const add = (value: string | undefined) => {
      if (!value) return;
      const lower = value.toLowerCase();
      if (seen.has(lower)) return;
      seen.add(lower);
      ordered.push(value);
    };

    // 1. Word-level antonym / opposite mutations.
    for (const m of buildWordMutations(correct, antonymMap, rng)) add(m);

    // 2. Other lesson answers.
    for (const q of lesson.warmup?.questions.slice(1) ?? []) add(q.correct_answer);
    if (lesson.try_it?.correct_answer) add(lesson.try_it.correct_answer);

    // 3. Generic antonym words as a last resort.
    if (ordered.length < 3) {
      for (const alts of Object.values(ANTONYM_MAP)) {
        for (const alt of alts) {
          if (ordered.length >= 3) break;
          add(alt);
        }
      }
    }

    distractors = rng.shuffle(ordered.slice(0, 3));
  }

  // Ensure at least 3 distinct numeric or text distractors exist.
  if (distractors.length < 3) {
    const padding = buildNumericDistractors(0, rng, 3 - distractors.length).map(String);
    distractors = [...distractors, ...padding];
  }

  const choices = shuffleChoices(distractors, correct, rng).slice(0, 4);
  return { type: "multiple_choice", choices };
}

function buildNumberPattern(value: number): RegExp {
  const digits = String(value);
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  const pattern = groups.map(escapeRegex).join(",?\\s*");
  return new RegExp(`\\b${pattern}\\b`, "i");
}

function makeFalseEquation(equation: string, rng: SeededRng): string {
  const numbers = extractNumbers(equation);

  if (numbers.length === 0) {
    // Place-value sentences may not contain raw numbers; try replacing place words.
    return equation
      .replace(/\bhundreds\b/gi, "tens")
      .replace(/\bthousands\b/gi, "hundreds")
      .replace(/\btens\b/gi, "ones");
  }

  const targetIndex = rng.nextInt(0, numbers.length - 1);
  const target = numbers[targetIndex];
  const falseValue = buildNumericDistractors(target, rng, 1)[0] ?? target + 1;

  const regex = buildNumberPattern(target);
  return equation.replace(regex, String(falseValue));
}

function buildConceptualFalseChoices(
  lesson: Lesson,
  correctEquation: string,
  rng: SeededRng,
): string[] {
  const seen = new Set<string>();
  const ordered: string[] = [];
  const lowerCorrect = correctEquation.toLowerCase();

  const add = (value: string | undefined) => {
    if (!value) return;
    const trimmed = value.trim();
    const lower = trimmed.toLowerCase();
    if (!trimmed || lower === lowerCorrect) return;
    if (isRedundantConceptualDistractor(trimmed, correctEquation)) return;
    if (seen.has(trimmed)) return;
    seen.add(trimmed);
    ordered.push(trimmed);
  };

  // 1. Numeric mutations of the example equation.
  for (let i = 0; i < 6; i += 1) {
    add(makeFalseEquation(correctEquation, rng));
  }

  // 2. Antonym / opposite word mutations (most plausible first).
  const antonymMap = new Map<string, string[]>(Object.entries(ANTONYM_MAP));
  const mutations = buildWordMutations(correctEquation, antonymMap, rng);
  for (const m of mutations) add(m);

  // 3. Lesson-sourced distractors: try it and warmup answers, and vocabulary.
  const lessonSources: string[] = [];
  if (lesson.try_it?.correct_answer) lessonSources.push(lesson.try_it.correct_answer);
  for (const q of lesson.warmup?.questions ?? []) {
    if (q.correct_answer) lessonSources.push(q.correct_answer);
  }
  for (const v of lesson.learn?.vocabulary ?? []) lessonSources.push(v);

  for (const source of rng.shuffle(lessonSources)) {
    if (source.toLowerCase() === lowerCorrect) continue;
    add(source);
  }

  // 4. Final, safe fallback: simple mathematical contradictions.
  if (ordered.length < 3) {
    add(`It is not ${correctEquation}.`);
    add(`The statement "${correctEquation}" is wrong.`);
    add(`None of the above.`);
  }

  return rng.shuffle(ordered.slice(0, 3));
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

    let distractors = [
      String(digit),
      String(value * 10),
      String(value / 10),
      String(value * 100),
      String(Math.floor(value / 100)),
    ].filter((d) => d !== correct && Number.isFinite(Number(d)));

    if (distractors.length < 3) {
      const extra = buildNumericDistractors(value, rng, 3 - distractors.length).map(String);
      distractors = [...distractors, ...extra];
    }

    const choices = shuffleChoices(rng.shuffle(distractors).slice(0, 3), correct, rng).slice(0, 4);

    return {
      id: buildQuestionId(lesson, "direct"),
      role: "direct",
      prompt,
      interaction: {
        type: "multiple_choice",
        choices: choices.map((c) => ({ label: c, value: c })),
        correctAnswer: correct,
      },
      visual: { type: "place_value_chart", number, highlightedPlace: place },
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
  const choiceResult = buildAnswerChoices(correct, lesson, rng);

  return {
    id: buildQuestionId(lesson, "direct"),
    role: "direct",
    prompt,
    interaction:
      choiceResult.type === "true_false"
        ? { type: "true_false", correctAnswer: choiceResult.correctAnswer }
        : {
            type: "multiple_choice",
            choices: choiceResult.choices.map((c) => ({ label: c, value: c })),
            correctAnswer: correct,
          },
    visual: buildVisualFromExample(lesson),
    feedback: baseFeedback(warmupQuestion.hint, `Nice work! ${correct} is correct.`),
    topicTag: warmupQuestion.skill,
    skill: warmupQuestion.skill,
  };
}

function buildConceptualQuestion(lesson: Lesson, rng: SeededRng): QuickCheckQuestion {
  if (!lesson.learn || !lesson.try_it) {
    throw new Error("Cannot build conceptual Quick Check question without learn and try_it data");
  }

  const example = lesson.learn.example;
  const tryIt = lesson.try_it;

  // Prefer the example equation as the canonical representation.
  const correctEquation = example.equation;
  const falseEquations = buildConceptualFalseChoices(lesson, correctEquation, rng);

  const prompt = ensureNeutral(`Which statement matches what we learned?`);
  const choices = shuffleChoices(falseEquations, correctEquation, rng);

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

  const fractions = parseFractions(correct);
  if (fractions.length > 0) {
    const { numerator, denominator } = fractions[0];
    const distractors = buildFractionDistractors(numerator, denominator, rng, 3);
    if (distractors.length > 0) return rng.pick(distractors);
  }

  const numbers = extractNumbers(correct);
  if (numbers.length > 0) {
    const targetIndex = rng.nextInt(0, numbers.length - 1);
    const target = numbers[targetIndex];
    const falseValue = buildNumericDistractors(target, rng, 1)[0] ?? target + 1;
    const regex = buildNumberPattern(target);
    const newText = correct.replace(regex, String(falseValue));
    if (newText !== correct) return newText;
  }

  const antonymMap = new Map<string, string[]>(Object.entries(ANTONYM_MAP));
  const mutations = buildWordMutations(correct, antonymMap, rng);
  if (mutations.length > 0) return mutations[0];

  return rng.pick(["0", "1", "none", "all", "always"]);
}

function makeFalseTryItStatement(
  tryIt: NonNullable<Lesson["try_it"]>,
  rng: SeededRng,
): { statement: string; correct: "yes" | "no"; falseAnswer: string } {
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
    falseAnswer,
  };
}

function buildReasoningQuestion(lesson: Lesson, rng: SeededRng): QuickCheckQuestion {
  if (!lesson.try_it) {
    throw new Error("Cannot build reasoning Quick Check question without try_it data");
  }

  const tryIt = lesson.try_it;
  const { statement, correct, falseAnswer } = makeFalseTryItStatement(tryIt, rng);

  const correctAnswer = tryIt.correct_answer;
  const successText =
    correct === "no"
      ? `Great! You correctly noticed the mistake.`
      : `That is right. The student's answer matches the correct answer.`;

  const explanationText =
    correct === "no"
      ? `The example student answered "${falseAnswer}", but the correct answer is "${correctAnswer}".`
      : `The example student's answer "${falseAnswer}" was correct.`;

  const feedback = baseFeedback(tryIt.hint, successText, explanationText);

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
