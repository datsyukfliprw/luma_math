import type { PracticeProblem } from './types'

export function generateCommutativePropertyProblems(): PracticeProblem[] {
  return [
    {
      id: 'commutative-property-1',
      questionText: 'Which equation matches 3 × 4?',
      correctAnswer: '4 × 3',
      visualType: 'multiple_choice',
      problemKey: 'commutative-3x4',
      visualData: {
        equation: '3 × 4 = 4 × 3',
        choices: ['4 × 3', '3 × 5', '4 × 4'],
      },
    },
    {
      id: 'commutative-property-2',
      questionText: 'Which equation matches 2 × 6?',
      correctAnswer: '6 × 2',
      visualType: 'multiple_choice',
      problemKey: 'commutative-2x6',
      visualData: {
        equation: '2 × 6 = 6 × 2',
        choices: ['6 × 2', '2 × 5', '6 × 6'],
      },
    },
    {
      id: 'commutative-property-3',
      questionText: 'Which equation matches 5 × 3?',
      correctAnswer: '3 × 5',
      visualType: 'multiple_choice',
      problemKey: 'commutative-5x3',
      visualData: {
        equation: '5 × 3 = 3 × 5',
        choices: ['3 × 5', '5 × 5', '3 × 4'],
      },
    },
  ]
}
