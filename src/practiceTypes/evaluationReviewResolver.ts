import { findCurriculumLessonById } from "../lib/curriculumLoader";
import type { Curriculum, Lesson } from "../data/curriculum";
import { practiceRegistry } from "./registry";
import { EvaluationGenerationError } from "./evaluationError";

export type ResolvedEvaluationReviewSource = {
  reviewType: string;
  sourceLesson: Lesson;
  generatorPracticeType: string;
  resolution: "specialized" | "alias" | "default";
};

// Aliases connect curriculum review_type labels to semantically equivalent
// specialized generators. Each alias is justified by the curriculum content.
export const evaluationReviewTypeAliases: Record<string, string> = {
  count_equal_groups: "equal_groups",
  factors_and_products: "factor_product_identification",
  draw_multiplication: "draw_arrays",
  build_arrays: "array_rows_columns",
  two_equations_for_array: "commutative_property_matching",
  commutative_multiplication: "commutative_property_matching",
  division_sharing: "fair_sharing_division",
  rows_columns_multiplication: "array_rows_columns",
};

function findSourceLesson(unit: Curriculum, reviewType: string): Lesson | undefined {
  for (const week of unit.weeks) {
    const match = week.lessons.find(
      (lesson) => lesson.lesson_type === "lesson" && lesson.practice_type === reviewType,
    );
    if (match) {
      return match;
    }
  }
  return undefined;
}

export function resolveEvaluationReviewSource(
  evaluationLessonId: string,
  reviewType: string,
): ResolvedEvaluationReviewSource {
  const found = findCurriculumLessonById(evaluationLessonId);
  if (!found) {
    throw new EvaluationGenerationError({
      evaluationLessonId,
      reviewType,
      reason: "Evaluation lesson not found in curriculum",
    });
  }

  const { unit } = found;

  const sourceLesson = findSourceLesson(unit, reviewType);
  if (!sourceLesson) {
    throw new EvaluationGenerationError({
      evaluationLessonId,
      reviewType,
      reason: "No regular lesson in this unit matches the review type",
    });
  }

  if (practiceRegistry[reviewType]) {
    return {
      reviewType,
      sourceLesson,
      generatorPracticeType: reviewType,
      resolution: "specialized",
    };
  }

  const alias = evaluationReviewTypeAliases[reviewType];
  if (alias && practiceRegistry[alias]) {
    return {
      reviewType,
      sourceLesson,
      generatorPracticeType: alias,
      resolution: "alias",
    };
  }

  return {
    reviewType,
    sourceLesson,
    generatorPracticeType: reviewType,
    resolution: "default",
  };
}
