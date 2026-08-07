export type SeededRng = {
  next(): number;
  nextInt(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
};

function hashString(str: string): number {
  let h = 0xdeadbeef;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 2_654_435_761);
  }
  h = Math.imul(h ^ (h >>> 16), 2_246_822_507);
  h = Math.imul(h ^ (h >>> 13), 3_266_489_909);
  return h >>> 0;
}

export function createSeededRng(seed: string | number = 0): SeededRng {
  let s: number;
  if (typeof seed === "string") {
    s = hashString(seed);
  } else {
    s = seed >>> 0;
  }
  if (s === 0) s = 1;

  const state = { a: s };

  const next = (): number => {
    let t = (state.a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };

  const nextInt = (min: number, max: number): number => {
    if (min > max) {
      throw new RangeError(`nextInt: min (${min}) must be <= max (${max})`);
    }
    return Math.floor(next() * (max - min + 1)) + min;
  };

  const pick = <T>(items: readonly T[]): T => {
    if (items.length === 0) {
      throw new Error("pick: empty array");
    }
    return items[nextInt(0, items.length - 1)];
  };

  const shuffle = <T>(items: readonly T[]): T[] => {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = nextInt(0, i);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  return { next, nextInt, pick, shuffle };
}

/**
 * Build a stable, deterministic practice-session seed.
 *
 * The returned seed is a pure function of the supplied identifiers; it does not
 * use `Date.now()`, `Math.random`, browser globals, or any mutable global
 * state. A caller (e.g. `PracticeScreen`) should create one seed per mounted
 * lesson/mode session, store it in component state or a ref, and pass it as
 * `options.seed` on every render. Reusing the same seed produces identical
 * problems; passing a different `sessionId` produces a different session.
 *
 * If `sessionId` is omitted, the seed is stable for the same lesson/mode,
 * which is the generator's fallback when `options.seed` is not supplied.
 */
export function createPracticeSessionSeed(
  lessonId: string,
  practiceType: string,
  mode: string,
  sessionId?: string,
): string {
  const sessionPart = sessionId?.trim() || "default";
  return `practice:${lessonId}:${practiceType}:${mode}:${sessionPart}`;
}
