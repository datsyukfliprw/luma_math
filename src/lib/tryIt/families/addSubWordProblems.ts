import type { TryItFamily, TryItFamilyContext } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  makeTryItProblem,
} from "../buildTryItProblem";

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

function buildCanonicalKey(practiceType: string, form: string, ...operands: number[]): string {
  return [practiceType, form, ...operands.map(String)].join(":");
}

type TwoStepForm = {
  key: string;
  prompt: (noun: string, a: number, b: number, c: number) => string;
  first: (a: number, b: number) => number;
  result: (a: number, b: number, c: number) => number;
};

const twoStepForms: TwoStepForm[] = [
  {
    key: "start_remove_add",
    prompt: (noun, a, b, c) =>
      `There are ${a} ${noun}. ${b} are taken away. Then ${c} more are added. How many ${noun} are there now?`,
    first: (a, b) => a - b,
    result: (a, b, c) => a - b + c,
  },
  {
    key: "start_add_remove",
    prompt: (noun, a, b, c) =>
      `There are ${a} ${noun}. ${b} more are added. Then ${c} are taken away. How many ${noun} are there now?`,
    first: (a, b) => a + b,
    result: (a, b, c) => a + b - c,
  },
  {
    key: "combine_remove",
    prompt: (noun, a, b, c) =>
      `There are ${a} ${noun} on one table and ${b} on another. ${c} are taken away. How many ${noun} are left?`,
    first: (a, b) => a + b,
    result: (a, b, c) => a + b - c,
  },
];

type MeasurementKind = "length" | "weight" | "volume";

type MeasurementContext = {
  singular: string;
  plural: string;
  unit: string;
  kind: MeasurementKind;
};

const measurementContexts: MeasurementContext[] = [
  { singular: "board", plural: "boards", unit: "feet", kind: "length" },
  { singular: "rope", plural: "ropes", unit: "inches", kind: "length" },
  { singular: "wire", plural: "wires", unit: "yards", kind: "length" },
  { singular: "string", plural: "strings", unit: "centimeters", kind: "length" },
  { singular: "ribbon", plural: "ribbons", unit: "meters", kind: "length" },
  { singular: "box", plural: "boxes", unit: "pounds", kind: "weight" },
  { singular: "bag", plural: "bags", unit: "ounces", kind: "weight" },
  { singular: "pumpkin", plural: "pumpkins", unit: "grams", kind: "weight" },
  { singular: "melon", plural: "melons", unit: "kilograms", kind: "weight" },
  { singular: "tank", plural: "tanks", unit: "gallons", kind: "volume" },
  { singular: "bottle", plural: "bottles", unit: "liters", kind: "volume" },
  { singular: "bucket", plural: "buckets", unit: "quarts", kind: "volume" },
  { singular: "jug", plural: "jugs", unit: "pints", kind: "volume" },
  { singular: "jar", plural: "jars", unit: "milliliters", kind: "volume" },
];

type MeasurementTwoStepForm = {
  key: string;
  build: (rng: TryItFamilyContext["rng"]) =>
    | {
        a: number;
        b: number;
        c: number;
        unit: string;
        singular: string;
        prompt: string;
        equation: string;
        result: number;
      }
    | undefined;
};

function addSubMeasurementPrompt(
  kind: MeasurementKind,
  singular: string,
  unit: string,
  a: number,
  b: number,
  c: number,
  removeFirst: boolean,
): string {
  const state =
    kind === "length"
      ? `A ${singular} is ${a} ${unit} long`
      : kind === "weight"
        ? `A ${singular} weighs ${a} ${unit}`
        : `A ${singular} holds ${a} ${unit}`;
  const first = removeFirst ? `${b} ${unit} are removed` : `${b} more ${unit} are added`;
  const second = removeFirst ? `${c} more ${unit} are added` : `${c} ${unit} are removed`;
  const question =
    kind === "length"
      ? `How many ${unit} long is the ${singular} now?`
      : kind === "weight"
        ? `How many ${unit} does the ${singular} weigh now?`
        : `How many ${unit} are in the ${singular} now?`;
  return `${state}. ${first}. Then ${second}. ${question}`;
}

