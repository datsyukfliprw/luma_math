// @SECTION FILE_OVERVIEW
// useProgressReport.ts
// React hook that builds a student-facing progress report for the full
// mastery pathway, including chapter/concept breakdowns and skill counts.

import { useMemo } from "react";
import { useStudentProgress } from "../../contexts/StudentProgressContext";
import { getPathway } from "../../data/curriculum/curriculumGraph";
import type { MasteryStatus } from "../../types/mastery";
import {
  evaluateConceptMastery,
  evaluateSkillMastery,
  MasteryStatusRank,
} from "../mastery/evaluateMastery";
import { getConceptUnlockState } from "../prerequisites/prerequisiteGraph";
import { getCurrentMission, getPathwayProgress, getSummaryStats } from "../mission/dailyMissionPlanner";
import type { DailyMission, SummaryStats } from "../mission/dailyMissionPlanner";

export type ConceptProgress = {
  id: string;
  title: string;
  status: MasteryStatus;
  locked: boolean;
  completedSkills: number;
  totalSkills: number;
  percent: number;
};

export type ChapterProgress = {
  id: string;
  title: string;
  concepts: ConceptProgress[];
  completedConcepts: number;
  totalConcepts: number;
};

export type ProgressReportData = {
  studentName: string;
  grade: number;
  pathwayTitle: string;
  progressPercent: number;
  summary: SummaryStats;
  currentMission: DailyMission | null;
  chapters: ChapterProgress[];
};

function isSkillComplete(status: MasteryStatus): boolean {
  return MasteryStatusRank[status] >= MasteryStatusRank["provisionally_mastered"];
}

function isConceptComplete(status: MasteryStatus, locked: boolean): boolean {
  return !locked && MasteryStatusRank[status] >= MasteryStatusRank["provisionally_mastered"];
}

export function useProgressReport(): ProgressReportData {
  const { studentState, getSkillProgress } = useStudentProgress();

  return useMemo(() => {
    const pathway = getPathway();
    const summary = getSummaryStats(getSkillProgress);
    const progress = getPathwayProgress(getSkillProgress);
    const currentMission = getCurrentMission(getSkillProgress);

    const chapters: ChapterProgress[] = pathway.chapters.map((chapter) => {
      const concepts: ConceptProgress[] = chapter.concepts.map((concept) => {
        const unlockState = getConceptUnlockState(concept.id, getSkillProgress);
        const status = evaluateConceptMastery(concept, getSkillProgress);

        let completedSkills = 0;
        for (const skillId of concept.skillIds) {
          const skillStatus = evaluateSkillMastery(getSkillProgress(skillId));
          if (isSkillComplete(skillStatus)) {
            completedSkills += 1;
          }
        }

        return {
          id: concept.id,
          title: concept.title,
          status,
          locked: !unlockState.unlocked,
          completedSkills,
          totalSkills: concept.skillIds.length,
          percent:
            concept.skillIds.length > 0
              ? Math.round((completedSkills / concept.skillIds.length) * 100)
              : 0,
        };
      });

      const completedConcepts = concepts.filter((concept) =>
        isConceptComplete(concept.status, concept.locked),
      ).length;

      return {
        id: chapter.id,
        title: chapter.title,
        concepts,
        completedConcepts,
        totalConcepts: concepts.length,
      };
    });

    return {
      studentName: studentState.starProfile.studentName || "Explorer",
      grade: studentState.starProfile.grade,
      pathwayTitle: pathway.title,
      progressPercent: progress.percent,
      summary,
      currentMission,
      chapters,
    };
  }, [studentState, getSkillProgress]);
}
