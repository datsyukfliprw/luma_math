// @SECTION FILE_OVERVIEW
// dailyMissionPlanner.ts
// Service that turns the mastery graph and current skill progress into a
// daily recommendation: the current mission, the learning-journey steps,
// and summary stats. It is pure and only reads skill progress, so it can
// be called from React hooks or non-React services.

import type { Concept, Mission } from "../../data/curriculum/curriculumGraph";
import { getAllSkills, getChapterForConcept, getPathway } from "../../data/curriculum/curriculumGraph";
import { evaluateConceptMastery, MasteryStatusRank } from "../mastery/evaluateMastery";
import { getConceptUnlockState } from "../prerequisites/prerequisiteGraph";
import type { SkillProgress } from "../../types/mastery";

// @SECTION TYPES
export type JourneyStepStatus = "complete" | "current" | "locked" | "reward";

export type JourneyStep = {
  id: string;
  title: string;
  status: JourneyStepStatus;
  conceptId?: string;
};

export type DailyMission = {
  conceptId: string;
  missionId: string;
  title: string;
  subtitle: string;
  to: string;
  estimatedMinutes: number;
  rationale: string;
  isReview: boolean;
};

export type SummaryStats = {
  conceptsComplete: number;
  conceptsTotal: number;
  skillsMastered: number;
  skillsTotal: number;
  streakDays: number;
};

export type PathwayProgress = {
  completed: number;
  total: number;
  percent: number;
};

// @SECTION INTERNAL_HELPERS
function getPathwayConceptOrder(): Concept[] {
  return getPathway().chapters.flatMap((chapter) => chapter.concepts);
}

function isConceptComplete(concept: Concept, getSkillProgress: (skillId: string) => SkillProgress): boolean {
  const status = evaluateConceptMastery(concept, getSkillProgress);
  return MasteryStatusRank[status] >= MasteryStatusRank["provisionally_mastered"];
}

function isMasteryCheckMission(mission: Mission): boolean {
  return mission.type === "mastery_check";
}

function getConceptJourneyStatus(
  concept: Concept,
  isCurrent: boolean,
  getSkillProgress: (skillId: string) => SkillProgress,
): JourneyStepStatus {
  if (isConceptComplete(concept, getSkillProgress)) {
    return "complete";
  }

  if (!isCurrent) {
    return "locked";
  }

  const mission = concept.missions[0];
  if (mission && isMasteryCheckMission(mission)) {
    return "reward";
  }

  return "current";
}

// @SECTION JOURNEY_STEPS
export function getJourneySteps(
  getSkillProgress: (skillId: string) => SkillProgress,
  focusConceptId?: string,
): JourneyStep[] {
  const chapter = focusConceptId
    ? getChapterForConcept(focusConceptId)
    : getPathway().chapters[0];

  if (!chapter) {
    return [];
  }

  const steps: JourneyStep[] = [];
  const concepts = chapter.concepts;

  // Virtual "Start" node. It is complete once the journey has begun.
  const firstConcept = concepts[0];
  const journeyBegun =
    firstConcept && getConceptUnlockState(firstConcept.id, getSkillProgress).unlocked;
  steps.push({
    id: "journey-start",
    title: "Start",
    status: journeyBegun ? "complete" : "locked",
  });

  let currentFound = false;

  for (const concept of concepts) {
    const unlockState = getConceptUnlockState(concept.id, getSkillProgress);
    const isCurrent = unlockState.unlocked && !isConceptComplete(concept, getSkillProgress) && !currentFound;

    if (isCurrent) {
      currentFound = true;
    }

    steps.push({
      id: concept.id,
      title: concept.title,
      status: getConceptJourneyStatus(concept, isCurrent, getSkillProgress),
      conceptId: concept.id,
    });
  }

  return steps;
}

// @SECTION CURRENT_MISSION
export function getCurrentMission(
  getSkillProgress: (skillId: string) => SkillProgress,
): DailyMission | null {
  const concepts = getPathwayConceptOrder();

  for (const concept of concepts) {
    const unlockState = getConceptUnlockState(concept.id, getSkillProgress);
    if (!unlockState.unlocked || isConceptComplete(concept, getSkillProgress)) {
      continue;
    }

    const mission = concept.missions[0];
    if (!mission) {
      continue;
    }

    const isReview = isMasteryCheckMission(mission);
    const estimatedMinutes = isReview ? 15 : 10;
    const subtitle = isReview
      ? "Show what you know and earn your mastery reward."
      : "Learn, practice, and grow your math power.";
    const rationale = isReview
      ? "You're ready to prove mastery of this concept."
      : "This is the next unlocked concept on your pathway.";

    return {
      conceptId: concept.id,
      missionId: mission.id,
      title: concept.title,
      subtitle,
      to: `/lesson/${mission.lessonId}`,
      estimatedMinutes,
      rationale,
      isReview,
    };
  }

  return null;
}

// @SECTION SUMMARY_STATS
export function getSummaryStats(
  getSkillProgress: (skillId: string) => SkillProgress,
): SummaryStats {
  const concepts = getPathwayConceptOrder();
  const skills = getAllSkills();

  const conceptsComplete = concepts.filter((concept) =>
    isConceptComplete(concept, getSkillProgress),
  ).length;

  const skillsMastered = skills.filter(
    (skill) => getSkillProgress(skill.id).status === "mastered",
  ).length;

  const streakDays = computeActiveStreak(getSkillProgress, skills.map((skill) => skill.id));

  return {
    conceptsComplete,
    conceptsTotal: concepts.length,
    skillsMastered,
    skillsTotal: skills.length,
    streakDays,
  };
}

function computeActiveStreak(
  getSkillProgress: (skillId: string) => SkillProgress,
  skillIds: string[],
): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWorkedTimestamps = skillIds
    .map((skillId) => getSkillProgress(skillId).lastWorkedAt)
    .filter((timestamp): timestamp is string => typeof timestamp === "string");

  if (lastWorkedTimestamps.length === 0) {
    return 0;
  }

  const mostRecent = new Date(
    Math.max(...lastWorkedTimestamps.map((timestamp) => new Date(timestamp).getTime())),
  );
  const mostRecentDay = new Date(
    mostRecent.getFullYear(),
    mostRecent.getMonth(),
    mostRecent.getDate(),
  );

  if (mostRecentDay.getTime() === today.getTime()) {
    return 1;
  }

  if (mostRecentDay.getTime() === yesterday.getTime()) {
    return 1;
  }

  return 0;
}

// @SECTION PATHWAY_ACCESS
export { getPathway } from "../../data/curriculum/curriculumGraph";

// @SECTION PATHWAY_PROGRESS
export function getPathwayProgress(
  getSkillProgress: (skillId: string) => SkillProgress,
): PathwayProgress {
  const stats = getSummaryStats(getSkillProgress);
  const total = stats.conceptsTotal || 1;
  const completed = stats.conceptsComplete;
  return {
    completed,
    total,
    percent: Math.round((completed / total) * 100),
  };
}
