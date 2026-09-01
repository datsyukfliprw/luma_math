import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const DATA_GRAPH_PRACTICE_TYPES = [
  "read_picture_graphs",
  "create_picture_graphs",
  "read_bar_graphs",
  "create_graphs_solve_problems",
] as const;

export type DataGraphPracticeType = (typeof DATA_GRAPH_PRACTICE_TYPES)[number];
type Rng = SeededRng;

function getSeed(
  practiceType: DataGraphPracticeType,
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

function numberChoices(correct: number, rng: Rng, extras: readonly number[] = []): string[] {
  const candidates = new Set<number>();
  const add = (value: number) => {
    if (Number.isInteger(value) && value >= 0 && value !== correct) candidates.add(value);
  };
  for (const extra of extras) add(extra);
  for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10]) add(correct + offset);
  let offset = 6;
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
): PracticeProblem[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
  const result: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;
  while (result.length < count && attempts < 400) {
    attempts += 1;
    const problem = build(result.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    result.push(problem);
  }
  if (result.length < count) throw new RangeError(`Could not generate ${count} unique graph problems`);
  return result;
}

function makeReadPictureGraph(index: number, mode: string, rng: Rng): PracticeProblem {
  const scale = rng.nextInt(2, 5);
  const symbols = rng.nextInt(2, 8);
  const total = scale * symbols;
  return {
    id: `read-picture-graphs-${mode}-${index + 1}`,
    questionText: `A picture graph key says each star stands for ${scale} books. Maya has ${symbols} stars. How many books does Maya have?`,
    correctAnswer: String(total),
    visualType: "multiple_choice",
    problemKey: `data:picture-read:scale=${scale}:symbols=${symbols}:ask=total`,
    visualData: {
      equation: `${symbols} × ${scale} = ?`,
      choices: numberChoices(total, rng, [symbols, scale, symbols + scale]),
    },
  };
}

function makeCreatePictureGraph(index: number, mode: string, rng: Rng): PracticeProblem {
  const scale = rng.nextInt(2, 5);
  const symbols = rng.nextInt(2, 8);
  const total = scale * symbols;
  return {
    id: `create-picture-graphs-${mode}-${index + 1}`,
    questionText: `You are making a picture graph for ${total} votes. If each symbol stands for ${scale} votes, how many symbols should you draw?`,
    correctAnswer: String(symbols),
    visualType: "multiple_choice",
    problemKey: `data:picture-create:value=${total}:scale=${scale}:ask=symbols`,
    visualData: {
      equation: `${total} ÷ ${scale} = ?`,
      choices: numberChoices(symbols, rng, [scale, total, total - scale]),
    },
  };
}

function makeReadBarGraph(index: number, mode: string, rng: Rng): PracticeProblem {
  const scale = rng.nextInt(2, 5);
  const spaces = rng.nextInt(2, 9);
  const value = scale * spaces;
  return {
    id: `read-bar-graphs-${mode}-${index + 1}`,
    questionText: `A bar graph scale counts by ${scale}. The bar for June reaches ${spaces} scale spaces. What value does the bar represent?`,
    correctAnswer: String(value),
    visualType: "multiple_choice",
    problemKey: `data:bar-read:scale=${scale}:spaces=${spaces}:ask=value`,
    visualData: {
      equation: `${spaces} × ${scale} = ?`,
      choices: numberChoices(value, rng, [spaces, scale, spaces + scale]),
    },
  };
}

function makeCreateGraphSolve(index: number, mode: string, rng: Rng): PracticeProblem {
  const a = rng.nextInt(8, 30);
  const b = rng.nextInt(5, 25);
  const c = rng.nextInt(4, 20);
  const task = rng.next() < 0.5 ? "difference" : "combined";
  const correct = task === "difference" ? Math.abs(a - c) : a + b;
  const questionText = task === "difference"
    ? `A bar graph will show Pizza ${a} votes, Tacos ${b} votes, and Burgers ${c} votes. After graphing the data, how many more votes separate Pizza and Burgers?`
    : `A bar graph will show Pizza ${a} votes, Tacos ${b} votes, and Burgers ${c} votes. After graphing the data, how many votes do Pizza and Tacos have altogether?`;
  return {
    id: `create-graphs-solve-problems-${mode}-${index + 1}`,
    questionText,
    correctAnswer: String(correct),
    visualType: "multiple_choice",
    problemKey: `data:create-and-solve:a=${a}:b=${b}:c=${c}:task=${task}`,
    visualData: {
      equation: task === "difference" ? `|${a} - ${c}| = ?` : `${a} + ${b} = ?`,
      choices: numberChoices(correct, rng, [a, b, c, a + b + c]),
    },
  };
}

export function generateDataGraphProblems(
  practiceType: DataGraphPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return buildUniqueProblems(count, (index) => {
    switch (practiceType) {
      case "read_picture_graphs":
        return makeReadPictureGraph(index, mode, rng);
      case "create_picture_graphs":
        return makeCreatePictureGraph(index, mode, rng);
      case "read_bar_graphs":
        return makeReadBarGraph(index, mode, rng);
      case "create_graphs_solve_problems":
        return makeCreateGraphSolve(index, mode, rng);
      default:
        throw new Error(`Unsupported data graph practice type: ${practiceType}`);
    }
  });
}
