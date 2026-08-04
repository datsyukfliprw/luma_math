// @SECTION EVALUATION_COMPLETION_RECORD
// A durable, idempotent record of a passed evaluation. Stored by evaluation
// lesson ID inside StudentState and persisted to localStorage.

export type EvaluationCompletionRecord = {
  evaluationLessonId: string;
  firstAttemptCorrectCount: number;
  firstAttemptTotalCount: number;
  accuracy: number;
  completedAt: string;
};

// @SECTION EVALUATION_COMPLETION_METRICS
// Scored session data supplied by the caller. Only first-attempt counts are
// used for the pass/fail decision so retries cannot rewrite the score.

export type EvaluationCompletionMetrics = {
  firstAttemptCorrectCount: number;
  firstAttemptTotalCount: number;
};

// @SECTION EVALUATION_COMPLETION_REJECTION_REASON
// Typed reasons for why an evaluation completion cannot be recorded.
// `already_completed` is detected first so historical completions remain
// valid even if a later caller supplies malformed metrics.

export type EvaluationCompletionRejectionReason =
  | "already_completed"
  | "evaluation_not_found"
  | "not_an_evaluation"
  | "invalid_session_result"
  | "insufficient_accuracy";

// @SECTION EVALUATION_COMPLETION_RESULT
// Public result returned by the progress context and pure service.
// On success the full completion record is returned. On failure the reason
// is returned, with the actual and required accuracy when they are known.

export type EvaluationCompletionResult =
  | {
      ok: true;
      evaluationLessonId: string;
      accuracy: number;
      requiredAccuracy: number;
      completion: EvaluationCompletionRecord;
    }
  | {
      ok: false;
      reason: EvaluationCompletionRejectionReason;
      accuracy?: number;
      requiredAccuracy?: number;
    };
