import { generateAdditionProblems } from "./addition";
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
import { generateSubtractionProblems } from "./subtraction";
import { generateValidInvalidArraysProblems } from "./validInvalidArrays";
import { generateWeek2EvaluationProblems } from "./week2Evaluation";
import { generatePlaceValueDigitsProblems } from "./placeValueDigits";
import { generateRoundingProblems } from "./rounding";
import { generateLargeDigitValueProblems } from "./largeDigitValue";
import { generateNumberWordsProblems } from "./numberWords";
import { generateExpandedFormProblems } from "./expandedForm";
import {
  generateBaseTenModelsProblems,
  generatePlaceValuePuzzlesProblems,
} from "./placeValueComposition";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type PracticeGenerator = (options?: PracticeGenerationOptions) => PracticeProblem[];

export const practiceRegistry: Record<string, PracticeGenerator> = {
  addition_number_line: generateAdditionProblems,
  addition_expanded_form: generateAdditionProblems,
  addition_compensation: generateAdditionProblems,
  addition_no_regroup: generateAdditionProblems,
  addition_regroup_ones: generateAdditionProblems,
  addition_regroup_tens: generateAdditionProblems,
  addition_three_numbers: generateAdditionProblems,
  missing_digits_properties: generateAdditionProblems,

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

  subtraction_number_line: generateSubtractionProblems,
  subtraction_expanded_form: generateSubtractionProblems,
  subtraction_compensation: generateSubtractionProblems,
  subtraction_no_regroup: generateSubtractionProblems,
  subtraction_regroup_ones: generateSubtractionProblems,
  subtraction_regroup_tens: generateSubtractionProblems,
  subtract_across_zeros: generateSubtractionProblems,
  subtraction_missing_digits: generateSubtractionProblems,

  place_value_digits: generatePlaceValueDigitsProblems,
  round_ten: generateRoundingProblems,
  round_hundred: generateRoundingProblems,
  round_place_value: generateRoundingProblems,
  estimate_reasonable: generateRoundingProblems,

  large_digit_value: generateLargeDigitValueProblems,
  reading_large_numbers: generateNumberWordsProblems,
  number_words: generateNumberWordsProblems,
  expanded_form: generateExpandedFormProblems,
  expanded_form_large: generateExpandedFormProblems,
  base_ten_models: generateBaseTenModelsProblems,
  place_value_puzzles: generatePlaceValuePuzzlesProblems,
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
