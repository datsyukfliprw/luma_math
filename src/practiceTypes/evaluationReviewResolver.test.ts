import { describe, it, expect } from "vitest";
import {
  resolveEvaluationReviewSource,
  evaluationReviewTypeAliases,
} from "./evaluationReviewResolver";
import { EvaluationGenerationError } from "./evaluationError";
import { practiceRegistry } from "./registry";
import { generateLargeDigitValueProblems } from "./largeDigitValue";
import { generateNumberWordsProblems } from "./numberWords";
import { generateExpandedFormProblems } from "./expandedForm";
import {
  generateBaseTenModelsProblems,
  generatePlaceValuePuzzlesProblems,
} from "./placeValueComposition";

describe("resolveEvaluationReviewSource", () => {
  it("routes the three place-value practice types to their approved generators", () => {
    expect(practiceRegistry.large_digit_value).toBe(generateLargeDigitValueProblems);
    expect(practiceRegistry.reading_large_numbers).toBe(generateNumberWordsProblems);
    expect(practiceRegistry.number_words).toBe(generateNumberWordsProblems);
  });

  it("routes the approved place-value practice types to their intended generators", () => {
    expect(practiceRegistry.expanded_form).toBe(generateExpandedFormProblems);
    expect(practiceRegistry.expanded_form_large).toBe(generateExpandedFormProblems);
    expect(practiceRegistry.base_ten_models).toBe(generateBaseTenModelsProblems);
    expect(practiceRegistry.place_value_puzzles).toBe(generatePlaceValuePuzzlesProblems);
  });

  it("resolves an exact registered review type to a specialized generator", () => {
    const source = resolveEvaluationReviewSource("g3-u1-w1-eval", "equal_groups");
    expect(source.reviewType).toBe("equal_groups");
    expect(source.generatorPracticeType).toBe("equal_groups");
    expect(source.resolution).toBe("specialized");
    expect(source.sourceLesson.lesson_id).toBe("g3-u1-w1-l1");
  });

  it("resolves a newly registered multiplication review type directly", () => {
    const source = resolveEvaluationReviewSource("g3-u9-w1-eval", "factors_and_products");
    expect(source.reviewType).toBe("factors_and_products");
    expect(source.generatorPracticeType).toBe("factors_and_products");
    expect(source.resolution).toBe("specialized");
    expect(source.sourceLesson.lesson_id).toBe("g3-u9-w1-l3");
  });

  it.each([
    ["large_digit_value", "g3-u2-w1-eval", "g3-u2-w1-l1"],
    ["reading_large_numbers", "g3-u2-w1-eval", "g3-u2-w1-l2"],
    ["number_words", "g3-u11-w1-eval", "g3-u11-w1-l4"],
  ])(
    "resolves newly registered review type %s through its specialized generator",
    (reviewType, evaluationLessonId, sourceLessonId) => {
      const source = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
      expect(source.reviewType).toBe(reviewType);
      expect(source.generatorPracticeType).toBe(reviewType);
      expect(source.resolution).toBe("specialized");
      expect(source.sourceLesson.lesson_id).toBe(sourceLessonId);
    },
  );

  it.each([
    ["expanded_form_large", "g3-u2-w1-eval", "g3-u2-w1-l3"],
    ["place_value_puzzles", "g3-u2-w1-eval", "g3-u2-w1-l4"],
    ["base_ten_models", "g3-u11-w1-eval", "g3-u11-w1-l2"],
    ["expanded_form", "g3-u11-w1-eval", "g3-u11-w1-l3"],
  ])(
    "resolves approved place-value review type %s through its specialized generator",
    (reviewType, evaluationLessonId, sourceLessonId) => {
      const source = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
      expect(source.reviewType).toBe(reviewType);
      expect(source.generatorPracticeType).toBe(reviewType);
      expect(source.resolution).toBe("specialized");
      expect(source.sourceLesson.lesson_id).toBe(sourceLessonId);
    },
  );

  it.each([
    ["division_sharing", "g3-u13-w1-eval", "g3-u13-w1-l1"],
    ["division_counting_groups", "g3-u13-w1-eval", "g3-u13-w1-l2"],
    ["write_division_equations", "g3-u13-w1-eval", "g3-u13-w1-l3"],
    ["division_with_1_and_0", "g3-u13-w1-eval", "g3-u13-w1-l4"],
    ["division_arrays", "g3-u14-w1-eval", "g3-u14-w1-l1"],
    ["division_number_line", "g3-u14-w1-eval", "g3-u14-w1-l2"],
    ["fact_families", "g3-u14-w1-eval", "g3-u14-w1-l3"],
    ["multiplication_for_division", "g3-u14-w1-eval", "g3-u14-w1-l4"],
    ["divide_by_6", "g3-u15-w1-eval", "g3-u15-w1-l2"],
    ["divide_by_7", "g3-u15-w1-eval", "g3-u15-w1-l4"],
    ["divide_by_8", "g3-u16-w1-eval", "g3-u16-w1-l2"],
    ["divide_by_9", "g3-u16-w1-eval", "g3-u16-w1-l4"],
    ["missing_numbers_division", "g3-u17-w1-eval", "g3-u17-w1-l3"],
  ])(
    "resolves division review type %s through its exact specialized generator",
    (reviewType, evaluationLessonId, sourceLessonId) => {
      const source = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
      expect(source.reviewType).toBe(reviewType);
      expect(source.generatorPracticeType).toBe(reviewType);
      expect(source.resolution).toBe("specialized");
      expect(source.sourceLesson.lesson_id).toBe(sourceLessonId);
    },
  );


  it.each([
    ["choose_operation", "g3-u8-w1-eval", "g3-u8-w1-l1"],
    ["estimate_then_solve", "g3-u8-w1-eval", "g3-u8-w1-l2"],
    ["one_step_word_problems", "g3-u8-w1-eval", "g3-u8-w1-l3"],
    ["two_step_unknowns", "g3-u8-w1-eval", "g3-u8-w1-l4"],
    ["equal_group_array_problems", "g3-u18-w1-eval", "g3-u18-w1-l1"],
    ["strip_models", "g3-u18-w1-eval", "g3-u18-w1-l2"],
    ["equations_with_unknowns", "g3-u18-w1-eval", "g3-u18-w1-l3"],
    ["two_step_mult_div_patterns", "g3-u18-w1-eval", "g3-u18-w1-l4"],
    ["two_step_measurement_equations", "g3-u36-w1-eval", "g3-u36-w1-l3"],
  ])(
    "resolves word-problem review type %s through its exact specialized generator",
    (reviewType, evaluationLessonId, sourceLessonId) => {
      const source = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
      expect(source.reviewType).toBe(reviewType);
      expect(source.generatorPracticeType).toBe(reviewType);
      expect(source.resolution).toBe("specialized");
      expect(source.sourceLesson.lesson_id).toBe(sourceLessonId);
    },
  );

  it.each([
    ["equal_unequal_parts", "g3-u26-w1-eval", "g3-u26-w1-l1"],
    ["halves_thirds_fourths", "g3-u26-w1-eval", "g3-u26-w1-l2"],
    ["sixths_eighths", "g3-u26-w1-eval", "g3-u26-w1-l3"],
    ["name_unit_fractions", "g3-u26-w1-eval", "g3-u26-w1-l4"],
    ["numerator_meaning", "g3-u27-w1-eval", "g3-u27-w1-l1"],
    ["denominator_meaning", "g3-u27-w1-eval", "g3-u27-w1-l2"],
    ["fraction_bars", "g3-u27-w1-eval", "g3-u27-w1-l3"],
    ["area_models_and_stories", "g3-u27-w1-eval", "g3-u27-w1-l4"],
    ["zero_to_one_interval", "g3-u28-w1-eval", "g3-u28-w1-l1"],
    ["partition_number_lines", "g3-u28-w1-eval", "g3-u28-w1-l2"],
    ["locate_unit_fractions_number_line", "g3-u28-w1-eval", "g3-u28-w1-l3"],
    ["locate_non_unit_fractions_number_line", "g3-u28-w1-eval", "g3-u28-w1-l4"],
    ["equivalence_same_amount", "g3-u29-w1-eval", "g3-u29-w1-l1"],
    ["fraction_strips_equivalence", "g3-u29-w1-eval", "g3-u29-w1-l2"],
    ["area_models_equivalence", "g3-u29-w1-eval", "g3-u29-w1-l3"],
    ["generate_explain_equivalent", "g3-u29-w1-eval", "g3-u29-w1-l4"],
    ["same_location_number_line", "g3-u30-w1-eval", "g3-u30-w1-l1"],
    ["find_equivalents_number_line", "g3-u30-w1-eval", "g3-u30-w1-l2"],
    ["graph_equivalent_fractions", "g3-u30-w1-eval", "g3-u30-w1-l3"],
    ["connect_models_number_lines_equations", "g3-u30-w1-eval", "g3-u30-w1-l4"],
    ["compare_like_denominators_models", "g3-u31-w1-eval", "g3-u31-w1-l1"],
    ["compare_like_denominators_number_line", "g3-u31-w1-eval", "g3-u31-w1-l2"],
    ["use_comparison_symbols", "g3-u31-w1-eval", "g3-u31-w1-l3"],
    ["comparison_word_problems_like_denominators", "g3-u31-w1-eval", "g3-u31-w1-l4"],
    ["compare_like_numerators_models", "g3-u32-w1-eval", "g3-u32-w1-l1"],
    ["compare_like_numerators_number_line", "g3-u32-w1-eval", "g3-u32-w1-l2"],
    ["same_whole_fractions", "g3-u32-w1-eval", "g3-u32-w1-l3"],
    ["compare_explain_fractions", "g3-u32-w1-eval", "g3-u32-w1-l4"],
  ])(
    "resolves fraction review type %s through its exact specialized generator",
    (reviewType, evaluationLessonId, sourceLessonId) => {
      const source = resolveEvaluationReviewSource(evaluationLessonId, reviewType);
      expect(source.reviewType).toBe(reviewType);
      expect(source.generatorPracticeType).toBe(reviewType);
      expect(source.resolution).toBe("specialized");
      expect(source.sourceLesson.lesson_id).toBe(sourceLessonId);
    },
  );

  it("no longer aliases division_sharing through the legacy fair-sharing generator", () => {
    expect(evaluationReviewTypeAliases.division_sharing).toBeUndefined();
  });

  it("finds a source lesson in the same unit even if the week differs", () => {
    const source = resolveEvaluationReviewSource(
      "g3-u1-w1-eval",
      "repeated_addition_to_multiplication",
    );
    expect(source.sourceLesson.lesson_id).toBe("g3-u1-w1-l2");
  });

  it("throws for an unknown evaluation lesson", () => {
    expect(() => resolveEvaluationReviewSource("g3-u999-w1-eval", "equal_groups")).toThrow(
      EvaluationGenerationError,
    );
  });

  it("throws for a review type with no matching source lesson", () => {
    expect(() => resolveEvaluationReviewSource("g3-u1-w1-eval", "fraction_comparison")).toThrow(
      EvaluationGenerationError,
    );
  });
});

describe("evaluationReviewTypeAliases", () => {
  it("only maps unresolved review types to registered specialized practice types", () => {
    for (const [reviewType, alias] of Object.entries(evaluationReviewTypeAliases)) {
      expect(practiceRegistry[reviewType]).toBeUndefined();
      expect(practiceRegistry[alias]).toBeDefined();
      expect(reviewType).not.toBe(alias);
    }
  });
});
