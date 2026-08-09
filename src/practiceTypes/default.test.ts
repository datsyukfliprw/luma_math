import { describe, it, expect } from "vitest";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import { generateDefaultPracticeProblems } from "./default";
import type { PracticeGenerationOptions } from "./types";
import type { Lesson } from "../data/curriculum";

function buildLesson(overrides: Partial<Lesson>): Partial<Lesson> {
  return {
    lesson_id: "g3-test-w1-l1",
    practice_type: "test_practice",
    ...overrides,
  };
}

function buildOptions(overrides?: Partial<PracticeGenerationOptions>): PracticeGenerationOptions {
  return {
    mode: "guided",
    seed: "default-test",
    ...overrides,
  };
}

type TestWarmupQuestion = {
  prompt: string;
  correct_answer: string;
  question_type?: "text" | "target_digit_value";
  number?: string;
  target_digit_index?: number;
};

function baseWarmup(raw: TestWarmupQuestion[]) {
  return {
    title: "Warmup",
    type: "warmup",
    question_count: raw.length,
    instructions: "Warm up.",
    questions: raw.map((q, i) => ({
      id: `warmup-${i + 1}`,
      prompt: q.prompt,
      correct_answer: q.correct_answer,
      hint: "Think it through.",
      skill: "test-skill",
      question_type: q.question_type,
      number: q.number,
      target_digit_index: q.target_digit_index,
    })),
  };
}

function baseTryIt(prompt: string, correctAnswer: string) {
  return {
    title: "Try It",
    type: "try_it",
    prompt,
    correct_answer: correctAnswer,
    hint: "Try it.",
    visual_data: { groups: 1, items_per_group: 1 },
  };
}

function basePracticeBlock(count: number) {
  return {
    title: "Practice",
    type: "practice",
    question_count: count,
    instructions: "Practice.",
  };
}

