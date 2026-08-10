import { describe, expect, it } from "vitest";
import { createSeededRng } from "../../practiceTypes/random";
import {
  decomposePlaceValueNumber,
  generateBaseTenModelProblem,
  generatePlaceValuePuzzleProblem,
  getPlaceValueCompositionDistractorCandidates,
  type BaseTenModelProblem,
  type PlaceValuePuzzleProblem,
} from "./placeValueComposition";

describe("place-value composition core", () => {
  it("decomposes a base-ten number into its place-value block counts", () => {
    const parts = decomposePlaceValueNumber(3_245, "base_ten_models");

    expect(parts.map((part) => [part.place, part.digit])).toEqual([
      ["ones", 5],
      ["tens", 4],
      ["hundreds", 2],
      ["thousands", 3],
    ]);
    expect(parts.reduce((total, part) => total + part.digit * part.placeValue, 0)).toBe(3_245);
  });

  it("retains zero place values in a place-value puzzle", () => {
    const parts = decomposePlaceValueNumber(70_409, "place_value_puzzles");

    expect(parts.map((part) => [part.place, part.digit])).toEqual([
      ["ones", 9],
      ["tens", 0],
      ["hundreds", 4],
      ["thousands", 0],
      ["ten-thousands", 7],
    ]);
    expect(parts.reduce((total, part) => total + part.digit * part.placeValue, 0)).toBe(70_409);
  });

  it("retains zero block counts between represented base-ten places", () => {
    const parts = decomposePlaceValueNumber(1_005, "base_ten_models");

    expect(parts.map((part) => part.digit)).toEqual([5, 0, 0, 1]);
    expect(parts.reduce((total, part) => total + part.digit * part.placeValue, 0)).toBe(1_005);
  });

  it("supports the inclusive boundaries for both generated domains", () => {
    for (const [number, type] of [
      [10, "base_ten_models"],
      [9_999, "base_ten_models"],
      [1_000, "place_value_puzzles"],
      [99_999, "place_value_puzzles"],
    ] as const) {
      const parts = decomposePlaceValueNumber(number, type);
      expect(parts.reduce((total, part) => total + part.digit * part.placeValue, 0)).toBe(number);
    }
  });

  it("can model an inserted digit in an implicit leading zero place", () => {
    const baseTen: BaseTenModelProblem = {
      form: "base_ten_models",
      number: 10,
      blocks: [
        { place: "ones", placeValue: 1, count: 0 },
        { place: "tens", placeValue: 10, count: 1 },
        { place: "hundreds", placeValue: 100, count: 0 },
        { place: "thousands", placeValue: 1_000, count: 0 },
      ],
      correctAnswer: 10,
      problemKey: "base_ten:10",
    };
    const puzzle: PlaceValuePuzzleProblem = {
      form: "place_value_puzzles",
      number: 1_000,
      clues: decomposePlaceValueNumber(1_000, "place_value_puzzles"),
      correctAnswer: 1_000,
      problemKey: "place_value_puzzle:1000:riddle",
    };

    expect(getPlaceValueCompositionDistractorCandidates(baseTen)).toContain(1_010);
    expect(getPlaceValueCompositionDistractorCandidates(puzzle)).toContain(11_000);
  });

  it("generates canonical keys and answers from the represented number", () => {
    const baseTen = generateBaseTenModelProblem(createSeededRng("known-base-ten"));
    const puzzle = generatePlaceValuePuzzleProblem(createSeededRng("known-puzzle"));

    expect(baseTen.problemKey).toBe(`base_ten:${baseTen.number}`);
    expect(baseTen.correctAnswer).toBe(baseTen.number);
    expect(puzzle.problemKey).toBe(`place_value_puzzle:${puzzle.number}:riddle`);
    expect(puzzle.correctAnswer).toBe(puzzle.number);
  });
});
