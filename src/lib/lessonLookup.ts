import unitOne from '../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json'

export function getLessonById(lessonId?: string) {
  if (!lessonId) {
    return {
      unit: unitOne,
      week: unitOne.weeks[0],
      lesson: unitOne.weeks[0].lessons[0],
      weekDayNumber: 1,
    }
  }

  for (const week of unitOne.weeks) {
    for (let lessonIndex = 0; lessonIndex < week.lessons.length; lessonIndex += 1) {
      const lesson = week.lessons[lessonIndex]
      const weekDayNumber = lessonIndex + 1

      const id = `unit-${unitOne.unit_number}-week-${week.week_number}-day-${weekDayNumber}`

      if (id === lessonId) {
        return {
          unit: unitOne,
          week,
          lesson,
          weekDayNumber,
        }
      }
    }
  }

  return {
    unit: unitOne,
    week: unitOne.weeks[0],
    lesson: unitOne.weeks[0].lessons[0],
    weekDayNumber: 1,
  }
}
