// @SECTION FILE_OVERVIEW
// lessonExperience.ts
// Central registry for lesson experience data.
// Types are exported from ./lessonExperience/types.ts
// Lesson data is organized by grade/unit/week in subdirectories.

import type {
  PracticeMode,
  LessonPracticeType,
  SeeItRuleFocus,
  QuickCheckQuestion,
  TryItProblem,
  LessonExperience,
} from "./lessonExperience/types";

// Re-export types for backward compatibility
export type {
  PracticeMode,
  LessonPracticeType,
  SeeItRuleFocus,
  QuickCheckQuestion,
  TryItProblem,
  LessonExperience,
};

// Import lesson experiences from organized structure
import { grade3Unit1Week1Experience as week1Lessons } from "./lessonExperience/grade3/unit1/week1";

// Re-export for backward compatibility
export const grade3Unit1Week1Experience = week1Lessons;

// @SECTION LESSON_EXPERIENCE_REGISTRY
// Central registry of all lesson experiences
const lessonExperienceRegistry: Record<string, LessonExperience> = {};

// Register Grade 3 Unit 1 Week 1 lessons
week1Lessons.forEach((lesson) => {
  lessonExperienceRegistry[lesson.id] = lesson;
});

// @SECTION LESSON_EXPERIENCE_LOOKUPS
export function getLessonExperience(lessonId?: string) {
  if (!lessonId) {
    return week1Lessons[0];
  }

  return lessonExperienceRegistry[lessonId];
}

export function requireLessonExperience(lessonId?: string): LessonExperience {
  const lesson = getLessonExperience(lessonId);

  if (!lesson) {
    throw new Error(`No lesson experience found for lessonId: ${lessonId}`);
  }

  return lesson;
}

export function getWeekOneLessonExperience() {
  return week1Lessons;
}
