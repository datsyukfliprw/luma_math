import { useEffect, useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import UnitCard from "../components/learning-path/UnitCard";
import { isInstructionalLessonAvailable, type Curriculum } from "../data/curriculum";
import { getAllCurricula, getFlashcardDeckIdFromCurriculum } from "../lib/curriculumLoader";
import { getConceptByLessonId } from "../data/curriculum/curriculumGraph";
import { getConceptUnlockState } from "../services/prerequisites/prerequisiteGraph";
import { getFlashcardDeckCardIds } from "../flashcards/deckRegistry";
import {
  useStudentProgress,
  type LessonProgress,
  type FlashcardDeckProgress,
} from "../contexts/StudentProgressContext";
import type { LessonPracticeRewardState } from "../types/practiceProgress";
import type { SkillProgress } from "../types/mastery";

function getFlashcardDeckIdForLesson(lessonId: string) {
  const match = lessonId.match(/^g3-u(\d+)-w(\d+)-l(\d+)$/);
  if (match) {
    const unitNumber = Number.parseInt(match[1], 10);
    const weekNumber = Number.parseInt(match[2], 10);
    const dayNumber = Number.parseInt(match[3], 10);
    const deckId = getFlashcardDeckIdFromCurriculum(unitNumber, weekNumber, dayNumber);
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

function getUnitCardData(
  unit: Curriculum,
  getLessonProgress: (id: string) => LessonProgress,
  getPracticeRewardState: (id: string) => LessonPracticeRewardState,
  getFlashcardDeckProgress: (deckId: string, cardIds: string[]) => FlashcardDeckProgress,
  getSkillProgress: (skillId: string) => SkillProgress,
) {
  let totalLessons = 0;
  let completeLessons = 0;

  const weeks = unit.weeks.map((week) => {
    let hasFoundCurrentLesson = false;

    const availableLessons = week.lessons.filter(isInstructionalLessonAvailable);

    const lessons = availableLessons.map((lesson) => {
      const weekDayNumber = lesson.day_number;
      const lessonId =
        lesson.lesson_type === "evaluation"
          ? `g3-u${unit.unit_number}-w${week.week_number}-eval`
          : `g3-u${unit.unit_number}-w${week.week_number}-l${weekDayNumber}`;

      const concept = getConceptByLessonId(lessonId);
      const unlockState = concept
        ? getConceptUnlockState(concept.id, getSkillProgress)
        : { unlocked: true };
      const isLessonAvailable = unlockState.unlocked;

      const percentComplete = isLessonAvailable
        ? getLessonCompletionPercent(
            lessonId,
            lesson.lesson_type,
            getLessonProgress,
            getPracticeRewardState,
            getFlashcardDeckProgress,
          )
        : 0;

      let status: "complete" | "current" | "locked" = "locked";

      if (isLessonAvailable && percentComplete >= 100) {
        status = "complete";
        completeLessons += 1;
      } else if (isLessonAvailable && !hasFoundCurrentLesson) {
        status = "current";
        hasFoundCurrentLesson = true;
      }

      totalLessons += 1;

      const progressLabel =
        isLessonAvailable && percentComplete > 0 && percentComplete < 100
          ? ` • ${percentComplete}%`
          : "";

      return {
        id: lessonId,
        day: "",
        title: `${lesson.lesson_title}${progressLabel}`,
        status,
      };
    });

    const weekIsAvailable = lessons.some((lesson) => lesson.status !== "locked");

    return {
      weekNumber: week.week_number,
      title: week.week_title,
      status: weekIsAvailable ? ("current" as const) : ("locked" as const),
      lessons,
    };
  });

  const progress = totalLessons > 0 ? Math.round((completeLessons / totalLessons) * 100) : 0;

  return {
    weeks,
    progress,
  };
}

function LearningPathScreen() {
  const { getLessonProgress, getPracticeRewardState, getFlashcardDeckProgress, getSkillProgress } =
    useStudentProgress();
  const currentUnitRef = useRef<HTMLDivElement | null>(null);

  const units = getAllCurricula().sort((a, b) => a.unit_number - b.unit_number);

  const unitData = units.map((unit) => ({
    unit,
    ...getUnitCardData(
      unit,
      getLessonProgress,
      getPracticeRewardState,
      getFlashcardDeckProgress,
      getSkillProgress,
    ),
  }));

  const currentUnitEntry =
    unitData.find((entry) => entry.progress < 100) ?? unitData[unitData.length - 1];

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      currentUnitRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [currentUnitEntry?.unit.unit_number]);

  return (
    <PageLayout>
      {/* @SECTION LEARNING_PATH_STATIC_HEADER */}
      <div
        data-name="learning-path-static-header"
        className="sticky top-0 z-20 -mx-1 bg-[#FAF9F4] px-1 pb-6"
      >
        <div className="rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
            Your journey
          </p>

          <h1 className="mt-3 text-3xl font-black lg:text-4xl">Learning Path</h1>

          <p className="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#073B5A]/70 lg:text-lg">
            Follow each pathway one concept at a time. Complete missions, practice new skills, and
            prove mastery with a review quiz.
          </p>
        </div>
      </div>

      {/* @SECTION LEARNING_PATH_UNIT_LIST */}
      <div data-name="learning-path-unit-list" className="space-y-5">
        {unitData.map(({ unit, weeks, progress }) => {
          const isCurrent = unit === currentUnitEntry.unit;

          return (
            <div
              key={unit.unit_number}
              ref={isCurrent ? currentUnitRef : undefined}
              className={isCurrent ? "scroll-mt-[260px] lg:scroll-mt-[230px]" : ""}
            >
              <UnitCard
                unitNumber={unit.unit_number}
                title={unit.unit_title}
                description={unit.unit_description ?? ""}
                progress={progress}
                isCurrent={isCurrent}
                weeks={weeks}
              />
            </div>
          );
        })}
      </div>
    </PageLayout>
  );
}

export default LearningPathScreen;
