import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const ADD_SUB_WORD_PROBLEM_PRACTICE_TYPES = [
  "choose_operation",
  "estimate_then_solve",
  "one_step_word_problems",
  "two_step_unknowns",
  "two_step_measurement_equations",
] as const;

export type AddSubWordProblemPracticeType =
  (typeof ADD_SUB_WORD_PROBLEM_PRACTICE_TYPES)[number];

type AddSubOperation = "add" | "subtract";
type Rng = SeededRng;

const NOUNS = ["books", "stickers", "crayons", "marbles", "pencils", "tickets"] as const;
const MEASUREMENT_CONTEXTS = [
  { subject: "ribbon", plural: "ribbons", unit: "meters" },
  { subject: "rope", plural: "ropes", unit: "feet" },
  { subject: "box", plural: "boxes", unit: "pounds" },
  { subject: "bag", plural: "bags", unit: "ounces" },
  { subject: "jug", plural: "jugs", unit: "liters" },
  { subject: "jar", plural: "jars", unit: "milliliters" },
] as const;

type TwoStepForm =
  | "add_then_add"
  | "add_then_subtract"
  | "subtract_then_add"
  | "subtract_then_subtract";

type MeasurementForm =
  | "add_then_subtract"
  | "subtract_then_add"
  | "multiply_then_add"
  | "multiply_then_subtract"
  | "divide_then_add"
  | "divide_then_subtract";

type MeasurementState = {
  form: MeasurementForm;
  a: number;
  b: number;
  c: number;
  result: number;
  unit: string;
  subject: string;
  plural: string;
};

function getSeed(
  practiceType: AddSubWordProblemPracticeType,
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

function balancedSchedule<T>(values: readonly T[], count: number, rng: Rng): T[] {
  validateCount(count);
  if (values.length === 0) throw new Error("Cannot build a schedule from no values");
  const schedule = Array.from({ length: count }, (_, index) => values[index % values.length]);
  return rng.shuffle(schedule);
}

function roundToHundred(value: number): number {
  return Math.round(value / 100) * 100;
}

function numericChoices(correct: number, operands: readonly number[], rng: Rng): string[] {
  const candidates = new Set<number>();
  const add = (value: number) => {
    if (Number.isInteger(value) && value >= 0 && value <= 999 && value !== correct) {
      candidates.add(value);
    }
  };

  for (const offset of [1, -1, 2, -2, 10, -10, 20, -20, 100, -100]) {
    add(correct + offset);
  }
  for (const operand of operands) add(operand);

  let offset = 3;
  while (candidates.size < 3) {
    add(correct + offset);
    add(correct - offset);
    offset += 1;
  }

  return rng.shuffle([String(correct), ...rng.shuffle([...candidates]).slice(0, 3).map(String)]);
}

function stringChoices(correct: string, distractors: readonly string[], rng: Rng): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < 3) throw new Error("Word-problem generator needs three unique distractors");
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, 3)]);
}

function oneStepKey(
  practiceType: "choose_operation" | "estimate_then_solve" | "one_step_word_problems",
  operation: AddSubOperation,
  a: number,
  b: number,
  task: string,
): string {
  return `addsub:${practiceType}:op=${operation}:a=${a}:b=${b}:task=${task}`;
}

function twoStepKey(form: TwoStepForm, a: number, b: number, c: number): string {
  return `addsub:two-step:form=${form}:a=${a}:b=${b}:c=${c}:ask=result`;
}

function measurementKey(state: MeasurementState): string {
  return `measurement:two-step-equation:form=${state.form}:a=${state.a}:b=${state.b}:c=${state.c}:unit=${state.unit}:ask=equation-and-result`;
}

