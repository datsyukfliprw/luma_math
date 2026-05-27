import { useState } from 'react'
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
import { hasNamedStar } from './lib/starProfile'

const CURRENT_STUDENT_ID = 'default-student'

function App() {
  const [starNameReady, setStarNameReady] = useState(() =>
    hasNamedStar(CURRENT_STUDENT_ID),
  )

  return (
    <DelightAnimationProvider>
      <main className="h-screen overflow-hidden bg-[#faf9f4] p-0 text-[#073B5A] xl:p-5">
        {!starNameReady && (
          <StarNamePrompt
            studentId={CURRENT_STUDENT_ID}
            onSaved={() => setStarNameReady(true)}
          />
        )}

        <div className="mx-auto flex h-full max-w-[1540px] gap-7 overflow-hidden">
          <Sidebar />

          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/learning-path" element={<LearningPathScreen />} />
            <Route path="/lesson" element={<LessonScreen />} />
            <Route path="/lesson/:lessonId" element={<LessonScreen />} />
            <Route path="/learn" element={<LearnScreen />} />
            <Route path="/learn/:lessonId" element={<LearnScreen />} />
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
      </main>
    </DelightAnimationProvider>
  )
}

export default App
