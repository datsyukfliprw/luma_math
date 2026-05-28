import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import LearnCard from "../components/lesson/LearnCard";
import LessonHero from "../components/lesson/LessonHero";
import PracticeTimeCard from "../components/lesson/PracticeTimeCard";
import TryItCard from "../components/lesson/TryItCard";
import WarmUpCard from "../components/lesson/WarmUpCard";
import { getLessonById } from "../lib/lessonLookup";
import { getLessonProgress, type LessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";
import type { WarmUpData } from "../types/warmup";

const CURRENT_STUDENT_ID = "default-student";

type LessonWithStructuredData = {
  warmup?: WarmUpData;
};

type SectionState = "complete" | "active" | "future";

function getNextStep(progress: LessonProgress) {
  if (!progress.warmupComplete) {
    return {
      title: "Warm-Up",
      description: "Power up your star with quick review rounds.",
    };
  }

  if (!progress.learnComplete) {
    return {
      title: "Learn",
      description: "Watch the short lesson and learn today’s skill.",
    };
  }

  if (!progress.tryItComplete) {
    return {
      title: "Try It",
      description: "Try one guided problem before practice.",
    };
  }

  if (!progress.practiceComplete) {
    return {
      title: "Practice",
      description: "Finish with guided practice and lock in the skill.",
    };
  }

  return {
    title: "Complete",
    description: "Great work! You finished today’s lesson.",
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
    <div className={`h-full rounded-[1.9rem] p-[2px] ${frameClass}`}>
      <div className="h-full rounded-[1.75rem]">{children}</div>
    </div>
  );
}

function LessonActionBar({
  nextStep,
  words,
}: {
  nextStep: {
    title: string;
    description: string;
  };
  words: string[];
}) {
  return (
    <section className="mb-5 overflow-hidden rounded-[1.5rem] border border-[#073B5A]/10 bg-white shadow-sm">
      <div className="grid items-stretch lg:grid-cols-[1fr_auto]">
        <div className="flex items-center gap-4 px-5 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-2xl">
            🚀
          </div>

          <div className="min-w-0">
            <p className="text-xl font-black text-[#073B5A]">
              Next Up: <span className="text-[#0081A7]">{nextStep.title}</span>
            </p>

            <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
              {nextStep.description}
            </p>
          </div>

          <button
            type="button"
            className="ml-auto hidden shrink-0 rounded-xl bg-[#00AFB9] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7] md:block"
          >
            Continue Lesson ›
          </button>
        </div>

        <div className="flex items-center gap-3 border-t border-[#073B5A]/10 px-5 py-4 lg:border-l lg:border-t-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-xl">
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

  const nextStep = getNextStep(progress);
  const todaysWords = getTodaysWords(lesson.lesson_title, lesson.practice_type);

  return (
    <PageLayout>
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

      <section className="grid items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.15fr]">
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
    </PageLayout>
  );
}

export default LessonScreen;
