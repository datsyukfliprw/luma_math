import TopBar from '../components/layout/TopBar'
import GoalCard from '../components/lesson/GoalCard'
import LearnCard from '../components/lesson/LearnCard'
import LessonFooter from '../components/lesson/LessonFooter'
import LessonHero from '../components/lesson/LessonHero'
import PracticeTimeCard from '../components/lesson/PracticeTimeCard'
import TryItCard from '../components/lesson/TryItCard'
import WarmUpCard from '../components/lesson/WarmUpCard'
import PageLayout from '../components/layout/PageLayout'

function LessonScreen() {
  return (
    <PageLayout>
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
    </PageLayout>
  )
}

export default LessonScreen
