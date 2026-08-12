import { describe, expect, it } from "vitest";
import {
  areFactorProductAnswersCorrect,
  getEqualGroupsAnswerChoices,
} from "./PracticeScreen";

describe("PracticeScreen equal-groups choices", () => {
  it("uses supplied domain choices when present", () => {
    expect(getEqualGroupsAnswerChoices("12", 3, ["12", "9", "15", "4"])).toEqual([
      "12",
      "9",
      "15",
      "4",
    ]);
  });

  it("retains the legacy fallback when supplied choices are absent", () => {
    expect(getEqualGroupsAnswerChoices("12", 3)).toEqual(["0", "1", "12"]);
  });
});

describe("PracticeScreen factor/product answers", () => {
  it("accepts reversed factors when the product is correct", () => {
    expect(areFactorProductAnswersCorrect("4", "3", "12", "3", "4", "12")).toBe(true);
  });
});
