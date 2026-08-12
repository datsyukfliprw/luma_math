import {
  EQUAL_GROUPS_RANGE,
  createEqualGroupsState,
  equalGroupsProblemKey,
  getEqualGroupsMisconceptionCandidates,
  type EqualGroupsState,
} from "../lib/multiplication/core";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function getSeed(options: PracticeGenerationOptions | undefined): string | number {
  const practiceType = "count_equal_groups";
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function buildChoices(state: EqualGroupsState, rng: ReturnType<typeof createSeededRng>): string[] {
  const distractors = getEqualGroupsMisconceptionCandidates(state).slice(0, 3);
  if (distractors.length < 3) throw new Error("Equal-groups core did not provide enough distractors");
  return rng.shuffle([String(state.product), ...distractors.map(String)]);
}

function makeProblem(
  state: EqualGroupsState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  return {
    id: `count-equal-groups-${mode}-${index + 1}`,
    questionText: `There are ${state.groups} groups with ${state.itemsPerGroup} ${state.itemsPerGroup === 1 ? "star" : "stars"} in each group. How many stars are there in all?`,
    correctAnswer: String(state.product),
    visualType: "equal_groups",
    problemKey: equalGroupsProblemKey(state, "count-total"),
    visualData: {
      groups: state.groups,
      itemsPerGroup: state.itemsPerGroup,
      equation: `${state.groups} × ${state.itemsPerGroup} = ${state.product}`,
      choices: buildChoices(state, rng),
      product: state.product,
    },
  };
}

export function generateCountEqualGroupsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options));
  const count = getPracticeProblemCount(options);
  const candidates: EqualGroupsState[] = [];

  for (let groups = EQUAL_GROUPS_RANGE.groups.min; groups <= EQUAL_GROUPS_RANGE.groups.max; groups += 1) {
    for (
      let itemsPerGroup = EQUAL_GROUPS_RANGE.itemsPerGroup.min;
      itemsPerGroup <= EQUAL_GROUPS_RANGE.itemsPerGroup.max;
      itemsPerGroup += 1
    ) {
      candidates.push(createEqualGroupsState(groups, itemsPerGroup));
    }
  }

  if (count > candidates.length) throw new RangeError("Requested count exceeds equal-groups state space");
  return rng.shuffle(candidates).slice(0, count).map((state, index) =>
    makeProblem(state, index, options?.mode ?? "guided", rng),
  );
}

export const generateMultiplicationEqualGroupsProblems = generateCountEqualGroupsProblems;
