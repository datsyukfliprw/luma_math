import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getAllCurricula } from "../../data/curriculum";
import type { ResolvedTryItProblem, TryItAnswerPart } from "./types";
import { matchesGeometryPrompt } from "./families/geometryAttributes";

function parseFactFamilyReference(
  prompt: string,
): { a: number; b: number; product: number } | undefined {
  const match = prompt.match(/(\d+) × (\d+) = (\d+)/);
  if (!match) return undefined;
  return { a: Number(match[1]), b: Number(match[2]), product: Number(match[3]) };
}

function isFactFamilyEquation(
  ref: { a: number; b: number; product: number },
  equation: string,
): boolean {
  const mulMatch = equation.match(/^(\d+) × (\d+) = (\d+)$/);
  if (mulMatch) {
    const x = Number(mulMatch[1]);
    const y = Number(mulMatch[2]);
    const z = Number(mulMatch[3]);
    return (
      x * y === z &&
      z === ref.product &&
      ((x === ref.a && y === ref.b) || (x === ref.b && y === ref.a))
    );
  }

  const divMatch = equation.match(/^(\d+) ÷ (\d+) = (\d+)$/);
  if (divMatch) {
    const x = Number(divMatch[1]);
    const y = Number(divMatch[2]);
    const z = Number(divMatch[3]);
    return (
      y !== 0 &&
      y * z === x &&
      x === ref.product &&
      ((y === ref.a && z === ref.b) || (y === ref.b && z === ref.a))
    );
  }

  return false;
}

function allLessonIds(): string[] {
  const ids: string[] = [];
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        ids.push(
          lesson.lesson_id ?? `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`,
        );
      }
    }
  }
  return ids;
}

const lessonIds = allLessonIds();

const lessonIdToPracticeType = new Map<string, string>();
for (const unit of getAllCurricula()) {
  for (const week of unit.weeks) {
    for (const lesson of week.lessons) {
      const id =
        lesson.lesson_id ?? `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
      lessonIdToPracticeType.set(id, lesson.practice_type);
    }
  }
}

function isCorrectChoice(
  practiceType: string,
  problem: ResolvedTryItProblem,
  part: TryItAnswerPart,
  choice: string,
): boolean {
  if (practiceType === "fact_families") {
    const ref = parseFactFamilyReference(problem.prompt);
    if (!ref) return false;
    return isFactFamilyEquation(ref, choice);
  }

  if (
    practiceType === "parallel_sides_quadrilaterals" ||
    practiceType === "parallelograms_trapezoids" ||
    practiceType === "classify_squares_rectangles_rhombuses"
  ) {
    return matchesGeometryPrompt(choice, problem.prompt);
  }

  return choice === part.correctAnswer;
}

describe("Grade 3 Try It whole-grade invariants", () => {
  it("never falls back to the generic family for any regular Grade 3 lesson", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "no-generic" });
      if (!experience || experience.family === "generic") {
        failures.push(lessonId);
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("resolves at least one generated Try It problem for every regular Grade 3 lesson with an attemptKey", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "whole-grade" });
      if (!experience || experience.problems.length === 0) {
        failures.push(lessonId);
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("produces deterministic same-seed results for every regular Grade 3 lesson", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const first = getResolvedTryItExperience(lessonId, { attemptKey: "seed-a" });
      const second = getResolvedTryItExperience(lessonId, { attemptKey: "seed-a" });
      if (JSON.stringify(first) !== JSON.stringify(second)) {
        failures.push(lessonId);
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("produces meaningful cross-seed variation for every regular Grade 3 lesson", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const first = getResolvedTryItExperience(lessonId, { attemptKey: "seed-a" });
      const second = getResolvedTryItExperience(lessonId, { attemptKey: "seed-b" });

      const firstSignatures = new Set(first?.problems.map((p) => JSON.stringify(p)));
      const secondSignatures = new Set(second?.problems.map((p) => JSON.stringify(p)));

      if (firstSignatures.size === 0 || secondSignatures.size === 0) {
        failures.push(lessonId);
        continue;
      }

      const overlap = [...firstSignatures].filter((s) => secondSignatures.has(s));
      if (overlap.length === Math.min(firstSignatures.size, secondSignatures.size)) {
        failures.push(lessonId);
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("has no duplicate canonical problemKey within one attempt for any regular Grade 3 lesson", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "dedup" });
      const keys = experience?.problems.map((p) => p.problemKey ?? p.id);
      const uniqueKeys = new Set(keys);
      if (uniqueKeys.size !== keys?.length) {
        failures.push(lessonId);
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("has exactly one correct multiple-choice interpretation in each part where choices are present", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "mc-check" });
      if (!experience) {
        failures.push(lessonId);
        continue;
      }
      const practiceType = lessonIdToPracticeType.get(lessonId) ?? "";
      for (const problem of experience.problems) {
        for (const part of problem.parts) {
          if (part.choices && part.choices.length > 0) {
            const correctCount = part.choices.filter((c) =>
              isCorrectChoice(practiceType, problem, part, c),
            ).length;
            if (correctCount !== 1) {
              failures.push(`${lessonId}:${problem.id}:${part.key}`);
            }
          }
        }
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("keeps visual data synchronized with canonical answer parts for multiplication families", () => {
    const failures: string[] = [];
    for (const lessonId of lessonIds) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "sync" });
      if (!experience) {
        failures.push(lessonId);
        continue;
      }
      for (const problem of experience.problems) {
        if (!problem.visualData) continue;
        const groupsPart = problem.parts.find((p) => p.key === "groups");
        const inEachPart = problem.parts.find((p) => p.key === "inEach");

        if (groupsPart && Number(groupsPart.correctAnswer) !== problem.visualData.groups) {
          failures.push(`${lessonId}:${problem.id}:groups`);
        }
        if (inEachPart && Number(inEachPart.correctAnswer) !== problem.visualData.itemsPerGroup) {
          failures.push(`${lessonId}:${problem.id}:inEach`);
        }
      }
    }
    expect(failures).toEqual([]);
  }, 60000);

  it("rejects false exclusive attributes in geometry problemKeys", () => {
    const geometryTypes = new Set([
      "sides_and_vertices",
      "parallel_sides_quadrilaterals",
      "classify_squares_rectangles_rhombuses",
      "parallelograms_trapezoids",
    ]);
    const failures: string[] = [];

    for (const lessonId of lessonIds) {
      const practiceType = lessonIdToPracticeType.get(lessonId) ?? "";
      if (!geometryTypes.has(practiceType)) continue;

      const experience = getResolvedTryItExperience(lessonId, { attemptKey: "geo-key" });
      if (!experience) {
        failures.push(lessonId);
        continue;
      }

      for (const problem of experience.problems) {
        const key = problem.problemKey ?? "";
        const promptLower = problem.prompt.toLowerCase();
        if (
          key.includes("equalSides=false") &&
          !/not four equal sides|no equal sides/.test(promptLower)
        ) {
          failures.push(`${lessonId}:${problem.id}:equalSides=false`);
        }
        if (
          key.includes("rightAngles=false") &&
          !/not four right angles|no right angles/.test(promptLower)
        ) {
          failures.push(`${lessonId}:${problem.id}:rightAngles=false`);
        }
        if (
          key.includes("parallelPairs=1") &&
          !/exactly one pair|one pair of parallel sides/.test(promptLower)
        ) {
          failures.push(`${lessonId}:${problem.id}:parallelPairs=1`);
        }
      }
    }
    expect(failures).toEqual([]);
  }, 60000);
});
