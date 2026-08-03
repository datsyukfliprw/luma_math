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
    };

const REWARD_IDS: Record<PracticeMode, string> = {
  guided: "common_star_accessory",
  independent: "rare_star_accessory",
  challenge: "epic_star_accessory",
};

const INDEPENDENT_ACCURACY_THRESHOLD = 0.8;

function isValidMetrics(metrics: PracticeCompletionMetrics): boolean {
  const { correctCount, totalCount } = metrics;

  return (
    Number.isFinite(correctCount) &&
    Number.isFinite(totalCount) &&
    Number.isInteger(correctCount) &&
    Number.isInteger(totalCount) &&
    totalCount > 0 &&
    correctCount >= 0 &&
    correctCount <= totalCount
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

  if (mode === "independent") {
    if (!isValidMetrics(metrics)) {
      return { ok: false, reason: "invalid_session_result" };
    }

    const accuracy = metrics.correctCount / metrics.totalCount;
    if (accuracy < INDEPENDENT_ACCURACY_THRESHOLD) {
      return { ok: false, reason: "insufficient_accuracy" };
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
  // per lesson-linked Skill. The source is mode-specific so the two activities
  // are distinct evidence identities. Challenge does not record evidence.
  if (mode === "guided" || mode === "independent") {
    nextSkillProgress = { ...currentSkillProgress };
    for (const skill of getSkillsForLesson(lessonId)) {
      const current = nextSkillProgress[skill.id] ?? createEmptySkillProgress(skill.id);
      nextSkillProgress[skill.id] = applySkillEvidence(current, {
        evidenceType: "procedural",
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
