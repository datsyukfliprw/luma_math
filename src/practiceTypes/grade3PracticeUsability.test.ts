import { describe, it, expect } from "vitest";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { isRegisteredPracticeType, generateProblemsForPracticeType } from "./registry";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { Lesson } from "../data/curriculum";
import type { PracticeMode, PracticeProblem } from "./types";

const PRACTICE_MODES: PracticeMode[] = ["guided", "independent", "challenge"];

function getAllGrade3Lessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (let unitNumber = 1; unitNumber <= 36; unitNumber += 1) {
    const unit = getCurriculum(3, unitNumber);
    if (!unit) continue;
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson") {
          lessons.push(lesson);
        }
      }
    }
  }
  return lessons;
}

function normalizePair(problem: PracticeProblem): string {
  return `${normalizeTextAnswer(problem.questionText)}::${normalizeTextAnswer(problem.correctAnswer)}`;
}

function problemFingerprint(problem: PracticeProblem): string {
  const v = problem.visualData;
  const c = problem.challengeData;

  const parts = [
    normalizeTextAnswer(problem.questionText),
    normalizeTextAnswer(problem.correctAnswer),
    problem.visualType,
    v?.equation ?? "",
    v?.groups ?? "",
    v?.itemsPerGroup ?? "",
    v?.repeatedAddition ?? "",
    v?.factors ? v.factors.join(",") : "",
    v?.product ?? "",
    v?.rows ?? "",
    v?.columns ?? "",
    v?.items ?? "",
    v?.groupsToShare ?? "",
    v?.choices ? v.choices.join(",") : "",
    c?.equationToCheck ?? "",
    c?.correctJudgment ?? "",
    c?.correctReason ?? "",
    c?.reasonChoices ? c.reasonChoices.join(",") : "",
  ];

  return parts.join("::");
}

function choiceMatchesCorrect(choice: string, correctAnswer: string): boolean {
  const numeric = normalizeNumericAnswer(correctAnswer);
  if (/^-?\d+(\.\d+)?$/.test(numeric)) {
    return normalizeNumericAnswer(choice) === numeric;
  }
  return normalizeTextAnswer(choice) === normalizeTextAnswer(correctAnswer);
}

describe("Grade 3 practice usability", () => {
  it("produces usable practice problems for every regular Grade 3 lesson in every mode", () => {
    const lessons = getAllGrade3Lessons();
    expect(lessons.length).toBe(144);

    let familyBacked = 0;
    let fallbackBacked = 0;

    const zeroProblemLessons: string[] = [];
    const missingChoiceProblems: string[] = [];
    const duplicateProblemLessons: string[] = [];

    for (const lesson of lessons) {
      if (isRegisteredPracticeType(lesson.practice_type)) {
        familyBacked += 1;
      } else {
        fallbackBacked += 1;
      }

      for (const mode of PRACTICE_MODES) {
        const problems = generateProblemsForPracticeType(lesson.practice_type, {
          mode,
          seed: `usability:${lesson.lesson_id}:${mode}`,
          lesson,
        });

        if (problems.length === 0) {
          zeroProblemLessons.push(`${lesson.lesson_id} (${mode})`);
          continue;
        }

        const isFallback = !isRegisteredPracticeType(lesson.practice_type);
        const seenProblemKeys = new Set<string>();
        const seenFingerprints = new Set<string>();
        const localDuplicateFingerprints: string[] = [];

        for (const problem of problems) {
          if (!problem.problemKey || seenProblemKeys.has(problem.problemKey)) {
            duplicateProblemLessons.push(`${lesson.lesson_id} (${mode})`);
          }
          seenProblemKeys.add(problem.problemKey);

          const fingerprint = isFallback ? normalizePair(problem) : problemFingerprint(problem);
          if (seenFingerprints.has(fingerprint)) {
            localDuplicateFingerprints.push(fingerprint);
          }
          seenFingerprints.add(fingerprint);

          expect(problem.correctAnswer).not.toBe("");

          if (problem.visualType === "multiple_choice") {
            const choices = problem.visualData?.choices ?? [];
            const distinctChoices = [...new Set(choices)];

            if (choices.length < 2 || distinctChoices.length !== choices.length) {
              missingChoiceProblems.push(`${lesson.lesson_id} (${mode})`);
            }

            const correctAppearances = choices.filter((choice) =>
              choiceMatchesCorrect(choice, problem.correctAnswer),
            ).length;

            if (correctAppearances !== 1) {
              missingChoiceProblems.push(`${lesson.lesson_id} (${mode})`);
            }
          }
        }

        if (localDuplicateFingerprints.length > 0) {
          duplicateProblemLessons.push(`${lesson.lesson_id} (${mode})`);
        }
      }
    }

    console.log(
      JSON.stringify({
        regularLessons: lessons.length,
        familyBacked,
        fallbackBacked,
        zeroProblemLessons: zeroProblemLessons.length,
        missingChoiceProblems: missingChoiceProblems.length,
        duplicateProblemLessons: duplicateProblemLessons.length,
      }),
    );

    expect(familyBacked).toBe(13);
    expect(fallbackBacked).toBe(131);
    expect(zeroProblemLessons).toEqual([]);
    expect(missingChoiceProblems).toEqual([]);
    expect(duplicateProblemLessons).toEqual([]);
  });
});
