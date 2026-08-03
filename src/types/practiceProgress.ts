import type { PracticeMode } from "../practiceTypes/types";

// @SECTION PRACTICE_REWARD_RECORD
// A single completed practice mode for a lesson. Includes the reward item
// granted and the timestamp of first completion.

export type PracticeRewardRecord = {
  completed: boolean;
  rewardId: string;
  completedAt: string;
};

// @SECTION LESSON_PRACTICE_REWARD_STATE
// Per-lesson completion state across all three practice modes.

export type LessonPracticeRewardState = Partial<Record<PracticeMode, PracticeRewardRecord>>;

// @SECTION PRACTICE_REWARDS_STATE
// Collection of practice reward states indexed by lesson ID.

export type PracticeRewardsState = Record<string, LessonPracticeRewardState>;

// @SECTION PRACTICE_COMPLETION_METRICS
// Scored session data supplied by the caller. The domain uses these counts
// to calculate accuracy and decide whether a practice session qualifies.

export type PracticeCompletionMetrics = {
  firstAttemptCorrectCount: number;
  firstAttemptTotalCount: number;
};

export type PracticeCompletionRejectionReason =
  | "guided_required"
  | "independent_required"
  | "already_completed"
  | "invalid_session_result"
  | "insufficient_accuracy";

// @SECTION PRACTICE_COMPLETION_RESULT
// Public result returned by the progress context when a practice mode
// completion is attempted. The UI uses this to decide feedback and next steps.

export type PracticeCompletionResult =
  | {
      ok: true;
      mode: PracticeMode;
    }
  | {
      ok: false;
      reason: PracticeCompletionRejectionReason;
    };
