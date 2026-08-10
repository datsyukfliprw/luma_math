import type { SeededRng } from "../../../practiceTypes/random";
import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  makeTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

const LENGTH_UNITS = ["inches", "feet", "yards"];

const WEIGHT_MASS_UNITS = ["ounces", "pounds", "grams", "kilograms"];
const VOLUME_UNITS = ["cups", "pints", "quarts", "gallons", "liters", "milliliters"];

type LengthScenario = {
  object: string;
  unit: "inches" | "feet" | "yards";
  estimate: number;
};

const LENGTH_SCENARIOS: LengthScenario[] = [
  { object: "pencil", unit: "inches", estimate: 6 },
  { object: "crayon", unit: "inches", estimate: 4 },
  { object: "book", unit: "inches", estimate: 8 },
  { object: "marker", unit: "inches", estimate: 5 },
  { object: "paper clip", unit: "inches", estimate: 1 },
  { object: "phone", unit: "inches", estimate: 6 },
  { object: "ruler", unit: "inches", estimate: 12 },
  { object: "door", unit: "feet", estimate: 7 },
  { object: "desk", unit: "feet", estimate: 3 },
  { object: "window", unit: "feet", estimate: 4 },
  { object: "shelf", unit: "feet", estimate: 6 },
  { object: "basketball hoop", unit: "feet", estimate: 10 },
  { object: "school bus", unit: "yards", estimate: 12 },
  { object: "garden", unit: "yards", estimate: 5 },
  { object: "hallway", unit: "yards", estimate: 8 },
  { object: "playground", unit: "yards", estimate: 10 },
];

const MAX_LENGTH_ESTIMATE_BY_UNIT: Record<LengthScenario["unit"], number> = {
  inches: 12,
  feet: 20,
  yards: 20,
};

type WeightMassVolumeScenario = {
  object: string;
  quantity: "weight" | "mass" | "liquid volume";
  correct: string;
};

const WEIGHT_MASS_VOLUME_SCENARIOS: WeightMassVolumeScenario[] = [
  { object: "an apple", quantity: "weight", correct: "ounces" },
  { object: "a banana", quantity: "weight", correct: "ounces" },
  { object: "a watermelon", quantity: "weight", correct: "pounds" },
  { object: "a backpack", quantity: "weight", correct: "pounds" },
  { object: "a cat", quantity: "weight", correct: "pounds" },
  { object: "a dog", quantity: "weight", correct: "pounds" },
  { object: "a bicycle", quantity: "weight", correct: "pounds" },
  { object: "an elephant", quantity: "mass", correct: "kilograms" },
  { object: "a paper clip", quantity: "mass", correct: "grams" },
  { object: "a small medicine cup", quantity: "liquid volume", correct: "milliliters" },
  { object: "a glass of juice", quantity: "liquid volume", correct: "cups" },
  { object: "a water bottle", quantity: "liquid volume", correct: "liters" },
  { object: "a soda can", quantity: "liquid volume", correct: "milliliters" },
  { object: "a milk jug", quantity: "liquid volume", correct: "gallons" },
  { object: "a bathtub", quantity: "liquid volume", correct: "gallons" },
  { object: "a soup bowl", quantity: "liquid volume", correct: "cups" },
  { object: "a spoon", quantity: "liquid volume", correct: "milliliters" },
];

const QUARTER_INCH_OBJECTS = [
  "pencil",
  "crayon",
  "marker",
  "paper clip",
  "ribbon",
  "stick",
  "eraser",
  "paintbrush",
  "twig",
];

const QUARTER_INCH_FORMS = ["mark", "between"];

function to12Hour(hour: number): { hour: number; ampm: string } {
  if (hour === 0) return { hour: 12, ampm: "AM" };
  if (hour === 12) return { hour: 12, ampm: "PM" };
  if (hour > 12) return { hour: hour - 12, ampm: "PM" };
  return { hour, ampm: "AM" };
}

function formatInches(whole: number, quarters: number): string {
  if (quarters === 0) {
    return `${whole} ${whole === 1 ? "inch" : "inches"}`;
  }
  if (whole === 0) {
    const fraction = ["", "1/4", "1/2", "3/4"][quarters];
    return `${fraction} inches`;
  }
  const fraction = ["", "1/4", "1/2", "3/4"][quarters];
  return `${whole} ${fraction} inches`;
}

function buildQuarterInchPrompt(
  object: string,
  whole: number,
  quarters: number,
  form: string,
): string {
  if (form === "between") {
    if (quarters === 0) {
      return `A ${object} ends right at the ${whole} inch mark on a ruler. What is its length to the nearest quarter inch?`;
    }
    const next = whole + 1;
    if (quarters === 2) {
      return `A ${object} ends halfway between ${whole} and ${next} inches. What is its length to the nearest quarter inch?`;
    }
    const fractionText = ["", "one quarter", "", "three quarters"];
    return `A ${object} ends ${fractionText[quarters]} of the way between ${whole} and ${next} inches. What is its length to the nearest quarter inch?`;
  }

  if (quarters === 0) {
    return `A ${object} lines up exactly with the ${whole} inch mark on a ruler. What is its length to the nearest quarter inch?`;
  }
  const ordinal = ["", "first", "second", "third"];
  return `A ${object} ends at the ${ordinal[quarters]} quarter-inch mark after ${whole} inches. What is its length to the nearest quarter inch?`;
}

