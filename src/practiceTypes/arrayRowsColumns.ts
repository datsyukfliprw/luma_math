import type { PracticeProblem } from './types'

export function generateArrayRowsColumnsProblems(): PracticeProblem[] {
  return [
    {
      id: 'array-rows-columns-1',
      questionText:
        'Look at the array. How many rows are there? How many columns are in each row? What is the product?',
      correctAnswer: '3,4,12',
      visualType: 'array_rows_columns',
      problemKey: 'array-3-rows-4-columns',
      visualData: {
        rows: 3,
        columns: 4,
        equation: '3 × 4 = 12',
        product: 12,
      },
      answerData: {
        rows: '3',
        columns: '4',
        product: '12',
      },
    },
    {
      id: 'array-rows-columns-2',
      questionText:
        'Look at the array. How many rows are there? How many columns are in each row? What is the product?',
      correctAnswer: '2,5,10',
      visualType: 'array_rows_columns',
      problemKey: 'array-2-rows-5-columns',
      visualData: {
        rows: 2,
        columns: 5,
        equation: '2 × 5 = 10',
        product: 10,
      },
      answerData: {
        rows: '2',
        columns: '5',
        product: '10',
      },
    },
    {
      id: 'array-rows-columns-3',
      questionText:
        'Look at the array. How many rows are there? How many columns are in each row? What is the product?',
      correctAnswer: '4,3,12',
      visualType: 'array_rows_columns',
      problemKey: 'array-4-rows-3-columns',
      visualData: {
        rows: 4,
        columns: 3,
        equation: '4 × 3 = 12',
        product: 12,
      },
      answerData: {
        rows: '4',
        columns: '3',
        product: '12',
      },
    },
  ]
}
