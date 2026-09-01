import { enumerateDivisionFacts, type DivisionFact } from "../lib/division/core";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const MULT_DIV_WORD_PROBLEM_PRACTICE_TYPES = [
  "equal_group_array_problems",
  "strip_models",
  "equations_with_unknowns",
  "two_step_mult_div_patterns",
] as const;

export type MultDivWordProblemPracticeType =
  (typeof MULT_DIV_WORD_PROBLEM_PRACTICE_TYPES)[number];

type Rng = SeededRng;
type EqualGroupTask =
  | "groups-multiply"
  | "groups-divide-sharing"
  | "array-multiply"
  | "array-divide-dimension";
type StripTask = "find-total" | "find-part-size" | "find-part-count";
type UnknownEquationTask =
  | "multiply-missing-factor"
  | "division-missing-dividend"
  | "division-missing-divisor"
  | "division-missing-quotient";
type TwoStepTask =
  | "multiply-then-add"
  | "multiply-then-subtract"
  | "multiply-then-divide"
  | "divide-then-multiply";
type PatternTask = "double" | "add-factor";

const OBJECTS = ["crayons", "stickers", "books", "markers", "tiles", "counters"] as const;

function getSeed(
  practiceType: MultDivWordProblemPracticeType,
  options: PracticeGenerationOptions | undefined,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;
  const lessonCount = options?.lesson?.practice_block?.question_count;
  if (typeof lessonCount === "number" && lessonCount > 0) return lessonCount;
  return getPracticeProblemCount(options);
}

function validateCount(count: number): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
}

function numericChoices(correct: number, operands: readonly number[], rng: Rng): string[] {
  const distractors = new Set<number>();
  const add = (value: number) => {
    if (Number.isInteger(value) && value >= 0 && value <= 999 && value !== correct) {
      distractors.add(value);
    }
  };

  for (const offset of [1, -1, 2, -2, 5, -5, 10, -10, 20, -20]) add(correct + offset);
  for (const operand of operands) add(operand);
  let offset = 3;
  while (distractors.size < 3) {
    add(correct + offset);
    add(correct - offset);
    offset += 1;
  }

  return rng.shuffle([String(correct), ...rng.shuffle([...distractors]).slice(0, 3).map(String)]);
}

function stringChoices(correct: string, distractors: readonly string[], rng: Rng): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < 3) throw new Error("Mult/div word-problem generator needs three unique distractors");
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, 3)]);
}

function selectBalanced<T>(buckets: readonly T[][], count: number, rng: Rng): T[] {
  validateCount(count);
  const shuffled = buckets.map((bucket) => rng.shuffle(bucket));
  const total = shuffled.reduce((sum, bucket) => sum + bucket.length, 0);
  if (count > total) throw new RangeError("Requested count exceeds balanced state space");

  const order = rng.shuffle(shuffled.map((_, index) => index));
  const offsets = shuffled.map(() => 0);
  const selected: T[] = [];
  while (selected.length < count) {
    let added = false;
    for (const bucketIndex of order) {
      const candidate = shuffled[bucketIndex][offsets[bucketIndex]];
      if (candidate === undefined) continue;
      selected.push(candidate);
      offsets[bucketIndex] += 1;
      added = true;
      if (selected.length >= count) break;
    }
    if (!added) break;
  }
  return selected;
}

function equalGroupKey(task: EqualGroupTask, fact: DivisionFact): string {
  return `multdiv:application:task=${task}:a=${fact.divisor}:b=${fact.quotient}:total=${fact.dividend}`;
}

