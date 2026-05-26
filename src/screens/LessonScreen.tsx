import { useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import TopBar from '../components/layout/TopBar'
import GoalCard from '../components/lesson/GoalCard'
import LearnCard from '../components/lesson/LearnCard'
import LessonFooter from '../components/lesson/LessonFooter'
import LessonHero from '../components/lesson/LessonHero'
import PracticeTimeCard from '../components/lesson/PracticeTimeCard'
import TryItCard from '../components/lesson/TryItCard'
import WarmUpCard from '../components/lesson/WarmUpCard'
import { getLessonById } from '../lib/lessonLookup'

function LessonScreen() {
  const { lessonId } = useParams()
  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId)

  const currentLessonId =
    lessonId ??
    `unit-${unit.unit_number}-week-${week.week_number}-day-${weekDayNumber}`

  return (
    <PageLayout>
      <TopBar />

      <LessonHero
        unitNumber={unit.unit_number}
        weekNumber={week.week_number}
        dayNumber={weekDayNumber}
        title={lesson.lesson_title}
        topic={unit.unit_title}
        description={lesson.objective}
        minutes={lesson.lesson_type === 'evaluation' ? 35 : 25}
        grade={`${unit.grade_level}rd Grade`}
      />

      <section className="mb-5 grid items-stretch gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <GoalCard
          objective={lesson.objective}
          lessonType={lesson.lesson_type}
          quizQuestionCount={lesson.quiz_question_count}
        />

        <WarmUpCard factDrill={lesson.fact_drill} />
      </section>

      <section className="grid items-stretch gap-5 lg:grid-cols-3">
        <LearnCard concept={lesson.concept} />

        <TryItCard
          practice={lesson.practice}
          practiceType={lesson.practice_type}
        />

        <PracticeTimeCard
          lessonId={currentLessonId}
          activities={[
            {
              icon: '🧮',
              title: 'Guided Practice',
              subtitle: lesson.practice,
            },
            {
              icon: '✏️',
              title: 'Independent Practice',
              subtitle: 'Solve on your own',
            },
            {
              icon: '🏆',
              title: 'Challenge Yourself',
              subtitle: 'Take it up a notch!',
            },
          ]}
        />
      </section>

      <LessonFooter />
    </PageLayout>
  )
}

export default LessonScreen