function multMeasurementPrompt(
  kind: MeasurementKind,
  plural: string,
  unit: string,
  a: number,
  b: number,
  c: number,
  isSubtract: boolean,
): string {
  const start =
    kind === "length"
      ? `${a} ${plural} are ${b} ${unit} long each`
      : kind === "weight"
        ? `${a} ${plural} weigh ${b} ${unit} each`
        : `${a} ${plural} hold ${b} ${unit} each`;
  const change = isSubtract ? `${c} ${unit} are removed` : `${c} more ${unit} are added`;
  const question =
    kind === "length"
      ? `How many ${unit} long is the total now?`
      : kind === "weight"
        ? `How many ${unit} is the total?`
        : `How many ${unit} are there in all?`;
  return `${start}. Then ${change}. ${question}`;
}

function divMeasurementPrompt(
  kind: MeasurementKind,
  singular: string,
  unit: string,
  a: number,
  b: number,
  c: number,
  isSubtract: boolean,
): string {
  const start =
    kind === "length"
      ? `A ${singular} is ${a} ${unit} long. It is cut into ${b} equal parts`
      : kind === "weight"
        ? `A ${singular} weighs ${a} ${unit}. It is split into ${b} equal pieces`
        : `A ${singular} holds ${a} ${unit}. It is poured into ${b} equal containers`;
  const change = isSubtract
    ? `${c} ${unit} are removed from one part`
    : `${c} more ${unit} are added to one part`;
  const question =
    kind === "length"
      ? `How many ${unit} long is one part now?`
      : kind === "weight"
        ? `How many ${unit} does one part weigh now?`
        : `How many ${unit} are in one container now?`;
  return `${start}. Then ${change}. ${question}`;
}

const measurementTwoStepForms: MeasurementTwoStepForm[] = [
  {
    key: "add_then_subtract",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const a = rng.nextInt(2, 20);
      const b = rng.nextInt(2, 20);
      const c = rng.nextInt(2, a + b - 2);
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: addSubMeasurementPrompt(ctx.kind, ctx.singular, ctx.unit, a, b, c, false),
        equation: `${a} + ${b} - ${c} = n`,
        result: a + b - c,
      };
    },
  },
  {
    key: "subtract_then_add",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const a = rng.nextInt(5, 30);
      const b = rng.nextInt(2, a - 2);
      const c = rng.nextInt(2, 20);
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: addSubMeasurementPrompt(ctx.kind, ctx.singular, ctx.unit, a, b, c, true),
        equation: `${a} - ${b} + ${c} = n`,
        result: a - b + c,
      };
    },
  },
  {
    key: "multiply_then_add",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const a = rng.nextInt(2, 9);
      const b = rng.nextInt(2, 9);
      const product = a * b;
      const c = rng.nextInt(2, Math.min(20, 100 - product));
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: multMeasurementPrompt(ctx.kind, ctx.plural, ctx.unit, a, b, c, false),
        equation: `${a} × ${b} + ${c} = n`,
        result: product + c,
      };
    },
  },
  {
    key: "multiply_then_subtract",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const a = rng.nextInt(2, 9);
      const b = rng.nextInt(2, 9);
      const product = a * b;
      const c = rng.nextInt(2, Math.min(20, product - 2));
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: multMeasurementPrompt(ctx.kind, ctx.plural, ctx.unit, a, b, c, true),
        equation: `${a} × ${b} - ${c} = n`,
        result: product - c,
      };
    },
  },
  {
    key: "divide_then_add",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const b = rng.nextInt(2, 9);
      const quotient = rng.nextInt(2, Math.floor(100 / b));
      const a = quotient * b;
      const c = rng.nextInt(2, Math.min(20, 100 - quotient));
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: divMeasurementPrompt(ctx.kind, ctx.singular, ctx.unit, a, b, c, false),
        equation: `${a} ÷ ${b} + ${c} = n`,
        result: quotient + c,
      };
    },
  },
  {
    key: "divide_then_subtract",
    build(rng) {
      const ctx = rng.pick(measurementContexts);
      const b = rng.nextInt(2, 9);
      const quotient = rng.nextInt(4, Math.floor(100 / b));
      const a = quotient * b;
      const c = rng.nextInt(2, Math.min(20, quotient - 2));
      return {
        a,
        b,
        c,
        unit: ctx.unit,
        singular: ctx.singular,
        prompt: divMeasurementPrompt(ctx.kind, ctx.singular, ctx.unit, a, b, c, true),
        equation: `${a} ÷ ${b} - ${c} = n`,
        result: quotient - c,
      };
    },
  },
];

