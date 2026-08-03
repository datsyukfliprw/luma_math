import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { PracticeMode } from "../practiceTypes/types";
import type { MasteryStatus, SkillEvidence, SkillProgress } from "../types/mastery";
import type {
  LessonPracticeRewardState,
  PracticeCompletionMetrics,
  PracticeCompletionResult,
  PracticeRewardsState,
} from "../types/practiceProgress";
import { applySkillEvidence } from "../services/mastery/applySkillEvidence";
import { applyMasteryStatusEffects } from "../services/mastery/applyMasteryStatusEffects";
import { createEmptySkillProgress } from "../services/mastery/createEmptySkillProgress";
import { markPracticeRewardTransaction } from "../services/progress/markPracticeRewardTransaction";
import { getAllSkills, getSkillsForLesson } from "../data/curriculum/curriculumGraph";

// Types from existing files
export type LessonProgress = {
  lessonId: string;
  warmupComplete: boolean;
  learnComplete: boolean;
  tryItComplete: boolean;
  practiceComplete: boolean;
  lessonComplete: boolean;
  correctAnswers: number;
  totalQuestions: number;
  updatedAt: string;
};

export type FlashcardAnswerState = "known" | "review_again";

export type FlashcardDeckProgress = {
  deckId: string;
  currentCardIndex: number;
  completed: boolean;
  knownCardIds: string[];
  reviewAgainCardIds: string[];
  answeredCardIds: string[];
  updatedAt: string;
  completedAt?: string;
};

export type StarItemSlot = "hat" | "glasses" | "neck" | "shoes" | "handheld" | "trail";

export type EquippedStarItems = {
  hat?: string;
  glasses?: string;
  neck?: string;
  shoes?: string;
  handheld?: string;
  trail?: string;
};

export type StarProfile = {
  studentName: string;
  grade: number;
  starName: string;
  ownedItemIds: string[];
  equipped: EquippedStarItems;
  updatedAt: string;
};

// Combined student state
export type StudentState = {
  lessonProgress: Record<string, LessonProgress>;
  skillProgress: Record<string, SkillProgress>;
  flashcardProgress: Record<string, FlashcardDeckProgress>;
  practiceRewards: PracticeRewardsState;
  starProfile: StarProfile;
};

// Context type
type StudentProgressContextValue = {
  studentId: string;
  studentState: StudentState;
  updateLessonProgress: (
    lessonId: string,
    updates: Partial<Omit<LessonProgress, "lessonId" | "updatedAt">>,
  ) => void;
  getLessonProgress: (lessonId: string) => LessonProgress;
  resetLessonProgress: (lessonId: string) => void;
  getSkillProgress: (skillId: string) => SkillProgress;
  recordSkillEvidence: (
    skillId: string,
    evidence: Omit<SkillEvidence, "skillId" | "timestamp">,
  ) => void;
  updateSkillStatus: (skillId: string, status: MasteryStatus) => void;
  getFlashcardDeckProgress: (deckId: string, cardIds?: string[]) => FlashcardDeckProgress;
  saveFlashcardDeckProgress: (deckId: string, progress: FlashcardDeckProgress) => void;
  recordFlashcardAnswer: (
    deckId: string,
    cardId: string,
    answerState: FlashcardAnswerState,
    cardIds: string[],
    currentCardIndex: number,
  ) => void;
  resetFlashcardDeckProgress: (deckId: string) => void;
  getPracticeRewardState: (lessonId: string) => LessonPracticeRewardState;
  markPracticeReward: (
    lessonId: string,
    mode: PracticeMode,
    metrics: PracticeCompletionMetrics,
  ) => PracticeCompletionResult;
  hasPracticeReward: (lessonId: string, mode: PracticeMode) => boolean;
  getRecommendedNextPracticeMode: (
    lessonId: string,
    currentMode: PracticeMode,
  ) => PracticeMode | null;
  updateStarProfile: (updates: Partial<Omit<StarProfile, "updatedAt">>) => void;
  resetStarProfile: () => void;
};