function buildUniqueProblems(
  count: number,
  maxAttempts: number,
  build: (index: number) => PracticeProblem,
): PracticeProblem[] {
  validateCount(count);
  const problems: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;

  while (problems.length < count && attempts < maxAttempts) {
    attempts += 1;
    const problem = build(problems.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    problems.push(problem);
  }

  if (problems.length < count) {
    throw new RangeError(`Could not generate ${count} unique word problems after ${maxAttempts} attempts`);
  }
  return problems;
}

function generateOneStepOperands(operation: AddSubOperation, rng: Rng): [number, number, number] {
  if (operation === "add") {
    const a = rng.nextInt(120, 650);
    const b = rng.nextInt(40, Math.min(300, 999 - a));
    return [a, b, a + b];
  }

  const a = rng.nextInt(180, 900);
  const b = rng.nextInt(30, a - 20);
  return [a, b, a - b];
}

export function generateChooseOperationProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "choose_operation" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const operations = balancedSchedule<AddSubOperation>(["add", "subtract"], count, rng);

  return buildUniqueProblems(count, 400, (index) => {
    const operation = operations[index];
    const [a, b, result] = generateOneStepOperands(operation, rng);
    const noun = rng.pick(NOUNS);
    const equation = operation === "add" ? `${a} + ${b} = ${result}` : `${a} - ${b} = ${result}`;
    const wrongOperationResult = operation === "add" ? Math.abs(a - b) : a + b;
    const wrongOperation = operation === "add"
      ? `${a} - ${b} = ${wrongOperationResult}`
      : `${a} + ${b} = ${wrongOperationResult}`;
    const arithmeticSlip = operation === "add"
      ? `${a} + ${b} = ${result + 10}`
      : `${a} - ${b} = ${Math.max(0, result - 10)}`;
    const secondArithmeticSlip = operation === "add"
      ? `${a} + ${b} = ${Math.max(0, result - 10)}`
      : `${a} - ${b} = ${result + 10}`;
    const questionText = operation === "add"
      ? `One shelf has ${a} ${noun} and another shelf has ${b}. Which equation chooses the correct operation and solves how many ${noun} there are altogether?`
      : `A collection has ${a} ${noun}. ${b} are given away. Which equation chooses the correct operation and solves how many ${noun} are left?`;

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: equation,
      visualType: "multiple_choice",
      problemKey: oneStepKey(practiceType, operation, a, b, "choose-and-solve"),
      visualData: {
        equation,
        choices: stringChoices(equation, [wrongOperation, arithmeticSlip, secondArithmeticSlip], rng),
      },
    };
  });
}

export function generateEstimateThenSolveProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "estimate_then_solve" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const operations = balancedSchedule<AddSubOperation>(["add", "subtract"], count, rng);

  return buildUniqueProblems(count, 500, (index) => {
    const operation = operations[index];
    let a: number;
    let b: number;
    let exact: number;

    if (operation === "add") {
      a = rng.nextInt(120, 650);
      b = rng.nextInt(80, Math.min(340, 999 - a));
      exact = a + b;
    } else {
      a = rng.nextInt(250, 900);
      b = rng.nextInt(80, a - 100);
      exact = a - b;
    }

    const roundedA = roundToHundred(a);
    const roundedB = roundToHundred(b);
    const estimate = operation === "add" ? roundedA + roundedB : roundedA - roundedB;
    const symbol = operation === "add" ? "+" : "-";
    const correct = `Estimate ${estimate}; exact ${exact}`;
    const estimateOff = Math.max(0, estimate + (rng.nextInt(0, 1) === 0 ? 100 : -100));
    const wrongExact = operation === "add" ? Math.abs(a - b) : a + b;
    const questionText = `Round ${a} and ${b} to the nearest hundred to estimate ${a} ${symbol} ${b}, then solve exactly. Which estimate-and-exact pair is correct?`;

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: oneStepKey(practiceType, operation, a, b, "estimate-hundreds-and-solve"),
      visualData: {
        equation: `${a} ${symbol} ${b} = ${exact}`,
        equations: [`${roundedA} ${symbol} ${roundedB} = ${estimate}`, `${a} ${symbol} ${b} = ${exact}`],
        choices: stringChoices(
          correct,
          [
            `Estimate ${estimateOff}; exact ${exact}`,
            `Estimate ${estimate}; exact ${wrongExact}`,
            `Estimate ${Math.max(0, estimateOff)}; exact ${wrongExact}`,
            `Estimate ${estimate}; exact ${Math.max(0, exact + 10)}`,
            `Estimate ${Math.max(0, estimate + 100)}; exact ${Math.max(0, exact - 10)}`,
          ],
          rng,
        ),
      },
    };
  });
}

