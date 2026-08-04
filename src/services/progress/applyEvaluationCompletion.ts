import type { StudentState } from "../../contexts/StudentProgressContext";
import { findCurriculumLessonById } from "../../lib/curriculumLoader";
import type {
  EvaluationCompletionMetrics,
  EvaluationCompletionRecord,
  EvaluationCompletionResult,
} from "../../types/evaluationProgress";

const EVALUATION_PASS_THRESHOLD = 0.8;

function isValidMetrics(metrics: EvaluationCompletionMetrics): boolean {
  const { firstAttemptCorrectCount, firstAttemptTotalCount } = metrics;

  return (
    Number.isFinite(firstAttemptCorrectCount) &&
    Number.isFinite(firstAttemptTotalCount) &&
    Number.isInteger(firstAttemptCorrectCount) &&
    Number.isInteger(firstAttemptTotalCount) &&
    firstAttemptTotalCount > 0 &&
    firstAttemptCorrectCount >= 0 &&
    firstAttemptCorrectCount <= firstAttemptTotalCount
  );
}

function buildCompletionRecord(
  evaluationLessonId: string,
  metrics: EvaluationCompletionMetrics,
  accuracy: number,
  completedAt: string,
): EvaluationCompletionRecord {
  return {
    evaluationLessonId,
    firstAttemptCorrectCount: metrics.firstAttemptCorrectCount,
    firstAttemptTotalCount: metrics.firstAttemptTotalCount,
    accuracy,
    completedAt,
  };
}

// Pure domain service that validates evaluation completion, enforces the 80%
// first-attempt accuracy threshold, and returns an immutable next StudentState.
// It does not create rewards, skill evidence, or mastery status changes.
export function applyEvaluationCompletion(
  currentState: StudentState,
  evaluationLessonId: string,
  metrics: EvaluationCompletionMetrics,
  timestamp: string,
): { result: EvaluationCompletionResult; nextState: StudentState } {
  const existing = currentState.evaluationCompletions?.[evaluationLessonId];

  if (existing) {
    return {
      result: {
        ok: false,
        reason: "already_completed",
        accuracy: existing.accuracy,
        requiredAccuracy: EVALUATION_PASS_THRESHOLD,
      },
      nextState: currentState,
    };
  }

  const found = findCurriculumLessonById(evaluationLessonId);
  if (!found) {
    return {
      result: { ok: false, reason: "evaluation_not_found" },
      nextState: currentState,
    };
  }

  if (found.lesson.lesson_type !== "evaluation") {
    return {
      result: { ok: false, reason: "not_an_evaluation" },
      nextState: currentState,
    };
  }

  if (!isValidMetrics(metrics)) {
    return {
      result: { ok: false, reason: "invalid_session_result" },
      nextState: currentState,
    };
  }

  const accuracy = metrics.firstAttemptCorrectCount / metrics.firstAttemptTotalCount;

  if (accuracy < EVALUATION_PASS_THRESHOLD) {
    return {
      result: {
        ok: false,
        reason: "insufficient_accuracy",
        accuracy,
        requiredAccuracy: EVALUATION_PASS_THRESHOLD,
      },
      nextState: currentState,
    };
  }

  const completion = buildCompletionRecord(evaluationLessonId, metrics, accuracy, timestamp);

  const nextState: StudentState = {
    ...currentState,
    evaluationCompletions: {
      ...currentState.evaluationCompletions,
      [evaluationLessonId]: completion,
    },
  };

  return {
    result: {
      ok: true,
      evaluationLessonId,
      accuracy,
      requiredAccuracy: EVALUATION_PASS_THRESHOLD,
      completion,
    },
    nextState,
  };
}
