import { describe, it, expect } from "vitest";
import { getConceptByLessonId, getSkillsForLesson } from "../../data/curriculum/curriculumGraph";
import { getConceptUnlockState } from "./prerequisiteGraph";
import type { SkillProgress } from "../../types/mastery";

const FIRST_LESSON_ID = "g3-u1-w1-l1";
const SECOND_LESSON_ID = "g3-u1-w1-l2";

function emptySkill(skillId: string): SkillProgress {
  return {
    skillId,
    status: "not_started",
    evidenceCounts: { conceptual: 0, procedural: 0, transfer: 0, retention: 0 },
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}

function introducedSkill(skillId: string): SkillProgress {
  return {
    skillId,
    status: "introduced",
    evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
    totalCorrect: 1,
    totalAttempts: 1,
    currentStreak: 1,
    bestStreak: 1,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}

function developingSkill(skillId: string): SkillProgress {
  return {
    skillId,
    status: "developing",
    evidenceCounts: { conceptual: 1, procedural: 1, transfer: 0, retention: 0 },
    totalCorrect: 2,
    totalAttempts: 2,
    currentStreak: 2,
    bestStreak: 2,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}

describe("getConceptUnlockState", () => {
  const firstConcept = getConceptByLessonId(FIRST_LESSON_ID);
  const secondConcept = getConceptByLessonId(SECOND_LESSON_ID);

  it("always unlocks the first pathway concept for a fresh student", () => {
    if (!firstConcept) throw new Error("First concept not found");
    const getSkillProgress = (skillId: string) => emptySkill(skillId);

    expect(getConceptUnlockState(firstConcept.id, getSkillProgress).unlocked).toBe(true);
  });

  it("locks the second concept when the previous concept has no evidence", () => {
    if (!firstConcept || !secondConcept) throw new Error("Concepts not found");
    const getSkillProgress = (skillId: string) => emptySkill(skillId);
    const state = getConceptUnlockState(secondConcept.id, getSkillProgress);

    expect(state.unlocked).toBe(false);
    expect(state.previousConceptBlocking).toBe(true);
  });

  it("unlocks the second concept once the previous concept's skills are introduced", () => {
    if (!firstConcept || !secondConcept) throw new Error("Concepts not found");
    const firstSkillIds = new Set(getSkillsForLesson(FIRST_LESSON_ID).map((skill) => skill.id));
    const getSkillProgress = (skillId: string) =>
      firstSkillIds.has(skillId) ? introducedSkill(skillId) : emptySkill(skillId);
    const state = getConceptUnlockState(secondConcept.id, getSkillProgress);

    expect(state.unlocked).toBe(true);
    expect(state.previousConceptStatus).toBe("introduced");
  });

  it("still unlocks the second concept when the previous concept's skills are developing", () => {
    if (!firstConcept || !secondConcept) throw new Error("Concepts not found");
    const firstSkillIds = new Set(getSkillsForLesson(FIRST_LESSON_ID).map((skill) => skill.id));
    const getSkillProgress = (skillId: string) =>
      firstSkillIds.has(skillId) ? developingSkill(skillId) : emptySkill(skillId);
    const state = getConceptUnlockState(secondConcept.id, getSkillProgress);

    expect(state.unlocked).toBe(true);
    expect(state.previousConceptStatus).toBe("developing");
  });

  it("is deterministic for the same skill progress", () => {
    if (!secondConcept) throw new Error("Second concept not found");
    const firstSkillIds = new Set(getSkillsForLesson(FIRST_LESSON_ID).map((skill) => skill.id));
    const getSkillProgress = (skillId: string) =>
      firstSkillIds.has(skillId) ? developingSkill(skillId) : emptySkill(skillId);

    const first = getConceptUnlockState(secondConcept.id, getSkillProgress);
    const second = getConceptUnlockState(secondConcept.id, getSkillProgress);

    expect(first).toEqual(second);
  });
});
