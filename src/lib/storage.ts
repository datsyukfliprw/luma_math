// Small wrappers around window.localStorage that keep persistence failures
// visible instead of silently swallowing them. Reads fall back to a default
// (corrupted or unavailable storage should not crash the app), but every
// failure is logged so it can be diagnosed. Writes report whether they
// succeeded so callers can react when persistence is unavailable
// (e.g. quota exceeded or private-browsing restrictions).

const isBrowser = typeof window !== "undefined";

export function readStoredJson<T>(storageKey: string, fallback: T): T {
  if (!isBrowser) {
    return fallback;
  }

  let raw: string | null;

  try {
    raw = window.localStorage.getItem(storageKey);
  } catch (error) {
    console.warn(`Unable to read "${storageKey}" from localStorage.`, error);
    return fallback;
  }

  if (raw === null) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Stored value for "${storageKey}" is not valid JSON; using fallback.`, error);
    return fallback;
  }
}

export function writeStoredJson(storageKey: string, value: unknown): boolean {
  if (!isBrowser) {
    return false;
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Unable to persist "${storageKey}" to localStorage.`, error);
    return false;
  }
}
