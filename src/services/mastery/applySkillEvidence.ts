import type { SkillEvidence, SkillProgress } from "../../types/mastery";
import { recordRetentionAttempt } from "../retention/retentionSchedule";
import { applyMasteryStatusEffects } from "./applyMasteryStatusEffects";
import { evaluateSkillMastery } from "./evaluateMastery";

// Pure helper that aggregates one SkillEvidence entry into a SkillProgress and
// then re-evaluates mastery status for non-mastered skills. Mastered and
// refresh_scheduled skills are protected from ordinary re-evaluation and only
// change through the explicit retention-failure workflow.
export function applySkillEvidence(
  current: SkillProgress,
  evidence: Omit<SkillEvidence, "skillId" | "timestamp"> & { timestamp: string },
): SkillProgress {
  const nextCorrect = current.totalCorrect + (evidence.correct ? 1 : 0);
  const nextAttempts = current.totalAttempts + 1;
  const nextCurrentStreak = evidence.correct ? current.currentStreak + 1 : 0;
  const nextBestStreak = Math.max(current.bestStreak, nextCurrentStreak);

  const nextEvidenceCounts = { ...current.evidenceCounts };
  nextEvidenceCounts[evidence.evidenceType] =
    (nextEvidenceCounts[evidence.evidenceType] ?? 0) + 1;

  let nextProgress: SkillProgress = {
    ...current,
    lastWorkedAt: evidence.timestamp,
    evidenceCounts: nextEvidenceCounts,
    totalCorrect: nextCorrect,
    totalAttempts: nextAttempts,
    currentStreak: nextCurrentStreak,
    bestStreak: nextBestStreak,
    status: current.status === "not_started" ? "introduced" : current.status,
  };

  if (!nextProgress.introducedAt) {
    nextProgress.introducedAt = evidence.timestamp;
  }

  const isMasteredOrRefresh =
    current.status === "mastered" || current.status === "refresh_scheduled";

  // Retention evidence on mastered/refresh skills is handled by the dedicated
  // retention service. It is the only non-legacy path that can regress a
  // protected status.
  if (evidence.evidenceType === "retention" && isMasteredOrRefresh) {
    const attempt = recordRetentionAttempt(current, evidence.correct, evidence.timestamp);
    nextProgress = {
      ...nextProgress,
      status: attempt.status,
      refreshDueAt: attempt.refreshDueAt,
      successfulRetentionCount: attempt.successfulRetentionCount,
      masteredAt: attempt.masteredAt,
    };
  } else if (!isMasteredOrRefresh) {
    // Non-mastered skills are re-evaluated from the complete evidence set.
    // The evaluator may promote or demote the skill, so its result is used
    // directly for not_started, introduced, developing, and provisionally_mastered.
    const newStatus = evaluateSkillMastery(nextProgress);
    nextProgress = applyMasteryStatusEffects(nextProgress, newStatus, evidence.timestamp);
  }

  return nextProgress;
}
