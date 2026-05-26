import type { PracticeProblem } from './types'

export function generateFairSharingDivisionProblems(): PracticeProblem[] {
  return [
    {
      id: 'fair-sharing-1',
      questionText:
        'Share 12 apples equally into 3 groups. How many apples go in each group?',
      correctAnswer: '4',
      visualType: 'fair_sharing',
      problemKey: '12-shared-into-3',
      visualData: {
        items: 12,
        groupsToShare: 3,
        itemsPerGroup: 4,
        equation: '12 ÷ 3 = 4',
      },
      answerData: {
        quotient: '4',
      },
    },
    {
      id: 'fair-sharing-2',
      questionText:
        'Share 15 counters equally into 5 groups. How many counters go in each group?',
      correctAnswer: '3',
      visualType: 'fair_sharing',
      problemKey: '15-shared-into-5',
      visualData: {
        items: 15,
        groupsToShare: 5,
        itemsPerGroup: 3,
        equation: '15 ÷ 5 = 3',
      },
      answerData: {
        quotient: '3',
      },
    },
    {
      id: 'fair-sharing-3',
      questionText:
        'Share 8 blocks equally into 2 groups. How many blocks go in each group?',
      correctAnswer: '4',
      visualType: 'fair_sharing',
      problemKey: '8-shared-into-2',
      visualData: {
        items: 8,
        groupsToShare: 2,
        itemsPerGroup: 4,
        equation: '8 ÷ 2 = 4',
      },
      answerData: {
        quotient: '4',
      },
    },
  ]
}
