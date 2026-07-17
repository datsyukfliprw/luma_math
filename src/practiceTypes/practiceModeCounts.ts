import type { PracticeGenerationOptions } from "./types";

export function getPracticeProblemCount(options?: PracticeGenerationOptions): number {
  if (options?.mode === "independent") return 12;
  if (options?.mode === "challenge") return 10;
  return 8;
}

export function takePracticeProblems<T>(problems: T[], options?: PracticeGenerationOptions): T[] {
  return problems.slice(0, getPracticeProblemCount(options));
}
