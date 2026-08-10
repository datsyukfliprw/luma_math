import type { TryItFamily } from "../types";
import type { SeededRng } from "../../../practiceTypes/random";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
  normalizeNoun,
} from "../buildTryItProblem";

const CATEGORIES = ["red", "blue", "green", "yellow", "orange", "purple"];
const PICTURE_SYMBOLS = ["stars", "hearts", "paws", "apples", "books", "circles"];
const BAR_LABELS = ["squares", "units", "spaces"];
const GRAPH_CONTEXTS = [
  { title: "favorite colors", unit: "votes" },
  { title: "books read", unit: "books" },
  { title: "points scored", unit: "points" },
  { title: "toys collected", unit: "toys" },
  { title: "fruit picked", unit: "fruits" },
];
const LINE_CONTEXTS = [
  { title: "pencil lengths", unit: "inches" },
  { title: "plant heights", unit: "inches" },
  { title: "ribbon lengths", unit: "inches" },
  { title: "measurements", unit: "inches" },
];

function pluralize(word: string, count: number): string {
  const { singular, plural } = normalizeNoun(word);
  return count === 1 ? singular : plural;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatFraction(quarters: number): string {
  if (quarters === 0) return "0";
  const whole = Math.floor(quarters / 4);
  const rem = quarters % 4;
  const g = gcd(rem, 4);
  const num = rem / g;
  const den = 4 / g;
  if (num === 0) return String(whole);
  if (whole === 0) return `${num}/${den}`;
  return `${whole} ${num}/${den}`;
}

function buildFractionChoices(correctQuarters: number, rng: SeededRng): string[] {
  const correct = formatFraction(correctQuarters);
  const set = new Set<string>([correct]);
  const candidates = [
    correctQuarters - 1,
    correctQuarters + 1,
    correctQuarters - 2,
    correctQuarters + 2,
    correctQuarters - 4,
    correctQuarters + 4,
    Math.floor(correctQuarters / 2),
    correctQuarters * 2,
  ];
  for (const q of candidates) {
    if (q > 0) set.add(formatFraction(q));
  }
  while (set.size < 4) {
    const q = rng.nextInt(1, Math.max(2, correctQuarters + 4));
    set.add(formatFraction(q));
  }
  set.delete(correct);
  return rng.shuffle([correct, ...Array.from(set).slice(0, 2)]);
}

function formatSymbolCounts(categories: string[], counts: number[], symbolWord: string): string {
  return categories
    .map((cat, i) => `${cat}: ${counts[i]} ${pluralize(symbolWord, counts[i])}`)
    .join(", ");
}

function buildPictureGraphChoices(
  categories: string[],
  symbolCounts: number[],
  symbolWord: string,
  actualCounts: number[],
  rng: SeededRng,
): string[] {
  const correct = formatSymbolCounts(categories, symbolCounts, symbolWord);
  const choices = new Set<string>([correct]);
  const raw = formatSymbolCounts(categories, actualCounts, symbolWord);
  if (raw !== correct) choices.add(raw);

  let attempts = 0;
  while (choices.size < 3 && attempts < 100) {
    attempts += 1;
    const changed = [...symbolCounts];
    const idx = rng.nextInt(0, changed.length - 1);
    changed[idx] = Math.max(0, changed[idx] + rng.pick([-1, 1]));
    const option = formatSymbolCounts(categories, changed, symbolWord);
    if (option !== correct) choices.add(option);
  }
  return rng.shuffle([...choices]);
}

function generateScaledCounts(
  rng: SeededRng,
  categoryCount: number,
  scale: number,
  maxSymbols = 8,
): number[] {
  return Array.from({ length: categoryCount }, () => rng.nextInt(2, maxSymbols) * scale);
}

function pickCategories(rng: SeededRng, count: number): string[] {
  const others = rng.shuffle(CATEGORIES.filter((c) => c !== "red")).slice(0, count - 1);
  return rng.shuffle(["red", ...others]);
}

function makeDistinctHeights(rng: SeededRng, heights: number[]): number[] {
  const result = [...heights];
  let guard = 0;
  while (new Set(result).size < result.length && guard < 50) {
    guard += 1;
    const idx = rng.nextInt(0, result.length - 1);
    let newValue;
    let inner = 0;
    do {
      newValue = rng.nextInt(2, 8);
      inner += 1;
    } while (result.includes(newValue) && inner < 20);
    result[idx] = newValue;
  }
  return result;
}

export const dataGraphsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    let prompt: string;
    let correct: string;
    let form: string;
    let choices: string[] | undefined;
    let extra: string;

    const categoryCount = ctx.rng.nextInt(3, 4);

    if (ctx.practiceType === "read_picture_graphs") {
      const context = ctx.rng.pick(GRAPH_CONTEXTS);
      const symbolWord = ctx.rng.pick(PICTURE_SYMBOLS);
      const { singular } = normalizeNoun(symbolWord);
      const scale = ctx.rng.pick([2, 5]);
      const categories = pickCategories(ctx.rng, categoryCount);
      const counts = generateScaledCounts(ctx.rng, categoryCount, scale);
      const symbols = counts.map((c) => c / scale);
      const target = ctx.rng.pick(categories);
      const targetIndex = categories.indexOf(target);
      const graph = formatSymbolCounts(categories, symbols, symbolWord);
      prompt = `A picture graph shows ${context.title}. Key: 1 ${singular} = ${scale} ${context.unit}. ${graph}. How many ${context.unit} are in the ${target} category?`;
      correct = String(counts[targetIndex]);
      form = `read:${target}`;
      choices = buildNumberChoices(counts[targetIndex], 0, 50, ctx.rng);
      extra = `scale=${scale}:${symbols.join(":")}:${categories.join(",")}:${target}:${symbolWord}`;
    } else if (ctx.practiceType === "create_picture_graphs") {
      const context = ctx.rng.pick(GRAPH_CONTEXTS);
      const symbolWord = ctx.rng.pick(PICTURE_SYMBOLS);
      const { singular } = normalizeNoun(symbolWord);
      const scale = ctx.rng.pick([2, 5]);
      const categories = pickCategories(ctx.rng, categoryCount);
      const counts = generateScaledCounts(ctx.rng, categoryCount, scale);
      const symbols = counts.map((c) => c / scale);
      const data = categories.map((cat, i) => `${cat}: ${counts[i]} ${context.unit}`).join(", ");
      const correctGraph = formatSymbolCounts(categories, symbols, symbolWord);
      prompt = `Create a picture graph for ${context.title}. The data are ${data}. Use the key 1 ${singular} = ${scale} ${context.unit}. Which picture graph is correct?`;
      correct = correctGraph;
      form = "create";
      choices = buildPictureGraphChoices(categories, symbols, symbolWord, counts, ctx.rng);
      extra = `scale=${scale}:${counts.join(":")}:${categories.join(",")}:${symbolWord}`;
    } else if (ctx.practiceType === "read_bar_graphs") {
      const context = ctx.rng.pick(GRAPH_CONTEXTS);
      const barWord = ctx.rng.pick(BAR_LABELS);
      const { singular } = normalizeNoun(barWord);
      const scale = ctx.rng.pick([2, 5]);
      const categories = pickCategories(ctx.rng, categoryCount);
      const heights = Array.from({ length: categoryCount }, () => ctx.rng.nextInt(2, 8));
      const counts = heights.map((h) => h * scale);
      const target = ctx.rng.pick(categories);
      const targetIndex = categories.indexOf(target);
      const graph = formatSymbolCounts(categories, heights, barWord);
      prompt = `A bar graph shows ${context.title}. The scale is 1 ${singular} = ${scale} ${context.unit}. ${graph}. How many ${context.unit} are in the ${target} category?`;
      correct = String(counts[targetIndex]);
      form = `bar:${target}`;
      choices = buildNumberChoices(counts[targetIndex], 0, 50, ctx.rng);
      extra = `scale=${scale}:${heights.join(":")}:${categories.join(",")}:${target}:${barWord}`;
    } else if (ctx.practiceType === "create_graphs_solve_problems") {
      const context = ctx.rng.pick(GRAPH_CONTEXTS);
      const barWord = ctx.rng.pick(BAR_LABELS);
      const { singular } = normalizeNoun(barWord);
      const scale = ctx.rng.pick([2, 5]);
      const categories = pickCategories(ctx.rng, categoryCount);
      const heights = makeDistinctHeights(
        ctx.rng,
        Array.from({ length: categoryCount }, () => ctx.rng.nextInt(2, 8)),
      );
      const counts = heights.map((h) => h * scale);
      const graph = formatSymbolCounts(categories, heights, barWord);
      const entries = categories
        .map((cat, i) => ({ cat, count: counts[i], height: heights[i] }))
        .sort((a, b) => b.count - a.count);
      const largest = entries[0];
      const second = entries[1];
      const smallest = entries[entries.length - 1];
      const other = ctx.rng.pick(entries.slice(1, -1));

      const formType = ctx.rng.nextInt(0, 5);
      let question: string;
      let targetSpec: string;
      switch (formType) {
        case 0:
          question = `How many ${context.unit} are there in all?`;
          correct = String(counts.reduce((a, b) => a + b, 0));
          targetSpec = "all";
          break;
        case 1:
          question = `How many more ${context.unit} does ${largest.cat} have than ${smallest.cat}?`;
          correct = String(largest.count - smallest.count);
          targetSpec = `${largest.cat}-${smallest.cat}`;
          break;
        case 2:
          question = `How many ${context.unit} are ${largest.cat} and ${second.cat} combined?`;
          correct = String(largest.count + second.count);
          targetSpec = `${largest.cat}+${second.cat}`;
          break;
        case 3:
          question = `How many more ${context.unit} are ${largest.cat} and ${second.cat} combined than ${smallest.cat}?`;
          correct = String(largest.count + second.count - smallest.count);
          targetSpec = `${largest.cat}+${second.cat}-${smallest.cat}`;
          break;
        case 4:
          question = `How many ${context.unit} are ${largest.cat} and ${other.cat} combined?`;
          correct = String(largest.count + other.count);
          targetSpec = `${largest.cat}+${other.cat}`;
          break;
        default:
          question = `How many more ${context.unit} are ${largest.cat} and ${other.cat} combined than ${smallest.cat}?`;
          correct = String(largest.count + other.count - smallest.count);
          targetSpec = `${largest.cat}+${other.cat}-${smallest.cat}`;
          break;
      }
      form = `solve:${formType}`;
      prompt = `A bar graph shows ${context.title}. The scale is 1 ${singular} = ${scale} ${context.unit}. ${graph}. ${question}`;
      choices = buildNumberChoices(Number(correct), 0, 200, ctx.rng);
      extra = `scale=${scale}:${heights.join(":")}:${categories.join(",")}:${formType}:${targetSpec}`;
    } else if (ctx.practiceType === "line_plots") {
      const context = ctx.rng.pick(LINE_CONTEXTS);
      const allQuarters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const distinctCount = ctx.rng.nextInt(3, 4);
      const selected = ctx.rng
        .shuffle(allQuarters)
        .slice(0, distinctCount)
        .sort((a, b) => a - b);
      if (selected.every((q) => q % 4 === 0)) {
        const idx = ctx.rng.nextInt(0, selected.length - 1);
        selected[idx] = ctx.rng.pick([1, 2, 3, 5, 6, 7, 9, 10, 11]);
        selected.sort((a, b) => a - b);
      }
      const mode = selected[0];
      const counts: Record<number, number> = {};
      counts[mode] = ctx.rng.nextInt(3, 4);
      for (let i = 1; i < selected.length; i += 1) {
        counts[selected[i]] = ctx.rng.nextInt(1, 2);
      }
      const measurements: number[] = [];
      for (const q of selected) {
        for (let i = 0; i < counts[q]; i += 1) {
          measurements.push(q);
        }
      }
      const sortedMeasurements = [...measurements].sort((a, b) => a - b);
      const plot = selected.map((q) => `${formatFraction(q)}: ${"X".repeat(counts[q])}`).join("; ");

      const formType = ctx.rng.nextInt(0, 6);
      let question: string;
      let correctQuarters: number;
      let isFraction = false;
      switch (formType) {
        case 0: {
          const q = ctx.rng.pick(selected);
          question = `How many measurements are ${formatFraction(q)}?`;
          correct = String(counts[q]);
          correctQuarters = counts[q];
          break;
        }
        case 1: {
          const q = ctx.rng.pick(selected);
          const total = selected.reduce((sum, v) => (v >= q ? sum + counts[v] : sum), 0);
          question = `How many measurements are at least ${formatFraction(q)}?`;
          correct = String(total);
          correctQuarters = total;
          break;
        }
        case 2: {
          const aIdx = ctx.rng.nextInt(0, selected.length - 2);
          const bIdx = ctx.rng.nextInt(aIdx + 1, selected.length - 1);
          const a = selected[aIdx];
          const b = selected[bIdx];
          const total = selected.reduce((sum, v) => (v >= a && v <= b ? sum + counts[v] : sum), 0);
          question = `How many measurements are between ${formatFraction(a)} and ${formatFraction(b)} inclusive?`;
          correct = String(total);
          correctQuarters = total;
          break;
        }
        case 3:
          question = "What is the difference between the largest and smallest measurement?";
          correct = formatFraction(selected[selected.length - 1] - selected[0]);
          correctQuarters = selected[selected.length - 1] - selected[0];
          isFraction = true;
          break;
        case 4:
          question =
            "What is the total of the two smallest measurements, counting each X mark as one measurement?";
          correct = formatFraction(sortedMeasurements[0] + sortedMeasurements[1]);
          correctQuarters = sortedMeasurements[0] + sortedMeasurements[1];
          isFraction = true;
          break;
        case 5:
          question =
            "What is the total of the two largest measurements, counting each X mark as one measurement?";
          correct = formatFraction(
            sortedMeasurements[sortedMeasurements.length - 1] +
              sortedMeasurements[sortedMeasurements.length - 2],
          );
          correctQuarters =
            sortedMeasurements[sortedMeasurements.length - 1] +
            sortedMeasurements[sortedMeasurements.length - 2];
          isFraction = true;
          break;
        default:
          question = "Which measurement appears most often?";
          correct = formatFraction(mode);
          correctQuarters = mode;
          isFraction = true;
          break;
      }
      form = `line:${formType}`;
      prompt = `A line plot shows ${context.title} (in ${context.unit}). The X marks are placed as follows: ${plot}. ${question}`;
      if (isFraction) {
        choices =
          formType === 6
            ? ctx.rng.shuffle([
                correct,
                ...ctx.rng
                  .shuffle(selected.filter((q) => q !== mode).map(formatFraction))
                  .slice(0, 2),
              ])
            : buildFractionChoices(correctQuarters, ctx.rng);
      } else {
        choices = buildNumberChoices(Number(correct), 0, measurements.length, ctx.rng);
      }
      extra = `data=${measurements.join(":")}:form=${formType}:q=${question}`;
    } else {
      continue;
    }

    const key = mathProblemKey(ctx.practiceType, 0, 0, form, extra);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-data-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        choices,
      }),
    );
  }

  return problems;
};
