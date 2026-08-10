import { describe, expect, it } from "vitest";
import type { PlaceValueCompositionType } from "../lib/placeValue/placeValueComposition";
import { generatePlaceValueCompositionProblems } from "./placeValueComposition";

const TYPES: readonly PlaceValueCompositionType[] = ["base_ten_models", "place_value_puzzles"];

function numberFromKey(problemKey: string, type: PlaceValueCompositionType): number {
  const pattern =
    type === "base_ten_models"
      ? /^base_ten:(\d+)$/
      : /^place_value_puzzle:(\d+):riddle$/;
  const match = problemKey.match(pattern);
  expect(match).not.toBeNull();
  return Number(match?.[1]);
}

const PLACE_VALUES: Record<string, number> = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten-thousands": 10_000,
};

function reconstructBaseTenPrompt(questionText: string): number {
  const blocks = questionText.match(/(\d+) (thousand cubes?|hundred flats?|ten rods?|unit cubes?)/g) ?? [];
  const total = blocks.reduce((sum, block) => {
    const match = block.match(/(\d+) (thousand|hundred|ten|unit)/);
    expect(match).not.toBeNull();
    const place = match?.[2] === "thousand"
      ? 1_000
      : match?.[2] === "hundred"
        ? 100
        : match?.[2] === "ten"
          ? 10
          : 1;
    return sum + Number(match?.[1]) * place;
  }, 0);

  return total;
}

function reconstructPuzzlePrompt(questionText: string): number {
  const clues = questionText.match(/(\d+) (ten-thousands?|thousands?|hundreds?|tens?|ones?)/g) ?? [];
  expect(clues).toHaveLength(5);
  const places = new Set<string>();
  const total = clues.reduce((sum, clue) => {
    const match = clue.match(/(\d+) (ten-thousands?|thousands?|hundreds?|tens?|ones?)/);
    expect(match).not.toBeNull();
    const place = match?.[2] === "ten-thousand"
      ? "ten-thousands"
      : match?.[2]?.endsWith("s")
        ? match[2]
        : `${match?.[2]}s`;
    places.add(place);
    return sum + Number(match?.[1]) * PLACE_VALUES[place];
  }, 0);

  expect(places).toEqual(new Set(Object.keys(PLACE_VALUES)));
  return total;
}

function assertChoices(problem: ReturnType<typeof generatePlaceValueCompositionProblems>[number]) {
  const choices = problem.visualData?.choices ?? [];
  expect(problem.visualType).toBe("multiple_choice");
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
  expect(choices.every((choice) => Number.isFinite(Number(choice)))).toBe(true);
}

describe("place-value composition Practice adapter", () => {
  it.each(TYPES)("generates %s problems in the curriculum range", (type) => {
    const problems = generatePlaceValueCompositionProblems({
      seed: `${type}:semantic`,
      count: 24,
      lesson: { practice_type: type },
    });

    expect(problems).toHaveLength(24);
    expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(24);
    for (const problem of problems) {
      const number = numberFromKey(problem.problemKey, type);
      const reconstructed =
        type === "base_ten_models"
          ? reconstructBaseTenPrompt(problem.questionText)
          : reconstructPuzzlePrompt(problem.questionText);

      expect(number).toBeGreaterThanOrEqual(type === "base_ten_models" ? 10 : 1_000);
      expect(number).toBeLessThanOrEqual(type === "base_ten_models" ? 9_999 : 99_999);
      expect(reconstructed).toBe(number);
      expect(problem.correctAnswer).toBe(String(number));
      assertChoices(problem);
    }
  });

  it("preserves explicit zero places in puzzle clues", () => {
    const problems = generatePlaceValueCompositionProblems({
      seed: "zero-clue-search",
      count: 100,
      lesson: { practice_type: "place_value_puzzles" },
    });

    expect(
      problems.some((problem) => /0 (ten-thousands|thousands|hundreds|tens|ones)/.test(problem.questionText)),
    ).toBe(true);
  });

  it("uses unit-cube wording for singular and plural ones blocks", () => {
    const problems = generatePlaceValueCompositionProblems({
      seed: "unit-cube-wording",
      count: 100,
      lesson: { practice_type: "base_ten_models" },
    });
    const prompts = problems.map((problem) => problem.questionText);

    expect(prompts.some((prompt) => /\b1 unit cube\b/.test(prompt))).toBe(true);
    expect(prompts.some((prompt) => /\b[2-9] unit cubes\b/.test(prompt))).toBe(true);
    expect(prompts.every((prompt) => !/\b\d+ one cubes?\b|\b\d+ ones cubes?\b/.test(prompt))).toBe(true);
  });

  it("is deterministic for the same seed and varies across seeds", () => {
    for (const type of TYPES) {
      const first = generatePlaceValueCompositionProblems({
        seed: `${type}:same`,
        count: 12,
        lesson: { practice_type: type },
      });
      const second = generatePlaceValueCompositionProblems({
        seed: `${type}:same`,
        count: 12,
        lesson: { practice_type: type },
      });
      const different = generatePlaceValueCompositionProblems({
        seed: `${type}:different`,
        count: 12,
        lesson: { practice_type: type },
      });

      expect(first).toEqual(second);
      expect(different).not.toEqual(first);
      expect(new Set(different.map((problem) => problem.problemKey)).size).toBeGreaterThan(1);
    }
  });
});
