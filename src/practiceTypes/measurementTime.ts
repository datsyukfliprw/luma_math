import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const MEASUREMENT_TIME_PRACTICE_TYPES = [
  "customary_length_units",
  "quarter_inch_measurement",
  "choose_weight_mass_volume_units",
  "line_plots",
  "read_analog_clocks",
  "match_time_formats",
  "estimate_time_intervals",
  "elapsed_time",
  "measurement_problems",
  "mixed_measurement_problems",
  "estimate_reasonableness",
] as const;

export type MeasurementTimePracticeType = (typeof MEASUREMENT_TIME_PRACTICE_TYPES)[number];
type Rng = SeededRng;

const LENGTH_CONTEXTS = [
  { id: "pencil", object: "the length of a pencil", unit: "inches" },
  { id: "book", object: "the width of a book", unit: "inches" },
  { id: "door", object: "the height of a classroom door", unit: "feet" },
  { id: "room", object: "the length of a classroom", unit: "feet" },
  { id: "bus", object: "the length of a school bus", unit: "yards" },
  { id: "playground", object: "the length of a playground", unit: "yards" },
  { id: "shoelace", object: "the length of a shoelace", unit: "inches" },
  { id: "hallway", object: "the length of a school hallway", unit: "yards" },
] as const;

const UNIT_CONTEXTS = [
  { id: "paperclip", object: "mass of a paperclip", unit: "grams" },
  { id: "backpack", object: "mass of a loaded backpack", unit: "kilograms" },
  { id: "orange", object: "weight of an orange", unit: "ounces" },
  { id: "student", object: "weight of a student", unit: "pounds" },
  { id: "medicine", object: "liquid volume of one spoonful of medicine", unit: "milliliters" },
  { id: "water-jug", object: "liquid volume of a large water jug", unit: "liters" },
  { id: "coin", object: "mass of a coin", unit: "grams" },
  { id: "dog", object: "weight of a medium dog", unit: "pounds" },
  { id: "soda-can", object: "liquid volume of a small drink can", unit: "milliliters" },
  { id: "bucket", object: "liquid volume of a bucket", unit: "liters" },
] as const;

const ESTIMATE_TIME_CONTEXTS = [
  { id: "brush-teeth", activity: "brush your teeth", minutes: 2 },
  { id: "tie-shoes", activity: "tie your shoes", minutes: 1 },
  { id: "walk-bus-stop", activity: "walk to a nearby bus stop", minutes: 5 },
  { id: "recess", activity: "have recess", minutes: 20 },
  { id: "lunch", activity: "eat lunch", minutes: 30 },
  { id: "soccer-practice", activity: "have a soccer practice", minutes: 60 },
  { id: "movie", activity: "watch a full movie", minutes: 120 },
  { id: "homework", activity: "finish a short homework assignment", minutes: 25 },
] as const;

const MEASUREMENT_UNITS = ["feet", "pounds", "liters", "inches", "ounces", "milliliters"] as const;

function getSeed(
  practiceType: MeasurementTimePracticeType,
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

function stringChoices(correct: string, distractors: readonly string[], rng: Rng): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < 3) throw new Error(`Need three unique distractors for ${correct}`);
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, 3)]);
}

function numberChoices(correct: number, rng: Rng, extras: readonly number[] = []): string[] {
  const candidates = new Set<number>();
  const add = (value: number) => {
    if (Number.isInteger(value) && value >= 0 && value !== correct) candidates.add(value);
  };
  for (const extra of extras) add(extra);
  for (const offset of [1, -1, 2, -2, 5, -5, 10, -10, 15, -15, 30, -30, 60, -60]) add(correct + offset);
  let offset = 3;
  while (candidates.size < 3) {
    add(correct + offset);
    add(correct - offset);
    offset += 1;
  }
  return rng.shuffle([String(correct), ...rng.shuffle([...candidates]).slice(0, 3).map(String)]);
}

