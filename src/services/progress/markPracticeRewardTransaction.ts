import type { StudentState } from "../../contexts/StudentProgressContext";
import type { PracticeMode } from "../../practiceTypes/types";
import type {
  PracticeCompletionMetrics,
  PracticeCompletionResult,
} from "../../types/practiceProgress";
import { applyLessonPracticeComplete } from "./applyLessonPracticeComplete";
import { applyPracticeCompletion } from "./applyPracticeCompletion";

// Pure transaction coordinator for completing a practice mode. It runs the
// domain validator and, on success, builds the complete next StudentState,
// including the lesson-progress consequence for Guided Practice. The context
// commits the result and keeps an authoritative ref in sync.
export function markPracticeRewardTransaction(
  currentState: StudentState,
  lessonId: string,
  mode: PracticeMode,
  timestamp: string,
  metrics: PracticeCompletionMetrics,
): { result: PracticeCompletionResult; nextState: StudentState } {
  const completion = applyPracticeCompletion(
    currentState.practiceRewards,
    currentState.skillProgress,
    lessonId,
    mode,
    timestamp,
    metrics,
  );

  if (!completion.ok) {
    return {
      result: { ok: false, reason: completion.reason },
      nextState: currentState,
    };
  }

  let nextLessonProgress = currentState.lessonProgress;
  if (mode === "guided") {
    nextLessonProgress = applyLessonPracticeComplete(
      currentState.lessonProgress,
      lessonId,
      timestamp,
    );
  }

  const nextState: StudentState = {
    ...currentState,
    practiceRewards: completion.nextPracticeRewards,
    skillProgress: completion.nextSkillProgress,
    lessonProgress: nextLessonProgress,
  };

  return {
    result: { ok: true, mode },
    nextState,
  };
}
