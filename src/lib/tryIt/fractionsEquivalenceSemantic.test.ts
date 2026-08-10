import { describe, it, expect } from "vitest";
import { fractionsEquivalenceFamily } from "./families/fractionsEquivalence";
import { getAllCurricula } from "../../data/curriculum";
import type { TryItFamilyContext } from "./types";
import type { Lesson } from "../../data/curriculum/curriculumSchema";
import { createSeededRng } from "../../practiceTypes/random";

const PRACTICE_TYPES = [
  "zero_to_one_interval",
  "partition_number_lines",
  "locate_unit_fractions_number_line",
  "locate_non_unit_fractions_number_line",
  "equivalence_same_amount",
  "fraction_strips_equivalence",
  "area_models_equivalence",
  "generate_explain_equivalent",
  "same_location_number_line",
  "find_equivalents_number_line",
  "graph_equivalent_fractions",
  "connect_models_number_lines_equations",
];

function findLesson(practiceType: string): Lesson | undefined {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson" && lesson.practice_type === practiceType) {
          return lesson;
        }
      }
    }
  }
  return undefined;
}

function makeContext(lesson: Lesson, attemptKey: string, count = 6): TryItFamilyContext {
  const seed = `${attemptKey}:fractions-equiv:${lesson.lesson_id ?? lesson.practice_type}`;
  return {
    lessonId: lesson.lesson_id ?? `${lesson.practice_type}-lesson`,
    lesson,
    family: "fractions_equivalence",
    practiceType: lesson.practice_type,
    attemptKey,
    rng: createSeededRng(seed),
    usedKeys: new Set(),
    count,
  };
}

function parseKey(key: string) {
  const parts = key.split(":");
  return {
    practiceType: parts[0],
    baseNum: Number(parts[1]),
    baseDen: Number(parts[2]),
    form: parts[4],
    extra: parts.slice(5).join(":"),
  };
}

function parseEquivalent(extra: string) {
  const match = extra.match(/m(\d+):eq(\d+)\/(\d+)/);
  if (!match) return undefined;
  return {
    multiplier: Number(match[1]),
    eqNum: Number(match[2]),
    eqDen: Number(match[3]),
  };
}

function parseFraction(s: string) {
  const match = s.match(/(\d+)\/(\d+)/);
  if (!match) return undefined;
  return { num: Number(match[1]), den: Number(match[2]) };
}

function isDecimal(s: string): boolean {
  return /\d+\.\d+/.test(s);
}

function parseSameAmountExtra(extra: string) {
  const match = extra.match(/^second(\d+)\/(\d+):ans(yes|no)$/);
  if (!match) return undefined;
  return {
    secondNum: Number(match[1]),
    secondDen: Number(match[2]),
    answer: match[3] as "yes" | "no",
  };
}

function parsePromptFractions(prompt: string) {
  return (prompt.match(/\d+\/\d+/g) ?? [])
    .map(parseFraction)
    .filter((f): f is { num: number; den: number } => f !== undefined);
}