function buildUniqueProblems(
  count: number,
  build: (index: number) => PracticeProblem,
  maxAttempts = 600,
): PracticeProblem[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
  const result: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;
  while (result.length < count && attempts < maxAttempts) {
    attempts += 1;
    const problem = build(result.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    result.push(problem);
  }
  if (result.length < count) throw new RangeError(`Could not generate ${count} unique measurement/time problems`);
  return result;
}

function formatQuarterInches(totalQuarters: number): string {
  const whole = Math.floor(totalQuarters / 4);
  const remainder = totalQuarters % 4;
  const fraction = remainder === 0 ? "" : remainder === 1 ? "1/4" : remainder === 2 ? "1/2" : "3/4";
  if (whole === 0) return `${fraction} inch${totalQuarters === 1 ? "" : "es"}`;
  if (remainder === 0) return `${whole} inch${whole === 1 ? "" : "es"}`;
  return `${whole} ${fraction} inches`;
}

function formatTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")}`;
}

function writtenTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 720) + 720) % 720;
  const hour = Math.floor(normalized / 60) || 12;
  const minute = normalized % 60;
  const nextHour = hour === 12 ? 1 : hour + 1;
  if (minute === 0) return `${hour} o'clock`;
  if (minute === 15) return `quarter past ${hour}`;
  if (minute === 30) return `half past ${hour}`;
  if (minute === 45) return `quarter to ${nextHour}`;
  if (minute < 30) return `${minute} minutes past ${hour}`;
  return `${60 - minute} minutes before ${nextHour}`;
}

function makeCustomaryLengthUnits(index: number, mode: string, rng: Rng): PracticeProblem {
  const context = rng.pick(LENGTH_CONTEXTS);
  const correct = context.unit;
  return {
    id: `customary-length-units-${mode}-${index + 1}`,
    questionText: `Which customary unit is the most reasonable for measuring ${context.object}?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `measurement:length-unit:object=${context.id}:ask=best-unit`,
    visualData: {
      choices: stringChoices(correct, ["inches", "feet", "yards", "pounds", "gallons"], rng),
    },
  };
}

function makeQuarterInch(index: number, mode: string, rng: Rng): PracticeProblem {
  const totalQuarters = rng.nextInt(1, 48);
  const correct = formatQuarterInches(totalQuarters);
  const distractorTotals = [totalQuarters - 1, totalQuarters + 1, totalQuarters - 2, totalQuarters + 2, totalQuarters + 4]
    .filter((value) => value > 0);
  return {
    id: `quarter-inch-measurement-${mode}-${index + 1}`,
    questionText: `On a ruler marked in quarter inches, an object ends at quarter-mark ${totalQuarters} after 0. What length should you record?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `measurement:quarter-inch:quarters=${totalQuarters}:ask=length`,
    visualData: {
      choices: stringChoices(correct, distractorTotals.map(formatQuarterInches), rng),
    },
  };
}

function makeChooseWeightMassVolume(index: number, mode: string, rng: Rng): PracticeProblem {
  const context = rng.pick(UNIT_CONTEXTS);
  return {
    id: `choose-weight-mass-volume-units-${mode}-${index + 1}`,
    questionText: `Which unit is the most reasonable for the ${context.object}?`,
    correctAnswer: context.unit,
    visualType: "multiple_choice",
    problemKey: `measurement:unit-choice:object=${context.id}:ask=best-unit`,
    visualData: {
      choices: stringChoices(context.unit, ["grams", "kilograms", "ounces", "pounds", "milliliters", "liters"], rng),
    },
  };
}

