import { describe, expect, it } from "vitest";
import { getAllCurricula } from "./data/curriculum";
import { getLessonExperience } from "./data/lessonExperience";
import { getResolvedTryItExperience } from "./lib/tryItResolver";
import { getLessonById } from "./lib/lessonLookup";

function canonicalLessonId(
  unitNumber: number,
  lesson: { lesson_id?: string; lesson_type: string; day_number: number },
) {
  if (lesson.lesson_id) return lesson.lesson_id;
  return lesson.lesson_type === "evaluation"
    ? `g3-u${unitNumber}-w1-eval`
    : `g3-u${unitNumber}-w1-l${lesson.day_number}`;
}

describe("Grade 3 release readiness", () => {
  const curricula = getAllCurricula().filter((curriculum) => curriculum.grade_level === 3);
  const lessons = curricula.flatMap((curriculum) =>
    curriculum.weeks.flatMap((week) =>
      week.lessons.map((lesson) => ({ curriculum, week, lesson })),
    ),
  );
  const regularLessons = lessons.filter(({ lesson }) => lesson.lesson_type === "lesson");
  const evaluations = lessons.filter(({ lesson }) => lesson.lesson_type === "evaluation");

  it("contains the complete Grade 3 course spine", () => {
    expect(curricula).toHaveLength(36);
    expect(regularLessons).toHaveLength(144);
    expect(evaluations).toHaveLength(36);

    const ids = lessons.map(({ curriculum, lesson }) =>
      canonicalLessonId(curriculum.unit_number, lesson),
    );
    expect(new Set(ids).size).toBe(180);
  });

  it(
    "every regular lesson resolves the required student learning experiences",
    { timeout: 60000 },
    () => {
      for (const { curriculum, lesson } of regularLessons) {
        const lessonId = canonicalLessonId(curriculum.unit_number, lesson);

        expect(() => getLessonById(lessonId), lessonId).not.toThrow();
        expect(lesson.warmup, `${lessonId} warmup`).toBeDefined();
        expect(lesson.learn, `${lessonId} learn`).toBeDefined();
        expect(lesson.try_it, `${lessonId} try it`).toBeDefined();
        expect(lesson.practice_block, `${lessonId} practice block`).toBeDefined();

        const experience = getLessonExperience(lessonId);
        expect(experience, `${lessonId} lesson experience`).toBeDefined();
        expect(experience?.canonicalQuickCheck?.questions, `${lessonId} quick check`).toHaveLength(
          3,
        );

        const roles =
          experience?.canonicalQuickCheck?.questions.map((question) => question.role) ?? [];
        expect(new Set(roles), `${lessonId} quick check roles`).toEqual(
          new Set(["direct", "conceptual", "reasoning"]),
        );

        const tryIt = getResolvedTryItExperience(lessonId);
        expect(tryIt?.problems.length ?? 0, `${lessonId} resolved Try It`).toBeGreaterThan(0);
      }
    },
  );

  it("every evaluation resolves and has review content configured", () => {
    for (const { curriculum, lesson } of evaluations) {
      const lessonId = canonicalLessonId(curriculum.unit_number, lesson);
      const resolved = getLessonById(lessonId);

      expect(resolved.lesson.lesson_type, lessonId).toBe("evaluation");
      expect(lesson.review_types?.length ?? 0, `${lessonId} review types`).toBeGreaterThan(0);
      expect(
        lesson.practice_block?.question_count ?? 0,
        `${lessonId} question count`,
      ).toBeGreaterThan(0);
    }
  });
});
