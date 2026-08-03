import type { LessonProgress } from "../../contexts/StudentProgressContext";

// Pure helper that updates lesson progress when Guided Practice succeeds.
// It sets practiceComplete: true and recomputes lessonComplete using the
// existing canonical rule, without mutating the input.
export function applyLessonPracticeComplete(
  currentLessonProgress: Record<string, LessonProgress>,
  lessonId: string,
  timestamp: string,
): Record<string, LessonProgress> {
  const current = currentLessonProgress[lessonId] ?? {
    lessonId,
    warmupComplete: false,
    learnComplete: false,
    tryItComplete: false,
    practiceComplete: false,
    lessonComplete: false,
    correctAnswers: 0,
    totalQuestions: 0,
    updatedAt: timestamp,
  };

  const next: LessonProgress = {
    ...current,
    practiceComplete: true,
    updatedAt: timestamp,
  };

  next.lessonComplete =
    next.warmupComplete &&
    next.learnComplete &&
    next.tryItComplete &&
    next.practiceComplete;

  return {
    ...currentLessonProgress,
    [lessonId]: next,
  };
}
