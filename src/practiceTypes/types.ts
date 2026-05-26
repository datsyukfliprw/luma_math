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
  }
  answerData?: {
    factorA?: string
    factorB?: string
    product?: string
    rows?: string
    columns?: string
  }
}
