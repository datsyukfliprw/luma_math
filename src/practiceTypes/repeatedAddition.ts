import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function makeRepeatedAdditionProblem({
  id,
  groups,
  addend,
}: {
  id: string;
  groups: number;
  addend: number;
}): PracticeProblem {
  const total = groups * addend;
  const repeatedAddition = Array.from({ length: groups }, () => String(addend)).join(" + ");

  return {
    id,
    questionText: `Write the multiplication sentence for ${repeatedAddition} = ${total}.`,
    correctAnswer: `${groups}x${addend}`,
    visualType: "repeated_addition",
    problemKey: `${groups}-groups-of-${addend}`,
    visualData: {
      repeatedAddition: `${repeatedAddition} = ${total}`,
      equation: `${groups} × ${addend} = ${total}`,
      groups,
      itemsPerGroup: addend,
      product: total,
    },
  };
}

const repeatedAdditionBank = [
  [3, 5],
  [4, 4],
  [5, 2],
  [2, 6],
  [6, 3],
  [3, 7],
  [4, 5],
  [8, 2],
  [5, 4],
  [2, 9],
  [7, 3],
  [6, 5],
] as const;

const repeatedAdditionChallengeBank = [
  [3, 6],
  [5, 3],
  [4, 7],
  [6, 4],
  [8, 3],
  [3, 9],
  [7, 2],
  [5, 6],
  [4, 8],
  [9, 2],
] as const;

export function generateRepeatedAdditionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const source =
    options?.mode === "challenge" ? repeatedAdditionChallengeBank : repeatedAdditionBank;

  return takePracticeProblems(
    source.map(([groups, addend], index) =>
      makeRepeatedAdditionProblem({
        id: `repeated-addition-${options?.mode ?? "guided"}-${index + 1}`,
        groups,
        addend,
      }),
    ),
    options,
  );
}