describe("generateDefaultPracticeProblems", () => {
  it("generates multiple choice for numeric answers with distractors", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([{ prompt: "What is 5 + 7?", correct_answer: "12" }]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems.length).toBe(1);
    expect(problems[0].visualType).toBe("multiple_choice");
    expect(problems[0].visualData?.choices).toBeDefined();
    expect(problems[0].visualData?.choices?.length).toBeGreaterThanOrEqual(2);
    expect(problems[0].visualData?.choices).toContain("12");
    expect(problems[0].correctAnswer).toBe("12");
  });

  it("generates multiple choice for comma-formatted numeric answers", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([{ prompt: "What is 1,000 + 5,000?", correct_answer: "6,000" }]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems[0].visualType).toBe("multiple_choice");
    expect(problems[0].visualData?.choices).toBeDefined();
    expect(problems[0].visualData?.choices?.length).toBeGreaterThanOrEqual(2);
    expect(problems[0].visualData?.choices).toContain("6,000");
  });

  it("generates multiple choice for fraction answers", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([{ prompt: "What fraction is shaded?", correct_answer: "3/4" }]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems[0].visualType).toBe("multiple_choice");
    expect(problems[0].visualData?.choices).toBeDefined();
    expect(problems[0].visualData?.choices?.length).toBeGreaterThanOrEqual(2);
    expect(problems[0].visualData?.choices).toContain("3/4");
  });

  it("generates two-choice multiple choice for yes/no answers", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([{ prompt: "Is 15 even?", correct_answer: "no" }]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems[0].visualType).toBe("multiple_choice");
    expect(problems[0].visualData?.choices).toHaveLength(2);
    expect(problems[0].visualData?.choices).toContain("yes");
    expect(problems[0].visualData?.choices).toContain("no");
  });

  it("generates categorical multiple choice for known option sets", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "Which operation?", correct_answer: "subtract" },
        { prompt: "Which comparison?", correct_answer: "greater" },
      ]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems.length).toBe(2);
    expect(problems.every((p) => p.visualType === "multiple_choice")).toBe(true);

    const addSubtract = problems.find(
      (p) => p.correctAnswer === "subtract" || p.correctAnswer === "add",
    );
    const greaterLessEqual = problems.find(
      (p) =>
        p.correctAnswer === "greater" || p.correctAnswer === "less" || p.correctAnswer === "equal",
    );

    expect(addSubtract?.visualData?.choices).toContain("add");
    expect(addSubtract?.visualData?.choices).toContain("subtract");
    expect(greaterLessEqual?.visualData?.choices).toContain("greater");
    expect(greaterLessEqual?.visualData?.choices).toContain("less");
    expect(greaterLessEqual?.visualData?.choices).toContain("equal");
  });

  it("falls back to text_entry for arbitrary text answers", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "Read 34,506.", correct_answer: "thirty-four thousand, five hundred six" },
      ]),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    expect(problems[0].visualType).toBe("text_entry");
    expect(problems[0].correctAnswer).toBe("thirty-four thousand, five hundred six");
  });

  it("uses text_entry when the source pool exceeds the requested count", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "Spell the number.", correct_answer: "twenty-three" },
        { prompt: "Spell the number.", correct_answer: "fifty" },
        { prompt: "Spell the number.", correct_answer: "seventeen" },
        { prompt: "Spell the number.", correct_answer: "one hundred" },
      ]),
      practice_block: basePracticeBlock(2),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson, count: 2 }));

    expect(problems.length).toBe(2);
    expect(problems.every((p) => p.visualType === "text_entry")).toBe(true);
    expect(problems[0].correctAnswer).not.toBe(problems[1].correctAnswer);
    expect(problems[0].problemKey).not.toBe(problems[1].problemKey);
  });

  it("returns only the unique source pool when count exceeds unique material", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "What is 2 + 2?", correct_answer: "4" },
        { prompt: "What is 3 + 3?", correct_answer: "6" },
        { prompt: "What is 4 + 4?", correct_answer: "8" },
      ]),
      try_it: baseTryIt("What is 5 + 5?", "10"),
      practice_block: basePracticeBlock(8),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson, count: 8 }));

    expect(problems.length).toBe(4);

    const pairs = new Set(problems.map((p) => `${p.questionText}::${p.correctAnswer}`));
    expect(pairs.size).toBe(4);
  });

  it("produces deterministic output for the same seed", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "What is 5 + 7?", correct_answer: "12" },
        { prompt: "What is 6 + 8?", correct_answer: "14" },
        { prompt: "What is 9 + 4?", correct_answer: "13" },
      ]),
      try_it: baseTryIt("What is 8 + 5?", "13"),
      practice_block: basePracticeBlock(6),
    });

    const options = buildOptions({ lesson, count: 6 });

    const first = generateDefaultPracticeProblems(options);
    const second = generateDefaultPracticeProblems(options);

    expect(first).toEqual(second);
  });

  it("produces different ordering or distractors for different seeds", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "What is 5 + 7?", correct_answer: "12" },
        { prompt: "What is 6 + 8?", correct_answer: "14" },
        { prompt: "What is 9 + 4?", correct_answer: "13" },
      ]),
      try_it: baseTryIt("What is 8 + 5?", "13"),
      practice_block: basePracticeBlock(6),
    });

    const first = generateDefaultPracticeProblems(
      buildOptions({ lesson, count: 6, seed: "seed-a" }),
    );
    const second = generateDefaultPracticeProblems(
      buildOptions({ lesson, count: 6, seed: "seed-b" }),
    );

    const firstKeys = first.map((p) => p.problemKey);
    const secondKeys = second.map((p) => p.problemKey);

    expect(firstKeys).not.toEqual(secondKeys);
  });

  it("produces unique semantic problem keys", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "What is 5 + 7?", correct_answer: "12" },
        { prompt: "What is 6 + 8?", correct_answer: "14" },
        { prompt: "What is 9 + 4?", correct_answer: "13" },
      ]),
      try_it: baseTryIt("What is 8 + 5?", "13"),
      practice_block: basePracticeBlock(4),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson, count: 4 }));

    const keys = new Set(problems.map((p) => p.problemKey));
    expect(keys.size).toBe(problems.length);
    expect(problems[0].problemKey).not.toMatch(/^default-\d+$/);
  });

  it("correct answer appears exactly once in multiple choice choices", () => {
    const lesson = buildLesson({
      warmup: baseWarmup([
        { prompt: "What is 7 + 6?", correct_answer: "13" },
        { prompt: "What is 9 - 3?", correct_answer: "6" },
        { prompt: "What is 4 × 5?", correct_answer: "20" },
      ]),
      practice_block: basePracticeBlock(6),
    });

    const problems = generateDefaultPracticeProblems(buildOptions({ lesson }));

    for (const problem of problems) {
      if (problem.visualType !== "multiple_choice") continue;
      const choices = problem.visualData?.choices ?? [];

      const correctNumeric = normalizeNumericAnswer(problem.correctAnswer);
      const isNumeric = /^-?\d+(\.\d+)?$/.test(correctNumeric);

      const matches = choices.filter((choice) => {
        if (isNumeric) {
          return normalizeNumericAnswer(choice) === correctNumeric;
        }
        return normalizeTextAnswer(choice) === normalizeTextAnswer(problem.correctAnswer);
      });

      expect(matches.length).toBe(1);
    }
  });
});
