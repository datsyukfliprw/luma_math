import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getAllCurricula } from "../../data/curriculum";

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

function resolve(practiceType: string, attemptKey = "semantic") {
  const lessonId = findLessonId(practiceType);
  if (!lessonId) throw new Error(`No lesson for practice type ${practiceType}`);
  return {
    lessonId,
    experience: getResolvedTryItExperience(lessonId, { attemptKey })!,
  };
}

function parsePromptFractions(prompt: string) {
  const matches = prompt.match(/\d+\/\d+/g) ?? [];
  return matches.map((frac) => {
    const [num, den] = frac.split("/").map(Number);
    return { num, den, value: num / den, frac };
  });
}

function compareSymbol(a: number, b: number): string {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

function compareWord(a: number, b: number): string {
  if (a < b) return "less than";
  if (a > b) return "greater than";
  return "equal to";
}

function isComparisonString(value: string): boolean {
  return /[<>=]/.test(value);
}

const COMPARING_TYPES = [
  "compare_like_denominators_models",
  "compare_like_denominators_number_line",
  "use_comparison_symbols",
  "comparison_word_problems_like_denominators",
  "compare_like_numerators_models",
  "compare_like_numerators_number_line",
  "same_whole_fractions",
  "compare_explain_fractions",
];

const NAME_PAIRS = new Set([
  "Maya",
  "Ava",
  "Sam",
  "Mia",
  "Tara",
  "Ben",
  "Lily",
  "Alex",
  "Ana",
  "Noah",
]);

describe("comparing fractions Try It semantic correctness", () => {
  it.each(COMPARING_TYPES)("generates problems for %s", (practiceType) => {
    const { experience } = resolve(practiceType);
    expect(experience).toBeDefined();
    expect(experience.problems.length).toBeGreaterThan(0);
  });

  it.each(COMPARING_TYPES)("produces proper, non-equivalent fractions for %s", (practiceType) => {
    const { experience } = resolve(practiceType);
    for (const problem of experience.problems) {
      const fractions = parsePromptFractions(problem.prompt);
      expect(fractions.length).toBeGreaterThanOrEqual(2);
      const [a, b] = fractions;
      for (const f of [a, b]) {
        expect(f.num).toBeGreaterThan(0);
        expect(f.den).toBeGreaterThan(f.num);
      }
      expect(a.value).not.toBe(b.value);
    }
  });

  it.each(COMPARING_TYPES)(
    "like-denominator and like-numerator constraints are honored for %s",
    (practiceType) => {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const fractions = parsePromptFractions(problem.prompt);
        expect(fractions.length).toBeGreaterThanOrEqual(2);
        const [a, b] = fractions;

        const rule = problem.problemKey?.split(":").pop();
        if (rule === "like_denominator") {
          expect(a.den).toBe(b.den);
        } else if (rule === "like_numerator") {
          expect(a.num).toBe(b.num);
        } else {
          // For types that do not encode the rule in the key, the fractions
          // should still be comparable at Grade 3 (either same numerator or
          // same denominator).
          expect(a.den === b.den || a.num === b.num).toBe(true);
        }
      }
    },
  );

  it.each(COMPARING_TYPES)("problemKey includes both fractions and form for %s", (practiceType) => {
    const { experience } = resolve(practiceType);
    for (const problem of experience.problems) {
      const key = problem.problemKey ?? "";
      const match = key.match(/^[\w_]+:(\d+)\/(\d+):(\d+)\/(\d+):(.+)$/);
      expect(match).toBeTruthy();
      expect(match![5].length).toBeGreaterThan(0);
    }
  });

  it.each(COMPARING_TYPES)("produces no duplicate problemKeys for %s", (practiceType) => {
    const { experience } = resolve(practiceType);
    const keys = experience.problems.map((p) => p.problemKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it.each(COMPARING_TYPES)(
    "remains deterministic for the same attemptKey for %s",
    (practiceType) => {
      const a = resolve(practiceType, "det-a").experience;
      const b = resolve(practiceType, "det-a").experience;
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    },
  );

  it.each(COMPARING_TYPES)(
    "never leaks the correct comparison relation in the prompt for %s",
    (practiceType) => {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const fractions = parsePromptFractions(problem.prompt);
        expect(fractions.length).toBeGreaterThanOrEqual(2);
        const [a, b] = fractions;
        const promptLower = problem.prompt.toLowerCase();

        const relationWord = compareWord(a.value, b.value).toLowerCase();
        const relationSymbol = compareSymbol(a.value, b.value);

        expect(promptLower).not.toContain(relationWord);
        expect(promptLower).not.toContain(relationSymbol);

        // If a part's correct answer is a comparison string or symbol, the
        // prompt itself must not contain it.
        for (const part of problem.parts) {
          if (isComparisonString(part.correctAnswer)) {
            expect(promptLower).not.toContain(part.correctAnswer.toLowerCase());
          }
        }
      }
    },
  );

  it.each(["compare_like_denominators_models", "compare_like_numerators_models"])(
    "model prompts use model language and a fraction answer for %s",
    (practiceType) => {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const promptLower = problem.prompt.toLowerCase();
        expect(promptLower).toMatch(/model|shaded/);
        expect(promptLower).not.toMatch(/number.line/);
        expect(problem.parts.length).toBe(1);
        const correct = problem.parts[0].correctAnswer;
        expect(correct).toMatch(/^\d+\/\d+$/);
      }
    },
  );

  it.each(["compare_like_denominators_number_line", "compare_like_numerators_number_line"])(
    "number-line prompts use number-line language and a fraction answer for %s",
    (practiceType) => {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const promptLower = problem.prompt.toLowerCase();
        expect(promptLower).toMatch(/number.line/);
        expect(problem.parts.length).toBe(1);
        const correct = problem.parts[0].correctAnswer;
        expect(correct).toMatch(/^\d+\/\d+$/);
      }
    },
  );

  it("use_comparison_symbols keeps a symbolic comparison form", () => {
    const { experience } = resolve("use_comparison_symbols");
    for (const problem of experience.problems) {
      expect(problem.prompt).toMatch(/___/);
      expect(problem.parts.length).toBe(1);
      expect(problem.parts[0].choices).toContain(problem.parts[0].correctAnswer);
      expect(["<", ">", "="]).toContain(problem.parts[0].correctAnswer);
    }
  });

  it("comparison_word_problems_like_denominators requires a comparison and a justification", () => {
    const { experience } = resolve("comparison_word_problems_like_denominators");
    for (const problem of experience.problems) {
      expect(problem.parts.length).toBeGreaterThanOrEqual(2);

      const whoPart = problem.parts[0];
      expect(whoPart.key).toBe("who");
      expect(whoPart.choices?.length).toBeGreaterThanOrEqual(2);
      expect(NAME_PAIRS.has(whoPart.correctAnswer)).toBe(true);
      const namesInChoices = whoPart.choices!.filter((c) => NAME_PAIRS.has(c));
      expect(namesInChoices.length).toBeGreaterThanOrEqual(2);

      const whyPart = problem.parts[1];
      expect(whyPart.key).toBe("why");
      expect(whyPart.choices?.length).toBeGreaterThanOrEqual(2);
      expect(whyPart.correctAnswer).toMatch(/denominator|parts|same size/);
    }
  });

  it("compare_explain_fractions asks for the comparison and a reason without leaking it", () => {
    const { experience } = resolve("compare_explain_fractions");
    for (const problem of experience.problems) {
      expect(problem.parts.length).toBeGreaterThanOrEqual(2);

      const comparisonPart = problem.parts[0];
      expect(comparisonPart.key).toBe("comparison");
      expect(comparisonPart.correctAnswer).toMatch(/^\d+\/\d+\s*[<>=]\s*\d+\/\d+$/);
      expect(comparisonPart.choices).toContain(comparisonPart.correctAnswer);
      expect(comparisonPart.choices?.length).toBeGreaterThanOrEqual(2);
      expect(problem.prompt.toLowerCase()).not.toContain(
        comparisonPart.correctAnswer.toLowerCase(),
      );

      const reasonPart = problem.parts[1];
      expect(reasonPart.key).toBe("reason");
      expect(reasonPart.correctAnswer).toMatch(/denominator|numerator|parts/);
      expect(reasonPart.choices?.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("same_whole_fractions distinguishes same-whole and different-whole comparison situations", () => {
    const sameForms = new Set<string>();
    const differentForms = new Set<string>();
    const sameCorrectAnswers = new Set<string>();
    const differentCorrectAnswers = new Set<string>();

    for (let i = 0; i < 10; i += 1) {
      const { experience } = resolve("same_whole_fractions", `same-whole-${i}`);
      for (const problem of experience.problems) {
        const form = problem.problemKey?.split(":").slice(-2).join(":");
        expect(form).toMatch(/^same_whole_(same|different):/);

        const fractions = parsePromptFractions(problem.prompt);
        expect(fractions.length).toBeGreaterThanOrEqual(2);
        const [a, b] = fractions;

        const largerFrac = a.value > b.value ? a.frac : b.frac;
        const smallerFrac = a.value > b.value ? b.frac : a.frac;

        if (form?.startsWith("same_whole_same:")) {
          sameForms.add(form!);
          sameCorrectAnswers.add(problem.parts[0].correctAnswer);

          // Same-size wholes: the larger fraction names the larger shaded amount.
          expect(problem.parts[0].correctAnswer).toBe(largerFrac);
          expect(problem.prompt.toLowerCase()).toMatch(/which (fraction|shaded amount) is larger/);
        } else if (form?.startsWith("same_whole_different:")) {
          differentForms.add(form!);
          differentCorrectAnswers.add(problem.parts[0].correctAnswer);

          // Different-size wholes: the physical shaded amount cannot be determined.
          expect(problem.parts[0].correctAnswer).toMatch(/cannot tell/i);
          expect(problem.parts[0].correctAnswer).not.toMatch(/^\d+\/\d+$/);
          expect(problem.prompt.toLowerCase()).not.toContain("which fraction is larger");
          expect(problem.prompt.toLowerCase()).toMatch(/can you tell|shaded amount/);

          // The distractors still include the larger and smaller fractions,
          // showing that the numerical fractions themselves can be compared.
          const choices = problem.parts[0].choices ?? [];
          expect(choices.some((c) => c.includes(largerFrac))).toBe(true);
          expect(choices.some((c) => c.includes(smallerFrac))).toBe(true);
        }
      }
    }

    // Both same-whole and different-whole cases should generate.
    expect(sameForms.size).toBeGreaterThan(0);
    expect(differentForms.size).toBeGreaterThan(0);
    expect(sameCorrectAnswers.size).toBeGreaterThan(0);
    expect(differentCorrectAnswers.size).toBeGreaterThan(0);

    // Same-whole answers are fractions; different-whole answers are not fractions.
    for (const answer of sameCorrectAnswers) {
      expect(answer).toMatch(/^\d+\/\d+$/);
    }
    for (const answer of differentCorrectAnswers) {
      expect(answer).not.toMatch(/^\d+\/\d+$/);
    }
  });

  it("places the larger fraction on the smaller whole in indeterminate different-whole problems", () => {
    let differentWholeProblems = 0;

    for (let i = 0; i < 20; i += 1) {
      const { experience } = resolve("same_whole_fractions", `different-whole-order-${i}`);
      for (const problem of experience.problems) {
        const form = problem.problemKey?.split(":").slice(-2).join(":");
        if (!form?.startsWith("same_whole_different:")) continue;

        const match = problem.prompt.match(
          /^A (small|large) \w+ has (\d+\/\d+) shaded\. A (small|large) \w+ has (\d+\/\d+) shaded\./,
        );
        expect(match).toBeTruthy();

        const firstValue = match![2].split("/").map(Number);
        const secondValue = match![4].split("/").map(Number);
        const firstIsLarger = firstValue[0] * secondValue[1] > secondValue[0] * firstValue[1];

        expect(match![1]).not.toBe(match![3]);
        expect(firstIsLarger ? match![1] : match![3]).toBe("small");
        expect(firstIsLarger ? match![3] : match![1]).toBe("large");
        differentWholeProblems += 1;
      }
    }

    expect(differentWholeProblems).toBeGreaterThan(0);
  });
});
