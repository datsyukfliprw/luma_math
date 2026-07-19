import { describe, expect, it } from "vitest";
import { generateEqualGroupsProblems } from "../equalGroups";

describe("generateEqualGroupsProblems", () => {
  it("generates 8 guided problems by default", () => {
    const problems = generateEqualGroupsProblems();
    expect(problems).toHaveLength(8);
    expect(problems.every((p) => p.visualType === "equal_groups")).toBe(true);
  });

  it("computes the correct total and equation for each guided problem", () => {
    for (const problem of generateEqualGroupsProblems()) {
      const { groups, itemsPerGroup } = problem.visualData ?? {};
      const total = (groups ?? 0) * (itemsPerGroup ?? 0);
      expect(problem.correctAnswer).toBe(String(total));
      expect(problem.visualData?.equation).toBe(`${groups} × ${itemsPerGroup} = ${total}`);
    }
  });

  it("uses singular 'star' only when there is exactly one item per group", () => {
    for (const problem of generateEqualGroupsProblems()) {
      const itemsPerGroup = problem.visualData?.itemsPerGroup ?? 0;
      const word = itemsPerGroup === 1 ? "star in each" : "stars in each";
      expect(problem.questionText).toContain(word);
    }
  });

  it("generates 12 independent problems", () => {
    expect(generateEqualGroupsProblems({ mode: "independent" })).toHaveLength(12);
  });

  it("generates 10 challenge mistake-check problems with consistent judgment data", () => {
    const problems = generateEqualGroupsProblems({ mode: "challenge" });
    expect(problems).toHaveLength(10);

    for (const problem of problems) {
      expect(problem.visualType).toBe("mistake_check");
      const challenge = problem.challengeData;
      expect(challenge).toBeDefined();
      if (!challenge) continue;

      expect(challenge.judgmentChoices).toEqual(["yes", "no"]);
      expect(problem.correctAnswer).toBe(challenge.correctJudgment);
      expect(challenge.reasonChoices).toContain(challenge.correctReason);
      // The shown equation is correct exactly when the judgment is "yes".
      const [, factorPart] = challenge.equationToCheck.split("=");
      const shownAnswer = Number(factorPart.trim());
      const [lhs] = challenge.equationToCheck.split("=");
      const [a, b] = lhs.split("×").map((n) => Number(n.trim()));
      const isCorrect = a * b === shownAnswer;
      expect(challenge.correctJudgment).toBe(isCorrect ? "yes" : "no");
    }
  });

  it("produces unique ids within a mode", () => {
    const ids = generateEqualGroupsProblems({ mode: "independent" }).map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
