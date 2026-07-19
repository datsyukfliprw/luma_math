import PageLayout from "../components/layout/PageLayout";
import UnitCard from "../components/learning-path/UnitCard";
import unitOne from "../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json";
import { getFlashcardDeckCardIds } from "../flashcards/deckRegistry";
import { getFlashcardDeckIdFromCurriculum } from "../lib/curriculumLoader";
import {
  useStudentProgress,
  type LessonProgress,
  type LessonPracticeRewardState,
  type FlashcardDeckProgress,
} from "../contexts/StudentProgressContext";

function getFlashcardDeckIdForLesson(lessonId: string) {
  const match = lessonId.match(/g\d+-u\d+-w(\d+)-l(\d+)/);
  if (match) {
    const weekNumber = Number.parseInt(match[1], 10);
    const dayNumber = Number.parseInt(match[2], 10);
    const deckId = getFlashcardDeckIdFromCurriculum(weekNumber, dayNumber);
    if (deckId) return deckId;
  }
  return `lesson-${lessonId}`;
}

function getLessonCompletionPercent(
  lessonId: string,
  lessonType: string,
  getLessonProgress: (id: string) => LessonProgress,
  getPracticeRewardState: (id: string) => LessonPracticeRewardState,
  getFlashcardDeckProgress: (deckId: string, cardIds: string[]) => FlashcardDeckProgress,
) {
  const progress = getLessonProgress(lessonId);
  const practiceRewards = getPracticeRewardState(lessonId);
  const flashcardDeckId = getFlashcardDeckIdForLesson(lessonId);
  const flashcardCardIds = getFlashcardDeckCardIds(flashcardDeckId);
  const flashcardProgress = getFlashcardDeckProgress(flashcardDeckId, flashcardCardIds);

  if (lessonType === "evaluation") {
    const items = [
      progress.learnComplete,
      progress.practiceComplete || progress.lessonComplete,
      flashcardProgress.completed,
    ];

    return Math.round((items.filter(Boolean).length / items.length) * 100);
  }

  const items = [
    progress.learnComplete,
    practiceRewards.guided?.completed === true,
    practiceRewards.independent?.completed === true,
    practiceRewards.challenge?.completed === true,
    flashcardProgress.completed,
  ];

  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

function LearningPathScreen() {
  const { getLessonProgress, getPracticeRewardState, getFlashcardDeckProgress } = useStudentProgress();

  const weeks = unitOne.weeks.map((week) => {
    const weekIsAvailable = week.week_number === 1;
    let hasFoundCurrentLesson = false;

    return {
      weekNumber: week.week_number,
      title: week.week_title,
      status: weekIsAvailable ? ("current" as const) : ("locked" as const),
      lessons: week.lessons.map((lesson, lessonIndex) => {
        const weekDayNumber = lessonIndex + 1;
        const lessonId = `g3-u${unitOne.unit_number}-w${week.week_number}-l${weekDayNumber}`;
        const percentComplete = weekIsAvailable
          ? getLessonCompletionPercent(
              lessonId,
              lesson.lesson_type,
              getLessonProgress,
              getPracticeRewardState,
              getFlashcardDeckProgress,
            )
          : 0;

        let status: "complete" | "current" | "locked" = "locked";

        if (weekIsAvailable && percentComplete >= 100) {
          status = "complete";
        } else if (weekIsAvailable && !hasFoundCurrentLesson) {
          status = "current";
          hasFoundCurrentLesson = true;
        }

        const progressLabel =
          weekIsAvailable && percentComplete > 0 && percentComplete < 100
            ? ` • ${percentComplete}%`
            : "";

        return {
          id: lessonId,
          day: `Day ${weekDayNumber}`,
          title: `${lesson.lesson_title}${progressLabel}`,
          status,
        };
      }),
    };
  });

  return (
    <PageLayout>
      <div className="mb-6 rounded-[2rem] bg-white p-6 lg:p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">Your journey</p>

        <h1 className="mt-3 text-3xl font-black lg:text-4xl">Learning Path</h1>

        <p className="mt-3 max-w-3xl text-base lg:text-lg font-medium leading-relaxed text-[#073B5A]/70">
          Follow each unit one week at a time. Complete daily lessons, practice new skills, and
          finish each week with a review quiz.
        </p>
      </div>

      <div className="space-y-5">
        <UnitCard
          unitNumber={unitOne.unit_number}
          title={unitOne.unit_title}
          description={unitOne.unit_description}
          progress={Math.round(
            (weeks[0].lessons.filter((lesson) => lesson.status === "complete").length /
              weeks[0].lessons.length) *
              100,
          )}
          weeks={weeks}
        />
      </div>
    </PageLayout>
  );
}

export default LearningPathScreen;
