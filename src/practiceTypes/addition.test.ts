import { describe, it, expect } from "vitest";
import { generateAdditionProblems, hasAnyCarryOut, hasCarryOutAtPlace } from "./addition";
import { additionFamilyConfigs, additionPracticeTypes } from "./familyConfigs";
import { generateProblemsForPracticeType, practiceRegistry } from "./registry";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { findCurriculumLessonById } from "../lib/curriculumLoader";
import { generateEvaluationProblems } from "./evaluation";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import { createPracticeSessionSeed } from "./random";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

const MODES: Array<"guided" | "independent" | "challenge"> = ["guided", "independent", "challenge"];

function parseEquation(equation: string): { left: string; right: string } {
  const [left, right] = equation.split(" = ");
  return { left: left?.trim() ?? "", right: right?.trim() ?? "" };
}

function prepareExpression(expr: string, correctAnswer: string): string {
  return expr.replaceAll("__", correctAnswer).replaceAll("_", correctAnswer);
}

function evaluateExpression(expr: string): number {
  const cleaned = expr.replace(/[()]/g, "").trim();
  if (!cleaned) return 0;
  return cleaned
    .split(/\s*\+\s*/)
    .reduce((sum, term) => sum + Number(term), 0);
}

function extractAddends(expr: string): number[] {
  const cleaned = expr.replace(/[()]/g, "").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/\s*\+\s*/)
    .map((term) => Number(term))
    .filter((n) => Number.isFinite(n));
}

function getAddends(problem: PracticeProblem): number[] {
  const equation =
    problem.visualType === "mistake_check"
      ? problem.challengeData?.equationToCheck ?? problem.visualData?.equation ?? ""
      : problem.visualData?.equation ?? "";
  if (!equation) return [];
  const { left } = parseEquation(equation);
  const prepared = prepareExpression(left, problem.correctAnswer);
  return extractAddends(prepared);
}

