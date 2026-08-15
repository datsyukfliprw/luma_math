import { describe, expect, it } from "vitest";
import {
  MULTIPLES_OF_TEN_PRACTICE_TYPES,
  generateMultiplesOfTenProblems,
} from "./multiplesOfTen";

function expectValidChoices(problem: ReturnType<typeof generateMultiplesOfTenProblems>[number], answer: number) {
  const choices = problem.visualData?.choices ?? [];
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => Number(choice) === answer)).toHaveLength(1);
  expect(problem.correctAnswer).toBe(String(answer));
}


describe("Unit 19 multiples-of-ten Practice generators", () => {
  it("connects each displayed basic fact to its scaled fact", () => {
    const problems = generateMultiplesOfTenProblems("multiples_of_ten_basic_facts", { seed: "basic", count: 12 });
    for (const problem of problems) {
      const match = problem.questionText.match(/^Use the basic fact (\d+) × (\d+) = (\d+)\. What is (\d+) × (\d+) = \?$/);
      if (!match) throw new Error(`Basic-fact scaffold missing: ${problem.questionText}`);
      const [, shownA, shownD, shownBasic, targetA, shownMultiple] = match;
      const a = Number(shownA);
      const d = Number(shownD);
      const multiple = Number(shownMultiple);
      expect(Number(targetA)).toBe(a);
      expect(a * d).toBe(Number(shownBasic));
      expect(multiple).toBe(d * 10);
      expect(Number(problem.correctAnswer)).toBe(Number(shownBasic) * 10);
      expect(problem.problemKey).toBe(`multiplication:scaled-ten:a=${a}:d=${d}:task=connect`);
      expectValidChoices(problem, a * multiple);
    }
  });

  it("keeps the basic-fact scaffold visible while asking for the scaled product", () => {
    const problems = generateMultiplesOfTenProblems("one_digit_by_multiples_of_ten", { seed: "scaffold", count: 12 });
    for (const problem of problems) {
      const match = problem.questionText.match(/^Use the basic fact (\d+) × (\d+) = (\d+)\. Then use its one zero to solve (\d+) × (\d+) = \?$/);
      if (!match) throw new Error(`One-digit scaffold missing: ${problem.questionText}`);
      const [, shownA, shownD, shownBasic, targetA, shownMultiple] = match;
      const a = Number(shownA);
      const d = Number(shownD);
      expect(Number(targetA)).toBe(a);
      expect(a * d).toBe(Number(shownBasic));
      expect(Number(shownMultiple)).toBe(d * 10);
      expect(Number(problem.correctAnswer)).toBe(a * d * 10);
      expect(problem.problemKey).toBe(`multiplication:scaled-ten:a=${a}:d=${d}:task=product`);
      expectValidChoices(problem, a * d * 10);
    }
  });

  it("creates unambiguous equal-groups stories rather than dressed-up equations", () => {
    const problems = generateMultiplesOfTenProblems("multiples_of_ten_word_problems", { seed: "stories", count: 18 });
    for (const problem of problems) {
      const match = problem.questionText.match(/^There are (\d+) .+\. Each .+ holds (\d+) .+\. How many .+ are there altogether\?$/);
      if (!match) throw new Error(`Could not parse word story: ${problem.questionText}`);
      const groups = Number(match[1]);
      const itemsPerGroup = Number(match[2]);
      expect(problem.questionText).not.toContain("×");
      expect(itemsPerGroup % 10).toBe(0);
      expect(Number(problem.correctAnswer)).toBe(groups * itemsPerGroup);
      expect(problem.answerData).toEqual({
        factorA: String(groups),
        factorB: String(itemsPerGroup),
        product: String(groups * itemsPerGroup),
      });
      expect(problem.problemKey).toBe(`multiplication:scaled-ten:a=${groups}:d=${itemsPerGroup / 10}:task=product`);
      expectValidChoices(problem, groups * itemsPerGroup);
    }
  });

  it("shows a consecutive-multiples-of-ten sequence with one inferable missing product", () => {
    const problems = generateMultiplesOfTenProblems("place_value_patterns", { seed: "patterns", count: 18 });
    for (const problem of problems) {
      const heading = problem.questionText.match(/^The first factor stays (\d+)\. Each second factor increases by 10, so each product increases by (\d+)\. Find the missing product: (.+)$/);
      if (!heading) throw new Error(`Could not parse pattern prompt: ${problem.questionText}`);
      const oneDigit = Number(heading[1]);
      const difference = Number(heading[2]);
      const terms = heading[3].split(", ").map((term) => {
        const match = term.match(/^(\d+) × (\d+) = (\d+|\?)$/);
        if (!match) throw new Error(`Could not parse pattern term: ${term}`);
        return { factor: Number(match[1]), multiple: Number(match[2]), product: match[3] === "?" ? undefined : Number(match[3]) };
      });
      expect(terms).toHaveLength(4);
      expect(terms.filter((term) => term.product === undefined)).toHaveLength(1);
      for (let index = 0; index < terms.length; index += 1) {
        expect(terms[index].factor).toBe(oneDigit);
        expect(terms[index].multiple).toBe((terms[0].multiple ?? 0) + index * 10);
        if (terms[index].product !== undefined) expect(terms[index].product).toBe(oneDigit * terms[index].multiple);
      }
      const missingIndex = terms.findIndex((term) => term.product === undefined);
      const expected = oneDigit * terms[missingIndex].multiple;
      expect(difference).toBe(oneDigit * 10);
      expect(Number(problem.correctAnswer)).toBe(expected);
      expect(problem.problemKey).toBe(
        `multiplication:ten-pattern:a=${oneDigit}:start=${terms[0].multiple / 10}:length=4:missing=${missingIndex}:task=missing-term`,
      );
      expectValidChoices(problem, expected);
    }
  });

  it.each(MULTIPLES_OF_TEN_PRACTICE_TYPES)("is deterministic, varies by seed, and prevents duplicate canonical keys for %s", (practiceType) => {
    const first = generateMultiplesOfTenProblems(practiceType, { seed: "same", count: 6 });
    const second = generateMultiplesOfTenProblems(practiceType, { seed: "same", count: 6 });
    const different = generateMultiplesOfTenProblems(practiceType, { seed: "different", count: 6 });
    expect(first).toEqual(second);
    expect(different).not.toEqual(first);
    expect(new Set(first.map((problem) => problem.problemKey)).size).toBe(6);
    expect(new Set(different.map((problem) => problem.problemKey)).size).toBe(6);
  });

  it.each(MULTIPLES_OF_TEN_PRACTICE_TYPES)("rejects a count beyond its canonical state space for %s", (practiceType) => {
    const tooMany = practiceType === "place_value_patterns" ? 163 : 82;
    expect(() => generateMultiplesOfTenProblems(practiceType, { count: tooMany })).toThrow("state space");
  });
});
