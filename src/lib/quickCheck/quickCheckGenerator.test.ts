import { describe, it, expect } from "vitest";
import { getAllCurricula } from "../../data/curriculum/curriculumRegistry";
import type { Lesson } from "../../data/curriculum/curriculumSchema";
import { getLessonById } from "../lessonLookup";
import {
  generateQuickCheckForLesson,
  type QuickCheckGeneratorOptions,
} from "./quickCheckGenerator";
import { QuickCheckSchema } from "./schema";

function getAllRegularGrade3Lessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const curriculum of getAllCurricula()) {
    if (curriculum.grade_level !== 3) continue;
    for (const week of curriculum.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson") {
          lessons.push(lesson);
        }
      }
    }
  }
  return lessons;
}

describe("Quick Check contract", () => {
  it("validates the canonical shape for a generated Quick Check", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const quickCheck = generateQuickCheckForLesson(lesson);
    expect(quickCheck).toBeDefined();
    const parsed = QuickCheckSchema.safeParse(quickCheck);
    expect(parsed.success).toBe(true);
  });

  it("has exactly one direct, one conceptual, and one reasoning question", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const quickCheck = generateQuickCheckForLesson(lesson)!;

    const roles = quickCheck.questions.map((q) => q.role);
    expect(roles).toHaveLength(3);
    expect(roles.filter((r) => r === "direct")).toHaveLength(1);
    expect(roles.filter((r) => r === "conceptual")).toHaveLength(1);
    expect(roles.filter((r) => r === "reasoning")).toHaveLength(1);
  });
});

describe("Quick Check Grade 3 coverage", () => {
  it("generates a valid 3-question Quick Check for every regular Grade 3 lesson", () => {
    const lessons = getAllRegularGrade3Lessons();
    expect(lessons.length).toBe(144);

    const roleCounts = { direct: 0, conceptual: 0, reasoning: 0 };
    const ids = new Set<string>();

    for (const lesson of lessons) {
      const quickCheck = generateQuickCheckForLesson(lesson);
      expect(quickCheck).toBeDefined();

      const parsed = QuickCheckSchema.safeParse(quickCheck);
      expect(parsed.success).toBe(true);

      expect(quickCheck!.questions).toHaveLength(3);

      for (const question of quickCheck!.questions) {
        expect(question.id).toBeTruthy();
        expect(ids.has(question.id)).toBe(false);
        ids.add(question.id);

        roleCounts[question.role] += 1;

        const interaction = question.interaction;
        if (interaction.type === "multiple_choice") {
          const choiceValues = interaction.choices.map((c) => c.value);
          expect(choiceValues).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "true_false") {
          expect(["true", "false"]).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "mistake_detection") {
          expect(["yes", "no"]).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "text_entry") {
          expect(interaction.correctAnswer).toBeTruthy();
          expect(["numeric", "text"]).toContain(interaction.answerType);
        }

        // No mascot / boost / charge language.
        const allText = [
          question.prompt,
          question.stem,
          question.feedback.hint,
          question.feedback.success,
          question.feedback.explanation,
          question.topicTag,
          question.skill,
        ]
          .filter(Boolean)
          .join(" ");
        expect(allText).not.toMatch(/\b(luma|spark|charge|boost|energy)\b/i);
      }
    }

    expect(roleCounts.direct).toBe(144);
    expect(roleCounts.conceptual).toBe(144);
    expect(roleCounts.reasoning).toBe(144);
  });
});

describe("Quick Check determinism", () => {
  it("produces identical output for the same lesson and seed", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const options: QuickCheckGeneratorOptions = { seed: "test-seed" };
    const first = generateQuickCheckForLesson(lesson, options);
    const second = generateQuickCheckForLesson(lesson, options);
    expect(first).toEqual(second);
  });

  it("produces stable output when no seed is supplied", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const first = generateQuickCheckForLesson(lesson);
    const second = generateQuickCheckForLesson(lesson);
    expect(first).toEqual(second);
  });

  it("produces different output for a different seed where variation is supported", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const first = generateQuickCheckForLesson(lesson, { seed: "a" });
    const second = generateQuickCheckForLesson(lesson, { seed: "b" });
    expect(first).not.toEqual(second);
  });
});
