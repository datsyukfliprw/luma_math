// @SECTION FILE_OVERVIEW
// useParentDashboard.ts
// React hook that gathers parent-facing analytics from the mastery services:
// summary stats, projected pacing, retention reviews due, and intervention alerts.

import { useMemo } from "react";
import { useStudentProgress } from "../../contexts/StudentProgressContext";
import { getAllSkills, getPathway, getSkillById } from "../../data/curriculum/curriculumGraph";
import {
  getCurrentMission,
  getPathwayProgress,
  getSummaryStats,
} from "../mission/dailyMissionPlanner";
import { isRefreshDue } from "../retention/retentionSchedule";
import { getIntervention } from "../intervention/interventionLadder";

export type PacingProjection = {
  remainingConcepts: number;
  estimatedMinutesPerDay: number;
  projectedFinishDate: string | null;
};

export type RetentionItem = {
  skillId: string;
  title: string;
  dueAt: string;
  isOverdue: boolean;
};

export type InterventionItem = {
  skillId: string;
  title: string;
  level: "extra_hint" | "worked_example" | "concept_review" | "pause";
  message: string;
  fallbackConceptTitle?: string;
};

export type ParentDashboardData = {
  studentName: string;
  grade: number;
  pathwayTitle: string;
  summary: {
    conceptsComplete: number;
    conceptsTotal: number;
    skillsMastered: number;
    skillsTotal: number;
    streakDays: number;
  };
  progressPercent: number;
  currentMissionTitle: string | null;
  pacing: PacingProjection;
  retentionDue: RetentionItem[];
  interventions: InterventionItem[];
};

function formatProjectionDate(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isOverdue(dueAt: string): boolean {
  const due = new Date(dueAt);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function useParentDashboard(): ParentDashboardData {
  const { studentState, getSkillProgress } = useStudentProgress();

  return useMemo(() => {
    const summary = getSummaryStats(getSkillProgress);
    const pathwayProgress = getPathwayProgress(getSkillProgress);
    const pathway = getPathway();
    const currentMission = getCurrentMission(getSkillProgress);

    const remainingConcepts = summary.conceptsTotal - summary.conceptsComplete;
    const pacing: PacingProjection = {
      remainingConcepts,
      estimatedMinutesPerDay: currentMission?.estimatedMinutes ?? 12,
      projectedFinishDate:
        remainingConcepts > 0 ? formatProjectionDate(remainingConcepts) : null,
    };

    const retentionDue: RetentionItem[] = [];
    const interventions: InterventionItem[] = [];

    for (const skill of getAllSkills()) {
      const progress = getSkillProgress(skill.id);

      if (isRefreshDue(progress)) {
        retentionDue.push({
          skillId: skill.id,
          title: skill.title,
          dueAt: progress.refreshDueAt ?? "",
          isOverdue: isOverdue(progress.refreshDueAt ?? ""),
        });
      }

      const intervention = getIntervention(skill.id, getSkillProgress, currentMission?.conceptId);
      if (intervention.level !== "none") {
        const skillInfo = getSkillById(skill.id);
        interventions.push({
          skillId: skill.id,
          title: skillInfo?.title ?? skill.id,
          level: intervention.level,
          message: intervention.message,
          fallbackConceptTitle: intervention.fallbackConceptTitle,
        });
      }
    }

    retentionDue.sort(
      (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
    );

    return {
      studentName: studentState.starProfile.studentName || "Student",
      grade: studentState.starProfile.grade,
      pathwayTitle: pathway.title,
      summary,
      progressPercent: pathwayProgress.percent,
      currentMissionTitle: currentMission?.title ?? null,
      pacing,
      retentionDue,
      interventions,
    };
  }, [studentState, getSkillProgress]);
}
