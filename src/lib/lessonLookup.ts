import unitOne from '../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json'

export function getLessonById(lessonId?: string) {
  if (!lessonId) {
    return {
      unit: unitOne,
      week: unitOne.weeks[0],
      lesson: unitOne.weeks[0].lessons[0],
    }
  }

  for (const week of unitOne.weeks) {
    for (const lesson of week.lessons) {
      const id = `unit-${unitOne.unit_number}-week-${week.week_number}-day-${lesson.day_number}`

      if (id === lessonId) {
        return {
          unit: unitOne,
          week,
          lesson,
        }
      }
    }
  }

  return {
    unit: unitOne,
    week: unitOne.weeks[0],
    lesson: unitOne.weeks[0].lessons[0],
  }
}
