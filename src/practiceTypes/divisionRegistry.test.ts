import { describe, expect, it } from "vitest";
import {
  DIVISION_PRACTICE_TYPES,
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
import { isRegisteredPracticeType, practiceRegistry } from "./registry";

describe("division registry wiring", () => {
  it("routes every Division Foundations practice type to its exact generator", () => {
    expect(practiceRegistry.division_sharing).toBe(generateDivisionSharingProblems);
    expect(practiceRegistry.division_counting_groups).toBe(generateDivisionCountingGroupsProblems);
    expect(practiceRegistry.write_division_equations).toBe(generateWriteDivisionEquationsProblems);
    expect(practiceRegistry.division_with_1_and_0).toBe(generateDivisionWithOneAndZeroProblems);
    expect(practiceRegistry.division_arrays).toBe(generateDivisionArraysProblems);
    expect(practiceRegistry.division_number_line).toBe(generateDivisionNumberLineProblems);
    expect(practiceRegistry.fact_families).toBe(generateFactFamiliesProblems);
    expect(practiceRegistry.multiplication_for_division).toBe(generateMultiplicationForDivisionProblems);
    expect(practiceRegistry.divide_by_6).toBe(generateDivideBy6Problems);
    expect(practiceRegistry.divide_by_7).toBe(generateDivideBy7Problems);
    expect(practiceRegistry.divide_by_8).toBe(generateDivideBy8Problems);
    expect(practiceRegistry.divide_by_9).toBe(generateDivideBy9Problems);
    expect(practiceRegistry.missing_numbers_division).toBe(generateMissingNumbersDivisionProblems);
  });

  it("registers all 13 division practice types without fallback", () => {
    expect(DIVISION_PRACTICE_TYPES).toHaveLength(13);
    for (const practiceType of DIVISION_PRACTICE_TYPES) {
      expect(isRegisteredPracticeType(practiceType)).toBe(true);
    }
  });
});
