import { generateEqualGroupsProblems } from './equalGroups'
import { generateFactorProductProblems } from './factorProduct'
import { generateRepeatedAdditionProblems } from './repeatedAddition'
import type { PracticeProblem } from './types'

export function generateEvaluationProblems(): PracticeProblem[] {
  const equalGroups = generateEqualGroupsProblems()
  const repeatedAddition = generateRepeatedAdditionProblems()
  const factorProduct = generateFactorProductProblems()

  return [
    equalGroups[0],
    repeatedAddition[0],
    factorProduct[0],
    equalGroups[1],
    repeatedAddition[1],
    factorProduct[1],
    equalGroups[2],
    repeatedAddition[2],
    factorProduct[2],
  ]
}
