import type { SessionResult } from "../../types/sessionResults";

const RECENT_RESULT_KEY = "lumamath.recentSessionResult";
const ACTIVE_STUDENT_STORAGE_KEY = "lumamath.activeStudentId";

function isSessionResult(value: unknown): value is SessionResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SessionResult>;
  return candidate.kind === "practice" || candidate.kind === "evaluation";
}

function getRecentResultStorageKey(): string {
  if (typeof window === "undefined") return RECENT_RESULT_KEY;

  try {
    const activeStudentId = window.localStorage.getItem(ACTIVE_STUDENT_STORAGE_KEY);
    return activeStudentId
      ? `${RECENT_RESULT_KEY}.${encodeURIComponent(activeStudentId)}`
      : RECENT_RESULT_KEY;
  } catch {
    return RECENT_RESULT_KEY;
  }
}

export function saveRecentSessionResult(result: SessionResult): void {
  if (typeof window === "undefined") return;

  try {
    window.sessionStorage.setItem(getRecentResultStorageKey(), JSON.stringify(result));
  } catch {
    // Results are convenience state. Progress itself is persisted separately,
    // so storage failures must never block the learning flow.
  }
}

export function readRecentSessionResult(): SessionResult | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const raw = window.sessionStorage.getItem(getRecentResultStorageKey());
    if (!raw) return undefined;
    const parsed: unknown = JSON.parse(raw);
    return isSessionResult(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