const StudentProgressContext = createContext<StudentProgressContextValue | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  lessonProgress: "lumamath_lesson_progress",
  skillProgress: "lumamath.skill_progress",
  flashcardProgress: "lumamath.flashcardProgress",
  practiceRewards: "lumamath.practiceRewards",
  starProfile: "lumamath_star_profiles",
};

// Helper functions
function readFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function getNextUnansweredCardIndex(
  cardIds: string[],
  answeredCardIds: string[],
  startIndex = 0,
): number {
  if (cardIds.length === 0) return 0;
  const safeStartIndex = Math.min(Math.max(startIndex, 0), cardIds.length - 1);

  for (let index = safeStartIndex; index < cardIds.length; index += 1) {
    if (!answeredCardIds.includes(cardIds[index])) return index;
  }

  for (let index = 0; index < safeStartIndex; index += 1) {
    if (!answeredCardIds.includes(cardIds[index])) return index;
  }

  return cardIds.length - 1;
}

function deriveSkillProgressFromLegacy(
  lessonProgress: Record<string, LessonProgress>,
): Record<string, SkillProgress> {
  const skillProgress: Record<string, SkillProgress> = {};

  for (const skill of getAllSkills()) {
    skillProgress[skill.id] = createEmptySkillProgress(skill.id);
  }

  for (const [lessonId, progress] of Object.entries(lessonProgress)) {
    const skills = getSkillsForLesson(lessonId);
    if (skills.length === 0) continue;

    if (progress.lessonComplete) {
      for (const skill of skills) {
        const current = skillProgress[skill.id] ?? createEmptySkillProgress(skill.id);
        current.status = "developing";
        current.lastWorkedAt = progress.updatedAt;
        if (!current.introducedAt) {
          current.introducedAt = progress.updatedAt;
        }
        skillProgress[skill.id] = current;
      }
    } else if (progress.learnComplete || progress.warmupComplete || progress.tryItComplete) {
      for (const skill of skills) {
        const current = skillProgress[skill.id] ?? createEmptySkillProgress(skill.id);
        if (current.status === "not_started") {
          current.status = "introduced";
        }
        if (!current.introducedAt) {
          current.introducedAt = progress.updatedAt;
        }
        current.lastWorkedAt = progress.updatedAt;
        skillProgress[skill.id] = current;
      }
    }
  }

  return skillProgress;
}

// Provider component
type StudentProgressProviderProps = {
  studentId: string;
  children: ReactNode;
};

