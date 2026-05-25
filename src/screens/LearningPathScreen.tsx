import PageLayout from '../components/layout/PageLayout'
import UnitCard from '../components/learning-path/UnitCard'

function LearningPathScreen() {
  const unitOneWeeks = [
    {
      weekNumber: 1,
      title: 'Equal Groups & Repeated Addition',
      status: 'current' as const,
      lessons: [
        { day: 'Day 1', title: 'Equal Groups', status: 'complete' as const },
        { day: 'Day 2', title: 'Repeated Addition', status: 'complete' as const },
        { day: 'Day 3', title: 'Multiplication Sentences', status: 'current' as const },
        { day: 'Day 4', title: 'Factors & Products', status: 'locked' as const },
        { day: 'Day 5', title: 'Weekly Review Quiz', status: 'locked' as const },
      ],
    },
  ]

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
          unitNumber={1}
          title="Multiplication & Division Foundations"
          description="Learn equal groups, repeated addition, multiplication sentences, factors, products, and weekly review skills."
          progress={40}
          weeks={unitOneWeeks}
        />
      </div>
    </PageLayout>
  )
}

export default LearningPathScreen
