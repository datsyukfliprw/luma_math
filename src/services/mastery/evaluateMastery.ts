// @SECTION FILE_OVERVIEW
// evaluateMastery.ts
// Pure evaluation functions that recommend a mastery status for a skill,
// concept, or mission based on recorded evidence. These functions are
// stateless and only read SkillProgress, so they can be used in services,
// hooks, or the context without creating circular dependencies.

import type { MasteryStatus, SkillProgress } from "../../types/mastery";
import type { Concept } from "../../data/curriculum/curriculumGraph";
import { getRetentionStatus } from "../retention/retentionSchedule";

// @SECTION CONFIG
// Thresholds are intentionally conservative. They favor repeat success,
// multiple evidence types, and explicit conceptual work before moving a
// skill to provisionally_mastered or mastered.

export const MasteryThresholds = {
  introduced: {
    minAttempts: 1,
  },
  developing: {
    minAttempts: 2,
    minAccuracy: 0.7,
    minProceduralEvidence: 1,
  },
  provisionallyMastered: {
    minAttempts: 3,
    minAccuracy: 0.8,
    minBestStreak: 2,
    minConceptualEvidence: 1,
    minProceduralEvidence: 1,
  },
  mastered: {
    minAttempts: 4,
    minAccuracy: 0.9,
    minBestStreak: 3,
    minConceptualEvidence: 1,
    minProceduralEvidence: 1,
    minTransferEvidence: 1,
  },
} as const;

// @SECTION STATUS_ORDER
export const MasteryStatusOrder: MasteryStatus[] = [
  "not_started",
  "introduced",
  "developing",
  "provisionally_mastered",
  "mastered",
  "refresh_scheduled",
];

export const MasteryStatusRank: Record<MasteryStatus, number> = Object.fromEntries(
  MasteryStatusOrder.map((status, index) => [status, index]),
) as Record<MasteryStatus, number>;

// @SECTION SKILL_EVALUATION
export function evaluateSkillMastery(progress: SkillProgress): MasteryStatus {
  const retentionStatus = getRetentionStatus(progress);
  if (retentionStatus === "refresh_scheduled") {
    return "refresh_scheduled";
  }

  if (progress.status === "mastered" || progress.status === "refresh_scheduled") {
    return progress.status;
  }

  const accuracy =
    progress.totalAttempts > 0 ? progress.totalCorrect / progress.totalAttempts : 0;

  const { evidenceCounts } = progress;

  // Mastered: strong accuracy, streak, and evidence across conceptual,
  // procedural, and transfer contexts.
  const masteredThreshold = MasteryThresholds.mastered;
  if (
    progress.totalAttempts >= masteredThreshold.minAttempts &&
    accuracy >= masteredThreshold.minAccuracy &&
    progress.bestStreak >= masteredThreshold.minBestStreak &&
    evidenceCounts.conceptual >= masteredThreshold.minConceptualEvidence &&
    evidenceCounts.procedural >= masteredThreshold.minProceduralEvidence &&
    evidenceCounts.transfer >= masteredThreshold.minTransferEvidence
  ) {
    return "mastered";
  }

  // Provisionally mastered: solid accuracy and streak with both conceptual
  // and procedural evidence.
  const provisionallyThreshold = MasteryThresholds.provisionallyMastered;
  if (
    progress.totalAttempts >= provisionallyThreshold.minAttempts &&
    accuracy >= provisionallyThreshold.minAccuracy &&
    progress.bestStreak >= provisionallyThreshold.minBestStreak &&
    evidenceCounts.conceptual >= provisionallyThreshold.minConceptualEvidence &&
    evidenceCounts.procedural >= provisionallyThreshold.minProceduralEvidence
  ) {
    return "provisionally_mastered";
  }

  // Developing: some successful practice with reasonable accuracy.
  const developingThreshold = MasteryThresholds.developing;
  if (
    progress.totalAttempts >= developingThreshold.minAttempts &&
    accuracy >= developingThreshold.minAccuracy &&
    evidenceCounts.procedural >= developingThreshold.minProceduralEvidence
  ) {
    return "developing";
  }

  // Introduced: any attempt or explicit lesson exposure.
  if (progress.totalAttempts > 0) {
    return "introduced";
  }

  return "not_started";
}

// @SECTION CONCEPT_EVALUATION
// A concept is only as strong as its weakest skill.
export function evaluateConceptMastery(
  concept: Concept,
  getSkillProgress: (skillId: string) => SkillProgress,
): MasteryStatus {
  if (concept.skillIds.length === 0) {
    return "not_started";
  }

  const ranks = concept.skillIds.map((skillId) =>
    MasteryStatusRank[evaluateSkillMastery(getSkillProgress(skillId))],
  );

  const weakestRank = Math.min(...ranks);
  return MasteryStatusOrder[weakestRank] ?? "not_started";
}

// @SECTION MISSION_OUTCOME
export type MissionOutcome = {
  passed: boolean;
  recommendedStatus: MasteryStatus;
  skillOutcomes: Record<string, MasteryStatus>;
};

export function evaluateMissionOutcome(
  skillIds: string[],
  getSkillProgress: (skillId: string) => SkillProgress,
): MissionOutcome {
  const skillOutcomes: Record<string, MasteryStatus> = {};

  for (const skillId of skillIds) {
    skillOutcomes[skillId] = evaluateSkillMastery(getSkillProgress(skillId));
  }

  const ranks = Object.values(skillOutcomes).map((status) => MasteryStatusRank[status]);
  const weakestRank = ranks.length > 0 ? Math.min(...ranks) : 0;
  const recommendedStatus = MasteryStatusOrder[weakestRank] ?? "not_started";

  const passed = Object.values(skillOutcomes).every(
    (status) => MasteryStatusRank[status] >= MasteryStatusRank["provisionally_mastered"],
  );

  return {
    passed,
    recommendedStatus,
    skillOutcomes,
  };
}
