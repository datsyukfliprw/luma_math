import type { PracticeProblem } from './types'

export function generateRepeatedAdditionProblems(): PracticeProblem[] {
  return [
    {
      id: 'repeated-addition-1',
      questionText:
        'Write the multiplication sentence for 5 + 5 + 5 = 15.',
      correctAnswer: '3x5',
      visualType: 'repeated_addition',
      problemKey: '3-groups-of-5',
    },
    {
      id: 'repeated-addition-2',
      questionText:
        'Write the multiplication sentence for 4 + 4 + 4 + 4 = 16.',
      correctAnswer: '4x4',
      visualType: 'repeated_addition',
      problemKey: '4-groups-of-4',
    },
    {
      id: 'repeated-addition-3',
      questionText:
        'Write the multiplication sentence for 2 + 2 + 2 + 2 + 2 = 10.',
      correctAnswer: '5x2',
      visualType: 'repeated_addition',
      problemKey: '5-groups-of-2',
    },
  ]
}
