import type { Lesson } from "../../data/curriculum/curriculumSchema";
import type { TryItSpec } from "../../data/lessonExperience/types";
import { createSeededRng, derivePracticeSeed } from "../../practiceTypes/random";
import type { ResolvedTryItExperience, ResolvedTryItOptions, TryItFamilyContext } from "./types";
import { getFamilyForPracticeType, getTryItFamily, tryItFamilyRegistry } from "./families";

function buildTryItAttemptSeed(lessonId: string, attemptKey: string | number): string {
  return derivePracticeSeed(String(attemptKey), "tryit", lessonId);
}

function resolveTryItPracticeType(
  tryIt: TryItSpec | undefined,
  lesson: Lesson,
  practiceType: string,
  rng: { pick<T>(items: readonly T[]): T },
): string {
  const base = tryIt?.generator?.practiceType ?? practiceType ?? lesson.practice_type;
  // If the author already chose a specialized family, trust the authored practiceType.
  if (tryIt?.generator?.family) return base;
  if (base !== "evaluation" && base !== "mixed_evaluation") return base;
  const reviews = lesson.review_types;
  if (reviews && reviews.length > 0) {
    return rng.pick(reviews);
  }
  return base;
}

export function generateTryItForLesson(
  lessonId: string,
  lesson: Lesson,
  practiceType: string,
  tryIt: TryItSpec | undefined,
  options?: ResolvedTryItOptions,
): ResolvedTryItExperience {
  const attemptKey = options?.attemptKey ?? 0;
  const seed = buildTryItAttemptSeed(lessonId, attemptKey);
  const routingRng = createSeededRng(seed);

  const effectivePracticeType = resolveTryItPracticeType(tryIt, lesson, practiceType, routingRng);
  const family = tryIt?.generator?.family ?? getFamilyForPracticeType(effectivePracticeType);
  const familyGenerator = getTryItFamily(family) ?? tryItFamilyRegistry.generic;
  const count = tryIt?.requiredCount ?? 3;
  const templates = tryIt?.generator?.templates;

  const ctx: TryItFamilyContext = {
    lessonId,
    lesson,
    family,
    practiceType: effectivePracticeType,
    attemptKey,
    rng: createSeededRng(seed),
    usedKeys: new Set(),
    count,
    templates,
  };

  const problems = familyGenerator(ctx);

  return {
    title: tryIt?.title ?? "Try It",
    subtitle: tryIt?.subtitle ?? "Try one problem before practice.",
    requiredCount: count,
    family,
    problems,
  };
}
