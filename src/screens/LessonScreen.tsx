import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import LearnCard from "../components/lesson/LearnCard";
import LessonHero from "../components/lesson/LessonHero";
import PracticeTimeCard from "../components/lesson/PracticeTimeCard";
import TryItCard from "../components/lesson/TryItCard";
import WarmUpCard from "../components/lesson/WarmUpCard";
import { getLessonById } from "../lib/lessonLookup";
import { getFlashcardDeckCardIds } from "../flashcards/deckRegistry";
import { getFlashcardDeckProgress } from "../lib/flashcardProgress";
import { getLessonProgress, type LessonProgress } from "../lib/lessonProgress";
import { getPracticeRewardState } from "../lib/practiceRewards";
import { getStarProfile } from "../lib/starProfile";
import type { WarmUpData } from "../types/warmup";

const CURRENT_STUDENT_ID = "default-student";

type LessonWithStructuredData = {
  warmup?: WarmUpData;
};

type SectionState = "complete" | "active" | "future";

type NextLessonStep = {
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
};

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

function getNextStep({
  lessonId,
  nextLessonId,
  progress,
}: {
  lessonId: string;
  nextLessonId?: string;
  progress: LessonProgress;
}): NextLessonStep {
  const practiceRewards = getPracticeRewardState(CURRENT_STUDENT_ID, lessonId);
  const guidedComplete =
    practiceRewards.guided?.completed === true || progress.practiceComplete;
  const independentComplete = practiceRewards.independent?.completed === true;
  const challengeComplete = practiceRewards.challenge?.completed === true;

  const flashcardDeckId = getFlashcardDeckIdForLesson(lessonId);
  const flashcardCardIds = getFlashcardDeckCardIds(flashcardDeckId);
  const flashcardProgress = getFlashcardDeckProgress(
    CURRENT_STUDENT_ID,
    flashcardDeckId,
    flashcardCardIds,
  );

  if (!progress.warmupComplete) {
    return {
      title: "Warm-Up",
      description: "Start with quick review before today’s lesson.",
      buttonLabel: "Start Warm-Up ›",
      to: `/learn/${lessonId}?step=warmup`,
    };
  }

  if (!progress.learnComplete) {
    return {
      title: "Learn",
      description: "Watch the short lesson and learn today’s skill.",
      buttonLabel: "Continue Lesson ›",
      to: `/learn/${lessonId}?step=learn`,
    };
  }

  if (!progress.tryItComplete) {
    return {
      title: "Try It",
      description: "Try one guided problem before practice.",
      buttonLabel: "Start Try It ›",
      to: `/try-it/${lessonId}`,
    };
  }

  if (!guidedComplete) {
    return {
      title: "Guided Practice",
      description: "Solve step-by-step problems with hints.",
      buttonLabel: "Start Guided Practice ›",
      to: `/practice/${lessonId}?mode=guided`,
    };
  }

  if (!independentComplete) {
    return {
      title: "Independent Practice",
      description: "Show what you can do on your own.",
      buttonLabel: "Start Independent Practice ›",
      to: `/practice/${lessonId}?mode=independent`,
    };
  }

  if (!challengeComplete) {
    return {
      title: "Challenge",
      description: "Try a tougher version for an epic reward.",
      buttonLabel: "Try Challenge ›",
      to: `/practice/${lessonId}?mode=challenge`,
    };
  }

  if (!flashcardProgress.completed) {
    return {
      title: "Flashcards",
      description: "Review this lesson’s deck and strengthen recall.",
      buttonLabel: "Try Flashcards ›",
      to: `/flashcards/deck/${flashcardDeckId}`,
    };
  }

  if (nextLessonId) {
    return {
      title: "Lesson Complete",
      description: "Great work! You’re ready for the next lesson.",
      buttonLabel: "Next Lesson ›",
      to: `/lesson/${nextLessonId}`,
    };
  }

  return {
    title: "Unit Checkpoint",
    description: "Great work! Head back to the learning path.",
    buttonLabel: "Back to Learning Path ›",
    to: "/learning-path",
  };
}

function getTodaysWords(lessonTitle: string, practiceType: string) {
  if (practiceType === "factor_product_identification") {
    return ["factor", "product", "equation"];
  }

  if (practiceType === "array_rows_columns") {
    return ["array", "row", "column"];
  }

  if (practiceType === "repeated_addition_to_multiplication") {
    return ["repeated addition", "groups", "multiply"];
  }

  if (lessonTitle.toLowerCase().includes("zero")) {
    return ["zero rule", "identity rule", "product"];
  }

  return ["equal groups", "factor", "product"];
}

function getSectionState(
  section: "warmup" | "learn" | "tryIt" | "practice",
  progress: LessonProgress,
): SectionState {
  if (section === "warmup") {
    return progress.warmupComplete ? "complete" : "active";
  }

  if (section === "learn") {
    if (progress.learnComplete) return "complete";
    return progress.warmupComplete ? "active" : "future";
  }

  if (section === "tryIt") {
    if (progress.tryItComplete) return "complete";
    return progress.learnComplete ? "active" : "future";
  }

  if (progress.practiceComplete) return "complete";
  return progress.tryItComplete ? "active" : "future";
}

// @SECTION LESSON_CARD_FRAME
function LessonCardFrame({
  state,
  children,
}: {
  state: SectionState;
  children: ReactNode;
}) {
  const frameClass =
    state === "active"
      ? "bg-[#00AFB9] shadow-[0_0_28px_rgba(0,175,185,0.22)]"
      : state === "complete"
        ? "bg-[#00AFB9]/35"
        : "bg-transparent";

  return (
    <div className={`h-full min-h-0 rounded-[1.9rem] p-[2px] ${frameClass}`}>
      <div className="h-full min-h-0 rounded-[1.75rem]">{children}</div>
    </div>
  );
}

