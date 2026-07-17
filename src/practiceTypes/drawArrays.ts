import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function makeDrawArrayProblem({
  id,
  rows,
  columns,
}: {
  id: string;
  rows: number;
  columns: number;
}): PracticeProblem {
  const product = rows * columns;

  return {
    id,
    questionText: `Build an array for ${rows} × ${columns}. How many rows, columns, and total dots should it have?`,
    correctAnswer: `${rows},${columns},${product}`,
    visualType: "array_rows_columns",
    problemKey: `draw-array-${rows}x${columns}`,
    visualData: {
      rows,
      columns,
      equation: `${rows} × ${columns} = ${product}`,
      product,
    },
    answerData: {
      rows: String(rows),
      columns: String(columns),
      product: String(product),
    },
  };
}

const drawArraysBank = [
  [3, 5],
  [4, 2],
  [2, 6],
  [5, 3],
  [3, 4],
  [6, 2],
  [4, 4],
  [2, 7],
  [5, 4],
  [3, 6],
  [7, 2],
  [6, 3],
] as const;

const drawArraysChallengeBank = [
  [6, 4],
  [5, 5],
  [7, 3],
  [4, 6],
  [8, 2],
  [3, 8],
  [6, 5],
  [7, 4],
  [5, 6],
  [8, 3],
] as const;

export function generateDrawArraysProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  const source = options?.mode === "challenge" ? drawArraysChallengeBank : drawArraysBank;

  return takePracticeProblems(
    source.map(([rows, columns], index) =>
      makeDrawArrayProblem({
        id: `draw-arrays-${options?.mode ?? "guided"}-${index + 1}`,
        rows,
        columns,
      }),
    ),
    options,
  );
}
