import { generateArrayRowsColumnsProblems } from "./arrayRowsColumns";
import { generateCommutativePropertyProblems } from "./commutativeProperty";
import { generateDefaultPracticeProblems } from "./default";
import { generateDrawArraysProblems } from "./drawArrays";
import { generateEqualGroupsProblems } from "./equalGroups";
import { generateEqualGroupsWithObjectsProblems } from "./equalGroupsWithObjects";
import { generateEvaluationProblems } from "./evaluation";
import { generateFactorProductProblems } from "./factorProduct";
import { generateFairSharingDivisionProblems } from "./fairSharingDivision";
import { generateRepeatedAdditionProblems } from "./repeatedAddition";
import { generateValidInvalidArraysProblems } from "./validInvalidArrays";
import { generateWeek2EvaluationProblems } from "./week2Evaluation";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type PracticeGenerator = (options?: PracticeGenerationOptions) => PracticeProblem[];

export const practiceRegistry: Record<string, PracticeGenerator> = {
  equal_groups: generateEqualGroupsProblems,
  repeated_addition_to_multiplication: generateRepeatedAdditionProblems,
  factor_product_identification: generateFactorProductProblems,
  equal_groups_with_objects: generateEqualGroupsWithObjectsProblems,

  evaluation: generateEvaluationProblems,
  mixed_evaluation: generateEvaluationProblems,
  week_1_evaluation: generateEvaluationProblems,

  array_rows_columns: generateArrayRowsColumnsProblems,
  commutative_property_matching: generateCommutativePropertyProblems,
  draw_arrays: generateDrawArraysProblems,
  valid_invalid_arrays: generateValidInvalidArraysProblems,
  week_2_evaluation: generateWeek2EvaluationProblems,

  fair_sharing_division: generateFairSharingDivisionProblems,
};

export type RegisteredPracticeType = keyof typeof practiceRegistry;

export function isRegisteredPracticeType(type: string): type is RegisteredPracticeType {
  return Object.prototype.hasOwnProperty.call(practiceRegistry, type);
}

export function generateProblemsForPracticeType(
  practiceType: string,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const generator = practiceRegistry[practiceType];

  if (generator) {
    return generator(options);
  }

  return generateDefaultPracticeProblems(options);
}
