import TopBar from '../components/layout/TopBar'
import GoalCard from '../components/lesson/GoalCard'
import LearnCard from '../components/lesson/LearnCard'
import LessonFooter from '../components/lesson/LessonFooter'
import LessonHero from '../components/lesson/LessonHero'
import PracticeTimeCard from '../components/lesson/PracticeTimeCard'
import TryItCard from '../components/lesson/TryItCard'
import WarmUpCard from '../components/lesson/WarmUpCard'

function LessonScreen() {
  return (
    <section className="flex-1 px-4 py-5 lg:px-0">
      <TopBar />
      <LessonHero />

      <section className="mb-5 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <GoalCard />
        <WarmUpCard />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <LearnCard />
        <TryItCard />
        <PracticeTimeCard />
      </section>

      <LessonFooter />
    </section>
  )
}

export default LessonScreen
