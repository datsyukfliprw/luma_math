import type { PracticeProblem } from './types'

export function generateDrawArraysProblems(): PracticeProblem[] {
  return [
    {
      id: 'draw-arrays-1',
      questionText:
        'Build an array for 3 × 5. How many rows, columns, and total dots should it have?',
      correctAnswer: '3,5,15',
      visualType: 'array_rows_columns',
      problemKey: 'draw-array-3x5',
      visualData: {
        rows: 3,
        columns: 5,
        equation: '3 × 5 = 15',
        product: 15,
      },
      answerData: {
        rows: '3',
        columns: '5',
        product: '15',
      },
    },
    {
      id: 'draw-arrays-2',
      questionText:
        'Build an array for 4 × 2. How many rows, columns, and total dots should it have?',
      correctAnswer: '4,2,8',
      visualType: 'array_rows_columns',
      problemKey: 'draw-array-4x2',
      visualData: {
        rows: 4,
        columns: 2,
        equation: '4 × 2 = 8',
        product: 8,
      },
      answerData: {
        rows: '4',
        columns: '2',
        product: '8',
      },
    },
    {
      id: 'draw-arrays-3',
      questionText:
        'Build an array for 2 × 6. How many rows, columns, and total dots should it have?',
      correctAnswer: '2,6,12',
      visualType: 'array_rows_columns',
      problemKey: 'draw-array-2x6',
      visualData: {
        rows: 2,
        columns: 6,
        equation: '2 × 6 = 12',
        product: 12,
      },
      answerData: {
        rows: '2',
        columns: '6',
        product: '12',
      },
    },
  ]
}
