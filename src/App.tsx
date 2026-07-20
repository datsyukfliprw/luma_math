import { Routes, Route } from "react-router-dom";
import { DelightAnimationProvider } from "./components/animations/DelightAnimationProvider";
import Sidebar from "./components/layout/Sidebar";
import StarNamePrompt from "./components/luma/StarNamePrompt";
import FlashcardsScreen from "./screens/FlashcardsScreen";
import HomeScreen from "./screens/HomeScreen";
import LearningPathScreen from "./screens/LearningPathScreen";
import LessonScreen from "./screens/LessonScreen";
import ParentAreaScreen from "./screens/ParentAreaScreen";
import PracticeScreen from "./screens/PracticeScreen";
import ProgressScreen from "./screens/ProgressScreen";
import SettingsScreen from "./screens/SettingsScreen";
import WarmUpScreen from "./screens/WarmUpScreen";
import LearnScreen from "./screens/LearnScreen";
import TryItScreen from "./screens/TryItScreen";
import FlashcardSessionScreen from "./screens/FlashcardSessionScreen";
import FlashcardCategoryScreen from "./screens/FlashcardCategoryScreen";
import { StudentProgressProvider, useStudentProgress } from "./contexts/StudentProgressContext";

const CURRENT_STUDENT_ID = "default-student";

// Inner component that uses the context
function AppContent() {
  const { studentState } = useStudentProgress();
  const starNameReady = studentState.starProfile.starName.trim().length > 0;

  return (
    <DelightAnimationProvider>
      <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-[#faf9f4] text-[#073B5A]">
        {!starNameReady && <StarNamePrompt onSaved={() => {}} />}

        {/* Constrained app shell: tablet-first, centered on large screens, phone-safe */}
        <div className="flex h-[100dvh] min-h-[100dvh] w-full max-w-[1366px] flex-col overflow-hidden bg-[#faf9f4] lg:max-h-[1024px] lg:flex-row lg:gap-7">
          <div className="hidden h-full lg:block lg:w-[245px] lg:shrink-0">
            <Sidebar />
          </div>

          <div className="h-full flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-0">
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
              <Route
                path="/flashcards/category/:categoryType/:categoryId"
                element={<FlashcardCategoryScreen />}
              />
              <Route path="/flashcards/deck/:deckId" element={<FlashcardSessionScreen />} />
              <Route path="/flashcards/:deckId" element={<FlashcardSessionScreen />} />
              <Route path="/practice/:lessonId" element={<PracticeScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/parent-area" element={<ParentAreaScreen />} />
              <Route path="/settings" element={<SettingsScreen />} />
            </Routes>
          </div>
        </div>
      </main>
    </DelightAnimationProvider>
  );
}

function App() {
  return (
    <StudentProgressProvider studentId={CURRENT_STUDENT_ID}>
      <AppContent />
    </StudentProgressProvider>
  );
}

export default App;
