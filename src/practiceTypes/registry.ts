import { generateArrayRowsColumnsProblems } from './arrayRowsColumns'
import { generateEqualGroupsProblems } from './equalGroups'
import { generateEqualGroupsWithObjectsProblems } from './equalGroupsWithObjects'
import { generateEvaluationProblems } from './evaluation'
import { generateFactorProductProblems } from './factorProduct'
import { generateRepeatedAdditionProblems } from './repeatedAddition'
import type { PracticeProblem } from './types'

type PracticeGenerator = () => PracticeProblem[]

const practiceRegistry: Record<string, PracticeGenerator> = {
  equal_groups: generateEqualGroupsProblems,
  repeated_addition_to_multiplication: generateRepeatedAdditionProblems,
  factor_product_identification: generateFactorProductProblems,
  equal_groups_with_objects: generateEqualGroupsWithObjectsProblems,
  evaluation: generateEvaluationProblems,
  array_rows_columns: generateArrayRowsColumnsProblems,
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
