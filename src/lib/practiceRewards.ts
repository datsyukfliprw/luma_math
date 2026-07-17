import type { PracticeMode } from "../practiceTypes/types";

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
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllPracticeRewards(rewards: Record<string, StudentPracticeRewardState>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
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