export function generateEqualGroupArrayProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "equal_group_array_problems" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const facts = enumerateDivisionFacts();
  const tasks: readonly EqualGroupTask[] = [
    "groups-multiply",
    "groups-divide-sharing",
    "array-multiply",
    "array-divide-dimension",
  ];
  const buckets = tasks.map((task) => facts.map((fact) => ({ task, fact })));
  const selected = selectBalanced(buckets, count, rng);

  return selected.map(({ task, fact }, index) => {
    const item = rng.pick(OBJECTS);
    let questionText: string;
    let correct: number;
    let equation: string;

    if (task === "groups-multiply") {
      questionText = `There are ${fact.divisor} equal groups with ${fact.quotient} ${item} in each group. How many ${item} are there altogether?`;
      correct = fact.dividend;
      equation = `${fact.divisor} × ${fact.quotient} = ?`;
    } else if (task === "groups-divide-sharing") {
      questionText = `${fact.dividend} ${item} are shared equally among ${fact.divisor} groups. How many ${item} are in each group?`;
      correct = fact.quotient;
      equation = `${fact.dividend} ÷ ${fact.divisor} = ?`;
    } else if (task === "array-multiply") {
      questionText = `An array has ${fact.divisor} rows and ${fact.quotient} columns. How many ${item} are in the array?`;
      correct = fact.dividend;
      equation = `${fact.divisor} × ${fact.quotient} = ?`;
    } else {
      questionText = `An array has ${fact.dividend} ${item} arranged in ${fact.divisor} equal rows. How many columns does it have?`;
      correct = fact.quotient;
      equation = `${fact.dividend} ÷ ${fact.divisor} = ?`;
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: String(correct),
      visualType: "multiple_choice",
      problemKey: equalGroupKey(task, fact),
      visualData: {
        groups: fact.divisor,
        itemsPerGroup: fact.quotient,
        rows: fact.divisor,
        columns: fact.quotient,
        product: fact.dividend,
        equation,
        choices: numericChoices(correct, [fact.divisor, fact.quotient, fact.dividend], rng),
      },
    };
  });
}

function stripKey(task: StripTask, fact: DivisionFact): string {
  return `multdiv:strip:parts=${fact.divisor}:size=${fact.quotient}:total=${fact.dividend}:ask=${task}`;
}

export function generateStripModelProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "strip_models" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const facts = enumerateDivisionFacts();
  const tasks: readonly StripTask[] = ["find-total", "find-part-size", "find-part-count"];
  const selected = selectBalanced(
    tasks.map((task) => facts.map((fact) => ({ task, fact }))),
    count,
    rng,
  );

  return selected.map(({ task, fact }, index) => {
    let questionText: string;
    let correct: number;
    let equation: string;
    if (task === "find-total") {
      questionText = `A strip model has ${fact.divisor} equal parts. Each part is labeled ${fact.quotient}. What is the total represented by the whole strip?`;
      correct = fact.dividend;
      equation = `${fact.divisor} × ${fact.quotient} = ?`;
    } else if (task === "find-part-size") {
      questionText = `A whole strip represents ${fact.dividend} and is divided into ${fact.divisor} equal parts. What value belongs in each part?`;
      correct = fact.quotient;
      equation = `${fact.dividend} ÷ ${fact.divisor} = ?`;
    } else {
      questionText = `A whole strip represents ${fact.dividend}. Each equal part is labeled ${fact.quotient}. How many equal parts are in the strip?`;
      correct = fact.divisor;
      equation = `${fact.dividend} ÷ ${fact.quotient} = ?`;
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: String(correct),
      visualType: "multiple_choice",
      problemKey: stripKey(task, fact),
      visualData: {
        groups: fact.divisor,
        itemsPerGroup: fact.quotient,
        product: fact.dividend,
        equation,
        sourceRepresentation: "strip_model",
        sourceDescription: questionText,
        choices: numericChoices(correct, [fact.divisor, fact.quotient, fact.dividend], rng),
      },
    };
  });
}

function unknownKey(task: UnknownEquationTask, fact: DivisionFact): string {
  return `multdiv:unknown-equation:task=${task}:a=${fact.divisor}:b=${fact.quotient}:product=${fact.dividend}`;
}

export function generateEquationsWithUnknownsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "equations_with_unknowns" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const facts = enumerateDivisionFacts();
  const tasks: readonly UnknownEquationTask[] = [
    "multiply-missing-factor",
    "division-missing-dividend",
    "division-missing-divisor",
    "division-missing-quotient",
  ];
  const selected = selectBalanced(
    tasks.map((task) => facts.map((fact) => ({ task, fact }))),
    count,
    rng,
  );

  return selected.map(({ task, fact }, index) => {
    const item = rng.pick(OBJECTS);
    let questionText: string;
    let equation: string;
    let solution: number;

    if (task === "multiply-missing-factor") {
      questionText = `${fact.divisor} equal groups contain ${fact.dividend} ${item} altogether. Which equation with n and solution find how many ${item} are in each group?`;
      equation = `${fact.divisor} × n = ${fact.dividend}`;
      solution = fact.quotient;
    } else if (task === "division-missing-dividend") {
      questionText = `A number of ${item} is shared among ${fact.divisor} groups, with ${fact.quotient} in each group. Which equation with n and solution find the starting total?`;
      equation = `n ÷ ${fact.divisor} = ${fact.quotient}`;
      solution = fact.dividend;
    } else if (task === "division-missing-divisor") {
      questionText = `${fact.dividend} ${item} are split into equal groups with ${fact.quotient} in each. Which equation with n and solution find the number of groups?`;
      equation = `${fact.dividend} ÷ n = ${fact.quotient}`;
      solution = fact.divisor;
    } else {
      questionText = `${fact.dividend} ${item} are shared equally among ${fact.divisor} groups. Which equation with n and solution find how many are in each group?`;
      equation = `${fact.dividend} ÷ ${fact.divisor} = n`;
      solution = fact.quotient;
    }

    const correct = `${equation}; n = ${solution}`;
    const wrongSolution = solution + 1;
    const inverseEquation = `${fact.divisor} × ${fact.quotient} = n`;

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: unknownKey(task, fact),
      visualData: {
        equation,
        factors: [fact.divisor, fact.quotient],
        product: fact.dividend,
        choices: stringChoices(
          correct,
          [
            `${equation}; n = ${wrongSolution}`,
            `${inverseEquation}; n = ${solution}`,
            `${inverseEquation}; n = ${fact.dividend}`,
            `${fact.dividend} ÷ ${fact.quotient} = n; n = ${fact.divisor}`,
            `${fact.quotient} × n = ${fact.dividend}; n = ${fact.divisor}`,
          ],
          rng,
        ),
      },
    };
  });
}

function twoStepKey(task: TwoStepTask, a: number, b: number, c: number): string {
  return `multdiv:two-step:task=${task}:a=${a}:b=${b}:c=${c}:ask=result`;
}

function patternKey(task: PatternTask, a: number, b: number): string {
  return `multdiv:pattern:task=${task}:a=${a}:b=${b}:ask=next`;
}

type TwoStepCandidate = {
  kind: "two-step";
  task: TwoStepTask;
  a: number;
  b: number;
  c: number;
  result: number;
  equation: string;
};

type PatternCandidate = {
  kind: "pattern";
  task: PatternTask;
  a: number;
  b: number;
  sequence: number[];
  result: number;
};

function makeTwoStepCandidate(rng: Rng): TwoStepCandidate {
  const task: TwoStepTask = rng.pick([
    "multiply-then-add",
    "multiply-then-subtract",
    "multiply-then-divide",
    "divide-then-multiply",
  ] as const);

  if (task === "multiply-then-add") {
    const a = rng.nextInt(2, 9);
    const b = rng.nextInt(2, 9);
    const c = rng.nextInt(2, 20);
    return { kind: "two-step", task, a, b, c, result: a * b + c, equation: `${a} × ${b} + ${c} = ?` };
  }
  if (task === "multiply-then-subtract") {
    const a = rng.nextInt(2, 9);
    const b = rng.nextInt(2, 9);
    const c = rng.nextInt(2, a * b - 1);
    return { kind: "two-step", task, a, b, c, result: a * b - c, equation: `${a} × ${b} - ${c} = ?` };
  }
  if (task === "multiply-then-divide") {
    const a = rng.nextInt(2, 9);
    const b = rng.nextInt(2, 9);
    const product = a * b;
    const divisors = [a, b].filter((value, index, values) => values.indexOf(value) === index);
    const c = rng.pick(divisors);
    return { kind: "two-step", task, a, b, c, result: product / c, equation: `(${a} × ${b}) ÷ ${c} = ?` };
  }

  const b = rng.nextInt(2, 9);
  const quotient = rng.nextInt(2, 9);
  const a = b * quotient;
  const c = rng.nextInt(2, 6);
  return { kind: "two-step", task, a, b, c, result: quotient * c, equation: `(${a} ÷ ${b}) × ${c} = ?` };
}

