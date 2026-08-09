import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createLocalStudent,
  getInitialActiveStudentId,
  getLocalStudentProfiles,
  setActiveStudentId,
} from "./studentProfiles";

const STAR_PROFILE_STORAGE_KEY = "lumamath_star_profiles";
const LESSON_PROGRESS_STORAGE_KEY = "lumamath_lesson_progress";

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
      return values.has(key) ? values.get(key) ?? null : null;
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

describe("local student profiles", () => {
  let localStorage: Storage;

  beforeEach(() => {
    localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts without an active student on a fresh device", () => {
    expect(getLocalStudentProfiles()).toEqual([]);
    expect(getInitialActiveStudentId()).toBeNull();
  });

  it("creates separate local student profiles and remembers the active student", () => {
    const first = createLocalStudent("Ava");
    const second = createLocalStudent("Gavin");

    expect(getLocalStudentProfiles().map((profile) => profile.studentName)).toEqual([
      "Ava",
      "Gavin",
    ]);

    setActiveStudentId(first.id);
    expect(getInitialActiveStudentId()).toBe(first.id);

    setActiveStudentId(second.id);
    expect(getInitialActiveStudentId()).toBe(second.id);
  });

  it("migrates legacy default-student progress into a selectable profile", () => {
    localStorage.setItem(
      LESSON_PROGRESS_STORAGE_KEY,
      JSON.stringify({ "default-student": { "g3-u1-w1-l1": { lessonComplete: true } } }),
    );

    const profiles = getLocalStudentProfiles();

    expect(profiles).toHaveLength(1);
    expect(profiles[0].id).toBe("default-student");
    expect(profiles[0].studentName).toBe("Student");

    const storedProfiles = JSON.parse(localStorage.getItem(STAR_PROFILE_STORAGE_KEY) ?? "{}");
    expect(storedProfiles["default-student"]).toBeDefined();
  });
});
