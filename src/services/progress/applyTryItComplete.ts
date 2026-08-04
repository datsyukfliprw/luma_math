import type { StudentState } from "../../contexts/StudentProgressContext";
import type { LessonProgress } from "../../contexts/StudentProgressContext";
import type { TryItCompletionResult } from "../../types/tryItProgress";

// Pure helper that sets tryItComplete: true for a lesson and recomputes
// lessonComplete using the existing canonical rule. It does not create
// rewards, skill evidence, or mastery status changes.
export function applyTryItComplete(
  currentState: StudentState,
  lessonId: string,
  timestamp: string,
): { result: TryItCompletionResult; nextState: StudentState } {
  const current = currentState.lessonProgress[lessonId] ?? {
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

  if (current.tryItComplete) {
    return {
      result: { ok: true, alreadyCompleted: true },
      nextState: currentState,
    };
  }

  const next: LessonProgress = {
    ...current,
    tryItComplete: true,
    updatedAt: timestamp,
  };

  next.lessonComplete =
    next.warmupComplete &&
    next.learnComplete &&
    next.tryItComplete &&
    next.practiceComplete;

  return {
    result: { ok: true, alreadyCompleted: false },
    nextState: {
      ...currentState,
      lessonProgress: {
        ...currentState.lessonProgress,
        [lessonId]: next,
      },
    },
  };
}
