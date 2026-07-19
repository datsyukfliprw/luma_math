import unitOne from "../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json";
import type { CurriculumLesson } from "./curriculumLoader";

export function getLessonById(lessonId?: string) {
  if (!lessonId) {
    return {
      unit: unitOne,
      week: unitOne.weeks[0],
      lesson: unitOne.weeks[0].lessons[0],
      weekDayNumber: 1,
    };
  }

  for (const week of unitOne.weeks) {
    for (let lessonIndex = 0; lessonIndex < week.lessons.length; lessonIndex += 1) {
      const lesson = week.lessons[lessonIndex];
      const weekDayNumber = lessonIndex + 1;

      // Use lesson_id from curriculum JSON if available, otherwise fall back to generated ID
      const curriculumLessonId = (lesson as CurriculumLesson).lesson_id;
      const generatedId = lesson.lesson_type === "evaluation"
        ? `g3-u${unitOne.unit_number}-w${week.week_number}-eval`
        : `g3-u${unitOne.unit_number}-w${week.week_number}-l${weekDayNumber}`;
      const id = curriculumLessonId || generatedId;

      if (id === lessonId) {
        return {
          unit: unitOne,
          week,
          lesson,
          weekDayNumber,
        };
      }
    }
  }

  return {
    unit: unitOne,
    week: unitOne.weeks[0],
    lesson: unitOne.weeks[0].lessons[0],
    weekDayNumber: 1,
  };
}