export function StudentProgressProvider({ studentId, children }: StudentProgressProviderProps) {
  // Initialize state from localStorage
  const [studentState, setStudentState] = useState<StudentState>(() => {
    const allLessonProgress = readFromLocalStorage<Record<string, Record<string, LessonProgress>>>(
      STORAGE_KEYS.lessonProgress,
      {},
    );
    const allFlashcardProgress = readFromLocalStorage<
      Record<string, Record<string, FlashcardDeckProgress>>
    >(STORAGE_KEYS.flashcardProgress, {});
    const allPracticeRewards = readFromLocalStorage<
      Record<string, Record<string, LessonPracticeRewardState>>
    >(STORAGE_KEYS.practiceRewards, {});
    const allSkillProgress = readFromLocalStorage<Record<string, Record<string, SkillProgress>>>(
      STORAGE_KEYS.skillProgress,
      {},
    );
    const allStarProfiles = readFromLocalStorage<Record<string, StarProfile>>(
      STORAGE_KEYS.starProfile,
      {},
    );

    const savedLessonProgress = allLessonProgress[studentId] ?? {};
    const savedSkillProgress = allSkillProgress[studentId] ?? {};

    const skillProgress: Record<string, SkillProgress> =
      Object.keys(savedSkillProgress).length === 0
        ? deriveSkillProgressFromLegacy(savedLessonProgress)
        : (() => {
            const hydrated: Record<string, SkillProgress> = { ...savedSkillProgress };
            for (const skill of getAllSkills()) {
              if (!hydrated[skill.id]) {
                hydrated[skill.id] = createEmptySkillProgress(skill.id);
              }
            }
            return hydrated;
          })();

    return {
      lessonProgress: savedLessonProgress,
      skillProgress,
      flashcardProgress: allFlashcardProgress[studentId] ?? {},
      practiceRewards: allPracticeRewards[studentId] ?? {},
      starProfile: allStarProfiles[studentId] ?? {
        studentName: "",
        grade: 3,
        starName: "",
        ownedItemIds: [],
        equipped: {},
        updatedAt: new Date().toISOString(),
      },
    };
  });

  // Authoritative ref synchronized with the committed React state. This is the
  // source of truth for synchronous transactions such as markPracticeReward.
  const studentStateRef = useRef<StudentState>(studentState);

  useEffect(() => {
    studentStateRef.current = studentState;
  }, [studentState]);

  function commitStudentState(nextState: StudentState) {
    studentStateRef.current = nextState;
    setStudentState(nextState);
  }

  // Persist state to localStorage when it changes
  useEffect(() => {
    const allLessonProgress = readFromLocalStorage<Record<string, Record<string, LessonProgress>>>(
      STORAGE_KEYS.lessonProgress,
      {},
    );
    const allFlashcardProgress = readFromLocalStorage<
      Record<string, Record<string, FlashcardDeckProgress>>
    >(STORAGE_KEYS.flashcardProgress, {});
    const allPracticeRewards = readFromLocalStorage<
      Record<string, Record<string, LessonPracticeRewardState>>
    >(STORAGE_KEYS.practiceRewards, {});
    const allSkillProgress = readFromLocalStorage<Record<string, Record<string, SkillProgress>>>(
      STORAGE_KEYS.skillProgress,
      {},
    );
    const allStarProfiles = readFromLocalStorage<Record<string, StarProfile>>(
      STORAGE_KEYS.starProfile,
      {},
    );

    writeToLocalStorage(STORAGE_KEYS.lessonProgress, {
      ...allLessonProgress,
      [studentId]: studentState.lessonProgress,
    });
    writeToLocalStorage(STORAGE_KEYS.skillProgress, {
      ...allSkillProgress,
      [studentId]: studentState.skillProgress,
    });
    writeToLocalStorage(STORAGE_KEYS.flashcardProgress, {
      ...allFlashcardProgress,
      [studentId]: studentState.flashcardProgress,
    });
    writeToLocalStorage(STORAGE_KEYS.practiceRewards, {
      ...allPracticeRewards,
      [studentId]: studentState.practiceRewards,
    });
    writeToLocalStorage(STORAGE_KEYS.starProfile, {
      ...allStarProfiles,
      [studentId]: studentState.starProfile,
    });
  }, [studentId, studentState]);

  // Lesson progress functions
  const updateLessonProgress = (
    lessonId: string,
    updates: Partial<Omit<LessonProgress, "lessonId" | "updatedAt">>,
  ) => {
    setStudentState((prev) => {
      const currentProgress = prev.lessonProgress[lessonId] ?? {
        lessonId,
        warmupComplete: false,
        learnComplete: false,
        tryItComplete: false,
        practiceComplete: false,
        lessonComplete: false,
        correctAnswers: 0,
        totalQuestions: 0,
        updatedAt: new Date().toISOString(),
      };

      const timestamp = new Date().toISOString();

      const nextProgress: LessonProgress = {
        ...currentProgress,
        ...updates,
        updatedAt: timestamp,
      };

      nextProgress.lessonComplete =
        nextProgress.warmupComplete &&
        nextProgress.learnComplete &&
        nextProgress.tryItComplete &&
        nextProgress.practiceComplete;

      return {
        ...prev,
        lessonProgress: {
          ...prev.lessonProgress,
          [lessonId]: nextProgress,
        },
      };
    });
  };

  const getLessonProgress = (lessonId: string): LessonProgress => {
    return (
      studentState.lessonProgress[lessonId] ?? {
        lessonId,
        warmupComplete: false,
        learnComplete: false,
        tryItComplete: false,
        practiceComplete: false,
        lessonComplete: false,
        correctAnswers: 0,
        totalQuestions: 0,
        updatedAt: new Date().toISOString(),
      }
    );
  };

  const resetLessonProgress = (lessonId: string) => {
    setStudentState((prev) => {
      const newLessonProgress = { ...prev.lessonProgress };
      delete newLessonProgress[lessonId];
      return {
        ...prev,
        lessonProgress: newLessonProgress,
      };
    });
  };

  // Skill progress functions
  const getSkillProgress = (skillId: string): SkillProgress => {
    return studentState.skillProgress[skillId] ?? createEmptySkillProgress(skillId);
  };

  const recordSkillEvidence = (
    skillId: string,
    evidence: Omit<SkillEvidence, "skillId" | "timestamp">,
  ) => {
    setStudentState((prev) => {
      const current = prev.skillProgress[skillId] ?? createEmptySkillProgress(skillId);
      const timestamp = new Date().toISOString();

      return {
        ...prev,
        skillProgress: {
          ...prev.skillProgress,
          [skillId]: applySkillEvidence(current, { ...evidence, timestamp }),
        },
      };
    });
  };

  const updateSkillStatus = (skillId: string, status: MasteryStatus) => {
    setStudentState((prev) => {
      const current = prev.skillProgress[skillId] ?? createEmptySkillProgress(skillId);
      const timestamp = new Date().toISOString();
      const nextProgress = applyMasteryStatusEffects({ ...current, skillId }, status, timestamp);

      return {
        ...prev,
        skillProgress: {
          ...prev.skillProgress,
          [skillId]: nextProgress,
        },
      };
    });
  };

  // Flashcard progress functions
  const getFlashcardDeckProgress = (
    deckId: string,
    cardIds: string[] = [],
  ): FlashcardDeckProgress => {
    const savedProgress = studentState.flashcardProgress[deckId];

    if (!savedProgress) {
      return {
        deckId,
        currentCardIndex: 0,
        completed: false,
        knownCardIds: [],
        reviewAgainCardIds: [],
        answeredCardIds: [],
        updatedAt: new Date().toISOString(),
      };
    }

    const answeredCardIds = unique(
      savedProgress.answeredCardIds ?? [
        ...(savedProgress.knownCardIds ?? []),
        ...(savedProgress.reviewAgainCardIds ?? []),
      ],
    );

    const completed =
      savedProgress.completed || (cardIds.length > 0 && answeredCardIds.length >= cardIds.length);

    return {
      ...savedProgress,
      deckId,
      knownCardIds: unique(savedProgress.knownCardIds ?? []),
      reviewAgainCardIds: unique(savedProgress.reviewAgainCardIds ?? []),
      answeredCardIds,
      completed,
      currentCardIndex: completed
        ? Math.min(
            savedProgress.currentCardIndex ?? cardIds.length - 1,
            Math.max(cardIds.length - 1, 0),
          )
        : getNextUnansweredCardIndex(cardIds, answeredCardIds, savedProgress.currentCardIndex ?? 0),
    };
  };

  const saveFlashcardDeckProgress = (deckId: string, progress: FlashcardDeckProgress) => {
    setStudentState((prev) => ({
      ...prev,
      flashcardProgress: {
        ...prev.flashcardProgress,
        [deckId]: progress,
      },
    }));
  };

  const recordFlashcardAnswer = (
    deckId: string,
    cardId: string,
    answerState: FlashcardAnswerState,
    cardIds: string[],
    currentCardIndex: number,
  ) => {
    const previousProgress = getFlashcardDeckProgress(deckId, cardIds);

    const knownCardIds =
      answerState === "known"
        ? unique([...previousProgress.knownCardIds, cardId])
        : previousProgress.knownCardIds.filter((knownCardId) => knownCardId !== cardId);

    const reviewAgainCardIds =
      answerState === "review_again"
        ? unique([...previousProgress.reviewAgainCardIds, cardId])
        : previousProgress.reviewAgainCardIds.filter((reviewCardId) => reviewCardId !== cardId);

    const answeredCardIds = unique([...previousProgress.answeredCardIds, cardId]);

    const completed = cardIds.length > 0 && answeredCardIds.length >= cardIds.length;
    const nextCardIndex = completed
      ? currentCardIndex
      : getNextUnansweredCardIndex(cardIds, answeredCardIds, currentCardIndex + 1);

    const nextProgress: FlashcardDeckProgress = {
      deckId,
      currentCardIndex: nextCardIndex,
      completed,
      knownCardIds,
      reviewAgainCardIds,
      answeredCardIds,
      updatedAt: new Date().toISOString(),
      completedAt: completed
        ? (previousProgress.completedAt ?? new Date().toISOString())
        : undefined,
    };

    saveFlashcardDeckProgress(deckId, nextProgress);
  };

  const resetFlashcardDeckProgress = (deckId: string) => {
    setStudentState((prev) => {
      const newFlashcardProgress = { ...prev.flashcardProgress };
      delete newFlashcardProgress[deckId];
      return {
        ...prev,
        flashcardProgress: newFlashcardProgress,
      };
    });
  };

  // Practice rewards functions
  const getPracticeRewardState = (lessonId: string): LessonPracticeRewardState => {
    return studentState.practiceRewards[lessonId] ?? {};
  };

  const hasPracticeReward = (lessonId: string, mode: PracticeMode): boolean => {
    return getPracticeRewardState(lessonId)[mode]?.completed === true;
  };

  const markPracticeReward = (
    lessonId: string,
    mode: PracticeMode,
    metrics: PracticeCompletionMetrics,
  ): PracticeCompletionResult => {
    const snapshot = studentStateRef.current;
    const timestamp = new Date().toISOString();

    const { result, nextState } = markPracticeRewardTransaction(
      snapshot,
      lessonId,
      mode,
      timestamp,
      metrics,
    );

    if (!result.ok) {
      return result;
    }

    commitStudentState(nextState);
    return result;
  };

  // Practice recommendation function
  const getRecommendedNextPracticeMode = (
    lessonId: string,
    currentMode: PracticeMode,
  ): PracticeMode | null => {
    const rewardState = getPracticeRewardState(lessonId);

    // Practice mode progression: guided → independent → challenge
    if (currentMode === "guided" && !rewardState.independent?.completed) {
      return "independent";
    }
    if (currentMode === "independent" && !rewardState.challenge?.completed) {
      return "challenge";
    }

    // If current mode is challenge or all modes are complete, no recommendation
    return null;
  };

  // Star profile functions
  const updateStarProfile = (updates: Partial<Omit<StarProfile, "updatedAt">>) => {
    setStudentState((prev) => {
      const currentProfile = prev.starProfile;

      const nextProfile: StarProfile = {
        ...currentProfile,
        ...updates,
        studentName:
          (updates.studentName !== undefined
            ? updates.studentName.trim().slice(0, 32)
            : currentProfile.studentName) ?? "",
        grade:
          (updates.grade !== undefined
            ? Math.max(0, Math.min(6, Math.floor(updates.grade)))
            : currentProfile.grade) ?? 3,
        starName:
          updates.starName !== undefined
            ? updates.starName.trim().slice(0, 16)
            : currentProfile.starName,
        equipped: {
          ...currentProfile.equipped,
          ...updates.equipped,
        },
        updatedAt: new Date().toISOString(),
      };

      return {
        ...prev,
        starProfile: nextProfile,
      };
    });
  };

  const resetStarProfile = () => {
    setStudentState((prev) => ({
      ...prev,
      starProfile: {
        studentName: "",
        grade: 3,
        starName: "",
        ownedItemIds: [],
        equipped: {},
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const value: StudentProgressContextValue = {
    studentId,
    studentState,
    updateLessonProgress,
    getLessonProgress,
    resetLessonProgress,
    getSkillProgress,
    recordSkillEvidence,
    updateSkillStatus,
    getFlashcardDeckProgress,
    saveFlashcardDeckProgress,
    recordFlashcardAnswer,
    resetFlashcardDeckProgress,
    getPracticeRewardState,
    markPracticeReward,
    hasPracticeReward,
    getRecommendedNextPracticeMode,
    updateStarProfile,
    resetStarProfile,
  };

  return (
    <StudentProgressContext.Provider value={value}>{children}</StudentProgressContext.Provider>
  );
}

// Hook to use the context
// eslint-disable-next-line react-refresh/only-export-components
export function useStudentProgress(): StudentProgressContextValue {
  const context = useContext(StudentProgressContext);
  if (!context) {
    throw new Error("useStudentProgress must be used within StudentProgressProvider");
  }
  return context;
}
