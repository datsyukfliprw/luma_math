import type { PracticeMode } from "../practiceTypes/types";
import { readStoredJson, writeStoredJson } from "./storage";

type PracticeRewardRecord = {
  completed: boolean;
  rewardId: string;
  completedAt: string;
};

type LessonPracticeRewardState = Partial<Record<PracticeMode, PracticeRewardRecord>>;

type StudentPracticeRewardState = Record<string, LessonPracticeRewardState>;

const STORAGE_KEY = "lumamath.practiceRewards";

const REWARD_IDS: Record<PracticeMode, string> = {
  guided: "common_star_accessory",
  independent: "rare_star_accessory",
  challenge: "epic_star_accessory",
};

function readAllPracticeRewards(): Record<string, StudentPracticeRewardState> {
  return readStoredJson<Record<string, StudentPracticeRewardState>>(STORAGE_KEY, {});
}

function writeAllPracticeRewards(rewards: Record<string, StudentPracticeRewardState>) {
  writeStoredJson(STORAGE_KEY, rewards);
}

export function getPracticeRewardState(
  studentId: string,
  lessonId: string,
): LessonPracticeRewardState {
  const rewards = readAllPracticeRewards();
  return rewards[studentId]?.[lessonId] ?? {};
}

export function hasPracticeReward(studentId: string, lessonId: string, mode: PracticeMode) {
  return getPracticeRewardState(studentId, lessonId)[mode]?.completed === true;
}

export function markPracticeReward(studentId: string, lessonId: string, mode: PracticeMode) {
  const rewards = readAllPracticeRewards();
  const studentRewards = rewards[studentId] ?? {};
  const lessonRewards = studentRewards[lessonId] ?? {};

  if (lessonRewards[mode]?.completed) {
    return lessonRewards[mode];
  }

  const rewardRecord: PracticeRewardRecord = {
    completed: true,
    rewardId: REWARD_IDS[mode],
    completedAt: new Date().toISOString(),
  };

  const nextRewards = {
    ...rewards,
    [studentId]: {
      ...studentRewards,
      [lessonId]: {
        ...lessonRewards,
        [mode]: rewardRecord,
      },
    },
  };

  writeAllPracticeRewards(nextRewards);
  return rewardRecord;
}

export function getRecommendedNextPracticeMode(
  studentId: string,
  lessonId: string,
  currentMode: PracticeMode,
): PracticeMode | null {
  const hasIndependent = hasPracticeReward(studentId, lessonId, "independent");
  const hasChallenge = hasPracticeReward(studentId, lessonId, "challenge");

  if (currentMode === "guided") {
    if (!hasIndependent) return "independent";
    if (!hasChallenge) return "challenge";
    return null;
  }

  if (currentMode === "independent") {
    if (!hasChallenge) return "challenge";
    return null;
  }

  return null;
}
