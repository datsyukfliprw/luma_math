import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createEqualGroupsState, equalGroupsProblemKey } from "../lib/multiplication/core";

function makeEqualGroupsProblem({
  id,
  groups,
  itemsPerGroup,
}: {
  id: string;
  groups: number;
  itemsPerGroup: number;
}): PracticeProblem {
  const state = createEqualGroupsState(groups, itemsPerGroup);

  return {
    id,
    questionText: `There are ${state.groups} groups with ${state.itemsPerGroup} ${
      itemsPerGroup === 1 ? "star" : "stars"
    } in each group. How many stars are there in all?`,
    correctAnswer: String(state.product),
    visualType: "equal_groups",
    problemKey: equalGroupsProblemKey(state, "count-total"),
    visualData: {
      groups: state.groups,
      itemsPerGroup: state.itemsPerGroup,
      equation: `${state.groups} × ${state.itemsPerGroup} = ${state.product}`,
    },
  };
}

function generateGuidedEqualGroupsProblems(): PracticeProblem[] {
  return [
    makeEqualGroupsProblem({ id: "equal-groups-guided-1", groups: 3, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-2", groups: 4, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-3", groups: 5, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-4", groups: 6, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-5", groups: 7, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-6", groups: 8, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-7", groups: 9, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-guided-8", groups: 2, itemsPerGroup: 0 }),
  ];
}

function generateIndependentEqualGroupsProblems(): PracticeProblem[] {
  return [
    makeEqualGroupsProblem({ id: "equal-groups-independent-1", groups: 3, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-2", groups: 4, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-3", groups: 5, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-4", groups: 6, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-5", groups: 7, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-6", groups: 8, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-7", groups: 9, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-8", groups: 2, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-9", groups: 10, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-10", groups: 11, itemsPerGroup: 0 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-11", groups: 12, itemsPerGroup: 1 }),
    makeEqualGroupsProblem({ id: "equal-groups-independent-12", groups: 1, itemsPerGroup: 0 }),
  ];
}

function makeMistakeCheckProblem({
  id,
  groups,
  factor,
  shownAnswer,
  correctJudgment,
}: {
  id: string;
  groups: number;
  factor: 0 | 1;
  shownAnswer: number;
  correctJudgment: "yes" | "no";
}): PracticeProblem {
  const state = createEqualGroupsState(groups, factor);
  const correctTotal = state.product;
  const equationToCheck = `${groups} × ${factor} = ${shownAnswer}`;
  const correctReason = `${groups} groups of ${factor} makes ${correctTotal}`;

  const otherFactor = factor === 0 ? 1 : 0;
  const otherTotal = createEqualGroupsState(groups, otherFactor).product;

  return {
    id,
    questionText: `A student wrote: ${equationToCheck}`,
    correctAnswer: correctJudgment,
    visualType: "mistake_check",
    problemKey: `${equalGroupsProblemKey(state, "zero-identity-check")}:shown=${shownAnswer}`,
    challengeData: {
      equationToCheck,
      judgmentChoices: ["yes", "no"],
      correctJudgment,
      correctReason,
      reasonChoices: [
        correctReason,
        `${groups} groups of ${otherFactor} makes ${otherTotal}`,
        `${factor} groups of ${groups} makes ${shownAnswer}`,
      ],
      feedback:
        factor === 0
          ? `The equation uses ×0, so each group has 0 and the total is ${correctTotal}.`
          : `The equation uses ×1, so ${groups} groups of 1 makes ${correctTotal}.`,
    },
  };
}

function generateChallengeEqualGroupsProblems(): PracticeProblem[] {
  return [
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-1",
      groups: 5,
      factor: 0,
      shownAnswer: 5,
      correctJudgment: "no",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-2",
      groups: 6,
      factor: 1,
      shownAnswer: 6,
      correctJudgment: "yes",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-3",
      groups: 4,
      factor: 1,
      shownAnswer: 1,
      correctJudgment: "no",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-4",
      groups: 8,
      factor: 0,
      shownAnswer: 0,
      correctJudgment: "yes",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-5",
      groups: 7,
      factor: 0,
      shownAnswer: 7,
      correctJudgment: "no",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-6",
      groups: 9,
      factor: 1,
      shownAnswer: 0,
      correctJudgment: "no",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-7",
      groups: 3,
      factor: 0,
      shownAnswer: 0,
      correctJudgment: "yes",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-8",
      groups: 10,
      factor: 1,
      shownAnswer: 10,
      correctJudgment: "yes",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-9",
      groups: 2,
      factor: 1,
      shownAnswer: 1,
      correctJudgment: "no",
    }),
    makeMistakeCheckProblem({
      id: "equal-groups-challenge-10",
      groups: 11,
      factor: 0,
      shownAnswer: 11,
      correctJudgment: "no",
    }),
  ];
}

export function generateEqualGroupsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  if (options?.mode === "challenge") {
    return generateChallengeEqualGroupsProblems();
  }

  if (options?.mode === "independent") {
    return generateIndependentEqualGroupsProblems();
  }

  return generateGuidedEqualGroupsProblems();
}
