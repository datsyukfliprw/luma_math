// @SECTION FILE_OVERVIEW
// useDailyMission.ts
// React hook that wires the daily mission planner to StudentProgressContext.
// It recomputes the current mission, journey, and stats whenever skill
// progress changes, keeping the home screen data-driven.

import { useMemo } from "react";
import { useStudentProgress } from "../../contexts/StudentProgressContext";
import {
  getCurrentMission,
  getJourneySteps,
  getPathway,
  getPathwayProgress,
  getSummaryStats,
} from "./dailyMissionPlanner";

export function useDailyMission() {
  const { getSkillProgress } = useStudentProgress();

  return useMemo(() => {
    const currentMission = getCurrentMission(getSkillProgress);

    return {
      pathway: getPathway(),
      currentMission,
      journeySteps: getJourneySteps(getSkillProgress, currentMission?.conceptId),
      summary: getSummaryStats(getSkillProgress),
      progress: getPathwayProgress(getSkillProgress),
    };
  }, [getSkillProgress]);
}
