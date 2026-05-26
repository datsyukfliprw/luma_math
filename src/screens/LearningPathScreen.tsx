import PageLayout from '../components/layout/PageLayout'
import UnitCard from '../components/learning-path/UnitCard'
import unitOne from '../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json'

function LearningPathScreen() {
  const weeks = unitOne.weeks.map((week) => ({
    weekNumber: week.week_number,
    title: week.week_title,
    status:
      week.week_number === 1
        ? ('current' as const)
        : ('locked' as const),
    lessons: week.lessons.map((lesson) => {
      const lessonId = `unit-${unitOne.unit_number}-week-${week.week_number}-day-${lesson.day_number}`

      let status: 'complete' | 'current' | 'locked' = 'locked'

      if (lesson.day_number === 1 || lesson.day_number === 2) {
        status = 'complete'
      }

      if (lesson.day_number === 3) {
        status = 'current'
      }

      return {
        id: lessonId,
        day: `Day ${lesson.day_number}`,
        title: lesson.lesson_title,
        status,
      }
    }),
  }))

  return (
    <PageLayout>
      <div className="mb-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
          Your journey
        </p>

        <h1 className="mt-3 text-4xl font-black">Learning Path</h1>

        <p className="mt-3 max-w-3xl text-lg font-medium leading-relaxed text-[#073B5A]/70">
          Follow each unit one week at a time. Complete daily lessons, practice
          new skills, and finish each week with a review quiz.
        </p>
      </div>

      <div className="space-y-5">
        <UnitCard
          unitNumber={unitOne.unit_number}
          title={unitOne.unit_title}
          description={unitOne.unit_description}
          progress={8}
          weeks={weeks}
        />
      </div>
    </PageLayout>
  )
}

export default LearningPathScreen
