import { describe, it, expect } from "vitest";
import { CurriculumSchema } from "./curriculumSchema";

const modules = import.meta.glob<{ default: unknown }>("./grade_3/*.json", {
  eager: true,
});

describe("curriculum completeness", () => {
  it("all instructional lessons have warmup, learn, try_it, and practice_block", () => {
    const incomplete: {
      unit: number;
      week: number;
      day: number;
      lessonId: string | undefined;
      title: string;
      missing: string;
    }[] = [];

    const validationErrors: { unit: number; file: string; issues: string }[] = [];

    for (const [path, mod] of Object.entries(modules)) {
      const data = ((mod as { default?: unknown }).default ?? mod) as Record<string, unknown>;
      const unitNumber = (data.unit_number as number | undefined) ?? -1;
      const parsed = CurriculumSchema.safeParse(data);

      if (!parsed.success) {
        const issues = parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; ");
        validationErrors.push({ unit: unitNumber, file: path, issues });
        continue;
      }

      const curriculum = parsed.data;
      for (const week of curriculum.weeks) {
        for (const lesson of week.lessons) {
          if (lesson.lesson_type !== "lesson") continue;

          const missing: string[] = [];
          if (!lesson.warmup) missing.push("warmup");
          if (!lesson.learn) missing.push("learn");
          if (!lesson.try_it) missing.push("try_it");
          if (!lesson.practice_block) missing.push("practice_block");

          if (missing.length > 0) {
            incomplete.push({
              unit: curriculum.unit_number,
              week: week.week_number,
              day: lesson.day_number,
              lessonId: lesson.lesson_id,
              title: lesson.lesson_title,
              missing: missing.join(", "),
            });
          }
        }
      }
    }

    if (incomplete.length > 0) {
      console.table(incomplete);
    }

    if (validationErrors.length > 0) {
      console.table(validationErrors);
    }

    expect(validationErrors).toHaveLength(0);
    expect(incomplete).toHaveLength(0);
  });
});
