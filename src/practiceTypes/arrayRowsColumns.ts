import { takePracticeProblems } from './practiceModeCounts'
import type { PracticeGenerationOptions, PracticeProblem } from './types'

function makeArrayRowsColumnsProblem({
  id,
  rows,
  columns,
}: {
  id: string
  rows: number
  columns: number
}): PracticeProblem {
  const product = rows * columns

  return {
    id,
    questionText:
      'Look at the array. How many rows are there? How many columns are in each row? What is the product?',
    correctAnswer: `${rows},${columns},${product}`,
    visualType: 'array_rows_columns',
    problemKey: `array-${rows}-rows-${columns}-columns`,
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
  }
}

const arrayRowsColumnsBank = [
  [3, 4],
  [2, 5],
  [4, 3],
  [2, 6],
  [5, 2],
  [3, 5],
  [4, 4],
  [6, 2],
  [5, 3],
  [2, 7],
  [6, 3],
  [4, 5],
] as const

const arrayRowsColumnsChallengeBank = [
  [6, 4],
  [5, 5],
  [7, 3],
  [4, 6],
  [3, 8],
  [8, 2],
  [6, 5],
  [7, 4],
  [5, 6],
  [8, 3],
] as const

export function generateArrayRowsColumnsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const source =
    options?.mode === 'challenge'
      ? arrayRowsColumnsChallengeBank
      : arrayRowsColumnsBank

  return takePracticeProblems(
    source.map(([rows, columns], index) =>
      makeArrayRowsColumnsProblem({
        id: `array-rows-columns-${options?.mode ?? 'guided'}-${index + 1}`,
        rows,
        columns,
      }),
    ),
    options,
  )
}
