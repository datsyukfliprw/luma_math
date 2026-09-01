import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SessionResult } from "../../types/sessionResults";
import { readRecentSessionResult, saveRecentSessionResult } from "./recentSessionResult";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, String(value));
    },
  };
}

const practiceResult: SessionResult = {
  kind: "practice",
  lessonId: "g3-u1-w1-l1",
  lessonTitle: "Zero and Identity Rules",
  mode: "guided",
  correctCount: 6,
  totalCount: 6,
  firstAttemptCorrectCount: 5,
  firstAttemptTotalCount: 6,
  accuracy: 5 / 6,
  recommendedMode: "independent",
  nextLessonPath: "/lesson/g3-u1-w1-l2",
  lessonPath: "/lesson/g3-u1-w1-l1",
};

describe("recent session results", () => {
  let localStorage: Storage;
  let sessionStorage: Storage;

  beforeEach(() => {
    localStorage = createMemoryStorage();
    sessionStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage, sessionStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("restores the active student's most recent result after a refresh", () => {
    localStorage.setItem("lumamath.activeStudentId", "student-a");
    saveRecentSessionResult(practiceResult);

    expect(readRecentSessionResult()).toEqual(practiceResult);
  });

  it("does not expose one student's recent result after switching students", () => {
    localStorage.setItem("lumamath.activeStudentId", "student-a");
    saveRecentSessionResult(practiceResult);

    localStorage.setItem("lumamath.activeStudentId", "student-b");
    expect(readRecentSessionResult()).toBeUndefined();

    const studentBResult: SessionResult = {
      ...practiceResult,
      lessonId: "g3-u2-w1-l1",
      lessonTitle: "Place Value",
      lessonPath: "/lesson/g3-u2-w1-l1",
      nextLessonPath: "/lesson/g3-u2-w1-l2",
    };
    saveRecentSessionResult(studentBResult);

    localStorage.setItem("lumamath.activeStudentId", "student-a");
    expect(readRecentSessionResult()).toEqual(practiceResult);

    localStorage.setItem("lumamath.activeStudentId", "student-b");
    expect(readRecentSessionResult()).toEqual(studentBResult);
  });
});
