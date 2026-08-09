import { describe, it, expect } from "vitest";
import {
  determineErrorType,
  generateSubtractionProblems,
  hasAnyBorrow,
  hasBorrowAtPlace,
} from "./subtraction";
import { subtractionPracticeTypes } from "./familyConfigs";
import { generateProblemsForPracticeType, practiceRegistry } from "./registry";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { createPracticeSessionSeed } from "./random";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

const MODES: Array<"guided" | "independent" | "challenge"> = ["guided", "independent", "challenge"];

function findSubtractionLesson(practiceType: string) {
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

function getExpectedCount(
  options: PracticeGenerationOptions | undefined,
  mode: "guided" | "independent" | "challenge",
): number {
  if (typeof options?.count === "number" && options.count > 0) return options.count;
  if (
    typeof options?.lesson?.practice_block?.question_count === "number" &&
    options.lesson.practice_block.question_count > 0
  ) {
    return options.lesson.practice_block.question_count;
  }
  if (mode === "independent") return 12;
  if (mode === "challenge") return 10;
  return 8;
}

function parseEquation(equation: string): { left: string; right: string } {
  const [left, right] = equation.split(" = ");
  return { left: left?.trim() ?? "", right: right?.trim() ?? "" };
}

function prepareExpression(expr: string, correctAnswer: string): string {
  return expr.replaceAll("__", correctAnswer).replaceAll("_", correctAnswer);
}

function tokenize(expr: string): string[] {
  return expr.match(/\d+|[+\-()]/g) ?? [];
}

function parseValue(tokens: string[], i: number): { value: number; nextIndex: number } {
  if (tokens[i] === "(") {
    const { value, nextIndex } = parseExpression(tokens, i + 1);
    if (tokens[nextIndex] !== ")") {
      throw new Error(`Missing closing parenthesis in expression: ${tokens.join(" ")}`);
    }
    return { value, nextIndex: nextIndex + 1 };
  }
  if (/^\d+$/.test(tokens[i])) {
    return { value: Number(tokens[i]), nextIndex: i + 1 };
  }
  throw new Error(`Unexpected token: ${tokens[i]} in expression: ${tokens.join(" ")}`);
}

function parseExpression(tokens: string[], i: number): { value: number; nextIndex: number } {
  let { value, nextIndex } = parseValue(tokens, i);

  while (nextIndex < tokens.length && (tokens[nextIndex] === "+" || tokens[nextIndex] === "-")) {
    const op = tokens[nextIndex];
    const { value: nextValue, nextIndex: afterNext } = parseValue(tokens, nextIndex + 1);
    value = op === "+" ? value + nextValue : value - nextValue;
    nextIndex = afterNext;
  }

  return { value, nextIndex };
}

function evaluateExpression(expr: string): number {
  const cleaned = expr.replace(/[()]/g, "").trim();
  if (!cleaned || cleaned === "?") return NaN;
  const tokens = tokenize(expr);
  if (tokens.length === 0) return 0;
  const { value } = parseExpression(tokens, 0);
  return value;
}

function getMinuendSubtrahend(problem: PracticeProblem): { minuend: number; subtrahend: number } {
  const keyMatch = problem.problemKey.match(/:([\d]+)-([\d]+)/);
  if (keyMatch) {
    return { minuend: Number(keyMatch[1]), subtrahend: Number(keyMatch[2]) };
  }

  const equation =
    problem.visualType === "mistake_check"
      ? (problem.challengeData?.equationToCheck ?? problem.visualData?.equation ?? "")
      : (problem.visualData?.equation ?? "");
  const { left } = parseEquation(equation);
  const prepared = prepareExpression(left, problem.correctAnswer);
  const tokens = tokenize(prepared);
  // left should be minuend - subtrahend (possibly with more terms)
  if (tokens.length >= 3 && tokens[1] === "-") {
    return { minuend: Number(tokens[0]), subtrahend: Number(tokens[2]) };
  }
  return { minuend: 0, subtrahend: 0 };
}

function verifyMultipleChoiceCorrectness(problem: PracticeProblem): void {
  const equation = problem.visualData?.equation ?? "";
  const { left, right } = parseEquation(equation);
  const preparedLeft = prepareExpression(left, problem.correctAnswer);
  const leftValue = evaluateExpression(preparedLeft);

  if (right === "?") {
    expect(leftValue).toBe(Number(problem.correctAnswer));
  } else {
    const preparedRight = prepareExpression(right, problem.correctAnswer);
    const rightValue = evaluateExpression(preparedRight);

    if (left.includes("__") || left.includes("_") || right.includes("_")) {
      expect(leftValue).toBe(rightValue);
    } else if (problem.correctAnswer === "true" || problem.correctAnswer === "false") {
      expect(String(leftValue === rightValue)).toBe(problem.correctAnswer);
    } else {
      expect(leftValue).toBe(Number(problem.correctAnswer));
    }
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

function verifyCompensationProblem(problem: PracticeProblem): void {
  expect(problem.visualType).toBe("multiple_choice");
  const equation = problem.visualData?.equation ?? "";
  const { left, right } = parseEquation(equation);
  const preparedLeft = prepareExpression(left, problem.correctAnswer);
  const preparedRight = prepareExpression(right, problem.correctAnswer);
  const leftValue = evaluateExpression(preparedLeft);
  const rightValue = evaluateExpression(preparedRight);

  if (problem.correctAnswer === "true" || problem.correctAnswer === "false") {
    const expected = problem.correctAnswer === "true";
    expect(leftValue === rightValue).toBe(expected);

    // The compensation adjustment plus the subtrahend should form a round hundred when true.
    const rightTokens = tokenize(preparedRight);
    // right is "intermediate + adjustment"
    const adjustment = Number(rightTokens[rightTokens.length - 1]);
    const { subtrahend } = getMinuendSubtrahend(problem);
    const target = subtrahend + adjustment;
    if (problem.correctAnswer === "true") {
      expect(target % 100).toBe(0);
    } else {
      expect(target % 100).not.toBe(0);
    }
  } else {
    expect(leftValue).toBe(rightValue);

    const { minuend, subtrahend } = getMinuendSubtrahend(problem);
    const adjustment = Number(problem.correctAnswer);
    const target = subtrahend + adjustment;
    expect(target % 100).toBe(0);
    expect(minuend - target).toBe(evaluateExpression(prepareExpression(right.split(" + ")[0], "")));
  }
}

function verifyNumberLineProblem(problem: PracticeProblem): void {
  expect(problem.visualType).toBe("multiple_choice");
  const equation = problem.visualData?.equation ?? "";
  const { left, right } = parseEquation(equation);
  const preparedLeft = prepareExpression(left, problem.correctAnswer);
  const leftValue = evaluateExpression(preparedLeft);

  const { minuend, subtrahend } = getMinuendSubtrahend(problem);

  if (right === "?") {
    expect(leftValue).toBe(Number(problem.correctAnswer));
    expect(Number(problem.correctAnswer)).toBe(minuend - subtrahend);
  } else {
    const preparedRight = prepareExpression(right, problem.correctAnswer);
    const rightValue = evaluateExpression(preparedRight);
    expect(leftValue).toBe(rightValue);
    expect(rightValue).toBe(minuend - subtrahend);
  }
}

function verifyExpandedFormProblem(problem: PracticeProblem): void {
  expect(problem.visualType).toBe("multiple_choice");
  const equation = problem.visualData?.equation ?? "";
  const { left, right } = parseEquation(equation);
  const preparedLeft = prepareExpression(left, problem.correctAnswer);
  const leftValue = evaluateExpression(preparedLeft);

  if (right === "?") {
    expect(leftValue).toBe(Number(problem.correctAnswer));
  } else {
    const preparedRight = prepareExpression(right, problem.correctAnswer);
    const rightValue = evaluateExpression(preparedRight);
    expect(leftValue).toBe(rightValue);
  }

  // Each parenthesized term should be a non-negative place-value difference.
  const termMatches = preparedLeft.match(/\(([^)]+)\)/g) ?? [];
  for (const term of termMatches) {
    const value = evaluateExpression(term.replace(/[()]/g, ""));
    expect(value).toBeGreaterThanOrEqual(0);
  }
}

function verifyMissingDigitUniqueness(problem: PracticeProblem): void {
  const equation = problem.visualData?.equation ?? "";
  const underscoreCount = (equation.match(/_/g) ?? []).length;
  if (underscoreCount !== 1) return;

  let validDigitCount = 0;
  for (let digit = 0; digit <= 9; digit += 1) {
    const testEquation = equation.replace("_", String(digit));
    const { left, right } = parseEquation(testEquation);
    const leftValue = evaluateExpression(left);
    const rightValue = evaluateExpression(right);
    if (leftValue === rightValue) validDigitCount += 1;
  }
  expect(validDigitCount).toBe(1);
  expect(Number(problem.correctAnswer)).toBeGreaterThanOrEqual(0);
  expect(Number(problem.correctAnswer)).toBeLessThanOrEqual(9);
}

function verifyNoRegroupDigits(minuend: number, subtrahend: number): void {
  const maxPlace = Math.max(String(minuend).length, String(subtrahend).length);
  for (let p = 0; p < maxPlace; p += 1) {
    expect(getDigit(minuend, p)).toBeGreaterThanOrEqual(getDigit(subtrahend, p));
  }
}

function getDigit(n: number, place: number): number {
  return Math.floor(n / 10 ** place) % 10;
}

describe("Subtraction family generator", () => {
  it("maps all eight Subtraction practice types to the Subtraction generator", () => {
    for (const practiceType of subtractionPracticeTypes) {
      expect(practiceRegistry[practiceType]).toBe(generateSubtractionProblems);
    }
  });

  it("discovers exactly eight Grade 3 Subtraction lessons", () => {
    const lessons = subtractionPracticeTypes.map(findSubtractionLesson);
    expect(lessons.length).toBe(8);
    expect(lessons.every((l) => l !== undefined)).toBe(true);
  });

  it("generates problems for every Subtraction practice type and mode", () => {
    for (const practiceType of subtractionPracticeTypes) {
      const lesson = findSubtractionLesson(practiceType)!;

      for (const mode of MODES) {
        const options: PracticeGenerationOptions = { mode, lesson };
        const problems = generateProblemsForPracticeType(practiceType, options);

        expect(problems).toHaveLength(getExpectedCount(options, mode));

        const keys = new Set<string>();
        for (const problem of problems) {
          expect(problem.questionText).toBeTruthy();
          expect(problem.correctAnswer).toBeTruthy();
          expect(problem.problemKey).toMatch(/^subtraction:/);
          expect(keys.has(problem.problemKey)).toBe(false);
          keys.add(problem.problemKey);

          if (problem.visualType === "multiple_choice") {
            verifyMultipleChoiceCorrectness(problem);
          } else if (problem.visualType === "mistake_check") {
            verifyMistakeCheck(problem);
          } else {
            throw new Error(`Unexpected visualType ${problem.visualType} for ${practiceType}`);
          }

          const { minuend, subtrahend } = getMinuendSubtrahend(problem);
          const difference = minuend - subtrahend;

          if (problem.visualType === "mistake_check") {
            const equationToCheck = problem.challengeData!.equationToCheck;
            const { left } = parseEquation(equationToCheck);
            expect(evaluateExpression(left)).toBe(difference);
          } else if (practiceType === "subtraction_compensation") {
            verifyCompensationProblem(problem);
          } else if (practiceType === "subtraction_number_line") {
            verifyNumberLineProblem(problem);
          } else if (practiceType === "subtraction_expanded_form") {
            verifyExpandedFormProblem(problem);
          } else {
            if (problem.visualData?.equation?.includes("_")) {
              verifyMissingDigitUniqueness(problem);
            }
          }

          expect(minuend).toBeGreaterThan(0);
          expect(minuend).toBeLessThan(1000);
          expect(subtrahend).toBeGreaterThan(0);
          expect(subtrahend).toBeLessThan(1000);
          expect(difference).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("produces deterministic output for the same seed and different output for different seeds", () => {
    const practiceType = "subtraction_number_line";
    const lesson = findSubtractionLesson(practiceType)!;

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
    const different = runA.some((problem, index) => problem.problemKey !== runC[index].problemKey);
    expect(different).toBe(true);
  });

  it("uses a deterministic fallback when options.seed is omitted", () => {
    const practiceType = "subtraction_number_line";
    const lesson = findSubtractionLesson(practiceType)!;

    const runA = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
    });
    const runB = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
    });
    expect(runA).toEqual(runB);

    const seedSame = createPracticeSessionSeed(
      lesson.lesson_id ?? "",
      practiceType,
      "guided",
      "session-1",
    );
    const seedDifferent = createPracticeSessionSeed(
      lesson.lesson_id ?? "",
      practiceType,
      "guided",
      "session-2",
    );

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

  it("honors options.count and lesson practice_block question_count", () => {
    const practiceType = "subtraction_no_regroup";
    const lesson = findSubtractionLesson(practiceType)!;

    const withCount = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      count: 5,
    });
    expect(withCount).toHaveLength(5);

    const withBlock = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
    });
    expect(withBlock).toHaveLength(lesson.practice_block?.question_count ?? 0);

    const withCountOverride = generateProblemsForPracticeType(practiceType, {
      mode: "guided",
      lesson,
      count: 3,
    });
    expect(withCountOverride).toHaveLength(3);
  });

  it("enforces regrouping rules for each practice type", () => {
    const expectations: Record<string, (minuend: number, subtrahend: number) => boolean | "mixed"> =
      {
        subtraction_number_line: (a, b) => !hasAnyBorrow(a, b),
        subtraction_expanded_form: (a, b) => !hasAnyBorrow(a, b),
        subtraction_no_regroup: (a, b) => !hasAnyBorrow(a, b),
        subtraction_compensation: () => "mixed",
        subtraction_regroup_ones: (a, b) =>
          hasBorrowAtPlace(a, b, 0) && !hasBorrowAtPlace(a, b, 1) && !hasBorrowAtPlace(a, b, 2),
        subtraction_regroup_tens: (a, b) =>
          !hasBorrowAtPlace(a, b, 0) && hasBorrowAtPlace(a, b, 1) && !hasBorrowAtPlace(a, b, 2),
        subtract_across_zeros: () => "mixed",
        subtraction_missing_digits: (a, b) => !hasAnyBorrow(a, b),
      };

    for (const practiceType of subtractionPracticeTypes) {
      const lesson = findSubtractionLesson(practiceType)!;
      const check = expectations[practiceType];

      for (const mode of MODES) {
        const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
        for (const problem of problems) {
          if (problem.visualType === "mistake_check") continue;
          const { minuend, subtrahend } = getMinuendSubtrahend(problem);
          const result = check(minuend, subtrahend);
          if (result === "mixed") continue;
          if (result !== true) {
            console.error({
              practiceType,
              mode,
              minuend,
              subtrahend,
              problemKey: problem.problemKey,
            });
          }
          expect(result).toBe(true);
        }
      }
    }
  });

  it("generates no-regroup problems with digitwise a >= b", () => {
    const practiceType = "subtraction_no_regroup";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        const { minuend, subtrahend } = getMinuendSubtrahend(problem);
        verifyNoRegroupDigits(minuend, subtrahend);
      }
    }
  });

  it("generates regroup-ones problems with exactly ones-column borrowing", () => {
    const practiceType = "subtraction_regroup_ones";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        if (problem.visualType === "mistake_check") continue;
        const { minuend, subtrahend } = getMinuendSubtrahend(problem);
        expect(hasBorrowAtPlace(minuend, subtrahend, 0)).toBe(true);
        expect(hasBorrowAtPlace(minuend, subtrahend, 1)).toBe(false);
        expect(hasBorrowAtPlace(minuend, subtrahend, 2)).toBe(false);
      }
    }
  });

  it("generates regroup-tens problems with exactly tens-column borrowing", () => {
    const practiceType = "subtraction_regroup_tens";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        if (problem.visualType === "mistake_check") continue;
        const { minuend, subtrahend } = getMinuendSubtrahend(problem);
        expect(hasBorrowAtPlace(minuend, subtrahend, 0)).toBe(false);
        expect(hasBorrowAtPlace(minuend, subtrahend, 1)).toBe(true);
        expect(hasBorrowAtPlace(minuend, subtrahend, 2)).toBe(false);
      }
    }
  });

  it("generates across-zeros problems that borrow through a zero", () => {
    const practiceType = "subtract_across_zeros";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        if (problem.visualType === "mistake_check") continue;
        const { minuend, subtrahend } = getMinuendSubtrahend(problem);
        expect(getDigit(minuend, 1)).toBe(0);
        expect(hasAnyBorrow(minuend, subtrahend)).toBe(true);
      }
    }
  });

  it("generates number-line problems with correct jump decompositions", () => {
    const practiceType = "subtraction_number_line";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        verifyNumberLineProblem(problem);
      }
    }
  });

  it("generates expanded-form problems that reconstruct the difference", () => {
    const practiceType = "subtraction_expanded_form";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        verifyExpandedFormProblem(problem);
      }
    }
  });

  it("generates compensation problems that preserve the original difference", () => {
    const practiceType = "subtraction_compensation";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        verifyCompensationProblem(problem);
      }
    }
  });

  it("generates missing-digit problems with a single unambiguous answer", () => {
    const practiceType = "subtraction_missing_digits";
    const lesson = findSubtractionLesson(practiceType)!;

    for (const mode of MODES) {
      const problems = generateProblemsForPracticeType(practiceType, { mode, lesson });
      for (const problem of problems) {
        if (problem.visualData?.equation?.includes("_")) {
          verifyMissingDigitUniqueness(problem);
        }
      }
    }
  });

  it("provides well-formed multiple-choice options", () => {
    const practiceType = "subtraction_no_regroup";
    const lesson = findSubtractionLesson(practiceType)!;

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

  it("classifies subtraction errors with specific reason choices", () => {
    expect(determineErrorType(86, 96, 243, 157)).toBe("forgot_ones_borrow");
    expect(determineErrorType(86, 186, 243, 157)).toBe("forgot_tens_borrow");
    expect(determineErrorType(86, 85, 243, 157)).toBe("off_by_one");
    expect(determineErrorType(86, 157, 243, 157)).toBe("used_operand");
    expect(determineErrorType(86, 243, 243, 157)).toBe("used_operand");
    expect(determineErrorType(86, 86, 243, 157)).toBe("correct");
  });

  it("keeps word-problem keys stable while changing only the object noun", () => {
    const practiceType = "subtraction_no_regroup";
    const lesson = findSubtractionLesson(practiceType)!;

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
