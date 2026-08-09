import { useEffect, useRef } from "react";
import PageLayout from "../components/layout/PageLayout";
import UnitCard from "../components/learning-path/UnitCard";
import { isInstructionalLessonAvailable, type Curriculum } from "../data/curriculum";
import { getAllCurricula } from "../lib/curriculumLoader";
import { getConceptByLessonId } from "../data/curriculum/curriculumGraph";
import { getConceptUnlockState } from "../services/prerequisites/prerequisiteGraph";
import { isFirstLessonOfUnitUnlocked } from "../services/progress/evaluationProgression";
import {
  useStudentProgress,
  type LessonProgress,
  type StudentState,
} from "../contexts/StudentProgressContext";
import type { LessonPracticeRewardState } from "../types/practiceProgress";
import type { SkillProgress } from "../types/mastery";
import type { EvaluationCompletionRecord } from "../types/evaluationProgress";

function getLessonCompletionPercent(
  lessonId: string,
  lessonType: string,
  getLessonProgress: (id: string) => LessonProgress,
  getPracticeRewardState: (id: string) => LessonPracticeRewardState,
  getEvaluationCompletion: (id: string) => EvaluationCompletionRecord | undefined,
) {
  const progress = getLessonProgress(lessonId);
  const practiceRewards = getPracticeRewardState(lessonId);
  if (lessonType === "evaluation") {
    return getEvaluationCompletion(lessonId) ? 100 : 0;
  }

  const guidedComplete = practiceRewards.guided?.completed === true || progress.practiceComplete;
  const items = [
    progress.warmupComplete,
    progress.learnComplete,
    progress.tryItComplete,
    guidedComplete,
  ];

  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

function getUnitCardData(
  unit: Curriculum,
  studentState: StudentState,
  getLessonProgress: (id: string) => LessonProgress,
  getPracticeRewardState: (id: string) => LessonPracticeRewardState,
  getSkillProgress: (skillId: string) => SkillProgress,
  getEvaluationCompletion: (id: string) => EvaluationCompletionRecord | undefined,
) {
  let totalLessons = 0;
  let completeLessons = 0;

  const firstInstructionalLesson = unit.weeks
    .flatMap((week) =>
      week.lessons
        .filter(
          (lesson) =>
            isInstructionalLessonAvailable(lesson) && lesson.lesson_type === "lesson",
        )
        .map((lesson) => ({
          weekNumber: week.week_number,
          dayNumber: lesson.day_number,
        })),
    )
    .at(0);

  const firstInstructionalLessonId = firstInstructionalLesson
    ? `g3-u${unit.unit_number}-w${firstInstructionalLesson.weekNumber}-l${firstInstructionalLesson.dayNumber}`
    : undefined;

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
        ? getConceptUnlockState(
            concept.id,
            getSkillProgress,
            (evaluationLessonId) => getEvaluationCompletion(evaluationLessonId),
          )
        : { unlocked: true };
      const isFirstLessonOfUnit = lessonId === firstInstructionalLessonId;
      const isLessonAvailable = isFirstLessonOfUnit
        ? isFirstLessonOfUnitUnlocked(studentState, unit.unit_number)
        : unlockState.unlocked;

      const percentComplete = isLessonAvailable
        ? getLessonCompletionPercent(
            lessonId,
            lesson.lesson_type,
            getLessonProgress,
            getPracticeRewardState,
            getEvaluationCompletion,
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

      const evaluationCompletion =
        lesson.lesson_type === "evaluation" ? getEvaluationCompletion(lessonId) : undefined;
      const progressLabel =
        isLessonAvailable && percentComplete > 0 && percentComplete < 100
          ? ` • ${percentComplete}%`
          : "";
      const evaluationLabel = evaluationCompletion
        ? ` • Passed ${Math.round(evaluationCompletion.accuracy * 100)}%`
        : "";

      return {
        id: lessonId,
        day: "",
        title: `${lesson.lesson_title}${progressLabel}${evaluationLabel}`,
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
    isAccessible: weeks.some((week) => week.status !== "locked"),
  };
}

function LearningPathScreen() {
  const {
    studentState,
    getLessonProgress,
    getPracticeRewardState,
    getSkillProgress,
  } = useStudentProgress();
  const currentUnitRef = useRef<HTMLDivElement | null>(null);

  const units = getAllCurricula().sort((a, b) => a.unit_number - b.unit_number);

  const unitData = units.map((unit) => ({
    unit,
    ...getUnitCardData(
      unit,
      studentState,
      getLessonProgress,
      getPracticeRewardState,
      getSkillProgress,
      (evaluationLessonId) => studentState.evaluationCompletions[evaluationLessonId],
    ),
  }));

  const currentUnitEntry =
    [...unitData]
      .reverse()
      .find((entry) => entry.isAccessible && entry.progress < 100) ??
    [...unitData].reverse().find((entry) => entry.isAccessible) ??
    unitData[0];

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