describe("fractions equivalence family semantic correctness", () => {
  it("produces problems for every listed practice type", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "produces"));
      expect(problems.length).toBeGreaterThan(0);
      for (const problem of problems) {
        expect(problem.parts.length).toBe(1);
        expect(problem.parts[0].choices).toBeDefined();
        expect(problem.parts[0].choices!.length).toBeGreaterThan(0);
      }
    }
  });

  it("never uses decimal approximations for number-line locations or correct answers", () => {
    const types = [
      "zero_to_one_interval",
      "locate_unit_fractions_number_line",
      "locate_non_unit_fractions_number_line",
      "same_location_number_line",
      "find_equivalents_number_line",
      "graph_equivalent_fractions",
      "connect_models_number_lines_equations",
    ];
    for (const type of types) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const ctx = makeContext(lesson!, "no-decimals", 10);
      const problems = fractionsEquivalenceFamily(ctx);
      for (const problem of problems) {
        expect(isDecimal(problem.parts[0].correctAnswer)).toBe(false);
        for (const choice of problem.parts[0].choices!) {
          expect(isDecimal(choice)).toBe(false);
        }
      }
    }
  });

  it("uses exact, proper fraction positions and partition descriptions", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "exact-position", 10));
      for (const problem of problems) {
        for (const frac of problem.prompt.match(/\d+\/\d+/g) ?? []) {
          const parsed = parseFraction(frac);
          expect(parsed).toBeDefined();
          expect(parsed!.num).toBeLessThan(parsed!.den);
          expect(parsed!.den).toBeGreaterThan(0);
        }
        for (const choice of problem.parts[0].choices!) {
          const match = choice.match(/\d+\/\d+/);
          if (match) {
            const parsed = parseFraction(match[0]);
            expect(parsed).toBeDefined();
            expect(parsed!.num).toBeLessThanOrEqual(parsed!.den);
            expect(parsed!.den).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it("generates mathematically exact equivalent fractions", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "exact-equivalent", 10));
      for (const problem of problems) {
        const { baseNum, baseDen, extra } = parseKey(problem.problemKey!);
        const eq = parseEquivalent(extra);
        if (!eq) continue;
        expect(baseNum * eq.eqDen).toBe(eq.eqNum * baseDen);
      }
    }
  });

  it("uses model- and form-specific prompts", () => {
    const checks: Record<string, (prompt: string) => boolean> = {
      fraction_strips_equivalence: (p) => /strip/i.test(p),
      area_models_equivalence: (p) => /area model|shaded|equal parts/i.test(p),
      generate_explain_equivalent: (p) => /explain|statement|equivalent/i.test(p),
      connect_models_number_lines_equations: (p) =>
        /fraction strip|area model|number line|equation/i.test(p),
      equivalence_same_amount: (p) => /same amount/i.test(p),
      same_location_number_line: (p) => /same point|same location|number line/i.test(p),
      find_equivalents_number_line: (p) => /number line|equal parts|equivalent/i.test(p),
      graph_equivalent_fractions: (p) => /graph|number line|both land/i.test(p),
      zero_to_one_interval: (p) => /number line|0 to 1|equal parts/i.test(p),
      partition_number_lines: (p) => /equal parts|number line/i.test(p),
      locate_unit_fractions_number_line: (p) => /number line|tick mark|unit fraction/i.test(p),
      locate_non_unit_fractions_number_line: (p) => /number line|tick mark/i.test(p),
    };
    for (const [type, check] of Object.entries(checks)) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "form", 6));
      for (const problem of problems) {
        expect(check(problem.prompt)).toBe(true);
      }
    }
  });

  it("requires generation and a valid common factor in generate_explain_equivalent", () => {
    const lesson = findLesson("generate_explain_equivalent");
    expect(lesson).toBeDefined();
    const problems = fractionsEquivalenceFamily(makeContext(lesson!, "explain", 10));
    for (const problem of problems) {
      const { baseNum, baseDen, extra } = parseKey(problem.problemKey!);
      const eq = parseEquivalent(extra);
      expect(eq).toBeDefined();
      expect(eq!.eqNum).toBe(baseNum * eq!.multiplier);
      expect(eq!.eqDen).toBe(baseDen * eq!.multiplier);

      const factorMatch = extra.match(/^m(\d+):/);
      expect(factorMatch).toBeTruthy();
      const multiplier = Number(factorMatch![1]);
      expect(multiplier).toBeGreaterThanOrEqual(2);

      const correct = problem.parts[0].correctAnswer;
      expect(correct).toMatch(/both multiplied by/);
      expect(correct).toMatch(new RegExp(`${multiplier}`));

      const fracMatch = correct.match(/(\d+)\/(\d+)/);
      expect(fracMatch).toBeTruthy();
      const n = Number(fracMatch![1]);
      const d = Number(fracMatch![2]);
      expect(n * baseDen).toBe(baseNum * d);
    }
  });

  it("is deterministic for the same attempt key", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const a = fractionsEquivalenceFamily(makeContext(lesson!, "seed-a", 6));
      const b = fractionsEquivalenceFamily(makeContext(lesson!, "seed-a", 6));
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("produces different problems for different attempt keys", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const a = fractionsEquivalenceFamily(makeContext(lesson!, "seed-a", 6));
      const b = fractionsEquivalenceFamily(makeContext(lesson!, "seed-b", 6));
      const keysA = a.map((p) => p.problemKey);
      const keysB = b.map((p) => p.problemKey);
      expect(keysA).not.toEqual(keysB);
    }
  });

  it("has no duplicate problemKeys within a single attempt", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "dedup", 10));
      const keys = problems.map((p) => p.problemKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("encodes fractions, multiplier, form, and position data in problemKeys", () => {
    for (const type of PRACTICE_TYPES) {
      const lesson = findLesson(type);
      expect(lesson).toBeDefined();
      const problems = fractionsEquivalenceFamily(makeContext(lesson!, "key-data", 6));
      for (const problem of problems) {
        expect(problem.problemKey).toBeDefined();
        const key = problem.problemKey!;
        const { practiceType, baseNum, baseDen, form, extra } = parseKey(key);
        expect(practiceType).toBe(type);
        expect(baseNum).toBeGreaterThan(0);
        expect(baseDen).toBeGreaterThan(baseNum);
        expect(form).toBeTruthy();
        expect(extra).toBeTruthy();
      }
    }
  });

  describe("equivalence_same_amount key and semantics", () => {
    const lesson = findLesson("equivalence_same_amount")!;
    expect(lesson).toBeDefined();

    function sameAmountProblems(attemptKey: string, count = 6) {
      return fractionsEquivalenceFamily(makeContext(lesson, attemptKey, count));
    }

    it("generates both yes and no cases across multiple seeds", () => {
      const answers = new Set<string>();
      for (let i = 0; i < 30; i += 1) {
        const problems = sameAmountProblems(`both-answers-${i}`, 6);
        for (const problem of problems) {
          answers.add(problem.parts[0].correctAnswer);
        }
      }
      expect(answers.has("yes")).toBe(true);
      expect(answers.has("no")).toBe(true);
    });

    it("yes cases are mathematically equivalent by cross multiplication", () => {
      for (let i = 0; i < 30; i += 1) {
        const problems = sameAmountProblems(`yes-equiv-${i}`, 6);
        for (const problem of problems) {
          if (problem.parts[0].correctAnswer !== "yes") continue;
          const fractions = parsePromptFractions(problem.prompt);
          expect(fractions.length).toBe(2);
          const [first, second] = fractions;
          expect(first.num * second.den).toBe(second.num * first.den);
        }
      }
    });

    it("no cases are mathematically non-equivalent", () => {
      for (let i = 0; i < 30; i += 1) {
        const problems = sameAmountProblems(`no-non-${i}`, 6);
        for (const problem of problems) {
          if (problem.parts[0].correctAnswer !== "no") continue;
          const fractions = parsePromptFractions(problem.prompt);
          expect(fractions.length).toBe(2);
          const [first, second] = fractions;
          expect(first.num * second.den).not.toBe(second.num * first.den);
        }
      }
    });

    it("problemKey contains both shown fractions, form, and answer with no unused multiplier or equivalent state", () => {
      for (let i = 0; i < 30; i += 1) {
        const problems = sameAmountProblems(`key-clean-${i}`, 6);
        for (const problem of problems) {
          const key = problem.problemKey!;
          const { practiceType, baseNum, baseDen, form, extra } = parseKey(key);
          expect(practiceType).toBe("equivalence_same_amount");
          expect(form).toBe("same_amount");

          const promptFractions = parsePromptFractions(problem.prompt);
          expect(promptFractions.length).toBe(2);
          const [first, second] = promptFractions;

          expect(baseNum).toBe(first.num);
          expect(baseDen).toBe(first.den);

          const parsed = parseSameAmountExtra(extra);
          expect(parsed).toBeDefined();
          expect(parsed!.secondNum).toBe(second.num);
          expect(parsed!.secondDen).toBe(second.den);
          expect(parsed!.answer).toBe(problem.parts[0].correctAnswer);

          expect(extra).not.toMatch(/m\d+:eq\d+\/\d+/);
        }
      }
    });

    it("remains deterministic and has no duplicate problemKeys within one attempt", () => {
      const a = sameAmountProblems("det-same", 20);
      const b = sameAmountProblems("det-same", 20);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));

      const keys = a.map((p) => p.problemKey);
      expect(new Set(keys).size).toBe(keys.length);
    });
  });
});
