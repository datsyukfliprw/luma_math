import { describe, expect, it } from "vitest";
import { generateCountEqualGroupsProblems } from "./multiplicationEqualGroups";
import { generateFactorsAndProductsProblems } from "./multiplicationTerms";
import {
  generateBuildArraysProblems,
  generateConnectModelsEquationsStoriesProblems,
  generateDrawMultiplicationProblems,
  generateMultiplicationNumberLineProblems,
  generateTwoEquationsForArrayProblems,
} from "./multiplicationModels";
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
import { isRegisteredPracticeType, practiceRegistry } from "./registry";

describe("multiplication registry wiring", () => {
  it("routes completed multiplication practice types to their exact generators", () => {
    expect(practiceRegistry.count_equal_groups).toBe(generateCountEqualGroupsProblems);
    expect(practiceRegistry.factors_and_products).toBe(generateFactorsAndProductsProblems);
    expect(practiceRegistry.draw_multiplication).toBe(generateDrawMultiplicationProblems);
    expect(practiceRegistry.build_arrays).toBe(generateBuildArraysProblems);
    expect(practiceRegistry.two_equations_for_array).toBe(generateTwoEquationsForArrayProblems);
    expect(practiceRegistry.multiplication_number_line).toBe(
      generateMultiplicationNumberLineProblems,
    );
    expect(practiceRegistry.connect_models_equations_stories).toBe(
      generateConnectModelsEquationsStoriesProblems,
    );
    expect(practiceRegistry.commutative_multiplication).toBe(
      generateCommutativeMultiplicationProblems,
    );
    expect(practiceRegistry.associative_multiplication).toBe(
      generateAssociativeMultiplicationProblems,
    );
    expect(practiceRegistry.mixed_multiplication_facts).toBe(
      generateMixedMultiplicationFactsProblems,
    );
    expect(practiceRegistry.missing_factors).toBe(generateMissingFactorsProblems);
    expect(practiceRegistry.choose_strategy).toBe(generateChooseStrategyProblems);
    expect(practiceRegistry.multiples_of_ten_basic_facts).toBe(
      generateMultiplesOfTenBasicFactsProblems,
    );
    expect(practiceRegistry.one_digit_by_multiples_of_ten).toBe(
      generateOneDigitByMultiplesOfTenProblems,
    );
    expect(practiceRegistry.multiples_of_ten_word_problems).toBe(
      generateMultiplesOfTenWordProblems,
    );
    expect(practiceRegistry.place_value_patterns).toBe(generatePlaceValuePatternsProblems);
  });

  it.each([
    ["multiply_by_3", 3],
    ["multiply_by_4", 4],
    ["multiply_by_6", 6],
    ["multiply_by_7", 7],
    ["multiply_by_8", 8],
    ["multiply_by_9", 9],
  ] as const)("binds %s to the correct fixed factor", (practiceType, fixedFactor) => {
    expect(isRegisteredPracticeType(practiceType)).toBe(true);

    const problems = practiceRegistry[practiceType]({
      count: 2,
      seed: `registry-${practiceType}`,
    });

    expect(problems).toHaveLength(2);
    expect(
      problems.every((problem) => {
        const factorA = Number(problem.answerData?.factorA);
        const factorB = Number(problem.answerData?.factorB);
        return factorA === fixedFactor || factorB === fixedFactor;
      }),
    ).toBe(true);
  });
});
