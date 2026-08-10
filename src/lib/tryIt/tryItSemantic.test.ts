import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getAllCurricula } from "../../data/curriculum";
import { getFamilyForPracticeType } from "./families";

function findLessonId(practiceType: string): string | undefined {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.practice_type === practiceType && lesson.lesson_type === "lesson") {
          return `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
        }
      }
    }
  }
  return undefined;
}

function resolve(practiceType: string) {
  const lessonId = findLessonId(practiceType);
  if (!lessonId) throw new Error(`No lesson for practice type ${practiceType}`);
  return { lessonId, experience: getResolvedTryItExperience(lessonId, { attemptKey: "semantic" })! };
}

function parsePair(pair: string): { a: number; b: number } | undefined {
  const match = pair.match(/(\d+)\s*×\s*(\d+)/);
  if (!match) return undefined;
  return { a: Number(match[1]), b: Number(match[2]) };
}

describe("Try It semantic correctness", () => {
  it("routes every non-evaluation practice type to a non-generic family", () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (const unit of getAllCurricula()) {
      for (const week of unit.weeks) {
        for (const lesson of week.lessons) {
          if (lesson.lesson_type !== "lesson") continue;
          if (seen.has(lesson.practice_type)) continue;
          seen.add(lesson.practice_type);
          const family = getFamilyForPracticeType(lesson.practice_type);
          if (family === "generic") {
            failures.push(`${lesson.practice_type} (${unit.unit_number}-${week.week_number}-${lesson.day_number})`);
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("produces repeated-addition problems for Unit 1 Lesson 2", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l2", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      expect(problem.prompt).toMatch(/\d+ \+ /);
      expect(problem.parts.length).toBeGreaterThanOrEqual(3);
      const equationPart = problem.parts.find((p) => p.key === "equation");
      expect(equationPart).toBeDefined();
    }
  });

  it("produces equal-groups-with-objects problems for Unit 1 Lesson 4", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l4", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      expect(problem.prompt).toMatch(/There are \d+ .* with \d+ .* in each/);
      expect(problem.parts.find((p) => p.key === "groups")).toBeDefined();
      expect(problem.parts.find((p) => p.key === "inEach")).toBeDefined();
    }
  });

  it("matches factor/product question wording to the correct answer type", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l3", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      if (problem.prompt.includes("product")) {
        expect(problem.parts.at(-1)!.correctAnswer).toMatch(/^Product: \d+$/);
      } else if (problem.prompt.includes("factors")) {
        expect(problem.parts.at(-1)!.correctAnswer).toMatch(/^\d+ and \d+$/);
      } else if (problem.prompt.includes("answer called")) {
        expect(problem.parts.at(-1)!.correctAnswer).toBe("product");
      }
    }
  });

  it("generates mathematically valid division with 1 and 0", () => {
    const { experience } = resolve("division_with_1_and_0");
    for (const problem of experience.problems) {
      const match = problem.prompt.match(/^(\d+) ÷ (\d+) = \?$/);
      expect(match).toBeTruthy();
      const dividend = Number(match![1]);
      const divisor = Number(match![2]);
      const correct = Number(problem.parts[0].correctAnswer);
      if (dividend === 0) {
        expect(correct).toBe(0);
      } else if (divisor === 1) {
        expect(correct).toBe(dividend);
      } else if (dividend === divisor) {
        expect(correct).toBe(1);
      }
    }
  });

  it("never asks to take away more than the starting quantity", () => {
    const { experience } = resolve("one_step_word_problems");
    for (const problem of experience.problems) {
      if (problem.prompt.includes("taken away")) {
        const startMatch = problem.prompt.match(/There are (\d+)/);
        const awayMatch = problem.prompt.match(/(\d+) are taken away/);
        expect(startMatch).toBeTruthy();
        expect(awayMatch).toBeTruthy();
        expect(Number(awayMatch![1])).toBeLessThanOrEqual(Number(startMatch![1]));
      }
    }
  });

  it("honors same-area and same-perimeter alternate-rectangle constraints", () => {
    const areaLesson = findLessonId("same_area_different_perimeter") ?? findLessonId("different_arrangements_same_area");
    if (areaLesson) {
      const exp = getResolvedTryItExperience(areaLesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const original = problem.prompt.match(/length (\d+) and width (\d+)/);
        expect(original).toBeTruthy();
        const oLen = Number(original![1]);
        const oWid = Number(original![2]);
        const correct = problem.parts[0].correctAnswer;
        const alt = parsePair(correct);
        expect(alt).toBeDefined();
        expect(alt!.a * alt!.b).toBe(oLen * oWid);
      }
    }

    const perimeterLesson = findLessonId("same_perimeter_different_area");
    if (perimeterLesson) {
      const exp = getResolvedTryItExperience(perimeterLesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const original = problem.prompt.match(/length (\d+) and width (\d+)/);
        expect(original).toBeTruthy();
        const oLen = Number(original![1]);
        const oWid = Number(original![2]);
        const correct = problem.parts[0].correctAnswer;
        const alt = parsePair(correct);
        expect(alt).toBeDefined();
        expect(alt!.a + alt!.b).toBe(oLen + oWid);
      }
    }
  });

  it("enforces like-denominator and like-numerator constraints", () => {
    const likeDenom = findLessonId("compare_like_denominators_models") ?? findLessonId("compare_like_denominators_number_line");
    if (likeDenom) {
      const exp = getResolvedTryItExperience(likeDenom, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const fracs = problem.prompt.match(/\d+\/\d+/g) ?? [];
        expect(fracs.length).toBeGreaterThanOrEqual(2);
        const dens = fracs.map((f) => Number(f.split("/")[1]));
        expect(new Set(dens).size).toBe(1);
      }
    }

    const likeNum = findLessonId("compare_like_numerators_models") ?? findLessonId("compare_like_numerators_number_line");
    if (likeNum) {
      const exp = getResolvedTryItExperience(likeNum, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const fracs = problem.prompt.match(/\d+\/\d+/g) ?? [];
        expect(fracs.length).toBeGreaterThanOrEqual(2);
        const nums = fracs.map((f) => Number(f.split("/")[0]));
        expect(new Set(nums).size).toBe(1);
      }
    }
  });

  it("keeps number-line and interval fractions between 0 and 1", () => {
    const types = ["zero_to_one_interval", "partition_number_lines", "locate_unit_fractions_number_line"];
    for (const type of types) {
      const lesson = findLessonId(type);
      if (!lesson) continue;
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        for (const frac of problem.prompt.match(/\d+\/\d+/g) ?? []) {
          const [n, d] = frac.split("/").map(Number);
          expect(n).toBeLessThan(d);
        }
        for (const choice of problem.parts[0].choices ?? []) {
          const match = choice.match(/\d+\/\d+/);
          if (match) {
            const [n, d] = match[0].split("/").map(Number);
            expect(n).toBeLessThanOrEqual(d);
          }
        }
      }
    }
  });

  it("includes graph data in the prompt", () => {
    const lesson = findLessonId("read_picture_graphs") ?? findLessonId("read_bar_graphs");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        expect(problem.prompt).toMatch(/red: \d+/);
      }
    }
  });

  it("describes clock hand positions in the prompt", () => {
    const lesson = findLessonId("read_analog_clocks");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        expect(problem.prompt).toMatch(/hour hand.*pointing/);
        expect(problem.prompt).toMatch(/minute hand.*pointing/);
      }
    }
  });

  it("uses a logically appropriate unit for weight/mass/volume measurement", () => {
    const lesson = findLessonId("choose_weight_mass_volume_units");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const correct = problem.parts[0].correctAnswer;
        expect([..."ounces pounds grams kilograms cups pints quarts gallons liters".split(" "), "inches", "feet", "yards", "centimeters", "meters"]).toContain(correct);
      }
    }
  });

  it("problemKey changes when canonical math changes", () => {
    const { experience: a } = resolve("equations_with_unknowns");
    const { experience: b } = resolve("equations_with_unknowns");
    // Two attempts should produce different problems with different canonical keys.
    const keysA = new Set(a.problems.map((p) => p.problemKey));
    const keysB = new Set(b.problems.map((p) => p.problemKey));
    // We specifically use different attemptKey to get variation; for the same lesson
    // we run twice with the same attemptKey in the helper, so the keys should be equal.
    expect(keysA).toEqual(keysB);

    const different = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "pk-a" });
    const different2 = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "pk-b" });
    const shared = different!.problems[0].problemKey;
    const shared2 = different2!.problems[0].problemKey;
    expect(shared).not.toBe(shared2);
  });
});
