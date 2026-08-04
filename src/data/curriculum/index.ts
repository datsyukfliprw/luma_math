import grade3Unit1Data from "./grade_3/unit_01_multiplication_foundations.json";
import grade3Unit2Data from "./grade_3/unit_02_numbers_through_100000.json";
import grade3Unit3Data from "./grade_3/unit_03_rounding_and_estimation.json";
import grade3Unit4Data from "./grade_3/unit_04_addition_strategies.json";
import grade3Unit5Data from "./grade_3/unit_05_addition_with_regrouping.json";
import grade3Unit6Data from "./grade_3/unit_06_subtraction_strategies.json";
import grade3Unit7Data from "./grade_3/unit_07_subtraction_with_regrouping.json";
import grade3Unit8Data from "./grade_3/unit_08_addition_subtraction_problem_solving.json";
import grade3Unit9Data from "./grade_3/unit_09_equal_groups.json";
import grade3Unit10Data from "./grade_3/unit_10_arrays_and_number_lines.json";
import grade3Unit11Data from "./grade_3/unit_11_place_value_foundations.json";
import grade3Unit12Data from "./grade_3/unit_12_multiplying_by_3_and_4.json";
import grade3Unit13Data from "./grade_3/unit_13_understanding_division.json";
import grade3Unit14Data from "./grade_3/unit_14_connecting_multiplication_and_division.json";
import grade3Unit15Data from "./grade_3/unit_15_facts_for_6_and_7.json";
import grade3Unit16Data from "./grade_3/unit_16_facts_for_8_and_9.json";
import grade3Unit17Data from "./grade_3/unit_17_multiplication_and_division_fluency.json";
import grade3Unit18Data from "./grade_3/unit_18_multiplication_and_division_problems.json";
import grade3Unit19Data from "./grade_3/unit_19_multiplying_by_multiples_of_ten.json";
import grade3Unit20Data from "./grade_3/unit_20_understanding_area.json";
import grade3Unit21Data from "./grade_3/unit_21_area_and_multiplication.json";
import grade3Unit22Data from "./grade_3/unit_22_area_arrangements_and_decomposition.json";
import grade3Unit23Data from "./grade_3/unit_23_understanding_perimeter.json";
import grade3Unit24Data from "./grade_3/unit_24_area_and_perimeter_relationships.json";
import grade3Unit25Data from "./grade_3/unit_25_picture_graphs_and_bar_graphs.json";
import grade3Unit26Data from "./grade_3/unit_26_equal_parts_and_unit_fractions.json";
import grade3Unit27Data from "./grade_3/unit_27_numerators_and_denominators.json";
import grade3Unit28Data from "./grade_3/unit_28_fractions_on_number_lines.json";
import grade3Unit29Data from "./grade_3/unit_29_equivalent_fractions_with_models.json";
import grade3Unit30Data from "./grade_3/unit_30_equivalent_fractions_on_number_lines.json";
import grade3Unit31Data from "./grade_3/unit_31_comparing_fractions_with_like_denominators.json";
import grade3Unit32Data from "./grade_3/unit_32_comparing_fractions_with_like_numerators.json";
import grade3Unit33Data from "./grade_3/unit_33_shapes_and_quadrilaterals.json";
import grade3Unit34Data from "./grade_3/unit_34_measurement_and_line_plots.json";
import grade3Unit35Data from "./grade_3/unit_35_time_and_elapsed_time.json";
import grade3Unit36Data from "./grade_3/unit_36_measurement_and_four_operation_problem_solving.json";
import {
  getCurriculum,
  getCurriculumByKey,
  getAllCurricula,
  getCurriculumKeys,
  hasCurriculum,
  registerCurriculum,
} from "./curriculumRegistry";
import { validateCurriculum } from "./validateCurriculum";

