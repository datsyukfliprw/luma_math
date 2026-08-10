import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

const LENGTH_UNITS = ["inches", "feet", "yards"];
const WEIGHTS = ["ounces", "pounds", "grams", "kilograms"];
const VOLUMES = ["cups", "pints", "quarts", "gallons", "liters"];

function to12Hour(hour: number): { hour: number; ampm: string } {
  if (hour === 0) return { hour: 12, ampm: "AM" };
  if (hour === 12) return { hour: 12, ampm: "PM" };
  if (hour > 12) return { hour: hour - 12, ampm: "PM" };
  return { hour, ampm: "AM" };
}

type UnitScenario = {
  object: string;
  quantity: "weight" | "volume" | "length";
  correct: string;
};

const UNIT_SCENARIOS: UnitScenario[] = [
  { object: "apple", quantity: "weight", correct: "ounces" },
  { object: "backpack", quantity: "weight", correct: "pounds" },
  { object: "elephant", quantity: "weight", correct: "kilograms" },
  { object: "glass of juice", quantity: "volume", correct: "cups" },
  { object: "bathtub", quantity: "volume", correct: "gallons" },
  { object: "soda bottle", quantity: "volume", correct: "liters" },
  { object: "pencil", quantity: "length", correct: "inches" },
  { object: "classroom", quantity: "length", correct: "meters" },
];

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
    let prompt = "";
    let correct = "";
    let form = "";
    let choices: string[] | undefined;
    let keyPartA = 0;
    let keyPartB = 0;
    let keyExtra = "";

    if (ctx.practiceType === "customary_length_units") {
      const object = ctx.rng.pick(["pencil", "desk", "door"]);
      const correctUnit = object === "pencil" ? "inches" : object === "desk" ? "feet" : "yards";
      prompt = `Which customary unit would you use to measure the length of a ${object}?`;
      correct = correctUnit;
      form = "length_unit";
      const others = LENGTH_UNITS.filter((u) => u !== correctUnit);
      choices = ctx.rng.shuffle([correctUnit, ...others]);
      keyPartA = object.length;
      keyExtra = `${object}:${correctUnit}`;
    } else if (ctx.practiceType === "quarter_inch_measurement") {
      const quarters = ctx.rng.nextInt(2, 12) * 4;
      prompt = `A line is ${quarters} quarter-inches long. How many inches is that?`;
      correct = String(quarters / 4);
      form = "quarter_inch";
      choices = buildNumberChoices(quarters / 4, 1, 12, ctx.rng);
      keyPartA = quarters;
      keyPartB = 0;
    } else if (ctx.practiceType === "choose_weight_mass_volume_units") {
      const scenario = ctx.rng.pick(UNIT_SCENARIOS);
      const correctUnit = scenario.correct;
      prompt = `Which unit would you use to measure the ${scenario.quantity} of a ${scenario.object}?`;
      correct = correctUnit;
      form = "unit";
      const distractors = ctx.rng
        .shuffle([
          ...new Set([
            ...WEIGHTS,
            ...VOLUMES,
            ...["inches", "feet", "yards", "centimeters", "meters"],
          ]),
        ])
        .filter((u) => u !== correctUnit)
        .slice(0, 2);
      choices = ctx.rng.shuffle([correctUnit, ...distractors]);
      keyExtra = `${scenario.object}:${correctUnit}`;
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