export function generateOneStepWordProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "one_step_word_problems" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const operations = balancedSchedule<AddSubOperation>(["add", "subtract"], count, rng);

  return buildUniqueProblems(count, 400, (index) => {
    const operation = operations[index];
    const [a, b, result] = generateOneStepOperands(operation, rng);
    const noun = rng.pick(NOUNS);
    const symbol = operation === "add" ? "+" : "-";
    const questionText = operation === "add"
      ? `There are ${a} ${noun} in one place and ${b} in another. How many ${noun} are there in all?`
      : `There are ${a} ${noun}. ${b} are taken away. How many ${noun} are left?`;

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: String(result),
      visualType: "multiple_choice",
      problemKey: oneStepKey(practiceType, operation, a, b, "solve"),
      visualData: {
        equation: `${a} ${symbol} ${b} = ?`,
        choices: numericChoices(result, [a, b], rng),
      },
    };
  });
}

function makeTwoStepState(form: TwoStepForm, rng: Rng): { a: number; b: number; c: number; result: number } {
  if (form === "add_then_add") {
    const a = rng.nextInt(20, 250);
    const b = rng.nextInt(10, 180);
    const c = rng.nextInt(10, Math.min(180, 999 - a - b));
    return { a, b, c, result: a + b + c };
  }
  if (form === "add_then_subtract") {
    const a = rng.nextInt(30, 300);
    const b = rng.nextInt(20, 200);
    const c = rng.nextInt(10, a + b - 1);
    return { a, b, c, result: a + b - c };
  }
  if (form === "subtract_then_add") {
    const a = rng.nextInt(80, 500);
    const b = rng.nextInt(10, a - 20);
    const c = rng.nextInt(10, Math.min(250, 999 - (a - b)));
    return { a, b, c, result: a - b + c };
  }

  const a = rng.nextInt(100, 600);
  const b = rng.nextInt(10, a - 40);
  const first = a - b;
  const c = rng.nextInt(10, first - 1);
  return { a, b, c, result: first - c };
}

function twoStepEquation(form: TwoStepForm, a: number, b: number, c: number): string {
  if (form === "add_then_add") return `${a} + ${b} + ${c} = ?`;
  if (form === "add_then_subtract") return `${a} + ${b} - ${c} = ?`;
  if (form === "subtract_then_add") return `${a} - ${b} + ${c} = ?`;
  return `${a} - ${b} - ${c} = ?`;
}

export function generateTwoStepUnknownProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "two_step_unknowns" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const forms = balancedSchedule<TwoStepForm>(
    ["add_then_add", "add_then_subtract", "subtract_then_add", "subtract_then_subtract"],
    count,
    rng,
  );

  return buildUniqueProblems(count, 500, (index) => {
    const form = forms[index];
    const { a, b, c, result } = makeTwoStepState(form, rng);
    const noun = rng.pick(NOUNS);
    let questionText: string;
    if (form === "add_then_add") {
      questionText = `There are ${a} ${noun}. ${b} more arrive, then ${c} more arrive. How many are there now?`;
    } else if (form === "add_then_subtract") {
      questionText = `There are ${a} ${noun}. ${b} more arrive, then ${c} are taken away. How many are there now?`;
    } else if (form === "subtract_then_add") {
      questionText = `There are ${a} ${noun}. ${b} are taken away, then ${c} more arrive. How many are there now?`;
    } else {
      questionText = `There are ${a} ${noun}. ${b} are taken away, then another ${c} are taken away. How many are left?`;
    }

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText,
      correctAnswer: String(result),
      visualType: "multiple_choice",
      problemKey: twoStepKey(form, a, b, c),
      visualData: {
        equation: twoStepEquation(form, a, b, c),
        choices: numericChoices(result, [a, b, c], rng),
      },
    };
  });
}

