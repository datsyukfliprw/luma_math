import { Routes, Route, useLocation } from "react-router-dom";
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
import FlashcardSessionScreen from "./screens/FlashcardSessionScreen";
import FlashcardCategoryScreen from "./screens/FlashcardCategoryScreen";
import { StudentProgressProvider, useStudentProgress } from "./contexts/StudentProgressContext";

const CURRENT_STUDENT_ID = "default-student";

function AppContent() {
  const { studentState } = useStudentProgress();
  const location = useLocation();
  const isHomeScreen = location.pathname === "/";
  const isLearningPath = location.pathname === "/learning-path";
  const starNameReady = studentState.starProfile.starName.trim().length > 0;

  return (
    <DelightAnimationProvider>
      <main
        data-name="lumamath-app-viewport"
        className="fixed inset-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#F0EEE7] text-[#073B5A]"
      >
        {!starNameReady && <StarNamePrompt onSaved={() => {}} />}

        {/* @SECTION Centered tablet-first application stage */}
        <div
          data-name="lumamath-tablet-stage"
          className="flex h-full min-h-0 w-full max-w-[1366px] flex-col overflow-hidden bg-[#FAF9F4] lg:max-h-[1024px] lg:flex-row lg:gap-8 lg:p-5 xl:gap-9 min-[1440px]:rounded-[2rem] min-[1440px]:shadow-[0_28px_80px_rgba(7,59,90,0.14)]"
        >
          <div className="hidden h-full min-h-0 shrink-0 lg:block">
            <Sidebar />
          </div>

          <div
            data-name="app-route-scroll-region"
            className={`min-h-0 min-w-0 flex-1 overflow-x-hidden ${
              isHomeScreen
                ? "overflow-y-hidden"
                : "app-scroll-region overflow-y-auto overscroll-contain"
            }`}
            style={isLearningPath ? { overscrollBehavior: "none" } : undefined}
          >
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
