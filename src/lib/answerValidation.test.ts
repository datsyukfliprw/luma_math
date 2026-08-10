import { describe, it, expect } from "vitest";
import { normalizeTextAnswer, normalizeNumericAnswer } from "./answerValidation";

describe("normalizeNumericAnswer", () => {
  it("treats 3000 and 3,000 as equivalent", () => {
    expect(normalizeNumericAnswer("3,000")).toBe("3000");
    expect(normalizeNumericAnswer("3000")).toBe("3000");
  });

  it("ignores surrounding and internal whitespace", () => {
    expect(normalizeNumericAnswer(" 3000 ")).toBe("3000");
    expect(normalizeNumericAnswer("3 000")).toBe("3000");
  });

  it("leaves non-numeric characters unchanged", () => {
    expect(normalizeNumericAnswer("400")).toBe("400");
  });
});

describe("normalizeTextAnswer", () => {
  it("lowercases and removes spaces", () => {
    expect(normalizeTextAnswer("Forty-Seven ")).toBe("forty-seven");
  });

  it("treats slash and division symbols as equivalent", () => {
    expect(normalizeTextAnswer("/")).toBe(normalizeTextAnswer("÷"));
  });

  it("treats slash and division symbols as equivalent in typed equations", () => {
    expect(normalizeTextAnswer("56 / 8 - 5 = n")).toBe("56÷8-5=n");
    expect(normalizeTextAnswer("56 ÷ 8 - 5 = n")).toBe("56÷8-5=n");
  });

  it("preserves multiplication symbol normalization", () => {
    expect(normalizeTextAnswer("5 × 1 = 5")).toBe("5x1=5");
    expect(normalizeTextAnswer("5 * 1 = 5")).toBe("5x1=5");
  });

  it("preserves commas and hyphens for number words", () => {
    expect(normalizeTextAnswer("ninety-one thousand, thirty")).toBe(
      "ninety-onethousand,thirty",
    );
  });
});
