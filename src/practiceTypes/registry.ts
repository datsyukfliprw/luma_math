import { generateEqualGroupsProblems } from './equalGroups'
import { generateFactorProductProblems } from './factorProduct'
import { generateRepeatedAdditionProblems } from './repeatedAddition'
import type { PracticeProblem } from './types'

type PracticeGenerator = () => PracticeProblem[]

const practiceRegistry: Record<string, PracticeGenerator> = {
  equal_groups: generateEqualGroupsProblems,
  repeated_addition_to_multiplication: generateRepeatedAdditionProblems,
  factor_product_identification: generateFactorProductProblems,
}

export function generateProblemsForPracticeType(
  practiceType: string,
): PracticeProblem[] {
  const generator = practiceRegistry[practiceType]

  if (!generator) {
    return []
  }

  return generator()
}
