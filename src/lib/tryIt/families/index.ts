import type { TryItFamily } from "../types";
import { multiplicationFoundationsFamily } from "./multiplicationFoundations";
import { additionFamily } from "./addition";
import { subtractionFamily } from "./subtraction";
import { divisionFoundationsFamily } from "./divisionFoundations";
import { placeValueFamily } from "./placeValue";
import { multiplicationFactsFamily } from "./multiplicationFacts";
import { addSubWordProblemsFamily } from "./addSubWordProblems";
import { multDivWordProblemsFamily } from "./multDivWordProblems";
import { fractionsFoundationsFamily } from "./fractionsFoundations";
import { fractionsEquivalenceFamily } from "./fractionsEquivalence";
import { comparingFractionsFamily } from "./comparingFractions";
import { geometryAttributesFamily } from "./geometryAttributes";
import { areaPerimeterFamily } from "./areaPerimeter";
import { dataGraphsFamily } from "./dataGraphs";
import { measurementTimeFamily } from "./measurementTime";
import { genericFamily } from "./genericFamily";

export * from "./multiplicationFoundations";

export const tryItFamilyRegistry: Record<string, TryItFamily> = {
  multiplication_foundations: multiplicationFoundationsFamily,
  addition: additionFamily,
  subtraction: subtractionFamily,
  division_foundations: divisionFoundationsFamily,
  place_value: placeValueFamily,
  multiplication_facts: multiplicationFactsFamily,
  add_sub_word_problems: addSubWordProblemsFamily,
  mult_div_word_problems: multDivWordProblemsFamily,
  fractions_foundations: fractionsFoundationsFamily,
  fractions_equivalence: fractionsEquivalenceFamily,
  comparing_fractions: comparingFractionsFamily,
  geometry_attributes: geometryAttributesFamily,
  area_perimeter: areaPerimeterFamily,
  data_graphs: dataGraphsFamily,
  measurement_time: measurementTimeFamily,
  generic: genericFamily,
};

export function getTryItFamily(family: string): TryItFamily | undefined {
  return tryItFamilyRegistry[family];
}

