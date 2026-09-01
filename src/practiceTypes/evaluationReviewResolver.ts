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

// Aliases are reserved for curriculum review_type labels that do not yet have
// an exact specialized generator. Exact registered types resolve before this map.
export const evaluationReviewTypeAliases: Record<string, string> = {};

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
