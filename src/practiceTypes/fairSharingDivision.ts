import { takePracticeProblems } from './practiceModeCounts'
import type { PracticeGenerationOptions, PracticeProblem } from './types'

function makeFairSharingProblem({
  id,
  items,
  groupsToShare,
  itemName,
}: {
  id: string
  items: number
  groupsToShare: number
  itemName: string
}): PracticeProblem {
  const quotient = items / groupsToShare

  return {
    id,
    questionText: `Share ${items} ${itemName} equally into ${groupsToShare} groups. How many ${itemName} go in each group?`,
    correctAnswer: String(quotient),
    visualType: 'fair_sharing',
    problemKey: `${items}-shared-into-${groupsToShare}`,
    visualData: {
      items,
      groupsToShare,
      itemsPerGroup: quotient,
      equation: `${items} ÷ ${groupsToShare} = ${quotient}`,
    },
    answerData: {
      quotient: String(quotient),
    },
  }
}

const fairSharingBank = [
  [12, 3, 'apples'],
  [15, 5, 'counters'],
  [8, 2, 'blocks'],
  [10, 5, 'stars'],
  [18, 3, 'tiles'],
  [20, 4, 'coins'],
  [14, 2, 'shells'],
  [16, 4, 'cubes'],
  [24, 6, 'beads'],
  [21, 3, 'tokens'],
  [25, 5, 'stickers'],
  [30, 6, 'crayons'],
] as const

const fairSharingChallengeBank = [
  [24, 4, 'apples'],
  [28, 7, 'counters'],
  [32, 4, 'blocks'],
  [36, 6, 'stars'],
  [30, 5, 'tiles'],
  [40, 8, 'coins'],
  [27, 3, 'shells'],
  [42, 6, 'cubes'],
  [35, 7, 'beads'],
  [48, 8, 'tokens'],
] as const

export function generateFairSharingDivisionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const source =
    options?.mode === 'challenge'
      ? fairSharingChallengeBank
      : fairSharingBank

  return takePracticeProblems(
    source.map(([items, groupsToShare, itemName], index) =>
      makeFairSharingProblem({
        id: `fair-sharing-${options?.mode ?? 'guided'}-${index + 1}`,
        items,
        groupsToShare,
        itemName,
      }),
    ),
    options,
  )
}
