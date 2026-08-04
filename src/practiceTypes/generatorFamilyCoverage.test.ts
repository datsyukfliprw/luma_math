import { describe, it, expect } from "vitest";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { additionPracticeTypes } from "./familyConfigs";
import { generateProblemsForPracticeType, isRegisteredPracticeType } from "./registry";
import type { Lesson } from "../data/curriculum/curriculumSchema";

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

describe("Grade 3 generator family coverage", () => {
  it("covers all regular Grade 3 lessons without errors and tracks family/default split", () => {
    const lessons = getAllGrade3Lessons();
    expect(lessons.length).toBe(144);

    let familyBacked = 0;
    let defaultBacked = 0;
    const unsupported: string[] = [];
    const additionBacked: string[] = [];

    for (const lesson of lessons) {
      const practiceType = lesson.practice_type ?? "";
      try {
        const problems = generateProblemsForPracticeType(practiceType, {
          mode: "guided",
          lesson,
        });

        if (problems.length === 0) {
          unsupported.push(lesson.lesson_id ?? practiceType);
          continue;
        }

        const allAddition = problems.every((p) => p.problemKey.startsWith("addition:"));
        if (allAddition) {
          additionBacked.push(lesson.lesson_id ?? practiceType);
        }

        if (isRegisteredPracticeType(practiceType)) {
          familyBacked += 1;
        } else {
          defaultBacked += 1;
        }
      } catch {
        unsupported.push(lesson.lesson_id ?? practiceType);
      }
    }

    console.log(`Grade 3 regular lessons: ${lessons.length}`);
    console.log(`Family-backed: ${familyBacked}`);
    console.log(`Default-backed: ${defaultBacked}`);
    console.log(`Addition-backed lessons: ${additionBacked.length}`);

    expect(unsupported).toEqual([]);
    expect(additionBacked.length).toBe(additionPracticeTypes.length);
    expect(familyBacked).toBeGreaterThanOrEqual(13);
    expect(defaultBacked).toBeLessThanOrEqual(131);
  });
});
