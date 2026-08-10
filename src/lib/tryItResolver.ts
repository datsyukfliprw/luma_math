import { findCurriculumLessonById } from "./curriculumLoader";
import { getLessonById } from "./lessonLookup";
import { getLessonExperience } from "../data/lessonExperience";
import { generateTryItForLesson } from "./tryIt/generateTryItForLesson";
import type {
  ResolvedTryItOptions,
  ResolvedTryItProblem,
  ResolvedTryItExperience,
} from "./tryIt/types";

export type { ResolvedTryItOptions, ResolvedTryItProblem, ResolvedTryItExperience };

export function getResolvedTryItExperience(
  lessonId?: string,
  options?: ResolvedTryItOptions,
): ResolvedTryItExperience | undefined {
  if (!lessonId) return undefined;

  const found = findCurriculumLessonById(lessonId);
  if (!found) return undefined;

  const { lesson } = getLessonById(lessonId);
  const experience = getLessonExperience(lessonId);
  const practiceType = experience?.practiceType ?? lesson.practice_type;

  return generateTryItForLesson(lessonId, lesson, practiceType, experience?.tryIt, options);
}
