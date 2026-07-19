import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export function resolvePracticeMode(options?: PracticeGenerationOptions): string {
  return options?.mode ?? "guided";
}

type BankedProblemBuildContext = {
  id: string;
  index: number;
  mode: string;
};

export function generateBankedProblems<TEntry>({
  slug,
  bank,
  challengeBank,
  options,
  build,
}: {
  slug: string;
  bank: readonly TEntry[];
  challengeBank?: readonly TEntry[];
  options?: PracticeGenerationOptions;
  build: (entry: TEntry, context: BankedProblemBuildContext) => PracticeProblem;
}): PracticeProblem[] {
  const mode = resolvePracticeMode(options);
  const source = options?.mode === "challenge" && challengeBank ? challengeBank : bank;

  return takePracticeProblems(
    source.map((entry, index) => build(entry, { id: `${slug}-${mode}-${index + 1}`, index, mode })),
    options,
  );
}
