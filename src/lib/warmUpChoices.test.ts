import { describe, expect, it } from "vitest";
import { getWarmUpChoices } from "./warmUpChoices";
import type { WarmUpQuestion } from "../types/warmup";

function question(overrides: Partial<WarmUpQuestion>): WarmUpQuestion {
  return {
    id: "q1",
    prompt: "7 × 0 = ?",
    correct_answer: "0",
    hint: "Multiplying by zero makes zero.",
    skill: "zero_property",
    ...overrides,
  };
}

describe("getWarmUpChoices", () => {
  it("generates Grade 3 numeric choices with the correct answer exactly once", () => {
    const choices = getWarmUpChoices(question({}), 3);

    expect(choices).not.toBeNull();
    expect(choices).toHaveLength(3);
    expect(choices?.filter((choice) => choice === "0")).toHaveLength(1);
    expect(choices).toContain("7");
  });

  it("generates same-denominator fraction distractors", () => {
    const choices = getWarmUpChoices(
      question({
        id: "fraction",
        prompt: "What fraction is shaded?",
        correct_answer: "2/5",
      }),
      3,
    );

    expect(choices).not.toBeNull();
    expect(choices).toHaveLength(3);
    expect(choices).toContain("2/5");
    expect(choices?.every((choice) => choice.endsWith("/5"))).toBe(true);
  });

  it("uses tap choices for yes/no questions", () => {
    expect(
      getWarmUpChoices(
        question({
          id: "boolean",
          prompt: "Is 220 a reasonable answer?",
          correct_answer: "no",
        }),
        3,
      ),
    ).toEqual(["No", "Yes"]);
  });

  it("keeps complex text responses as text entry", () => {
    expect(
      getWarmUpChoices(
        question({
          id: "words",
          prompt: "Read 34,506.",
          correct_answer: "thirty-four thousand, five hundred six",
        }),
        3,
      ),
    ).toBeNull();
  });

  it("preserves text entry by default for Grade 4 and above", () => {
    expect(getWarmUpChoices(question({}), 4)).toBeNull();
  });

  it("uses valid authored choices at any grade level", () => {
    const choices = getWarmUpChoices(
      question({
        id: "authored",
        correct_answer: "8",
        choices: ["7", "8", "9"],
      }),
      5,
    );

    expect(choices).not.toBeNull();
    expect(choices).toHaveLength(3);
    expect(choices).toContain("8");
  });
});