function makeMeasurementState(form: MeasurementForm, rng: Rng): MeasurementState {
  const context = rng.pick(MEASUREMENT_CONTEXTS);

  if (form === "add_then_subtract") {
    const a = rng.nextInt(8, 60);
    const b = rng.nextInt(3, 30);
    const c = rng.nextInt(2, a + b - 1);
    return { form, a, b, c, result: a + b - c, ...context };
  }
  if (form === "subtract_then_add") {
    const a = rng.nextInt(12, 70);
    const b = rng.nextInt(2, a - 2);
    const c = rng.nextInt(2, 30);
    return { form, a, b, c, result: a - b + c, ...context };
  }
  if (form === "multiply_then_add") {
    const a = rng.nextInt(2, 9);
    const b = rng.nextInt(2, 9);
    const c = rng.nextInt(2, 25);
    return { form, a, b, c, result: a * b + c, ...context };
  }
  if (form === "multiply_then_subtract") {
    const a = rng.nextInt(2, 9);
    const b = rng.nextInt(2, 9);
    const c = rng.nextInt(2, a * b - 1);
    return { form, a, b, c, result: a * b - c, ...context };
  }
  if (form === "divide_then_add") {
    const b = rng.nextInt(2, 9);
    const quotient = rng.nextInt(3, 12);
    const a = b * quotient;
    const c = rng.nextInt(2, 20);
    return { form, a, b, c, result: quotient + c, ...context };
  }

  const b = rng.nextInt(2, 9);
  const quotient = rng.nextInt(4, 12);
  const a = b * quotient;
  const c = rng.nextInt(2, quotient - 1);
  return { form, a, b, c, result: quotient - c, ...context };
}

function measurementEquation(state: MeasurementState): string {
  const { form, a, b, c } = state;
  if (form === "add_then_subtract") return `n = ${a} + ${b} - ${c}`;
  if (form === "subtract_then_add") return `n = ${a} - ${b} + ${c}`;
  if (form === "multiply_then_add") return `n = ${a} × ${b} + ${c}`;
  if (form === "multiply_then_subtract") return `n = ${a} × ${b} - ${c}`;
  if (form === "divide_then_add") return `n = ${a} ÷ ${b} + ${c}`;
  return `n = ${a} ÷ ${b} - ${c}`;
}

function measurementPrompt(state: MeasurementState): string {
  const { form, a, b, c, unit, subject, plural } = state;
  if (form === "add_then_subtract") {
    return `A ${subject} measures ${a} ${unit}. ${b} ${unit} are added, then ${c} ${unit} are removed. Which equation and solution give its final measurement?`;
  }
  if (form === "subtract_then_add") {
    return `A ${subject} measures ${a} ${unit}. ${b} ${unit} are removed, then ${c} ${unit} are added. Which equation and solution give its final measurement?`;
  }
  if (form === "multiply_then_add") {
    return `${a} ${plural} each measure ${b} ${unit}. Another ${c} ${unit} are added to the combined amount. Which equation and solution give the total?`;
  }
  if (form === "multiply_then_subtract") {
    return `${a} ${plural} each measure ${b} ${unit}. Then ${c} ${unit} are removed from the combined amount. Which equation and solution give what remains?`;
  }
  if (form === "divide_then_add") {
    return `A ${subject} measuring ${a} ${unit} is split into ${b} equal parts. Then ${c} ${unit} are added to one part. Which equation and solution give that part's final measurement?`;
  }
  return `A ${subject} measuring ${a} ${unit} is split into ${b} equal parts. Then ${c} ${unit} are removed from one part. Which equation and solution give that part's final measurement?`;
}

export function generateTwoStepMeasurementEquationProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = "two_step_measurement_equations" as const;
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const forms = balancedSchedule<MeasurementForm>(
    [
      "add_then_subtract",
      "subtract_then_add",
      "multiply_then_add",
      "multiply_then_subtract",
      "divide_then_add",
      "divide_then_subtract",
    ],
    count,
    rng,
  );

  return buildUniqueProblems(count, 600, (index) => {
    const state = makeMeasurementState(forms[index], rng);
    const equation = measurementEquation(state);
    const correct = `${equation}; n = ${state.result} ${state.unit}`;
    const wrongResult = state.result + (rng.nextInt(0, 1) === 0 ? 1 : 10);
    const swappedEquation = equation
      .replace(" + ", " TEMP ")
      .replace(" - ", " + ")
      .replace(" TEMP ", " - ");
    const wrongOperationEquation = equation.includes("×")
      ? equation.replace("×", "+")
      : equation.includes("÷")
        ? equation.replace("÷", "-")
        : swappedEquation;

    return {
      id: `${practiceType}-${mode}-${index + 1}`,
      questionText: measurementPrompt(state),
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: measurementKey(state),
      visualData: {
        equation,
        choices: stringChoices(
          correct,
          [
            `${equation}; n = ${wrongResult} ${state.unit}`,
            `${wrongOperationEquation}; n = ${state.result} ${state.unit}`,
            `${wrongOperationEquation}; n = ${wrongResult} ${state.unit}`,
          ],
          rng,
        ),
      },
    };
  });
}
