import { getCurriculum } from "../data/curriculum";
import type { Curriculum, Lesson, Week } from "../data/curriculum";

const DEFAULT_GRADE = 3;

function getFallbackUnit(): Curriculum {
  return getCurriculum(DEFAULT_GRADE, 1)!;
}

export function getLessonById(lessonId?: string) {
  const fallbackUnit = getFallbackUnit();
  const fallbackWeek = fallbackUnit.weeks[0];
  const fallbackLesson = fallbackWeek.lessons[0];

  if (!lessonId) {
    return {
      unit: fallbackUnit,
      week: fallbackWeek,
      lesson: fallbackLesson,
      weekDayNumber: 1,
    };
  }

  // Match formats: g3-u{unit}-w{week}-l{lesson} or g3-u{unit}-w{week}-eval
  const match = lessonId.match(/^g3-u(\d+)-w(\d+)-(?:l(\d+)|eval)$/);
  if (!match) {
    return {
      unit: fallbackUnit,
      week: fallbackWeek,
      lesson: fallbackLesson,
      weekDayNumber: 1,
    };
  }

  const unitNumber = Number.parseInt(match[1], 10);
  const weekNumber = Number.parseInt(match[2], 10);
  const isEvaluation = !match[3];
  const dayNumber = isEvaluation ? undefined : Number.parseInt(match[3], 10);

  const unit = getCurriculum(DEFAULT_GRADE, unitNumber) ?? fallbackUnit;
  const week = unit.weeks.find((w) => w.week_number === weekNumber) ?? fallbackWeek;

  let lesson: Lesson = fallbackLesson;
  let weekDayNumber = fallbackLesson.day_number;

  if (isEvaluation) {
    const found = week.lessons.find((l) => l.lesson_type === "evaluation");
    if (found) {
      lesson = found;
      weekDayNumber = found.day_number;
    }
  } else if (dayNumber !== undefined) {
    const found = week.lessons.find((l) => l.day_number === dayNumber);
    if (found) {
      lesson = found;
      weekDayNumber = dayNumber;
    }
  }

  return {
    unit,
    week: week as Week,
    lesson,
    weekDayNumber,
  };
}
