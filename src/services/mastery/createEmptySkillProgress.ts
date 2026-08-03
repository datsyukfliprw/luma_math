import type { SkillProgress } from "../../types/mastery";
import { EvidenceTypeValues } from "../../types/mastery";

// Pure factory for a brand-new SkillProgress. Used by services and the
// progress context whenever a skill is referenced for the first time.
export function createEmptySkillProgress(skillId: string): SkillProgress {
  const evidenceCounts = Object.fromEntries(
    EvidenceTypeValues.map((evidenceType) => [evidenceType, 0]),
  ) as Record<"conceptual" | "procedural" | "transfer" | "retention", number>;

  return {
    skillId,
    status: "not_started",
    evidenceCounts,
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}
