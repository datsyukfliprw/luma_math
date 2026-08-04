import { describe, it, expect } from "vitest";
import {
  resolveEvaluationReviewSource,
  evaluationReviewTypeAliases,
} from "./evaluationReviewResolver";
import { EvaluationGenerationError } from "./evaluationError";
import { practiceRegistry } from "./registry";

describe("resolveEvaluationReviewSource", () => {
  it("resolves an exact registered review type to a specialized generator", () => {
    const source = resolveEvaluationReviewSource("g3-u1-w1-eval", "equal_groups");
    expect(source.reviewType).toBe("equal_groups");
    expect(source.generatorPracticeType).toBe("equal_groups");
    expect(source.resolution).toBe("specialized");
    expect(source.sourceLesson.lesson_id).toBe("g3-u1-w1-l1");
  });

  it("resolves an alias to the equivalent specialized generator", () => {
    const source = resolveEvaluationReviewSource("g3-u9-w1-eval", "factors_and_products");
    expect(source.reviewType).toBe("factors_and_products");
    expect(source.generatorPracticeType).toBe("factor_product_identification");
    expect(source.resolution).toBe("alias");
    expect(source.sourceLesson.lesson_id).toBe("g3-u9-w1-l3");
  });

  it("uses the default generator when no specialized generator or alias exists", () => {
    const source = resolveEvaluationReviewSource("g3-u2-w1-eval", "large_digit_value");
    expect(source.reviewType).toBe("large_digit_value");
    expect(source.generatorPracticeType).toBe("large_digit_value");
    expect(source.resolution).toBe("default");
    expect(source.sourceLesson.lesson_id).toBe("g3-u2-w1-l1");
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
  it("only maps review types to registered specialized practice types", () => {
    for (const [reviewType, alias] of Object.entries(evaluationReviewTypeAliases)) {
      expect(practiceRegistry[alias]).toBeDefined();
      expect(reviewType).not.toBe(alias);
    }
  });
});