function makeLinePlot(index: number, mode: string, rng: Rng): PracticeProblem {
  const data = Array.from({ length: rng.nextInt(6, 10) }, () => rng.nextInt(2, 8));
  const sorted = [...data].sort((a, b) => a - b);
  const task = rng.next() < 0.65 ? "frequency" : "most-common";
  if (task === "frequency") {
    const target = rng.pick(sorted);
    const frequency = sorted.filter((value) => value === target).length;
    const targetText = formatQuarterInches(target).replace(/ inches?$/, "");
    return {
      id: `line-plots-${mode}-${index + 1}`,
      questionText: `Make a line plot for these lengths in inches: ${sorted.map((value) => formatQuarterInches(value).replace(/ inches?$/, "")).join(", ")}. How many Xs belong above ${targetText}?`,
      correctAnswer: String(frequency),
      visualType: "multiple_choice",
      problemKey: `measurement:line-plot:data=${sorted.join("-")}:task=frequency:target=${target}`,
      visualData: { choices: numberChoices(frequency, rng, [data.length, target]) },
    };
  }
  const counts = new Map<number, number>();
  for (const value of sorted) counts.set(value, (counts.get(value) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  const modes = [...counts.entries()].filter(([, count]) => count === maxCount).map(([value]) => value);
  if (modes.length !== 1) return makeLinePlot(index, mode, rng);
  const correct = formatQuarterInches(modes[0]).replace(/ inches?$/, "");
  const candidates = Array.from({ length: 7 }, (_, offset) => offset + 2)
    .filter((value) => value !== modes[0])
    .map((value) => formatQuarterInches(value).replace(/ inches?$/, ""));
  return {
    id: `line-plots-${mode}-${index + 1}`,
    questionText: `Make a line plot for these lengths in inches: ${sorted.map((value) => formatQuarterInches(value).replace(/ inches?$/, "")).join(", ")}. Which measurement has the most Xs?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `measurement:line-plot:data=${sorted.join("-")}:task=mode`,
    visualData: { choices: stringChoices(correct, candidates, rng) },
  };
}

function makeReadAnalogClock(index: number, mode: string, rng: Rng): PracticeProblem {
  const hour = rng.nextInt(1, 12);
  const minute = rng.nextInt(0, 59);
  const total = (hour % 12) * 60 + minute;
  const correct = formatTime(total);
  const nextHour = hour === 12 ? 1 : hour + 1;
  return {
    id: `read-analog-clocks-${mode}-${index + 1}`,
    questionText: `An analog clock's minute hand points to the ${minute}-minute mark after 12, and the hour hand is ${minute === 0 ? `on ${hour}` : `between ${hour} and ${nextHour}`}. What time is it?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `time:analog:hour=${hour}:minute=${minute}:ask=digital`,
    visualData: {
      choices: stringChoices(correct, [
        formatTime(total + 5),
        formatTime(total - 5),
        formatTime((minute % 12) * 60 + hour),
        formatTime(total + 60),
      ], rng),
    },
  };
}

function makeMatchTimeFormats(index: number, mode: string, rng: Rng): PracticeProblem {
  const hour = rng.nextInt(1, 12);
  const minute = rng.pick([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as const);
  const total = (hour % 12) * 60 + minute;
  const digital = formatTime(total);
  const correct = writtenTime(total);
  return {
    id: `match-time-formats-${mode}-${index + 1}`,
    questionText: `Which written time matches the digital time ${digital}?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `time:match:hour=${hour}:minute=${minute}:from=digital:to=written`,
    visualData: {
      choices: stringChoices(correct, [
        writtenTime(total + 5),
        writtenTime(total - 5),
        writtenTime(total + 15),
        writtenTime(total - 15),
      ], rng),
    },
  };
}

function makeEstimateTimeIntervals(index: number, mode: string, rng: Rng): PracticeProblem {
  const context = rng.pick(ESTIMATE_TIME_CONTEXTS);
  const correct = String(context.minutes);
  const candidates = ESTIMATE_TIME_CONTEXTS.map((candidate) => candidate.minutes);
  return {
    id: `estimate-time-intervals-${mode}-${index + 1}`,
    questionText: `Which is the most reasonable estimate, in minutes, for how long it takes to ${context.activity}?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `time:estimate:activity=${context.id}:ask=minutes`,
    visualData: { choices: stringChoices(correct, candidates.map(String), rng) },
  };
}

function makeElapsedTime(index: number, mode: string, rng: Rng): PracticeProblem {
  const start = rng.nextInt(7 * 60, 16 * 60);
  const duration = rng.nextInt(3, 24) * 5;
  const end = start + duration;
  const task = rng.next() < 0.5 ? "end" : "elapsed";
  if (task === "end") {
    const correct = formatTime(end);
    return {
      id: `elapsed-time-${mode}-${index + 1}`,
      questionText: `An activity starts at ${formatTime(start)} and lasts ${duration} minutes. What time does it end?`,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: `time:elapsed:start=${start}:duration=${duration}:ask=end`,
      visualData: {
        equation: `${formatTime(start)} + ${duration} minutes = ?`,
        choices: stringChoices(correct, [formatTime(end + 5), formatTime(end - 5), formatTime(end + 15), formatTime(end - 15)], rng),
      },
    };
  }
  return {
    id: `elapsed-time-${mode}-${index + 1}`,
    questionText: `An activity starts at ${formatTime(start)} and ends at ${formatTime(end)}. How many minutes elapsed?`,
    correctAnswer: String(duration),
    visualType: "multiple_choice",
    problemKey: `time:elapsed:start=${start}:end=${end}:ask=duration`,
    visualData: {
      equation: `${formatTime(start)} → ${formatTime(end)}`,
      choices: numberChoices(duration, rng, [duration + 60, Math.max(0, duration - 60)]),
    },
  };
}

type FourOperation = "add" | "subtract" | "multiply" | "divide";

function makeMeasurementProblems(index: number, mode: string, rng: Rng): PracticeProblem {
  const operation = rng.pick<FourOperation>(["add", "subtract", "multiply", "divide"]);
  const unit = rng.pick(MEASUREMENT_UNITS);
  let a: number;
  let b: number;
  let result: number;
  let questionText: string;
  let equation: string;
  if (operation === "add") {
    a = rng.nextInt(5, 80);
    b = rng.nextInt(2, 50);
    result = a + b;
    questionText = `One container has ${a} ${unit}. Another has ${b} ${unit}. How many ${unit} are there altogether?`;
    equation = `${a} + ${b} = ?`;
  } else if (operation === "subtract") {
    a = rng.nextInt(20, 100);
    b = rng.nextInt(2, a - 1);
    result = a - b;
    questionText = `A measurement is ${a} ${unit}. ${b} ${unit} are removed. How many ${unit} remain?`;
    equation = `${a} - ${b} = ?`;
  } else if (operation === "multiply") {
    a = rng.nextInt(2, 9);
    b = rng.nextInt(2, 12);
    result = a * b;
    questionText = `There are ${a} equal items measuring ${b} ${unit} each. What is their combined measurement in ${unit}?`;
    equation = `${a} × ${b} = ?`;
  } else {
    b = rng.nextInt(2, 9);
    result = rng.nextInt(2, 12);
    a = b * result;
    questionText = `${a} ${unit} are shared equally among ${b} groups. How many ${unit} are in each group?`;
    equation = `${a} ÷ ${b} = ?`;
  }
  return {
    id: `measurement-problems-${mode}-${index + 1}`,
    questionText,
    correctAnswer: String(result),
    visualType: "multiple_choice",
    problemKey: `measurement:word:op=${operation}:a=${a}:b=${b}:unit=${unit}:ask=result`,
    visualData: { equation, choices: numberChoices(result, rng, [a, b]) },
  };
}

type ConversionKind = "feet-inches" | "liters-milliliters" | "kilograms-grams";

function makeMixedMeasurement(index: number, mode: string, rng: Rng): PracticeProblem {
  const kind = rng.pick<ConversionKind>(["feet-inches", "liters-milliliters", "kilograms-grams"]);
  const operation = rng.pick(["add", "subtract"] as const);
  const ratio = kind === "feet-inches" ? 12 : 1000;
  const largeUnit = kind === "feet-inches" ? "feet" : kind === "liters-milliliters" ? "liters" : "kilograms";
  const smallUnit = kind === "feet-inches" ? "inches" : kind === "liters-milliliters" ? "milliliters" : "grams";
  const largeAmount = rng.nextInt(2, 6);
  const converted = largeAmount * ratio;
  const smallStep = kind === "feet-inches" ? rng.nextInt(2, 22) : rng.nextInt(1, 9) * 100;
  const smallAmount = operation === "subtract" ? Math.min(smallStep, converted - (kind === "feet-inches" ? 1 : 100)) : smallStep;
  const result = operation === "add" ? converted + smallAmount : converted - smallAmount;
  const symbol = operation === "add" ? "+" : "-";
  const action = operation === "add" ? "combined with" : "reduced by";
  return {
    id: `mixed-measurement-problems-${mode}-${index + 1}`,
    questionText: `${largeAmount} ${largeUnit} are ${action} ${smallAmount} ${smallUnit}. Convert first. What is the result in ${smallUnit}?`,
    correctAnswer: String(result),
    visualType: "multiple_choice",
    problemKey: `measurement:mixed:kind=${kind}:op=${operation}:large=${largeAmount}:small=${smallAmount}:ask=${smallUnit}`,
    visualData: {
      equation: `${largeAmount} ${largeUnit} = ${converted} ${smallUnit}; ${converted} ${symbol} ${smallAmount} = ?`,
      choices: numberChoices(result, rng, [converted, smallAmount, largeAmount + smallAmount]),
    },
  };
}

function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

function makeEstimateReasonableness(index: number, mode: string, rng: Rng): PracticeProblem {
  const operation = rng.pick(["add", "subtract"] as const);
  const unit = rng.pick(["feet", "pounds", "liters"] as const);
  let a: number;
  let b: number;
  let exact: number;
  if (operation === "add") {
    a = rng.nextInt(21, 89);
    b = rng.nextInt(11, 79);
    exact = a + b;
  } else {
    a = rng.nextInt(51, 149);
    b = rng.nextInt(11, Math.min(79, a - 1));
    exact = a - b;
  }
  const estimate = operation === "add"
    ? roundToTen(a) + roundToTen(b)
    : roundToTen(a) - roundToTen(b);
  const symbol = operation === "add" ? "+" : "-";
  const correct = `Estimate ${estimate}; exact ${exact}; reasonable`;
  return {
    id: `estimate-reasonableness-${mode}-${index + 1}`,
    questionText: `A measurement problem is ${a} ${unit} ${symbol} ${b} ${unit}. Round each number to the nearest ten, estimate, solve exactly, and decide whether the exact answer is reasonable.`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `measurement:reasonableness:op=${operation}:a=${a}:b=${b}:unit=${unit}:round=tens`,
    visualData: {
      equation: `${a} ${symbol} ${b} = ${exact}`,
      choices: stringChoices(correct, [
        `Estimate ${estimate + 10}; exact ${exact}; reasonable`,
        `Estimate ${estimate}; exact ${exact + 10}; reasonable`,
        `Estimate ${estimate}; exact ${exact}; not reasonable`,
        `Estimate ${Math.max(0, estimate - 10)}; exact ${Math.max(0, exact - 10)}; reasonable`,
      ], rng),
    },
  };
}

export function generateMeasurementTimeProblems(
  practiceType: MeasurementTimePracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return buildUniqueProblems(count, (index) => {
    switch (practiceType) {
      case "customary_length_units":
        return makeCustomaryLengthUnits(index, mode, rng);
      case "quarter_inch_measurement":
        return makeQuarterInch(index, mode, rng);
      case "choose_weight_mass_volume_units":
        return makeChooseWeightMassVolume(index, mode, rng);
      case "line_plots":
        return makeLinePlot(index, mode, rng);
      case "read_analog_clocks":
        return makeReadAnalogClock(index, mode, rng);
      case "match_time_formats":
        return makeMatchTimeFormats(index, mode, rng);
      case "estimate_time_intervals":
        return makeEstimateTimeIntervals(index, mode, rng);
      case "elapsed_time":
        return makeElapsedTime(index, mode, rng);
      case "measurement_problems":
        return makeMeasurementProblems(index, mode, rng);
      case "mixed_measurement_problems":
        return makeMixedMeasurement(index, mode, rng);
      case "estimate_reasonableness":
        return makeEstimateReasonableness(index, mode, rng);
      default:
        throw new Error(`Unsupported measurement/time practice type: ${practiceType}`);
    }
  });
}
