import { generateBankedProblems } from "./generateBankedProblems";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function makeCommutativeProblem({
  id,
  factorA,
  factorB,
  distractorA,
  distractorB,
}: {
  id: string;
  factorA: number;
  factorB: number;
  distractorA: string;
  distractorB: string;
}): PracticeProblem {
  const correctAnswer = `${factorB} × ${factorA}`;

  return {
    id,
    questionText: `Which equation matches ${factorA} × ${factorB}?`,
    correctAnswer,
    visualType: "multiple_choice",
    problemKey: `commutative-${factorA}x${factorB}`,
    visualData: {
      equation: `${factorA} × ${factorB} = ${correctAnswer}`,
      choices: [correctAnswer, distractorA, distractorB],
    },
  };
}

const commutativeBank = [
  [3, 4, "3 × 5", "4 × 4"],
  [2, 6, "2 × 5", "6 × 6"],
  [5, 3, "5 × 5", "3 × 4"],
  [4, 2, "4 × 3", "2 × 2"],
  [6, 3, "6 × 4", "3 × 3"],
  [2, 8, "2 × 7", "8 × 8"],
  [5, 4, "5 × 3", "4 × 4"],
  [7, 2, "7 × 3", "2 × 2"],
  [3, 6, "3 × 5", "6 × 6"],
  [4, 7, "4 × 6", "7 × 7"],
  [8, 3, "8 × 2", "3 × 3"],
  [5, 6, "5 × 5", "6 × 6"],
] as const;

const commutativeChallengeBank = [
  [6, 4, "4 × 5", "6 × 6"],
  [7, 3, "3 × 6", "7 × 7"],
  [8, 2, "2 × 7", "8 × 8"],
  [5, 6, "6 × 4", "5 × 5"],
  [9, 3, "3 × 8", "9 × 9"],
  [4, 8, "8 × 5", "4 × 4"],
  [7, 5, "5 × 6", "7 × 7"],
  [6, 8, "8 × 7", "6 × 6"],
  [9, 4, "4 × 8", "9 × 9"],
  [5, 7, "7 × 6", "5 × 5"],
] as const;

export function generateCommutativePropertyProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  return generateBankedProblems<readonly [number, number, string, string]>({
    slug: "commutative-property",
    bank: commutativeBank,
    challengeBank: commutativeChallengeBank,
    options,
    build: ([factorA, factorB, distractorA, distractorB], { id }) =>
      makeCommutativeProblem({ id, factorA, factorB, distractorA, distractorB }),
  });
}
