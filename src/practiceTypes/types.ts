export type PracticeMode = 'guided' | 'independent' | 'challenge'

export type PracticeGenerationOptions = {
  mode?: PracticeMode
  lesson?: {
    lesson_title?: string
    practice_type?: string
    skills?: string[]
    practice_block?: {
      question_count?: number
      type?: string
      instructions?: string
    }
  }
}

export type PracticeProblem = {
  id: string
  questionText: string
  correctAnswer: string
  visualType:
    | 'equal_groups'
    | 'repeated_addition'
    | 'factor_product'
    | 'array_rows_columns'
    | 'multiple_choice'
    | 'fair_sharing'
    | 'mistake_check'
  problemKey: string
  visualData?: {
    groups?: number
    itemsPerGroup?: number
    repeatedAddition?: string
    equation?: string
    factors?: number[]
    product?: number
    rows?: number
    columns?: number
    choices?: string[]
    items?: number
    groupsToShare?: number
  }
  answerData?: {
    factorA?: string
    factorB?: string
    product?: string
    rows?: string
    columns?: string
    quotient?: string
  }
  challengeData?: {
    equationToCheck: string
    judgmentChoices: Array<'yes' | 'no'>
    correctJudgment: 'yes' | 'no'
    reasonChoices: string[]
    correctReason: string
    feedback: string
  }
}
