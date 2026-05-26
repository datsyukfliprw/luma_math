export type PracticeProblem = {
  id: string
  questionText: string
  correctAnswer: string
  visualType: 'equal_groups' | 'repeated_addition' | 'factor_product'
  problemKey: string
  visualData?: {
    groups?: number
    itemsPerGroup?: number
    repeatedAddition?: string
    equation?: string
    factors?: number[]
    product?: number
  }
}