export function getFamilyForPracticeType(practiceType: string): string {
  // Wave 1 families
  if (practiceType.startsWith("addition_") || practiceType === "missing_digits_properties") {
    return "addition";
  }
  if (practiceType.startsWith("subtraction_") || practiceType === "subtract_across_zeros") {
    return "subtraction";
  }
  if (
    practiceType === "large_digit_value" ||
    practiceType === "reading_large_numbers" ||
    practiceType === "expanded_form_large" ||
    practiceType === "place_value_puzzles" ||
    practiceType.startsWith("round_") ||
    practiceType === "estimate_reasonable" ||
    practiceType === "place_value_digits" ||
    practiceType === "base_ten_models" ||
    practiceType === "expanded_form" ||
    practiceType === "number_words"
  ) {
    return "place_value";
  }

  // Multiplication foundations
  if (
    practiceType === "equal_groups" ||
    practiceType === "repeated_addition_to_multiplication" ||
    practiceType === "factor_product_identification" ||
    practiceType === "equal_groups_with_objects" ||
    practiceType === "count_equal_groups" ||
    practiceType === "factors_and_products" ||
    practiceType === "draw_multiplication" ||
    practiceType === "build_arrays" ||
    practiceType === "two_equations_for_array" ||
    practiceType === "multiplication_number_line" ||
    practiceType === "connect_models_equations_stories"
  ) {
    return "multiplication_foundations";
  }

  // Multiplication facts
  if (
    practiceType.startsWith("multiply_by_") ||
    practiceType.startsWith("divide_by_") ||
    practiceType === "mixed_multiplication_facts" ||
    practiceType === "missing_factors" ||
    practiceType === "choose_strategy" ||
    practiceType.startsWith("multiples_of_ten") ||
    practiceType === "one_digit_by_multiples_of_ten" ||
    practiceType === "place_value_patterns" ||
    practiceType === "commutative_multiplication" ||
    practiceType === "associative_multiplication"
  ) {
    return "multiplication_facts";
  }

  // Division foundations
  if (
    practiceType.startsWith("division_") ||
    practiceType === "fact_families" ||
    practiceType === "multiplication_for_division" ||
    practiceType === "missing_numbers_division" ||
    practiceType === "write_division_equations"
  ) {
    return "division_foundations";
  }

  // Word problems
  if (
    practiceType === "choose_operation" ||
    practiceType === "estimate_then_solve" ||
    practiceType === "one_step_word_problems" ||
    practiceType === "two_step_unknowns" ||
    practiceType === "two_step_measurement_equations" ||
    practiceType === "two_step_mult_div_patterns"
  ) {
    return practiceType.includes("mult") || practiceType.includes("div")
      ? "mult_div_word_problems"
      : "add_sub_word_problems";
  }

  // Multiplication/division word-problem contexts
  if (
    practiceType === "equal_group_array_problems" ||
    practiceType === "strip_models" ||
    practiceType === "equations_with_unknowns"
  ) {
    return "mult_div_word_problems";
  }

  // Fractions
  if (
    practiceType === "equal_unequal_parts" ||
    practiceType === "halves_thirds_fourths" ||
    practiceType === "sixths_eighths" ||
    practiceType === "name_unit_fractions" ||
    practiceType === "numerator_meaning" ||
    practiceType === "denominator_meaning" ||
    practiceType === "fraction_bars" ||
    practiceType === "area_models_and_stories"
  ) {
    return "fractions_foundations";
  }
  if (
    practiceType === "zero_to_one_interval" ||
    practiceType === "partition_number_lines" ||
    practiceType.startsWith("locate_") ||
    practiceType === "equivalence_same_amount" ||
    practiceType === "fraction_strips_equivalence" ||
    practiceType === "area_models_equivalence" ||
    practiceType === "generate_explain_equivalent" ||
    practiceType === "same_location_number_line" ||
    practiceType === "find_equivalents_number_line" ||
    practiceType === "graph_equivalent_fractions" ||
    practiceType === "connect_models_number_lines_equations"
  ) {
    return "fractions_equivalence";
  }
  if (
    practiceType.startsWith("compare_") ||
    practiceType === "use_comparison_symbols" ||
    practiceType.startsWith("comparison_") ||
    practiceType === "same_whole_fractions"
  ) {
    return "comparing_fractions";
  }

  // Geometry
  if (
    practiceType === "sides_and_vertices" ||
    practiceType === "parallel_sides_quadrilaterals" ||
    practiceType === "classify_squares_rectangles_rhombuses" ||
    practiceType === "parallelograms_trapezoids"
  ) {
    return "geometry_attributes";
  }

  // Area & perimeter
  if (
    practiceType.startsWith("area_") ||
    practiceType.startsWith("perimeter_") ||
    practiceType === "cover_with_unit_squares" ||
    practiceType === "count_and_label_area" ||
    practiceType === "hidden_squares_area" ||
    practiceType === "tile_rectangles" ||
    practiceType === "rows_columns_multiplication" ||
    practiceType === "create_rectangles_area" ||
    practiceType === "different_arrangements_same_area" ||
    practiceType === "missing_side_length" ||
    practiceType === "distributive_property_area" ||
    practiceType === "same_perimeter_different_area" ||
    practiceType === "same_area_different_perimeter" ||
    practiceType === "missing_side_perimeter" ||
    practiceType === "find_area_perimeter_missing_side"
  ) {
    return "area_perimeter";
  }

  // Data & graphs
  if (
    practiceType === "read_picture_graphs" ||
    practiceType === "create_picture_graphs" ||
    practiceType === "read_bar_graphs" ||
    practiceType === "create_graphs_solve_problems" ||
    practiceType === "line_plots"
  ) {
    return "data_graphs";
  }

  // Measurement & time
  if (
    practiceType === "customary_length_units" ||
    practiceType === "quarter_inch_measurement" ||
    practiceType === "choose_weight_mass_volume_units" ||
    practiceType === "read_analog_clocks" ||
    practiceType === "match_time_formats" ||
    practiceType === "estimate_time_intervals" ||
    practiceType === "elapsed_time" ||
    practiceType === "measurement_problems" ||
    practiceType === "mixed_measurement_problems" ||
    practiceType === "estimate_reasonableness"
  ) {
    return "measurement_time";
  }

  return "generic";
}