function buildFractionalChoices(whole: number, quarters: number, rng: SeededRng): string[] {
  const correctQuarters = whole * 4 + quarters;
  const distractors = new Set<string>();
  const offsets = [-3, -2, -1, 1, 2, 3, -4, 4];

  for (const offset of offsets) {
    const candidate = correctQuarters + offset;
    if (candidate >= 1 && candidate <= 24 && candidate !== correctQuarters) {
      distractors.add(formatInches(Math.floor(candidate / 4), candidate % 4));
    }
  }

  let guard = 0;
  while (distractors.size < 2 && guard < 100) {
    guard += 1;
    const candidate = rng.nextInt(1, 24);
    if (candidate !== correctQuarters) {
      distractors.add(formatInches(Math.floor(candidate / 4), candidate % 4));
    }
  }

  const selected = rng.shuffle([...distractors]).slice(0, 2);
  return rng.shuffle([formatInches(whole, quarters), ...selected]);
}

type ReasonableScenario = {
  statement: string;
  correct: "yes" | "no";
};

const REASONABLE_SCENARIOS: ReasonableScenario[] = [
  { statement: "A pencil is about 7 inches long.", correct: "yes" },
  { statement: "A door is about 2 yards tall.", correct: "yes" },
  { statement: "A watermelon weighs about 5 pounds.", correct: "yes" },
  { statement: "A car ride takes about 20 minutes.", correct: "yes" },
  { statement: "A book is about 2 feet long.", correct: "no" },
  { statement: "A glass of juice holds about 5 gallons.", correct: "no" },
  { statement: "An apple weighs about 10 pounds.", correct: "no" },
  { statement: "A school day is about 5 minutes long.", correct: "no" },
];

