import PageLayout from "../components/layout/PageLayout";
import UnitCard from "../components/learning-path/UnitCard";
import unitOne from "../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json";
import { getFlashcardDeckCardIds } from "../flashcards/deckRegistry";
import { getFlashcardDeckProgress } from "../lib/flashcardProgress";
import { getLessonProgress } from "../lib/lessonProgress";
import { getPracticeRewardState } from "../lib/practiceRewards";

const CURRENT_STUDENT_ID = "default-student";

function getFlashcardDeckIdForLesson(lessonId: string) {
  const deckMap: Record<string, string> = {
    "unit-1-week-1-day-1": "lesson-g3-u1-w1-d1-zero-identity",
    "unit-1-week-1-day-2": "lesson-g3-u1-w1-d2-repeated-addition",
    "unit-1-week-1-day-3": "lesson-g3-u1-w1-d3-factors-products",
    "unit-1-week-1-day-4": "lesson-g3-u1-w1-d4-object-groups",
    "unit-1-week-1-day-5": "lesson-g3-u1-w1-d5-week-review",
  };

  return deckMap[lessonId] ?? `lesson-${lessonId}`;
}

function getLessonCompletionPercent(lessonId: string, lessonType: string) {
  const progress = getLessonProgress(lessonId);
  const practiceRewards = getPracticeRewardState(CURRENT_STUDENT_ID, lessonId);
  const flashcardDeckId = getFlashcardDeckIdForLesson(lessonId);
  const flashcardCardIds = getFlashcardDeckCardIds(flashcardDeckId);
  const flashcardProgress = getFlashcardDeckProgress(
    CURRENT_STUDENT_ID,
    flashcardDeckId,
    flashcardCardIds,
  );

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
  const availableLessons = unitOne.weeks
    .filter((week) => week.week_number === 1)
    .flatMap((week) =>
      week.lessons.map((lesson, lessonIndex) => ({
        lessonId: `unit-${unitOne.unit_number}-week-${week.week_number}-day-${lessonIndex + 1}`,
        lessonType: lesson.lesson_type,
      })),
    );

  const currentLessonId =
    availableLessons.find(
      ({ lessonId, lessonType }) => getLessonCompletionPercent(lessonId, lessonType) < 100,
    )?.lessonId ?? null;

  const weeks = unitOne.weeks.map((week) => {
    const weekIsAvailable = week.week_number === 1;

    return {
      weekNumber: week.week_number,
      title: week.week_title,
      status: weekIsAvailable ? ("current" as const) : ("locked" as const),
      lessons: week.lessons.map((lesson, lessonIndex) => {
        const weekDayNumber = lessonIndex + 1;
        const lessonId = `unit-${unitOne.unit_number}-week-${week.week_number}-day-${weekDayNumber}`;
        const percentComplete = weekIsAvailable
          ? getLessonCompletionPercent(lessonId, lesson.lesson_type)
          : 0;

        let status: "complete" | "current" | "locked" = "locked";

        if (weekIsAvailable && percentComplete >= 100) {
          status = "complete";
        } else if (weekIsAvailable && lessonId === currentLessonId) {
          status = "current";
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
      <div className="mb-6 rounded-[2rem] bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">Your journey</p>

        <h1 className="mt-3 text-4xl font-black">Learning Path</h1>

        <p className="mt-3 max-w-3xl text-lg font-medium leading-relaxed text-[#073B5A]/70">
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