export const addSubWordProblemsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;
  const nouns = ["apples", "books", "stickers", "crayons", "marbles", "cookies", "toys", "pencils"];

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const a = ctx.rng.nextInt(2, 50);
    const b = ctx.rng.nextInt(2, 50);
    const noun = ctx.rng.pick(nouns);
    let prompt: string;
    let correct: string | number;
    let form: string;
    let key: string;
    let choices: string[] | undefined;

    if (ctx.practiceType === "choose_operation") {
      const isAdd = ctx.rng.nextInt(0, 1) === 1;
      const second = isAdd ? b : ctx.rng.nextInt(2, a);
      prompt = isAdd
        ? `Maya has ${a} ${noun} and finds ${second} more. Which operation finds the total?`
        : `Maya has ${a} ${noun} and gives away ${second}. Which operation finds how many are left?`;
      correct = isAdd ? "Addition" : "Subtraction";
      form = isAdd ? "add" : "subtract";
      const alternative = isAdd ? "Subtraction" : "Addition";
      const extra = ctx.rng.pick(["Multiplication", "Division"]);
      choices = ctx.rng.shuffle([correct, alternative, extra]);
      key = buildCanonicalKey(ctx.practiceType, form, a, second);
    } else if (ctx.practiceType === "one_step_word_problems") {
      const isAdd = ctx.rng.nextInt(0, 1) === 1;
      const second = isAdd ? b : ctx.rng.nextInt(2, a);
      const sum = a + second;
      const diff = a - second;
      prompt = isAdd
        ? `There are ${a} ${noun} on one table and ${second} on another. How many ${noun} are there in all?`
        : `There are ${a} ${noun}. ${second} are taken away. How many are left?`;
      correct = isAdd ? sum : diff;
      form = isAdd ? "add" : "subtract";
      choices = buildNumberChoices(correct, 0, correct + 20, ctx.rng);
      key = buildCanonicalKey(ctx.practiceType, form, a, second);
    } else if (ctx.practiceType === "estimate_then_solve") {
      const isAdd = ctx.rng.nextInt(0, 1) === 1;
      const first = ctx.rng.nextInt(5, 50);
      const second = isAdd ? ctx.rng.nextInt(5, 50) : ctx.rng.nextInt(2, first);
      if (!isAdd && roundToTen(second) >= roundToTen(first)) continue;
      const exact = isAdd ? first + second : first - second;
      const estimate = isAdd
        ? roundToTen(first) + roundToTen(second)
        : roundToTen(first) - roundToTen(second);
      prompt = isAdd
        ? `Estimate by rounding to the nearest ten, then find the exact answer. There are ${first} ${noun} on one table and ${second} on another. How many ${noun} are there in all?`
        : `Estimate by rounding to the nearest ten, then find the exact answer. There are ${first} ${noun}. ${second} are taken away. How many are left?`;
      form = isAdd ? "add" : "subtract";
      key = buildCanonicalKey(ctx.practiceType, form, first, second);
      const exactChoices = buildNumberChoices(exact, 0, exact + 20, ctx.rng);
      const estimateChoices = buildNumberChoices(estimate, 0, estimate + 20, ctx.rng);
      if (ctx.usedKeys.has(key)) continue;
      ctx.usedKeys.add(key);
      problems.push(
        makeTryItProblem({
          id: `${ctx.lessonId}-addsub-word-${problems.length + 1}`,
          problemKey: key,
          prompt,
          tip: ctx.lesson.objective,
          successMessage: `Yes! The answer is ${exact}.`,
          visualEmoji: "✏️",
          parts: [
            {
              key: "estimate",
              label: "Estimate",
              correctAnswer: String(estimate),
              choices: estimateChoices,
            },
            {
              key: "exact",
              label: "Exact answer",
              correctAnswer: String(exact),
              choices: exactChoices,
            },
          ],
        }),
      );
      continue;
    } else if (ctx.practiceType === "two_step_unknowns") {
      const formSpec = ctx.rng.pick(twoStepForms);
      let x: number;
      let y: number;
      let z: number;
      if (formSpec.key === "start_remove_add") {
        x = ctx.rng.nextInt(3, 50);
        y = ctx.rng.nextInt(2, x - 1);
        z = ctx.rng.nextInt(2, 50);
      } else if (formSpec.key === "start_add_remove") {
        x = ctx.rng.nextInt(2, 50);
        y = ctx.rng.nextInt(2, 50);
        z = ctx.rng.nextInt(2, x + y - 1);
      } else {
        x = ctx.rng.nextInt(2, 50);
        y = ctx.rng.nextInt(2, 50);
        z = ctx.rng.nextInt(2, x + y - 1);
      }
      const firstStep = formSpec.first(x, y);
      const result = formSpec.result(x, y, z);
      if (firstStep < 0 || result < 0) continue;
      prompt = formSpec.prompt(noun, x, y, z);
      correct = result;
      form = formSpec.key;
      choices = buildNumberChoices(result, 0, result + 20, ctx.rng);
      key = buildCanonicalKey(ctx.practiceType, form, x, y, z);
    } else if (ctx.practiceType === "two_step_measurement_equations") {
      const spec = ctx.rng.pick(measurementTwoStepForms);
      const generated = spec.build(ctx.rng);
      if (!generated) continue;
      const { a, b, c, unit, singular, prompt, equation, result } = generated;
      form = spec.key;
      key = [ctx.practiceType, form, singular, a, b, c, unit].join(":");
      if (ctx.usedKeys.has(key)) continue;
      ctx.usedKeys.add(key);
      const solution = `${result} ${unit}`;
      const maxChoice = Math.min(result + 20, 100);
      const solutionChoices = buildNumberChoices(result, 0, maxChoice, ctx.rng).map(
        (n) => `${n} ${unit}`,
      );
      problems.push(
        makeTryItProblem({
          id: `${ctx.lessonId}-measurement-${problems.length + 1}`,
          problemKey: key,
          prompt,
          tip: ctx.lesson.objective,
          successMessage: `Yes! ${equation} and ${solution}.`,
          visualEmoji: "✏️",
          parts: [
            { key: "equation", label: "Equation", correctAnswer: equation },
            {
              key: "solution",
              label: "Solution",
              correctAnswer: solution,
              choices: solutionChoices,
            },
          ],
        }),
      );
      continue;
    } else {
      const sum = a + b;
      prompt = `There are ${a} ${noun} on one table and ${b} on another. How many ${noun} are there in all?`;
      correct = sum;
      form = "add";
      choices = buildNumberChoices(sum, 0, a + b + 20, ctx.rng);
      key = buildCanonicalKey(ctx.practiceType, form, a, b);
    }

    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-addsub-word-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: String(correct),
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "✏️",
        choices,
      }),
    );
  }

  return problems;
};
