import { describe, expect, it } from "vitest";
import { getAllCurricula } from "../../data/curriculum";
import { createSeededRng, derivePracticeSeed } from "../../practiceTypes/random";
import { getDigitValueDistractorCandidates } from "../placeValue/distractors";
import { generateDigitValueProblem } from "../placeValue/generator";
import type { DigitValueProblem } from "../placeValue/types";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getLessonById } from "../lessonLookup";
import { placeValueFamily } from "./families/placeValue";
import type { TryItFamilyContext } from "./types";

const PLACE_VALUES = {
  ones: 1,
  tens: 10,
  hundreds: 100,
  thousands: 1_000,
  "ten thousands": 10_000,
} as const;

function findLessonId(practiceType = "place_value_digits"): string {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson" && lesson.practice_type === practiceType) {
          return `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
        }
      }
    }
  }
  throw new Error("No place_value_digits lesson found");
}

function resolve(attemptKey: string | number, practiceType = "place_value_digits") {
  return getResolvedTryItExperience(findLessonId(practiceType), { attemptKey })!;
}

describe("place_value_digits Try It semantics", () => {
  it("adapts the shared mathematical state into the existing presentation", () => {
    const lessonId = findLessonId();
    const attemptKey = "shared-state";
    const experience = getResolvedTryItExperience(lessonId, { attemptKey })!;
    const shared = generateDigitValueProblem(
      createSeededRng(derivePracticeSeed(String(attemptKey), "tryit", lessonId)),
    );
    const problem = experience.problems[0];

    expect(problem.problemKey).toBe(shared.problemKey);
    expect(problem.prompt).toBe(
      `In the number ${shared.number}, what is the value of the ${shared.targetPlace} digit?`,
    );
    expect(problem.parts).toHaveLength(1);
    expect(problem.parts[0].correctAnswer).toBe(String(shared.correctAnswer));
  });

  it("produces three unique choices with exactly one mathematically correct answer", () => {
    for (const problem of resolve("choice-semantics").problems) {
      const match = problem.prompt.match(
        /^In the number (\d+), what is the value of the (ones|tens|hundreds|thousands|ten thousands) digit\?$/,
      );
      expect(match).not.toBeNull();
      const number = Number(match![1]);
      const targetPlace = match![2] as keyof typeof PLACE_VALUES;
      const placeValue = PLACE_VALUES[targetPlace];
      const targetDigit = Math.floor(number / placeValue) % 10;
      const expected = targetDigit * placeValue;
      const choices = problem.parts[0].choices ?? [];
      const canonicalProblem: DigitValueProblem = {
        form: "digit_value",
        number,
        targetPlace,
        targetDigit,
        placeValue,
        correctAnswer: expected,
        problemKey: problem.problemKey ?? "",
      };
      const domainCandidates = new Set(
        getDigitValueDistractorCandidates(canonicalProblem).map(String),
      );

      expect(choices).toHaveLength(3);
      expect(new Set(choices).size).toBe(3);
      expect(problem.parts[0].correctAnswer).toBe(String(expected));
      expect(choices.filter((choice) => choice === String(expected))).toHaveLength(1);
      for (const choice of choices.filter((choice) => choice !== String(expected))) {
        expect(domainCandidates).toContain(choice);
      }
    }
  });

  it("is deterministic for the same attempt and has no duplicate keys", () => {
    const first = resolve("deterministic");
    expect(resolve("deterministic")).toEqual(first);
    expect(new Set(first.problems.map((problem) => problem.problemKey)).size).toBe(
      first.problems.length,
    );
  });

  it("keeps ten-thousands answers finite and valid", () => {
    let encounteredTenThousandsProblems = 0;

    for (let index = 0; index < 100; index += 1) {
      const experience = resolve(`ten-thousands-${index}`);
      for (const problem of experience.problems) {
        if (!problem.prompt.includes("ten thousands")) continue;
        encounteredTenThousandsProblems += 1;
        const answer = Number(problem.parts[0].correctAnswer);
        expect(Number.isFinite(answer)).toBe(true);
        expect(answer).toBeGreaterThanOrEqual(0);
        expect(answer).toBeLessThanOrEqual(90_000);
        expect(answer % 10_000).toBe(0);
      }
    }

    expect(encounteredTenThousandsProblems).toBeGreaterThan(0);
  });
});

describe("legacy place-value Try It semantics", () => {
  it.each(["large_digit_value", "place_value_puzzles"])(
    "calculates finite, correct answers for %s across five-digit attempts",
    (practiceType) => {
      let encounteredTenThousandsProblems = 0;

      for (let index = 0; index < 200; index += 1) {
        for (const problem of resolve(`legacy-five-digit-${practiceType}-${index}`, practiceType).problems) {
          const keyParts = (problem.problemKey ?? "").split(":");
          const number = Number(keyParts[1]);
          const placeIndex = Number(keyParts[2]);
          if (number < 10_000 || placeIndex !== 4) continue;

          encounteredTenThousandsProblems += 1;
          const displayedDigit = Math.floor(number / 10_000) % 10;
          const expected =
            practiceType === "large_digit_value" ? displayedDigit * 10_000 : displayedDigit;

          expect(Number(problem.parts[0].correctAnswer)).toBe(expected);
          expect(Number.isFinite(Number(problem.parts[0].correctAnswer))).toBe(true);
        }
      }

      expect(encounteredTenThousandsProblems).toBeGreaterThan(0);
    },
  );

  it("does not consume presentation RNG while rejecting a shared duplicate", () => {
    const lessonId = findLessonId();
    const lesson = getLessonById(lessonId).lesson;
    const seed = "duplicate-presentation-rng";
    const expectedRng = createSeededRng(seed);
    const first = generateDigitValueProblem(expectedRng);
    const second = generateDigitValueProblem(expectedRng);
    const baseContext = (usedKeys: Set<string>, rngSeed: string): TryItFamilyContext => ({
      lessonId,
      lesson,
      family: "place_value",
      practiceType: "place_value_digits",
      attemptKey: seed,
      rng: createSeededRng(rngSeed),
      usedKeys,
      count: 1,
    });

    const afterDuplicate = placeValueFamily(
      baseContext(new Set([first.problemKey]), seed),
    )[0];
    const expectedSecondKey = second.problemKey;

    expect(afterDuplicate.problemKey).toBe(expectedSecondKey);
  });
});