function findAdditionLesson(practiceType: string) {
  for (let unitNumber = 1; unitNumber <= 36; unitNumber += 1) {
    const unit = getCurriculum(3, unitNumber);
    if (!unit) continue;
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

function getExpectedCount(mode: "guided" | "independent" | "challenge"): number {
  if (mode === "independent") return 12;
  if (mode === "challenge") return 10;
  return 8;
}

function verifyMultipleChoiceCorrectness(problem: PracticeProblem): void {
  const equation = problem.visualData?.equation ?? "";
  const { left, right } = parseEquation(equation);
  const preparedLeft = prepareExpression(left, problem.correctAnswer);
  const preparedRight = prepareExpression(right, problem.correctAnswer);
  const leftValue = evaluateExpression(preparedLeft);
  const rightValue = evaluateExpression(preparedRight);

  if (right === "?") {
    expect(leftValue).toBe(Number(problem.correctAnswer));
  } else if (left.includes("__") || left.includes("_") || right.includes("_")) {
    expect(leftValue).toBe(rightValue);
  } else if (problem.correctAnswer === "true" || problem.correctAnswer === "false") {
    expect(String(leftValue === rightValue)).toBe(problem.correctAnswer);
  } else {
    expect(leftValue).toBe(Number(problem.correctAnswer));
  }
}

function verifyMistakeCheck(problem: PracticeProblem): void {
  expect(problem.challengeData).toBeDefined();
  const { equationToCheck, correctJudgment, reasonChoices, correctReason, judgmentChoices } =
    problem.challengeData!;
  const { left, right } = parseEquation(equationToCheck);
  const leftValue = evaluateExpression(left);
  const rightValue = evaluateExpression(right);

  if (correctJudgment === "yes") {
    expect(leftValue).toBe(rightValue);
  } else {
    expect(leftValue).not.toBe(rightValue);
  }

  expect(judgmentChoices).toContain("yes");
  expect(judgmentChoices).toContain("no");
  expect(new Set(judgmentChoices).size).toBe(judgmentChoices.length);

  expect(reasonChoices).toContain(correctReason);
  expect(new Set(reasonChoices).size).toBe(reasonChoices.length);
  expect(reasonChoices.length).toBeGreaterThanOrEqual(2);
}

describe("Addition family generator", () => {
  it("maps all eight Addition practice types to the Addition generator", () => {
    for (const practiceType of additionPracticeTypes) {
      expect(practiceRegistry[practiceType]).toBe(generateAdditionProblems);
    }
  });

  it("discovers exactly eight Grade 3 Addition lessons", () => {
    const lessons = additionPracticeTypes.map(findAdditionLesson);
    expect(lessons.length).toBe(8);
    expect(lessons.every((l) => l !== undefined)).toBe(true);
  });

  it("generates problems for every Addition practice type and mode", () => {
    for (const practiceType of additionPracticeTypes) {
      const lesson = findAdditionLesson(practiceType)!;
      const config = additionFamilyConfigs[practiceType];

      for (const mode of MODES) {
        const options: PracticeGenerationOptions = { mode, lesson };
        const problems = generateProblemsForPracticeType(practiceType, options);

        expect(problems).toHaveLength(getExpectedCount(mode));

        const keys = new Set<string>();
        for (const problem of problems) {
          expect(problem.questionText).toBeTruthy();
          expect(problem.correctAnswer).toBeTruthy();
          expect(problem.problemKey).toMatch(/^addition:/);
          expect(keys.has(problem.problemKey)).toBe(false);
          keys.add(problem.problemKey);

          if (problem.visualType === "multiple_choice") {
            verifyMultipleChoiceCorrectness(problem);
          } else if (problem.visualType === "mistake_check") {
            verifyMistakeCheck(problem);
          } else {
            throw new Error(`Unexpected visualType ${problem.visualType} for ${practiceType}`);
          }

          const addends = getAddends(problem);
          const sum =
            problem.visualType === "mistake_check"
              ? evaluateExpression(
                  parseEquation(problem.challengeData!.equationToCheck).left,
                )
              : addends.reduce((a, b) => a + b, 0);

          if (config.resultRange) {
            expect(sum).toBeGreaterThanOrEqual(config.resultRange.min);
            expect(sum).toBeLessThanOrEqual(config.resultRange.max);
          }

          for (const addend of addends) {
            expect(addend).toBeGreaterThan(0);
            expect(addend).toBeLessThan(1000);
          }
        }
      }
    }
  });

  it("produces deterministic output for the same seed and different output for different seeds", () => {
    const practiceType = "addition_number_line";
    const lesson = findAdditionLesson(practiceType)!;

    const runA = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: "seed-123",
    });
    const runB = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: "seed-123",
    });
    expect(runA).toEqual(runB);

    const runC = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: "seed-456",
    });
    const different = runA.some(
      (problem, index) => problem.problemKey !== runC[index].problemKey,
    );
    expect(different).toBe(true);
  });

  it("uses a deterministic fallback when options.seed is omitted", () => {
    const practiceType = "addition_number_line";
    const lesson = findAdditionLesson(practiceType)!;

    // Omitted seed: deterministic, no timestamp/Math.random/global state.
    const runA = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
    });
    const runB = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
    });
    expect(runA).toEqual(runB);

    // Explicit session seed via createPracticeSessionSeed: same session id is stable,
    // different session id produces different problems.
    const seedSame = createPracticeSessionSeed(lesson.lesson_id ?? "", practiceType, "guided", "session-1");
    const seedDifferent = createPracticeSessionSeed(lesson.lesson_id ?? "", practiceType, "guided", "session-2");

    const runExplicitA = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: seedSame,
    });
    const runExplicitB = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: seedSame,
    });
    expect(runExplicitA).toEqual(runExplicitB);

    const runDifferent = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      seed: seedDifferent,
    });
    const different = runExplicitA.some(
      (problem, index) => problem.problemKey !== runDifferent[index].problemKey,
    );
    expect(different).toBe(true);
  });

  it("enforces regrouping rules for each practice type", () => {
    const expectations: Record<string, (addends: number[]) => boolean | "mixed"> = {
      addition_number_line: (addends) => !hasAnyCarryOut(addends),
      addition_expanded_form: (addends) => !hasAnyCarryOut(addends),
      addition_no_regroup: (addends) => !hasAnyCarryOut(addends),
      addition_compensation: () => "mixed",
      addition_regroup_ones: (addends) => hasCarryOutAtPlace(addends, 0),
      addition_regroup_tens: (addends) => hasCarryOutAtPlace(addends, 1),
      addition_three_numbers: () => "mixed",
      missing_digits_properties: () => "mixed",
    };

    for (const practiceType of additionPracticeTypes) {
      const lesson = findAdditionLesson(practiceType)!;
      const check = expectations[practiceType];

      for (const mode of MODES) {
        const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
        for (const problem of problems) {
          const addends = getAddends(problem);
          if (addends.length === 0) continue;
          const result = check(addends);
          if (result === "mixed") continue;
          expect(result).toBe(true);
        }
      }
    }
  });

  it("distinguishes exact regrouping columns", () => {
    // place 0 (ones) carry-out into tens
    expect(hasCarryOutAtPlace([5, 7], 0)).toBe(true); // 5 + 7 = 12
    // place 1 (tens) carry-out into hundreds, including any carry-in
    expect(hasCarryOutAtPlace([50, 60], 1)).toBe(true); // 5 tens + 6 tens = 11 tens
    // ones-only carry, tens column does NOT produce a carry-out
    expect(hasCarryOutAtPlace([5, 7], 1)).toBe(false); // 12 → tens column is 0 + 0 + 1 = 1, no new carry
    // carry due to tens digits + ones carry-in
    expect(hasCarryOutAtPlace([95, 45], 1)).toBe(true); // 9+4+1 = 14 tens
    // no regrouping anywhere
    expect(hasCarryOutAtPlace([1, 2], 0)).toBe(false);
    expect(hasCarryOutAtPlace([10, 20], 1)).toBe(false);

    // hasAnyCarryOut must detect an intermediate ones carry even if the final carry is 0.
    expect(hasAnyCarryOut([5, 7])).toBe(true);
    expect(hasAnyCarryOut([105, 107])).toBe(true);
    expect(hasAnyCarryOut([123, 456])).toBe(false);
  });

  it("generates full sessions with exact column-carry requirements", () => {
    const onesLesson = findAdditionLesson("addition_regroup_ones")!;
    for (const mode of MODES) {
      const onesProblems = generateProblemsForPracticeType("addition_regroup_ones", {
        mode,
        lesson: onesLesson,
      });
      expect(onesProblems.length).toBeGreaterThan(0);
      for (const problem of onesProblems) {
        const addends = getAddends(problem);
        expect(hasCarryOutAtPlace(addends, 0)).toBe(true);
      }
    }

    const tensLesson = findAdditionLesson("addition_regroup_tens")!;
    for (const mode of MODES) {
      const tensProblems = generateProblemsForPracticeType("addition_regroup_tens", {
        mode,
        lesson: tensLesson,
      });
      expect(tensProblems.length).toBeGreaterThan(0);
      for (const problem of tensProblems) {
        const addends = getAddends(problem);
        expect(hasCarryOutAtPlace(addends, 1)).toBe(true);
      }
    }

    const noRegroupLesson = findAdditionLesson("addition_no_regroup")!;
    for (const mode of MODES) {
      const noRegroupProblems = generateProblemsForPracticeType("addition_no_regroup", {
        mode,
        lesson: noRegroupLesson,
      });
      expect(noRegroupProblems.length).toBeGreaterThan(0);
      for (const problem of noRegroupProblems) {
        const addends = getAddends(problem);
        expect(hasAnyCarryOut(addends)).toBe(false);
      }
    }
  });

  it("provides well-formed multiple-choice options", () => {
    const practiceType = "addition_no_regroup";
    const lesson = findAdditionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        if (problem.visualType !== "multiple_choice") continue;
        const choices = problem.visualData?.choices;
        expect(choices).toBeDefined();
        expect(choices!.length).toBeGreaterThanOrEqual(2);
        expect(new Set(choices).size).toBe(choices!.length);

        const correct = problem.correctAnswer;
        const matches = choices!.filter((choice) => {
          if (correct === "true" || correct === "false") {
            return normalizeTextAnswer(choice) === correct;
          }
          return normalizeNumericAnswer(choice) === normalizeNumericAnswer(correct);
        });
        expect(matches.length).toBe(1);
      }
    }
  });

  it("supports evaluation generation for Unit 4 and Unit 5 Addition evaluations", () => {
    const unit4Eval = findCurriculumLessonById("g3-u4-w1-eval")?.lesson;
    const unit5Eval = findCurriculumLessonById("g3-u5-w1-eval")?.lesson;

    expect(unit4Eval).toBeDefined();
    expect(unit5Eval).toBeDefined();

    for (const evalLesson of [unit4Eval!, unit5Eval!]) {
      const problems = generateEvaluationProblems({ lesson: evalLesson });
      expect(problems.length).toBeGreaterThan(0);

      const keys = new Set<string>();
      for (const problem of problems) {
        expect(problem.problemKey).toBeTruthy();
        expect(keys.has(problem.problemKey)).toBe(false);
        keys.add(problem.problemKey);
        expect(["multiple_choice", "mistake_check"]).toContain(problem.visualType);
      }
    }
  });

  it("keeps word-problem keys stable while changing only the object noun", () => {
    const practiceType = "addition_no_regroup";
    const lesson = findAdditionLesson(practiceType)!;

    const run1 = generateProblemsForPracticeType(practiceType, {
      mode: "independent",
      lesson,
      seed: "word-problem-stability",
    });
    const run2 = generateProblemsForPracticeType(practiceType, {
      mode: "independent",
      lesson,
      seed: "word-problem-stability",
    });
    expect(run1.map((p) => p.problemKey)).toEqual(run2.map((p) => p.problemKey));
  });
});
