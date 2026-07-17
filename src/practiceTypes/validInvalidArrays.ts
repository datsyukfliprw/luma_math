import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type ArrayJudgmentSeed = {
  description: string;
  correctAnswer: string;
  problemKey: string;
  rows?: number;
  columns?: number;
  equation: string;
};

function makeValidInvalidArrayProblem(
  seed: ArrayJudgmentSeed,
  index: number,
  mode: string,
): PracticeProblem {
  return {
    id: `valid-invalid-array-${mode}-${index + 1}`,
    questionText: seed.description,
    correctAnswer: seed.correctAnswer,
    visualType: "multiple_choice",
    problemKey: seed.problemKey,
    visualData: {
      equation: seed.equation,
      rows: seed.rows,
      columns: seed.columns,
      choices: ["Yes, it is an array", "No, it is not an array"],
    },
  };
}

const validInvalidArraysBank: ArrayJudgmentSeed[] = [
  {
    description: "This arrangement has 3 rows with 4 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-3x4",
    rows: 3,
    columns: 4,
    equation: "3 rows of 4",
  },
  {
    description: "This arrangement has rows with different numbers of dots. Is it a true array?",
    correctAnswer: "No, it is not an array",
    problemKey: "invalid-array-uneven-rows",
    equation: "Uneven rows",
  },
  {
    description: "This arrangement has 2 rows with 5 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-2x5",
    rows: 2,
    columns: 5,
    equation: "2 rows of 5",
  },
  {
    description: "This arrangement has 4 equal rows with 3 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-4x3",
    rows: 4,
    columns: 3,
    equation: "4 rows of 3",
  },
  {
    description:
      "This arrangement has one row with 2 dots, one row with 3 dots, and one row with 2 dots. Is it a true array?",
    correctAnswer: "No, it is not an array",
    problemKey: "invalid-array-2-3-2",
    equation: "Uneven rows",
  },
  {
    description: "This arrangement has 5 equal rows with 2 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-5x2",
    rows: 5,
    columns: 2,
    equation: "5 rows of 2",
  },
  {
    description: "This arrangement has gaps that make the rows uneven. Is it a true array?",
    correctAnswer: "No, it is not an array",
    problemKey: "invalid-array-gaps",
    equation: "Uneven gaps",
  },
  {
    description: "This arrangement has 2 equal rows with 6 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-2x6",
    rows: 2,
    columns: 6,
    equation: "2 rows of 6",
  },
  {
    description: "This arrangement has columns that do not line up. Is it a true array?",
    correctAnswer: "No, it is not an array",
    problemKey: "invalid-array-columns-not-lined-up",
    equation: "Columns do not line up",
  },
  {
    description: "This arrangement has 3 equal rows with 5 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-3x5",
    rows: 3,
    columns: 5,
    equation: "3 rows of 5",
  },
  {
    description: "This arrangement has 6 equal rows with 2 dots in each row. Is it a true array?",
    correctAnswer: "Yes, it is an array",
    problemKey: "valid-array-6x2",
    rows: 6,
    columns: 2,
    equation: "6 rows of 2",
  },
  {
    description: "This arrangement has scattered dots with no equal rows. Is it a true array?",
    correctAnswer: "No, it is not an array",
    problemKey: "invalid-array-scattered-dots",
    equation: "Scattered dots",
  },
];

export function generateValidInvalidArraysProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  return takePracticeProblems(
    validInvalidArraysBank.map((seed, index) =>
      makeValidInvalidArrayProblem(seed, index, options?.mode ?? "guided"),
    ),
    options,
  );
}
