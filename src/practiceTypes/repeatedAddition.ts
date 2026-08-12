import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createEqualGroupsState, equalGroupsProblemKey } from "../lib/multiplication/core";

function makeRepeatedAdditionProblem({
  id,
  groups,
  addend,
}: {
  id: string;
  groups: number;
  addend: number;
}): PracticeProblem {
  const state = createEqualGroupsState(groups, addend);
  const repeatedAddition = Array.from({ length: state.groups }, () => String(state.itemsPerGroup)).join(
    " + ",
  );

  return {
    id,
    questionText: `Write the multiplication sentence for ${repeatedAddition} = ${state.product}.`,
    correctAnswer: `${state.groups}x${state.itemsPerGroup}`,
    visualType: "repeated_addition",
    problemKey: equalGroupsProblemKey(state, "repeated-addition"),
    visualData: {
      repeatedAddition: `${repeatedAddition} = ${state.product}`,
      equation: `${state.groups} × ${state.itemsPerGroup} = ${state.product}`,
      groups: state.groups,
      itemsPerGroup: state.itemsPerGroup,
      product: state.product,
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
