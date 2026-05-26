import Sidebar from './components/layout/Sidebar'
import LessonScreen from './screens/LessonScreen'
import { Routes, Route } from 'react-router-dom'
import FlashcardsScreen from './screens/FlashcardsScreen'
import HomeScreen from './screens/HomeScreen'
import LearningPathScreen from './screens/LearningPathScreen'
import ParentAreaScreen from './screens/ParentAreaScreen'
import PracticeScreen from './screens/PracticeScreen'
import ProgressScreen from './screens/ProgressScreen'

function App() {
  return (
    <main className="min-h-screen bg-[#faf9f4] p-0 text-[#073B5A] xl:p-5">
      <div className="mx-auto flex min-h-screen max-w-[1540px] gap-7">
        <Sidebar />

        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/learning-path" element={<LearningPathScreen />} />
          <Route path="/lesson" element={<LessonScreen />} />
          <Route path="/lesson/:lessonId" element={<LessonScreen />} />
          <Route path="/flashcards" element={<FlashcardsScreen />} />
          <Route path="/practice" element={<PracticeScreen />} />
          <Route path="/practice/:lessonId" element={<PracticeScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/parent-area" element={<ParentAreaScreen />} />
        </Routes>
      </div>
    </main>
  )
}

export default App
