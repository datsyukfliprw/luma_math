import type { StarProfile } from "../contexts/StudentProgressContext";

const STAR_PROFILE_STORAGE_KEY = "lumamath_star_profiles";
const LESSON_PROGRESS_STORAGE_KEY = "lumamath_lesson_progress";
const ACTIVE_STUDENT_STORAGE_KEY = "lumamath.activeStudentId";
const LEGACY_STUDENT_ID = "default-student";

export type LocalStudentProfile = {
  id: string;
  studentName: string;
  grade: number;
  updatedAt: string;
};

type StarProfileMap = Record<string, StarProfile>;

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function cleanStudentName(name: string): string {
  return name.trim().slice(0, 32);
}

function buildEmptyProfile(studentName: string): StarProfile {
  return {
    studentName,
    grade: 3,
    starName: "",
    ownedItemIds: [],
    equipped: {},
    updatedAt: new Date().toISOString(),
  };
}

function hasLegacyDefaultProgress(): boolean {
  const lessonProgress = readStorage<Record<string, Record<string, unknown>>>(
    LESSON_PROGRESS_STORAGE_KEY,
    {},
  );

  return Boolean(lessonProgress[LEGACY_STUDENT_ID]);
}

function ensureLegacyProfile(): StarProfileMap {
  const profiles = readStorage<StarProfileMap>(STAR_PROFILE_STORAGE_KEY, {});

  if (Object.keys(profiles).length > 0 || !hasLegacyDefaultProgress()) {
    return profiles;
  }

  const migrated = {
    ...profiles,
    [LEGACY_STUDENT_ID]: buildEmptyProfile("Student"),
  };

  writeStorage(STAR_PROFILE_STORAGE_KEY, migrated);
  return migrated;
}

export function getLocalStudentProfiles(): LocalStudentProfile[] {
  const profiles = ensureLegacyProfile();

  return Object.entries(profiles)
    .map(([id, profile]) => ({
      id,
      studentName: cleanStudentName(profile.studentName) || "Student",
      grade: profile.grade || 3,
      updatedAt: profile.updatedAt,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export function getInitialActiveStudentId(): string | null {
  const profiles = getLocalStudentProfiles();
  if (profiles.length === 0) return null;

  if (typeof window !== "undefined") {
    const savedId = window.localStorage.getItem(ACTIVE_STUDENT_STORAGE_KEY);
    if (savedId && profiles.some((profile) => profile.id === savedId)) {
      return savedId;
    }
  }

  return profiles[0].id;
}

export function setActiveStudentId(studentId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_STUDENT_STORAGE_KEY, studentId);
}

export function createLocalStudent(studentName: string): LocalStudentProfile {
  const cleanedName = cleanStudentName(studentName);
  if (!cleanedName) {
    throw new Error("Student name is required.");
  }

  const id = `student-${globalThis.crypto.randomUUID()}`;
  const profile = buildEmptyProfile(cleanedName);
  const profiles = readStorage<StarProfileMap>(STAR_PROFILE_STORAGE_KEY, {});

  writeStorage(STAR_PROFILE_STORAGE_KEY, {
    ...profiles,
    [id]: profile,
  });
  setActiveStudentId(id);

  return {
    id,
    studentName: cleanedName,
    grade: 3,
    updatedAt: profile.updatedAt,
  };
}