function makePatternCandidate(rng: Rng): PatternCandidate {
  const task: PatternTask = rng.nextInt(0, 1) === 0 ? "double" : "add-factor";
  if (task === "double") {
    const a = rng.nextInt(2, 8);
    const sequence = [a, a * 2, a * 4, a * 8];
    return { kind: "pattern", task, a, b: 2, sequence, result: a * 8 };
  }

  const factor = rng.nextInt(2, 9);
  const startMultiplier = rng.nextInt(1, 4);
  const sequence = [1, 2, 3, 4].map((offset) => factor * (startMultiplier + offset - 1));
  return { kind: "pattern", task, a: factor, b: startMultiplier, sequence, result: sequence[3] };
}

function selectTwoStepAndPatternCandidates(count: number, rng: Rng): Array<TwoStepCandidate | PatternCandidate> {
  validateCount(count);
  const selected: Array<TwoStepCandidate | PatternCandidate> = [];
  const keys = new Set<string>();
  let attempts = 0;
  const targetPatternCount = count >= 4 ? Math.max(1, Math.floor(count / 3)) : count >= 2 ? 1 : 0;
  const targetTwoStepCount = count - targetPatternCount;
  let patternCount = 0;
  let twoStepCount = 0;

  while (selected.length < count && attempts < 1000) {
    attempts += 1;
    const needPattern = patternCount < targetPatternCount;
    const needTwoStep = twoStepCount < targetTwoStepCount;
    const candidate = needPattern && (!needTwoStep || rng.nextInt(0, 2) === 0)
      ? makePatternCandidate(rng)
      : makeTwoStepCandidate(rng);
    const key = candidate.kind === "pattern"
      ? patternKey(candidate.task, candidate.a, candidate.b)
      : twoStepKey(candidate.task, candidate.a, candidate.b, candidate.c);
    if (keys.has(key)) continue;
    keys.add(key);
    selected.push(candidate);
    if (candidate.kind === "pattern") patternCount += 1;
    else twoStepCount += 1;
  }

  if (selected.length < count) throw new RangeError("Could not generate enough two-step/pattern problems");
  return rng.shuffle(selected);
}

export function generateTwoStepMultDivPatternProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "two_step_mult_div_patterns" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const selected = selectTwoStepAndPatternCandidates(count, rng);

  return selected.map((candidate, index) => {
    if (candidate.kind === "pattern") {
      const shown = candidate.sequence.slice(0, 3);
      const questionText = candidate.task === "double"
        ? `Look at the pattern ${shown.join(", ")}, ?. Each number doubles. What number comes next?`
        : `Look at the multiplication pattern ${shown.join(", ")}, ?. The same factor, ${candidate.a}, is added each time. What number comes next?`;
      return {
        id: `${practiceType}-${mode}-${index + 1}`,
        questionText,
        correctAnswer: String(candidate.result),
        visualType: "multiple_choice",
        problemKey: patternKey(candidate.task, candidate.a, candidate.b),
        visualData: {
          equation: `${shown.join(", ")}, ?`,
          choices: numericChoices(candidate.result, shown, rng),
        },
      };
    }

    const item = rng.pick(OBJECTS);
    let questionText: string;
    if (candidate.task === "multiply-then-add") {
      questionText = `There are ${candidate.a} groups of ${candidate.b} ${item}. Then ${candidate.c} more ${item} are added. How many are there now?`;
    } else if (candidate.task === "multiply-then-subtract") {
      questionText = `There are ${candidate.a} groups of ${candidate.b} ${item}. Then ${candidate.c} ${item} are used. How many remain?`;
    } else if (candidate.task === "multiply-then-divide") {
      questionText = `There are ${candidate.a} groups of ${candidate.b} ${item}. All of them are then shared equally among ${candidate.c} groups. How many are in each new group?`;
    } else {
      questionText = `${candidate.a} ${item} are put into groups of ${candidate.b}. Each resulting group earns ${candidate.c} points. How many points are earned altogether?`;
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: String(candidate.result),
      visualType: "multiple_choice",
      problemKey: twoStepKey(candidate.task, candidate.a, candidate.b, candidate.c),
      visualData: {
        equation: candidate.equation,
        choices: numericChoices(candidate.result, [candidate.a, candidate.b, candidate.c], rng),
      },
    };
  });
}
