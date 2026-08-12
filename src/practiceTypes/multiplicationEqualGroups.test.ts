import { describe, expect, it } from "vitest";
import { generateCountEqualGroupsProblems } from "./multiplicationEqualGroups";

function parseEqualGroupsProblem(problem: ReturnType<typeof generateCountEqualGroupsProblems>[number]) {
  const match = problem.questionText.match(/(\d+) groups with (\d+) (?:star|stars) in each group/);
  if (!match) throw new Error(`Could not parse equal-groups prompt: ${problem.questionText}`);
  return { groups: Number(match[1]), itemsPerGroup: Number(match[2]) };
}

describe("count_equal_groups practice adapter", () => {
  it("exposes enough prompt information to independently reconstruct the total", () => {
    const problem = generateCountEqualGroupsProblems({ seed: "count-contract", count: 1 })[0];
    const { groups, itemsPerGroup } = parseEqualGroupsProblem(problem);

    expect(groups * itemsPerGroup).toBe(Number(problem.correctAnswer));
    expect(problem.visualData?.groups).toBe(groups);
    expect(problem.visualData?.itemsPerGroup).toBe(itemsPerGroup);
    expect(problem.visualData?.equation).toContain(`${groups} × ${itemsPerGroup}`);
    expect(problem.problemKey).toBe(
      `multiplication:model:equal-groups:g=${groups}:n=${itemsPerGroup}:task=count-total`,
    );
  });

  it("offers unique choices with exactly one correct total", () => {
    const problem = generateCountEqualGroupsProblems({ seed: "count-choices", count: 1 })[0];
    const choices = problem.visualData?.choices ?? [];

    expect(new Set(choices).size).toBe(choices.length);
    expect(choices).toHaveLength(4);
    expect(choices.filter((choice) => Number(choice) === Number(problem.correctAnswer))).toHaveLength(1);
  });

  it("fulfills requested counts and rejects duplicate canonical problems", () => {
    const problems = generateCountEqualGroupsProblems({ seed: "count-session", count: 12 });

    expect(problems).toHaveLength(12);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(problems.length);
  });

  it("is deterministic for a seed and varies across attempts", () => {
    expect(generateCountEqualGroupsProblems({ seed: "same", count: 8 })).toEqual(
      generateCountEqualGroupsProblems({ seed: "same", count: 8 }),
    );
    expect(generateCountEqualGroupsProblems({ seed: "one", count: 8 })).not.toEqual(
      generateCountEqualGroupsProblems({ seed: "two", count: 8 }),
    );
  });
});
