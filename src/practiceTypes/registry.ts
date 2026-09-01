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
import { generateCountEqualGroupsProblems } from "./multiplicationEqualGroups";
import { generateFactorsAndProductsProblems } from "./multiplicationTerms";
import {
  generateBuildArraysProblems,
  generateConnectModelsEquationsStoriesProblems,
  generateDrawMultiplicationProblems,
  generateMultiplicationNumberLineProblems,
  generateTwoEquationsForArrayProblems,
} from "./multiplicationModels";
import { generateFixedFactorFactFluencyProblems } from "./multiplicationFactFluency";
import {
  generateAssociativeMultiplicationProblems,
  generateCommutativeMultiplicationProblems,
} from "./multiplicationProperties";
import { generateMixedMultiplicationFactsProblems } from "./mixedMultiplicationFacts";
import { generateMissingFactorsProblems } from "./multiplicationMissingFactors";
import { generateChooseStrategyProblems } from "./multiplicationStrategy";
import {
  generateMultiplesOfTenBasicFactsProblems,
  generateMultiplesOfTenWordProblems,
  generateOneDigitByMultiplesOfTenProblems,
  generatePlaceValuePatternsProblems,
} from "./multiplesOfTen";
import {
  generateDivideBy6Problems,
  generateDivideBy7Problems,
  generateDivideBy8Problems,
  generateDivideBy9Problems,
  generateDivisionArraysProblems,
  generateDivisionCountingGroupsProblems,
  generateDivisionNumberLineProblems,
  generateDivisionSharingProblems,
  generateDivisionWithOneAndZeroProblems,
  generateFactFamiliesProblems,
  generateMissingNumbersDivisionProblems,
  generateMultiplicationForDivisionProblems,
  generateWriteDivisionEquationsProblems,
} from "./division";
import {
  generateChooseOperationProblems,
  generateEstimateThenSolveProblems,
  generateOneStepWordProblems,
  generateTwoStepMeasurementEquationProblems,
  generateTwoStepUnknownProblems,
} from "./addSubWordProblems";
import {
  generateEqualGroupArrayProblems,
  generateEquationsWithUnknownsProblems,
  generateStripModelProblems,
  generateTwoStepMultDivPatternProblems,
} from "./multDivWordProblems";
import {
  FRACTION_FOUNDATIONS_PRACTICE_TYPES,
  generateFractionFoundationsProblems,
} from "./fractionsFoundations";
import {
  FRACTION_EQUIVALENCE_PRACTICE_TYPES,
  generateFractionEquivalenceProblems,
} from "./fractionsEquivalence";
import {
  COMPARING_FRACTIONS_PRACTICE_TYPES,
  generateComparingFractionsProblems,
} from "./comparingFractions";
import { AREA_PERIMETER_PRACTICE_TYPES, generateAreaPerimeterProblems } from "./areaPerimeter";
import { DATA_GRAPH_PRACTICE_TYPES, generateDataGraphProblems } from "./dataGraphs";
import { GEOMETRY_PRACTICE_TYPES, generateGeometryProblems } from "./geometryShapes";
import {
  MEASUREMENT_TIME_PRACTICE_TYPES,
  generateMeasurementTimeProblems,
} from "./measurementTime";
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
  count_equal_groups: generateCountEqualGroupsProblems,
  factors_and_products: generateFactorsAndProductsProblems,
  draw_multiplication: generateDrawMultiplicationProblems,
  build_arrays: generateBuildArraysProblems,
  two_equations_for_array: generateTwoEquationsForArrayProblems,
  multiplication_number_line: generateMultiplicationNumberLineProblems,
  connect_models_equations_stories: generateConnectModelsEquationsStoriesProblems,

  multiply_by_3: (options) => generateFixedFactorFactFluencyProblems("multiply_by_3", options),
  multiply_by_4: (options) => generateFixedFactorFactFluencyProblems("multiply_by_4", options),
  commutative_multiplication: generateCommutativeMultiplicationProblems,
  associative_multiplication: generateAssociativeMultiplicationProblems,
  multiply_by_6: (options) => generateFixedFactorFactFluencyProblems("multiply_by_6", options),
  multiply_by_7: (options) => generateFixedFactorFactFluencyProblems("multiply_by_7", options),
  multiply_by_8: (options) => generateFixedFactorFactFluencyProblems("multiply_by_8", options),
  multiply_by_9: (options) => generateFixedFactorFactFluencyProblems("multiply_by_9", options),
  mixed_multiplication_facts: generateMixedMultiplicationFactsProblems,
  missing_factors: generateMissingFactorsProblems,
  choose_strategy: generateChooseStrategyProblems,
  multiples_of_ten_basic_facts: generateMultiplesOfTenBasicFactsProblems,
  one_digit_by_multiples_of_ten: generateOneDigitByMultiplesOfTenProblems,
  multiples_of_ten_word_problems: generateMultiplesOfTenWordProblems,
  place_value_patterns: generatePlaceValuePatternsProblems,

  evaluation: generateEvaluationProblems,
  mixed_evaluation: generateEvaluationProblems,
  week_1_evaluation: generateEvaluationProblems,

  array_rows_columns: generateArrayRowsColumnsProblems,
  commutative_property_matching: generateCommutativePropertyProblems,
  draw_arrays: generateDrawArraysProblems,
  valid_invalid_arrays: generateValidInvalidArraysProblems,
  week_2_evaluation: generateWeek2EvaluationProblems,

  fair_sharing_division: generateFairSharingDivisionProblems,
  division_sharing: generateDivisionSharingProblems,
  division_counting_groups: generateDivisionCountingGroupsProblems,
  write_division_equations: generateWriteDivisionEquationsProblems,
  division_with_1_and_0: generateDivisionWithOneAndZeroProblems,
  division_arrays: generateDivisionArraysProblems,
  division_number_line: generateDivisionNumberLineProblems,
  fact_families: generateFactFamiliesProblems,
  multiplication_for_division: generateMultiplicationForDivisionProblems,
  divide_by_6: generateDivideBy6Problems,
  divide_by_7: generateDivideBy7Problems,
  divide_by_8: generateDivideBy8Problems,
  divide_by_9: generateDivideBy9Problems,
  missing_numbers_division: generateMissingNumbersDivisionProblems,


  choose_operation: generateChooseOperationProblems,
  estimate_then_solve: generateEstimateThenSolveProblems,
  one_step_word_problems: generateOneStepWordProblems,
  two_step_unknowns: generateTwoStepUnknownProblems,
  two_step_measurement_equations: generateTwoStepMeasurementEquationProblems,

  equal_group_array_problems: generateEqualGroupArrayProblems,
  strip_models: generateStripModelProblems,
  equations_with_unknowns: generateEquationsWithUnknownsProblems,
  two_step_mult_div_patterns: generateTwoStepMultDivPatternProblems,

  ...Object.fromEntries(
    FRACTION_FOUNDATIONS_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateFractionFoundationsProblems(practiceType, options),
    ]),
  ),
  ...Object.fromEntries(
    FRACTION_EQUIVALENCE_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateFractionEquivalenceProblems(practiceType, options),
    ]),
  ),
  ...Object.fromEntries(
    COMPARING_FRACTIONS_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateComparingFractionsProblems(practiceType, options),
    ]),
  ),

  ...Object.fromEntries(
    AREA_PERIMETER_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateAreaPerimeterProblems(practiceType, options),
    ]),
  ),
  ...Object.fromEntries(
    DATA_GRAPH_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateDataGraphProblems(practiceType, options),
    ]),
  ),
  ...Object.fromEntries(
    GEOMETRY_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateGeometryProblems(practiceType, options),
    ]),
  ),
  ...Object.fromEntries(
    MEASUREMENT_TIME_PRACTICE_TYPES.map((practiceType) => [
      practiceType,
      (options?: PracticeGenerationOptions) => generateMeasurementTimeProblems(practiceType, options),
    ]),
  ),

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
