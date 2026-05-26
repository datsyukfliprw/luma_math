import type { PracticeProblem } from './types'

export function generateEqualGroupsWithObjectsProblems(): PracticeProblem[] {
  return [
    {
      id: 'equal-groups-objects-1',
      questionText:
        'You arrange 4 piles of buttons with 3 buttons in each pile. How many buttons are there in all?',
      correctAnswer: '12',
      visualType: 'equal_groups',
      problemKey: '4-piles-of-3-buttons',
      visualData: {
        groups: 4,
        itemsPerGroup: 3,
        equation: '4 × 3 = 12',
      },
    },
    {
      id: 'equal-groups-objects-2',
      questionText:
        'You arrange 3 piles of blocks with 5 blocks in each pile. How many blocks are there in all?',
      correctAnswer: '15',
      visualType: 'equal_groups',
      problemKey: '3-piles-of-5-blocks',
      visualData: {
        groups: 3,
        itemsPerGroup: 5,
        equation: '3 × 5 = 15',
      },
    },
    {
      id: 'equal-groups-objects-3',
      questionText:
        'You arrange 5 piles of counters with 2 counters in each pile. How many counters are there in all?',
      correctAnswer: '10',
      visualType: 'equal_groups',
      problemKey: '5-piles-of-2-counters',
      visualData: {
        groups: 5,
        itemsPerGroup: 2,
        equation: '5 × 2 = 10',
      },
    },
  ]
}
