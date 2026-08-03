import type { PracticeMode } from "../../practiceTypes/types";
import type { SkillProgress } from "../../types/mastery";
import type {
  LessonPracticeRewardState,
  PracticeCompletionMetrics,
  PracticeCompletionRejectionReason,
  PracticeRewardRecord,
  PracticeRewardsState,
} from "../../types/practiceProgress";
import { getSkillsForLesson } from "../../data/curriculum/curriculumGraph";
import { applySkillEvidence } from "../mastery/applySkillEvidence";
import { createEmptySkillProgress } from "../mastery/createEmptySkillProgress";

export type ApplyPracticeCompletionResult =
  | {
      ok: true;
      mode: PracticeMode;
      rewardRecord: PracticeRewardRecord;
      nextPracticeRewards: PracticeRewardsState;
      nextSkillProgress: Record<string, SkillProgress>;
    }
  | {
      ok: false;
      reason: PracticeCompletionRejectionReason;
      accuracy?: number;
      requiredAccuracy?: number;
    };

const REWARD_IDS: Record<PracticeMode, string> = {
  guided: "common_star_accessory",
  independent: "rare_star_accessory",
  challenge: "epic_star_accessory",
};

const FIRST_ATTEMPT_ACCURACY_THRESHOLD = 0.8;

function isValidMetrics(metrics: PracticeCompletionMetrics): boolean {
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

// Pure domain service that validates practice-mode completion order and,
// on success, returns the immutable next reward and skill-progress slices.
// It does not import React and never mutates its inputs.
export function applyPracticeCompletion(
  currentPracticeRewards: PracticeRewardsState,
  currentSkillProgress: Record<string, SkillProgress>,
  lessonId: string,
  mode: PracticeMode,
  timestamp: string,
  metrics: PracticeCompletionMetrics,
): ApplyPracticeCompletionResult {
  const lessonRewards = currentPracticeRewards[lessonId] ?? {};

  if (lessonRewards[mode]?.completed) {
    return { ok: false, reason: "already_completed" };
  }

  if (mode === "independent" && !lessonRewards.guided?.completed) {
    return { ok: false, reason: "guided_required" };
  }

  if (mode === "challenge") {
    if (!lessonRewards.guided?.completed) {
      return { ok: false, reason: "guided_required" };
    }
    if (!lessonRewards.independent?.completed) {
      return { ok: false, reason: "independent_required" };
    }
  }

  // Independent and Challenge both require a trustworthy first-attempt score.
  // Guided intentionally has no accuracy gate.
  if (mode === "independent" || mode === "challenge") {
    if (!isValidMetrics(metrics)) {
      return { ok: false, reason: "invalid_session_result" };
    }

    const accuracy = metrics.firstAttemptCorrectCount / metrics.firstAttemptTotalCount;
    if (accuracy < FIRST_ATTEMPT_ACCURACY_THRESHOLD) {
      return {
        ok: false,
        reason: "insufficient_accuracy",
        accuracy,
        requiredAccuracy: FIRST_ATTEMPT_ACCURACY_THRESHOLD,
      };
    }
  }

  const rewardRecord: PracticeRewardRecord = {
    completed: true,
    rewardId: REWARD_IDS[mode],
    completedAt: timestamp,
  };

  const nextLessonRewards: LessonPracticeRewardState = {
    ...lessonRewards,
    [mode]: rewardRecord,
  };

  const nextPracticeRewards: PracticeRewardsState = {
    ...currentPracticeRewards,
    [lessonId]: nextLessonRewards,
  };

  let nextSkillProgress = currentSkillProgress;

  // Guided and Independent Practice each record one procedural evidence entry
  // per lesson-linked Skill. Challenge records one transfer evidence entry.
  // Source identities are mode-specific so the three activities remain distinct.
  if (mode === "guided" || mode === "independent" || mode === "challenge") {
    nextSkillProgress = { ...currentSkillProgress };
    for (const skill of getSkillsForLesson(lessonId)) {
      const current = nextSkillProgress[skill.id] ?? createEmptySkillProgress(skill.id);
      nextSkillProgress[skill.id] = applySkillEvidence(current, {
        evidenceType: mode === "challenge" ? "transfer" : "procedural",
        source: `${mode}-practice-${lessonId}`,
        correct: true,
        timestamp,
        strength: 1,
      });
    }
  }

  return {
    ok: true,
    mode,
    rewardRecord,
    nextPracticeRewards,
    nextSkillProgress,
  };
}