export const measurementTimeFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    let prompt: string;
    let correct: string;
    let form: string;
    let choices: string[] | undefined;
    let keyPartA = 0;
    let keyPartB = 0;
    let keyExtra = "";

    if (ctx.practiceType === "customary_length_units") {
      const scenario = ctx.rng.pick(LENGTH_SCENARIOS);
      const { object, unit, estimate } = scenario;
      const lengthForm = ctx.rng.pick([
        "choose_unit",
        "estimate_length",
        "choose_and_estimate",
      ] as const);
      form = lengthForm;
      keyPartA = estimate;
      keyPartB = 0;
      keyExtra = `${object}:${unit}:${form}`;

      if (form === "choose_and_estimate") {
        const problemKey = mathProblemKey(ctx.practiceType, keyPartA, keyPartB, form, keyExtra);
        if (ctx.usedKeys.has(problemKey)) continue;
        ctx.usedKeys.add(problemKey);

        const max = MAX_LENGTH_ESTIMATE_BY_UNIT[unit];
        const unitChoices = ctx.rng.shuffle([unit, ...LENGTH_UNITS.filter((u) => u !== unit)]);
        const estimateChoices = buildNumberChoices(estimate, 1, max, ctx.rng);

        prompt = `Choose the best customary unit for measuring a ${object}, then estimate its length.`;

        problems.push(
          makeTryItProblem({
            id: `${ctx.lessonId}-measurement-${problems.length + 1}`,
            problemKey,
            prompt,
            tip: ctx.lesson.objective,
            successMessage: `Yes! A ${object} is about ${estimate} ${unit} long.`,
            visualEmoji: "🕒",
            parts: [
              {
                key: "unit",
                label: "Unit",
                correctAnswer: unit,
                choices: unitChoices,
              },
              {
                key: "estimate",
                label: "Estimate",
                correctAnswer: String(estimate),
                choices: estimateChoices,
              },
            ],
          }),
        );
        continue;
      }

      if (form === "choose_unit") {
        prompt = `Which customary unit would you use to measure the length of a ${object}?`;
        correct = unit;
        choices = ctx.rng.shuffle([unit, ...LENGTH_UNITS.filter((u) => u !== unit)]);
      } else {
        const max = MAX_LENGTH_ESTIMATE_BY_UNIT[unit];
        prompt = `About how many ${unit} long is a ${object}?`;
        correct = String(estimate);
        choices = buildNumberChoices(estimate, 1, max, ctx.rng);
      }
    } else if (ctx.practiceType === "quarter_inch_measurement") {
      const object = ctx.rng.pick(QUARTER_INCH_OBJECTS);
      const whole = ctx.rng.nextInt(1, 5);
      const quarters = ctx.rng.nextInt(0, 3);
      const qForm = ctx.rng.pick(QUARTER_INCH_FORMS);

      form = `quarter_inch_${qForm}`;
      keyPartA = whole;
      keyPartB = quarters;
      keyExtra = `${object}:${whole}:${quarters}:${qForm}`;

      prompt = buildQuarterInchPrompt(object, whole, quarters, qForm);
      correct = formatInches(whole, quarters);
      choices = buildFractionalChoices(whole, quarters, ctx.rng);
    } else if (ctx.practiceType === "choose_weight_mass_volume_units") {
      const scenario = ctx.rng.pick(WEIGHT_MASS_VOLUME_SCENARIOS);
      const correctUnit = scenario.correct;
      prompt = `Which unit would you use to measure the ${scenario.quantity} of ${scenario.object}?`;
      correct = correctUnit;
      form = "unit";
      const pool = scenario.quantity === "liquid volume" ? VOLUME_UNITS : WEIGHT_MASS_UNITS;
      const distractors = ctx.rng.shuffle(pool.filter((u) => u !== correctUnit)).slice(0, 2);
      choices = ctx.rng.shuffle([correctUnit, ...distractors]);
      keyPartA = 0;
      keyPartB = 0;
      keyExtra = `${scenario.object}:${correctUnit}:${form}`;
    } else if (ctx.practiceType === "read_analog_clocks") {
      const hour = ctx.rng.nextInt(1, 12);
      const minute = ctx.rng.nextInt(0, 11) * 5;
      prompt = `The hour hand is pointing at the ${hour} and the minute hand is pointing at the ${minute} minute mark. What time is it?`;
      correct = `${hour}:${minute.toString().padStart(2, "0")}`;
      form = "clock";
      const wrongMinute = ((minute + 5) % 60).toString().padStart(2, "0");
      const wrongHour = (hour % 12) + 1;
      choices = ctx.rng.shuffle([
        correct,
        `${hour}:${wrongMinute}`,
        `${wrongHour}:${minute.toString().padStart(2, "0")}`,
      ]);
      keyPartA = hour;
      keyPartB = minute;
    } else if (ctx.practiceType === "match_time_formats") {
      const hour = ctx.rng.nextInt(0, 23);
      const { hour: h12, ampm } = to12Hour(hour);
      prompt = `Match the digital time ${hour}:00 to the same 12-hour time.`;
      correct = `${h12}:00 ${ampm}`;
      form = "match_time";
      const wrongAmpm = ampm === "AM" ? "PM" : "AM";
      choices = ctx.rng.shuffle([
        correct,
        `${h12}:00 ${wrongAmpm}`,
        `${h12 === 12 ? 1 : h12 + 1}:00 ${ampm}`,
      ]);
      keyPartA = hour;
      keyPartB = 0;
    } else if (
      ctx.practiceType === "estimate_time_intervals" ||
      ctx.practiceType === "elapsed_time"
    ) {
      const start = ctx.rng.nextInt(1, 12);
      const elapsed = ctx.rng.nextInt(1, 4);
      prompt = `It is ${start}:00. What time will it be in ${elapsed} hours?`;
      correct = String(((start + elapsed - 1) % 12) + 1) + ":00";
      form = "elapsed";
      const correctHour = Number(correct.split(":")[0]);
      choices = buildNumberChoices(correctHour, 1, 12, ctx.rng).map((n) => `${n}:00`);
      keyPartA = start;
      keyPartB = elapsed;
    } else if (
      ctx.practiceType === "measurement_problems" ||
      ctx.practiceType === "mixed_measurement_problems"
    ) {
      const a = ctx.rng.nextInt(1, 20);
      const b = ctx.rng.nextInt(1, 20);
      const unit = ctx.rng.pick(["inches", "feet", "centimeters", "meters"]);
      prompt = `A board is ${a} ${unit} long. Another board is ${b} ${unit} long. How long are they together?`;
      correct = String(a + b);
      form = "measurement_add";
      choices = buildNumberChoices(a + b, 0, 100, ctx.rng);
      keyPartA = a;
      keyPartB = b;
    } else if (ctx.practiceType === "estimate_reasonableness") {
      const scenario = ctx.rng.pick(REASONABLE_SCENARIOS);
      prompt = `${scenario.statement} Is that reasonable?`;
      correct = scenario.correct;
      form = "reasonable";
      choices = ctx.rng.shuffle(["yes", "no"]);
      keyExtra = `${scenario.statement}:${scenario.correct}`;
    } else {
      const unit = ctx.rng.pick(["inches", "feet", "centimeters", "meters"]);
      const measure = ctx.rng.nextInt(1, 50);
      prompt = `How many ${unit} long is the object?`;
      correct = String(measure);
      form = "measure";
      choices = buildNumberChoices(measure, 1, 100, ctx.rng);
      keyPartA = measure;
      keyExtra = unit;
    }

    const key = mathProblemKey(ctx.practiceType, keyPartA, keyPartB, form, keyExtra);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-measurement-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "🕒",
        choices,
      }),
    );
  }

  return problems;
};
