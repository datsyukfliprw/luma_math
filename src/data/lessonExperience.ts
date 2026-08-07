// @SECTION FILE_OVERVIEW
// lessonExperience.ts
// Central registry for lesson experience data.
// Types are exported from ./lessonExperience/types.ts
// Lesson data is organized by grade/unit/week in subdirectories.

import type {
  PracticeMode,
  LessonPracticeType,
  SeeItRuleFocus,
  LegacyQuickCheckQuestion,
  TryItProblem,
  LessonExperience,
  LessonExperienceSource,
  AuthoredLessonExperience,
  CurriculumLessonExperience,
  ResolvedLessonExperience,
} from "./lessonExperience/types";

import { getAdaptedLessonExperience } from "../lib/lessonExperienceAdapter";
import { toCanonicalQuickCheck } from "../lib/quickCheck";

// Re-export types for consumers and authored lesson files
export type {
  PracticeMode,
  LessonPracticeType,
  SeeItRuleFocus,
  LegacyQuickCheckQuestion,
  TryItProblem,
  LessonExperience,
  LessonExperienceSource,
  AuthoredLessonExperience,
  CurriculumLessonExperience,
  ResolvedLessonExperience,
};

// Import lesson experiences from organized structure
import { grade3Unit1Week1Experience as week1Lessons } from "./lessonExperience/grade3/unit1/week1";

// Re-export for backward compatibility
export const grade3Unit1Week1Experience = week1Lessons;

// @SECTION LESSON_EXPERIENCE_REGISTRY
// Central registry of authored lesson experiences
const lessonExperienceRegistry: Record<string, LessonExperience> = {};

// Register Grade 3 Unit 1 Week 1 lessons
week1Lessons.forEach((lesson) => {
  lessonExperienceRegistry[lesson.id] = lesson;
});

// Cache for derived curriculum experiences so we do not rebuild on every render.
const derivedExperienceCache: Record<string, CurriculumLessonExperience> = {};

// @SECTION LESSON_EXPERIENCE_LOOKUPS
export function getLessonExperience(lessonId?: string): ResolvedLessonExperience | undefined {
  if (!lessonId) {
    return undefined;
  }

  const authored = lessonExperienceRegistry[lessonId];
  if (authored) {
    return {
      ...authored,
      source: "authored",
      canonicalQuickCheck: toCanonicalQuickCheck(authored.quickCheck),
    } as AuthoredLessonExperience;
  }

  if (derivedExperienceCache[lessonId]) {
    return derivedExperienceCache[lessonId];
  }

  const derived = getAdaptedLessonExperience(lessonId);
  if (derived) {
    derivedExperienceCache[lessonId] = derived;
  }

  return derived;
}

export function requireLessonExperience(lessonId?: string): ResolvedLessonExperience {
  const lesson = getLessonExperience(lessonId);

  if (!lesson) {
    throw new Error(`No lesson experience found for lessonId: ${lessonId}`);
  }

  return lesson;
}

export function getWeekOneLessonExperience() {
  return week1Lessons;
}
