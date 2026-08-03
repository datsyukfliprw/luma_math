import type { MasteryStatus, SkillProgress } from "../../types/mastery";
import { getInitialRefreshDueDate } from "../retention/retentionSchedule";

// Apply mastery status and the side-effect fields that depend on it.
// This is intentionally pure so it can be used both inside applySkillEvidence
// and inside updateSkillStatus without duplicating logic.
export function applyMasteryStatusEffects(
  progress: SkillProgress,
  status: MasteryStatus,
  timestamp: string,
): SkillProgress {
  const next: SkillProgress = { ...progress, status, lastWorkedAt: timestamp };

  if (status === "mastered") {
    next.masteredAt = timestamp;
    next.successfulRetentionCount = 0;
    next.refreshDueAt = getInitialRefreshDueDate(timestamp);
  } else if (status === "refresh_scheduled") {
    if (!next.masteredAt) {
      next.masteredAt = timestamp;
    }
  } else {
    next.masteredAt = undefined;
    next.refreshDueAt = undefined;
    next.successfulRetentionCount = 0;
  }

  if (!next.introducedAt) {
    next.introducedAt = timestamp;
  }

  return next;
}
