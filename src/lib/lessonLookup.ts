import { getCurriculum, isInstructionalLessonAvailable } from "../data/curriculum";
import type { Curriculum, Lesson, Week } from "../data/curriculum";

const DEFAULT_GRADE = 3;

function getFallbackUnit(): Curriculum {
  return getCurriculum(DEFAULT_GRADE, 1)!;
}

function unknownLesson(lessonId: string): never {
  throw new Error(`Unknown lesson: ${lessonId}`);
}

export function getLessonById(lessonId?: string) {
  const fallbackUnit = getFallbackUnit();
  const fallbackWeek = fallbackUnit.weeks[0];
  const fallbackLesson = fallbackWeek.lessons[0];

  // Bare /lesson, /learn, /practice, etc. intentionally open the first
  // instructional lesson. Explicit lesson IDs must resolve exactly and are
  // never allowed to silently fall back to Unit 1 Lesson 1.
  if (!lessonId) {
    return {
      unit: fallbackUnit,
      week: fallbackWeek,
      lesson: fallbackLesson,
      weekDayNumber: 1,
    };
  }

  const match = lessonId.match(/^g3-u(\d+)-w(\d+)-(?:l(\d+)|eval)$/);
  if (!match) return unknownLesson(lessonId);

  const unitNumber = Number.parseInt(match[1], 10);
  const weekNumber = Number.parseInt(match[2], 10);
  const isEvaluation = !match[3];
  const dayNumber = isEvaluation ? undefined : Number.parseInt(match[3], 10);

  const unit = getCurriculum(DEFAULT_GRADE, unitNumber);
  if (!unit) return unknownLesson(lessonId);

  const week = unit.weeks.find((candidate) => candidate.week_number === weekNumber);
  if (!week) return unknownLesson(lessonId);

  let lesson: Lesson | undefined;
  let weekDayNumber: number | undefined;

  if (isEvaluation) {
    lesson = week.lessons.find((candidate) => candidate.lesson_type === "evaluation");
    weekDayNumber = lesson?.day_number;
  } else if (dayNumber !== undefined) {
    const found = week.lessons.find(
      (candidate) => candidate.lesson_type === "lesson" && candidate.day_number === dayNumber,
    );
    if (found && isInstructionalLessonAvailable(found)) {
      lesson = found;
      weekDayNumber = dayNumber;
    }
  }

  if (!lesson || weekDayNumber === undefined) return unknownLesson(lessonId);

  return {
    unit,
    week: week as Week,
    lesson,
    weekDayNumber,
  };
}
