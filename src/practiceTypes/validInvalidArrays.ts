import type { PracticeProblem } from './types'

export function generateValidInvalidArraysProblems(): PracticeProblem[] {
  return [
    {
      id: 'valid-invalid-array-1',
      questionText:
        'This arrangement has 3 rows with 4 dots in each row. Is it a true array?',
      correctAnswer: 'Yes, it is an array',
      visualType: 'multiple_choice',
      problemKey: 'valid-array-3x4',
      visualData: {
        equation: '3 rows of 4',
        rows: 3,
        columns: 4,
        choices: ['Yes, it is an array', 'No, it is not an array'],
      },
    },
    {
      id: 'valid-invalid-array-2',
      questionText:
        'This arrangement has rows with different numbers of dots. Is it a true array?',
      correctAnswer: 'No, it is not an array',
      visualType: 'multiple_choice',
      problemKey: 'invalid-array-uneven-rows',
      visualData: {
        equation: 'Uneven rows',
        choices: ['Yes, it is an array', 'No, it is not an array'],
      },
    },
    {
      id: 'valid-invalid-array-3',
      questionText:
        'This arrangement has 2 rows with 5 dots in each row. Is it a true array?',
      correctAnswer: 'Yes, it is an array',
      visualType: 'multiple_choice',
      problemKey: 'valid-array-2x5',
      visualData: {
        equation: '2 rows of 5',
        rows: 2,
        columns: 5,
        choices: ['Yes, it is an array', 'No, it is not an array'],
      },
    },
  ]
}