// @SECTION LESSON_ACTION_BAR
function LessonActionBar({
  nextStep,
  words,
}: {
  nextStep: NextLessonStep;
  words: string[];
}) {
  const navigate = useNavigate();

  return (
    <section
      data-name="lesson-action-bar"
      className="mb-4 overflow-hidden rounded-[1.5rem] border border-[#073B5A]/10 bg-white shadow-sm"
    >
      <div className="grid items-stretch lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-4 px-5 py-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-2xl">
            🚀
          </div>

          <div className="min-w-0">
            <p className="text-xl font-black text-[#073B5A]">
              Next Up: <span className="text-[#0081A7]">{nextStep.title}</span>
            </p>

            <p className="mt-0.5 text-sm font-bold text-[#073B5A]/70">
              {nextStep.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(nextStep.to)}
            className="ml-auto hidden shrink-0 rounded-xl bg-[#00AFB9] px-6 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7] md:block"
          >
            {nextStep.buttonLabel}
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-[#073B5A]/10 px-5 py-3.5 lg:border-l lg:border-t-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-xl">
            📖
          </div>

          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <p className="mr-2 text-base font-black text-[#073B5A]">
              Today’s Words
            </p>

            {words.map((word) => (
              <span
                key={word}
                className="rounded-xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-2 text-sm font-bold text-[#275875]"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// @SECTION LESSON_SCREEN
function LessonScreen() {
  const { lessonId } = useParams();
  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);
  const structuredLesson = lesson as typeof lesson & LessonWithStructuredData;

  const currentLessonId =
    lessonId ??
    `unit-${unit.unit_number}-week-${week.week_number}-day-${weekDayNumber}`;

  const [progress, setProgress] = useState<LessonProgress>(() =>
    getLessonProgress(currentLessonId),
  );

  const [starName, setStarName] = useState(
    () => getStarProfile(CURRENT_STUDENT_ID).starName,
  );

  useEffect(() => {
    setProgress(getLessonProgress(currentLessonId));
    setStarName(getStarProfile(CURRENT_STUDENT_ID).starName);
  }, [currentLessonId]);

  const currentWeekIndex = unit.weeks.findIndex(
    (unitWeek) => unitWeek.week_number === week.week_number,
  );
  const nextLessonInSameWeek = week.lessons[weekDayNumber];
  const nextWeek = unit.weeks[currentWeekIndex + 1];
  const nextLessonId = nextLessonInSameWeek
    ? `unit-${unit.unit_number}-week-${week.week_number}-day-${weekDayNumber + 1}`
    : nextWeek
      ? `unit-${unit.unit_number}-week-${nextWeek.week_number}-day-1`
      : undefined;

  const nextStep = getNextStep({
    lessonId: currentLessonId,
    nextLessonId,
    progress,
  });
  const todaysWords = getTodaysWords(lesson.lesson_title, lesson.practice_type);

  return (
    <PageLayout>
      {/* @SECTION LESSON_OVERVIEW_STACK */}
      <div data-name="lesson-overview-stack" className="flex min-h-0 flex-col">
        <LessonHero
          unitNumber={unit.unit_number}
          weekNumber={week.week_number}
          dayNumber={weekDayNumber}
          title={lesson.lesson_title}
          topic={unit.unit_title}
          description={lesson.objective}
          minutes={lesson.lesson_type === "evaluation" ? 35 : 25}
          grade={`${unit.grade_level}rd Grade`}
          lessonType={lesson.lesson_type}
          quizQuestionCount={lesson.quiz_question_count}
          progress={progress}
          starName={starName}
        />

        <LessonActionBar nextStep={nextStep} words={todaysWords} />

        {/* @SECTION LESSON_STAGE_GRID */}
        <section
          data-name="lesson-stage-grid"
          className="grid min-h-0 items-stretch gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.12fr]"
        >
          <LessonCardFrame state={getSectionState("warmup", progress)}>
            <WarmUpCard
              factDrill={lesson.fact_drill}
              warmup={structuredLesson.warmup}
              lessonId={currentLessonId}
              isComplete={progress.warmupComplete}
            />
          </LessonCardFrame>

          <LessonCardFrame state={getSectionState("learn", progress)}>
            <LearnCard
              lessonId={currentLessonId}
              concept={lesson.concept}
              isComplete={progress.learnComplete}
            />
          </LessonCardFrame>

          <LessonCardFrame state={getSectionState("tryIt", progress)}>
            <TryItCard
              lessonId={currentLessonId}
              practice={lesson.practice}
              practiceType={lesson.practice_type}
              isComplete={progress.tryItComplete}
            />
          </LessonCardFrame>

          <LessonCardFrame state={getSectionState("practice", progress)}>
            <PracticeTimeCard
              lessonId={currentLessonId}
              activities={[
                {
                  icon: "🧮",
                  title: "Guided Practice",
                  subtitle: lesson.practice,
                },
                {
                  icon: "✏️",
                  title: "Independent Practice",
                  subtitle: "Solve on your own",
                },
                {
                  icon: "🏆",
                  title: "Challenge Yourself",
                  subtitle: "Take it up a notch!",
                },
              ]}
            />
          </LessonCardFrame>
        </section>
      </div>
    </PageLayout>
  );
}

export default LessonScreen;
