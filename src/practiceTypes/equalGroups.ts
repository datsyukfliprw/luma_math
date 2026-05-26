import type { PracticeProblem } from './types'

export function generateEqualGroupsProblems(): PracticeProblem[] {
  return [
    {
      id: 'equal-groups-1',
      questionText:
        'There are 3 groups with 4 stars in each group. How many stars are there in all?',
      correctAnswer: '12',
      visualType: 'equal_groups',
      problemKey: '3-groups-of-4',
      visualData: {
        groups: 3,
        itemsPerGroup: 4,
        equation: '3 × 4 = 12',
      },
    },
    {
      id: 'equal-groups-2',
      questionText:
        'There are 5 groups with 2 stars in each group. How many stars are there in all?',
      correctAnswer: '10',
      visualType: 'equal_groups',
      problemKey: '5-groups-of-2',
      visualData: {
        groups: 5,
        itemsPerGroup: 2,
        equation: '5 × 2 = 10',
      },
    },
    {
      id: 'equal-groups-3',
      questionText:
        'There are 4 groups with 3 stars in each group. How many stars are there in all?',
      correctAnswer: '12',
      visualType: 'equal_groups',
      problemKey: '4-groups-of-3',
      visualData: {
        groups: 4,
        itemsPerGroup: 3,
        equation: '4 × 3 = 12',
      },
    },
  ]
}
