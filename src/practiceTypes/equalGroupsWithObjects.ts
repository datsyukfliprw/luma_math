import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type ObjectProblemSeed = {
  groups: number;
  itemsPerGroup: number;
  item: string;
  pluralItem: string;
};

function makeObjectGroupsProblem(
  seed: ObjectProblemSeed,
  index: number,
  mode: string,
): PracticeProblem {
  const total = seed.groups * seed.itemsPerGroup;

  return {
    id: `equal-groups-objects-${mode}-${index + 1}`,
    questionText: `You arrange ${seed.groups} piles of ${seed.pluralItem} with ${seed.itemsPerGroup} ${seed.itemsPerGroup === 1 ? seed.item : seed.pluralItem} in each pile. How many ${seed.pluralItem} are there in all?`,
    correctAnswer: String(total),
    visualType: "equal_groups",
    problemKey: `${seed.groups}-piles-of-${seed.itemsPerGroup}-${seed.pluralItem}`,
    visualData: {
      groups: seed.groups,
      itemsPerGroup: seed.itemsPerGroup,
      equation: `${seed.groups} × ${seed.itemsPerGroup} = ${total}`,
    },
  };
}

const objectGroupsBank: ObjectProblemSeed[] = [
  { groups: 4, itemsPerGroup: 3, item: "button", pluralItem: "buttons" },
  { groups: 3, itemsPerGroup: 5, item: "block", pluralItem: "blocks" },
  { groups: 5, itemsPerGroup: 2, item: "counter", pluralItem: "counters" },
  { groups: 2, itemsPerGroup: 6, item: "shell", pluralItem: "shells" },
  { groups: 6, itemsPerGroup: 2, item: "cube", pluralItem: "cubes" },
  { groups: 3, itemsPerGroup: 4, item: "sticker", pluralItem: "stickers" },
  { groups: 7, itemsPerGroup: 1, item: "marker", pluralItem: "markers" },
  { groups: 4, itemsPerGroup: 5, item: "coin", pluralItem: "coins" },
  { groups: 5, itemsPerGroup: 3, item: "bead", pluralItem: "beads" },
  { groups: 2, itemsPerGroup: 8, item: "tile", pluralItem: "tiles" },
  { groups: 6, itemsPerGroup: 4, item: "token", pluralItem: "tokens" },
  { groups: 8, itemsPerGroup: 2, item: "crayon", pluralItem: "crayons" },
];

const objectGroupsChallengeBank: ObjectProblemSeed[] = [
  { groups: 8, itemsPerGroup: 3, item: "button", pluralItem: "buttons" },
  { groups: 7, itemsPerGroup: 4, item: "block", pluralItem: "blocks" },
  { groups: 6, itemsPerGroup: 5, item: "counter", pluralItem: "counters" },
  { groups: 9, itemsPerGroup: 2, item: "shell", pluralItem: "shells" },
  { groups: 5, itemsPerGroup: 6, item: "cube", pluralItem: "cubes" },
  { groups: 4, itemsPerGroup: 7, item: "sticker", pluralItem: "stickers" },
  { groups: 10, itemsPerGroup: 3, item: "marker", pluralItem: "markers" },
  { groups: 3, itemsPerGroup: 8, item: "coin", pluralItem: "coins" },
  { groups: 8, itemsPerGroup: 4, item: "bead", pluralItem: "beads" },
  { groups: 6, itemsPerGroup: 6, item: "tile", pluralItem: "tiles" },
];

export function generateEqualGroupsWithObjectsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const source = options?.mode === "challenge" ? objectGroupsChallengeBank : objectGroupsBank;

  return takePracticeProblems(
    source.map((seed, index) => makeObjectGroupsProblem(seed, index, options?.mode ?? "guided")),
    options,
  );
}
