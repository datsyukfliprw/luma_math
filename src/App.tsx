import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DelightAnimationProvider } from './components/animations/DelightAnimationProvider'
import Sidebar from './components/layout/Sidebar'
import StarNamePrompt from './components/luma/StarNamePrompt'
import FlashcardsScreen from './screens/FlashcardsScreen'
import HomeScreen from './screens/HomeScreen'
import LearningPathScreen from './screens/LearningPathScreen'
import LessonScreen from './screens/LessonScreen'
import ParentAreaScreen from './screens/ParentAreaScreen'
import PracticeScreen from './screens/PracticeScreen'
import ProgressScreen from './screens/ProgressScreen'
import SettingsScreen from './screens/SettingsScreen'
import WarmUpScreen from './screens/WarmUpScreen'
import LearnScreen from './screens/LearnScreen'
import TryItScreen from './screens/TryItScreen'
import { hasNamedStar } from './lib/starProfile'

const CURRENT_STUDENT_ID = 'default-student'

const APP_STAGE_WIDTH = 1540
const APP_STAGE_HEIGHT = 900
const APP_STAGE_MIN_SCALE = 0.88
const APP_STAGE_MAX_SCALE = 1.14

function getAppStageScale() {
  if (typeof window === 'undefined') {
    return 1
  }

  if (window.innerWidth < 1024) {
    return 1
  }

  const availableWidth = window.innerWidth - 72
  const availableHeight = window.innerHeight - 72

  const widthScale = availableWidth / APP_STAGE_WIDTH
  const heightScale = availableHeight / APP_STAGE_HEIGHT
  const nextScale = Math.min(widthScale, heightScale)

  return Math.min(
    APP_STAGE_MAX_SCALE,
    Math.max(APP_STAGE_MIN_SCALE, nextScale),
  )
}

function App() {
  const [starNameReady, setStarNameReady] = useState(() =>
    hasNamedStar(CURRENT_STUDENT_ID),
  )
  const [appStageScale, setAppStageScale] = useState(getAppStageScale)

  useEffect(() => {
    const updateAppStageScale = () => {
      setAppStageScale(getAppStageScale())
    }

    updateAppStageScale()
    window.addEventListener('resize', updateAppStageScale)

    return () => {
      window.removeEventListener('resize', updateAppStageScale)
    }
  }, [])

  return (
    <DelightAnimationProvider>
      <main className="flex h-screen items-start justify-center overflow-hidden bg-[#faf9f4] p-0 text-[#073B5A] lg:items-center lg:p-6">
        {!starNameReady && (
          <StarNamePrompt
            studentId={CURRENT_STUDENT_ID}
            onSaved={() => setStarNameReady(true)}
          />
        )}

        <div
          className="h-full w-full lg:h-auto lg:w-auto"
          style={{
            width:
              appStageScale === 1 && typeof window !== 'undefined' && window.innerWidth < 1024
                ? undefined
                : `${APP_STAGE_WIDTH * appStageScale}px`,
            height:
              appStageScale === 1 && typeof window !== 'undefined' && window.innerWidth < 1024
                ? undefined
                : `${APP_STAGE_HEIGHT * appStageScale}px`,
          }}
        >
          <div
            className="mx-auto h-full w-full overflow-visible lg:h-[900px] lg:w-[1540px] lg:origin-top lg:scale-[var(--app-stage-scale)]"
            style={
              {
                '--app-stage-scale': appStageScale,
              } as React.CSSProperties
            }
          >
            <div className="flex h-full w-full gap-7 overflow-visible p-1">
              <Sidebar />

              <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/learning-path" element={<LearningPathScreen />} />
            <Route path="/lesson" element={<LessonScreen />} />
            <Route path="/lesson/:lessonId" element={<LessonScreen />} />
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/learn/:lessonId" element={<LearnScreen />} />
            <Route path="/try-it" element={<TryItScreen />} />
            <Route path="/try-it/:lessonId" element={<TryItScreen />} />
            <Route path="/warmup" element={<WarmUpScreen />} />
            <Route path="/warmup/:lessonId" element={<WarmUpScreen />} />
            <Route path="/flashcards" element={<FlashcardsScreen />} />
            <Route path="/practice" element={<PracticeScreen />} />
            <Route path="/practice/:lessonId" element={<PracticeScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/parent-area" element={<ParentAreaScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
              </Routes>
            </div>
          </div>
        </div>
      </main>
    </DelightAnimationProvider>
  )
}

export default App
