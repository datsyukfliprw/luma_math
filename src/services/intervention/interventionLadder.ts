// @SECTION FILE_OVERVIEW
// interventionLadder.ts
// Detects when a learner is struggling with a skill and recommends the next
// rung of the intervention ladder: extra hint, worked example, concept review,
// or a break. This service is pure and only reads skill progress.

import type { SkillProgress } from "../../types/mastery";
import { masteryGraph } from "../../data/curriculum/curriculumGraph";

// @SECTION TYPES
export type InterventionLevel = "none" | "extra_hint" | "worked_example" | "concept_review" | "pause";

export type Intervention = {
  level: InterventionLevel;
  message: string;
  skillId: string;
  fallbackConceptId?: string;
  fallbackConceptTitle?: string;
};

// @SECTION CONFIG
export const InterventionThresholds = {
  extraHint: {
    minAttempts: 2,
    maxAccuracy: 0.5,
    maxCurrentStreak: 0,
  },
  workedExample: {
    minAttempts: 4,
    maxAccuracy: 0.4,
    maxCurrentStreak: 0,
  },
  conceptReview: {
    minAttempts: 6,
    maxAccuracy: 0.35,
    maxCurrentStreak: 0,
  },
  masteryCheckStruggle: {
    minAttempts: 2,
  },
} as const;

// @SECTION LADDER_DETECTION
export function getInterventionLevel(progress: SkillProgress): InterventionLevel {
  const accuracy = progress.totalAttempts > 0 ? progress.totalCorrect / progress.totalAttempts : 0;

  if (
    progress.totalAttempts >= InterventionThresholds.conceptReview.minAttempts &&
    accuracy <= InterventionThresholds.conceptReview.maxAccuracy &&
    progress.currentStreak <= InterventionThresholds.conceptReview.maxCurrentStreak
  ) {
    return "concept_review";
  }

  if (
    progress.totalAttempts >= InterventionThresholds.workedExample.minAttempts &&
    accuracy <= InterventionThresholds.workedExample.maxAccuracy &&
    progress.currentStreak <= InterventionThresholds.workedExample.maxCurrentStreak
  ) {
    return "worked_example";
  }

  if (
    progress.masteryCheckAttempts >= InterventionThresholds.masteryCheckStruggle.minAttempts &&
    !progress.masteryCheckPassed
  ) {
    return "concept_review";
  }

  if (
    progress.totalAttempts >= InterventionThresholds.extraHint.minAttempts &&
    accuracy <= InterventionThresholds.extraHint.maxAccuracy &&
    progress.currentStreak <= InterventionThresholds.extraHint.maxCurrentStreak
  ) {
    return "extra_hint";
  }

  return "none";
}

// @SECTION FALLBACK_CONCEPT
// Find the earliest concept that introduced this skill, excluding the current
// mission's concept if provided.
function findFallbackConcept(skillId: string, currentConceptId?: string) {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      if (
        concept.skillIds.includes(skillId) &&
        (!currentConceptId || concept.id !== currentConceptId)
      ) {
        return concept;
      }
    }
  }

  return undefined;
}

// @SECTION INTERVENTION_MESSAGES
function getInterventionMessage(level: InterventionLevel): string {
  switch (level) {
    case "extra_hint":
      return "Let's look at a helpful hint before the next try.";
    case "worked_example":
      return "A worked example might make this click. Let's review one together.";
    case "concept_review":
      return "This skill needs a fresh start. Let's revisit where it was first introduced.";
    case "pause":
      return "Great effort! Let's take a quick brain break and come back fresh.";
    default:
      return "";
  }
}

// @SECTION PUBLIC_API
export function getIntervention(
  skillId: string,
  getSkillProgress: (skillId: string) => SkillProgress,
  currentConceptId?: string,
): Intervention {
  const progress = getSkillProgress(skillId);
  const level = getInterventionLevel(progress);

  if (level === "none") {
    return { level, message: "", skillId };
  }

  const fallbackConcept =
    level === "concept_review" ? findFallbackConcept(skillId, currentConceptId) : undefined;

  return {
    level,
    message: getInterventionMessage(level),
    skillId,
    fallbackConceptId: fallbackConcept?.id,
    fallbackConceptTitle: fallbackConcept?.title,
  };
}
