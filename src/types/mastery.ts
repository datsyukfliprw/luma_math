// @SECTION MASTERY_STATUS
// Domain-wide mastery lifecycle. These statuses are local-first and
// sync-ready: they describe student skill state without calendar pacing.

export type MasteryStatus =
  | "not_started"
  | "introduced"
  | "developing"
  | "provisionally_mastered"
  | "mastered"
  | "refresh_scheduled";

export const MasteryStatusValues: MasteryStatus[] = [
  "not_started",
  "introduced",
  "developing",
  "provisionally_mastered",
  "mastered",
  "refresh_scheduled",
];

// @SECTION EVIDENCE_TYPES
// Evidence categories map to different kinds of student work.
// Procedural = practice/flashcard correctness
// Conceptual = explanation, vocabulary, model building
// Transfer = word problems, unfamiliar contexts, challenge
// Retention = spaced review success

export type EvidenceType = "conceptual" | "procedural" | "transfer" | "retention";

export const EvidenceTypeValues: EvidenceType[] = [
  "conceptual",
  "procedural",
  "transfer",
  "retention",
];

// @SECTION PREREQUISITE_TYPES
// Hard prerequisites must be at least developing before unlock.
// Supporting prerequisites are recommended but not blocking.

export type PrerequisiteType = "hard" | "supporting";

export const PrerequisiteTypeValues: PrerequisiteType[] = ["hard", "supporting"];

// @SECTION EVIDENCE_RECORD
// A single piece of work tied to a skill. The context records these and
// mastery services use the aggregated counts to decide status changes.

export type SkillEvidence = {
  skillId: string;
  evidenceType: EvidenceType;
  source: string; // mission id, lesson id, or practice session id
  correct: boolean;
  timestamp: string;
  strength: number; // 0-1, used for weighted mastery calculations
};

// @SECTION SKILL_PROGRESS
// Local-first skill progress. Status is the source of truth; counts and
// timestamps support evaluation, prerequisite checks, and retention scheduling.

export type SkillProgress = {
  skillId: string;
  status: MasteryStatus;
  introducedAt?: string;
  lastWorkedAt?: string;
  masteredAt?: string;
  refreshDueAt?: string;
  evidenceCounts: Record<EvidenceType, number>;
  totalCorrect: number;
  totalAttempts: number;
  currentStreak: number;
  bestStreak: number;
  masteryCheckAttempts: number;
  masteryCheckPassed: boolean;
  successfulRetentionCount: number;
};
