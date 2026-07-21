// @SECTION FILE_OVERVIEW
// retentionSchedule.ts
// Spaced-repetition-style scheduling for mastered skills. After a skill is
// first marked mastered, a refresh is scheduled 1 day later. Each successful
// retention review extends the interval through 3, 7, 14, and 30 days. A
// failed retention review drops the skill back to developing.

import type { MasteryStatus, SkillProgress } from "../../types/mastery";

// @SECTION INTERVALS
export const RetentionIntervalsDays = [1, 3, 7, 14, 30];

// @SECTION DATE_HELPERS
function addDays(dateString: string, days: number): string {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// @SECTION SCHEDULING
export function getNextRefreshDueDate(
  baseDate: string,
  successfulRetentionCount: number,
): string {
  const index = Math.max(
    0,
    Math.min(successfulRetentionCount, RetentionIntervalsDays.length - 1),
  );
  const days = RetentionIntervalsDays[index] ?? 1;
  return addDays(baseDate, days);
}

export function isRefreshDue(skillProgress: SkillProgress): boolean {
  if (!skillProgress.refreshDueAt) return false;

  const due = startOfDay(new Date(skillProgress.refreshDueAt));
  const today = startOfDay(new Date());
  return due <= today;
}

// @SECTION STATUS
export function getRetentionStatus(skillProgress: SkillProgress): MasteryStatus {
  if (skillProgress.status === "refresh_scheduled" || skillProgress.status === "mastered") {
    return isRefreshDue(skillProgress) ? "refresh_scheduled" : "mastered";
  }

  return skillProgress.status;
}

// @SECTION ATTEMPT_HANDLING
export type RetentionAttemptResult = {
  status: MasteryStatus;
  refreshDueAt?: string;
  successfulRetentionCount: number;
  masteredAt?: string;
};

export function recordRetentionAttempt(
  skillProgress: SkillProgress,
  correct: boolean,
  timestamp: string = new Date().toISOString(),
): RetentionAttemptResult {
  if (correct) {
    const nextCount = skillProgress.successfulRetentionCount + 1;
    return {
      status: "mastered",
      refreshDueAt: getNextRefreshDueDate(timestamp, nextCount),
      successfulRetentionCount: nextCount,
      masteredAt: skillProgress.masteredAt ?? timestamp,
    };
  }

  // Failed retention review: the learner needs to redevelop the skill.
  return {
    status: "developing",
    refreshDueAt: undefined,
    successfulRetentionCount: 0,
    masteredAt: undefined,
  };
}

export function getInitialRefreshDueDate(timestamp: string = new Date().toISOString()): string {
  return getNextRefreshDueDate(timestamp, 0);
}