// Validate and register the Grade 3 curriculum units
const grade3Unit1 = validateCurriculum(grade3Unit1Data);
const grade3Unit2 = validateCurriculum(grade3Unit2Data);
const grade3Unit3 = validateCurriculum(grade3Unit3Data);
const grade3Unit4 = validateCurriculum(grade3Unit4Data);
const grade3Unit5 = validateCurriculum(grade3Unit5Data);
const grade3Unit6 = validateCurriculum(grade3Unit6Data);
const grade3Unit7 = validateCurriculum(grade3Unit7Data);
const grade3Unit8 = validateCurriculum(grade3Unit8Data);
const grade3Unit9 = validateCurriculum(grade3Unit9Data);
const grade3Unit10 = validateCurriculum(grade3Unit10Data);
const grade3Unit11 = validateCurriculum(grade3Unit11Data);
const grade3Unit12 = validateCurriculum(grade3Unit12Data);
const grade3Unit13 = validateCurriculum(grade3Unit13Data);
const grade3Unit14 = validateCurriculum(grade3Unit14Data);
const grade3Unit15 = validateCurriculum(grade3Unit15Data);
const grade3Unit16 = validateCurriculum(grade3Unit16Data);
const grade3Unit17 = validateCurriculum(grade3Unit17Data);
const grade3Unit18 = validateCurriculum(grade3Unit18Data);
const grade3Unit19 = validateCurriculum(grade3Unit19Data);
const grade3Unit20 = validateCurriculum(grade3Unit20Data);
const grade3Unit21 = validateCurriculum(grade3Unit21Data);
const grade3Unit22 = validateCurriculum(grade3Unit22Data);
const grade3Unit23 = validateCurriculum(grade3Unit23Data);
const grade3Unit24 = validateCurriculum(grade3Unit24Data);
const grade3Unit25 = validateCurriculum(grade3Unit25Data);
const grade3Unit26 = validateCurriculum(grade3Unit26Data);
const grade3Unit27 = validateCurriculum(grade3Unit27Data);
const grade3Unit28 = validateCurriculum(grade3Unit28Data);
const grade3Unit29 = validateCurriculum(grade3Unit29Data);
const grade3Unit30 = validateCurriculum(grade3Unit30Data);
const grade3Unit31 = validateCurriculum(grade3Unit31Data);
const grade3Unit32 = validateCurriculum(grade3Unit32Data);
const grade3Unit33 = validateCurriculum(grade3Unit33Data);
const grade3Unit34 = validateCurriculum(grade3Unit34Data);
const grade3Unit35 = validateCurriculum(grade3Unit35Data);
const grade3Unit36 = validateCurriculum(grade3Unit36Data);
registerCurriculum(3, 1, grade3Unit1);
registerCurriculum(3, 2, grade3Unit2);
registerCurriculum(3, 3, grade3Unit3);
registerCurriculum(3, 4, grade3Unit4);
registerCurriculum(3, 5, grade3Unit5);
registerCurriculum(3, 6, grade3Unit6);
registerCurriculum(3, 7, grade3Unit7);
registerCurriculum(3, 8, grade3Unit8);
registerCurriculum(3, 9, grade3Unit9);
registerCurriculum(3, 10, grade3Unit10);
registerCurriculum(3, 11, grade3Unit11);
registerCurriculum(3, 12, grade3Unit12);
registerCurriculum(3, 13, grade3Unit13);
registerCurriculum(3, 14, grade3Unit14);
registerCurriculum(3, 15, grade3Unit15);
registerCurriculum(3, 16, grade3Unit16);
registerCurriculum(3, 17, grade3Unit17);
registerCurriculum(3, 18, grade3Unit18);
registerCurriculum(3, 19, grade3Unit19);
registerCurriculum(3, 20, grade3Unit20);
registerCurriculum(3, 21, grade3Unit21);
registerCurriculum(3, 22, grade3Unit22);
registerCurriculum(3, 23, grade3Unit23);
registerCurriculum(3, 24, grade3Unit24);
registerCurriculum(3, 25, grade3Unit25);
registerCurriculum(3, 26, grade3Unit26);
registerCurriculum(3, 27, grade3Unit27);
registerCurriculum(3, 28, grade3Unit28);
registerCurriculum(3, 29, grade3Unit29);
registerCurriculum(3, 30, grade3Unit30);
registerCurriculum(3, 31, grade3Unit31);
registerCurriculum(3, 32, grade3Unit32);
registerCurriculum(3, 33, grade3Unit33);
registerCurriculum(3, 34, grade3Unit34);
registerCurriculum(3, 35, grade3Unit35);
registerCurriculum(3, 36, grade3Unit36);

export { grade3Unit1 as curriculum };
export {
  getCurriculum,
  getCurriculumByKey,
  getAllCurricula,
  getCurriculumKeys,
  hasCurriculum,
  registerCurriculum,
};
export { isInstructionalLessonAvailable } from "./curriculumSchema";
export type { Curriculum, Lesson, Week } from "./curriculumSchema";
