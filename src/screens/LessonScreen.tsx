import { type ReactNode } from "react";
import { ClipboardCheck, CheckCircle2, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import LearnCard from "../components/lesson/LearnCard";
import LessonHero from "../components/lesson/LessonHero";
import PracticeTimeCard from "../components/lesson/PracticeTimeCard";
import TryItCard from "../components/lesson/TryItCard";
import WarmUpCard from "../components/lesson/WarmUpCard";
import { getLessonById } from "../lib/lessonLookup";
import { useStudentProgress, type LessonProgress } from "../contexts/StudentProgressContext";
import type { WarmUpData } from "../types/warmup";
import { getLessonExperience } from "../data/lessonExperience";
import { getChapterForConcept, getConceptByLessonId } from "../data/curriculum/curriculumGraph";
import { getNextGrade3CourseStep } from "../services/progress/grade3CourseProgression";

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

function formatGradeLabel(grade: number) {
  if (grade === 0) return "Kindergarten";
  if (grade === 1) return "1st Grade";
  if (grade === 2) return "2nd Grade";
  if (grade === 3) return "3rd Grade";
  return `${grade}th Grade`;
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
  if (!progress.warmupComplete) {
    return {
      title: "Warm-Up",
      description: "Start with a quick review before today’s lesson.",
      buttonLabel: "Start Warm-Up ›",
      to: `/warmup/${lessonId}`,
    };
  }

  if (!progress.learnComplete) {
    return {
      title: "Learn",
      description: "Explore today’s big idea and finish the Quick Check.",
      buttonLabel: "Continue Learn ›",
      to: `/learn/${lessonId}`,
    };
  }

  if (!progress.tryItComplete) {
    return {
      title: "Try It",
      description: "Try a guided example before practice.",
      buttonLabel: "Start Try It ›",
      to: `/try-it/${lessonId}`,
    };
  }

  if (!progress.practiceComplete) {
    return {
      title: "Guided Practice",
      description: "Finish today’s required practice to complete the lesson.",
      buttonLabel: "Start Guided Practice ›",
      to: `/practice/${lessonId}?mode=guided`,
    };
  }

  if (nextLessonId) {
    const isEvaluationNext = nextLessonId.endsWith("-eval");
    return {
      title: isEvaluationNext ? "Unit Evaluation" : "Lesson Complete",
      description: isEvaluationNext
        ? "You finished the unit lessons. The checkpoint is next."
        : "Great work! You’re ready for the next lesson.",
      buttonLabel: isEvaluationNext ? "Open Evaluation ›" : "Next Lesson ›",
      to: `/lesson/${nextLessonId}`,
    };
  }

  return {
    title: "Unit Complete",
    description: "Great work! Head back to the learning path.",
    buttonLabel: "Back to Learning Path ›",
    to: "/learning-path",
  };
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

function LessonCardFrame({ state, children }: { state: SectionState; children: ReactNode }) {
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

function LessonActionBar({ nextStep }: { nextStep: NextLessonStep }) {
  const navigate = useNavigate();

  return (
    <section
      data-name="lesson-action-bar"
      className="mb-4 rounded-[1.5rem] border border-[#073B5A]/10 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-lg font-black text-[#0081A7]">
          →
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-base font-black text-[#073B5A]">
            Next Up: <span className="text-[#0081A7]">{nextStep.title}</span>
          </p>
          <p className="mt-0.5 line-clamp-1 text-[13px] font-bold text-[#073B5A]/65">
            {nextStep.description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(nextStep.to)}
          className="min-h-11 shrink-0 rounded-xl bg-[#00AFB9] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
        >
          {nextStep.buttonLabel}
        </button>
      </div>
    </section>
  );
}

function EvaluationOverview({
  lessonId,
  questionCount,
  reviewTypes,
  accuracy,
  nextUnitPath,
}: {
  lessonId: string;
  questionCount: number;
  reviewTypes: string[];
  accuracy?: number;
  nextUnitPath: string;
}) {
  const navigate = useNavigate();
  const passed = accuracy !== undefined;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
            <ClipboardCheck size={26} strokeWidth={2.6} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
              Unit Checkpoint
            </p>
            <h2 className="mt-1 text-2xl font-black text-[#073B5A]">
              {passed ? "Evaluation passed" : "Show what you know"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#073B5A]/70">
              {passed
                ? "Your checkpoint is complete. You can continue to the next unit."
                : `Answer ${questionCount} mixed review questions. Score at least 80% on your first attempts to pass.`}
            </p>
          </div>
        </div>

        {reviewTypes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              Skills in this checkpoint
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {reviewTypes.map((reviewType) => (
                <span
                  key={reviewType}
                  className="rounded-full border border-[#073B5A]/10 bg-[#F8FBFB] px-3 py-2 text-xs font-black text-[#073B5A]"
                >
                  {reviewType
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate(passed ? nextUnitPath : `/practice/${lessonId}`)}
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#00AFB9] px-7 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
        >
          {passed ? "Continue ›" : "Start Evaluation ›"}
        </button>
      </article>

      <aside
        className={`rounded-[1.75rem] border p-6 shadow-sm ${
          passed
            ? "border-[#7CCB5B]/25 bg-[#EEF9EA]"
            : "border-[#F7B733]/30 bg-[#FFF8E8]"
        }`}
      >
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ${
            passed ? "text-[#2F7D32]" : "text-[#C78300]"
          }`}
        >
          {passed ? (
            <CheckCircle2 size={27} strokeWidth={2.7} />
          ) : (
            <RotateCcw size={25} strokeWidth={2.7} />
          )}
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
          {passed ? "Result" : "Good to know"}
        </p>
        <h3 className="mt-2 text-xl font-black text-[#073B5A]">
          {passed ? `${Math.round((accuracy ?? 0) * 100)}% first-attempt accuracy` : "You can retry if needed."}
        </h3>
        <p className="mt-2 text-sm font-bold leading-6 text-[#073B5A]/70">
          {passed
            ? "Passing this checkpoint unlocks the next Grade 3 unit."
            : "A failed attempt does not change mastery or consume the checkpoint. Review and try again."}
        </p>
      </aside>
    </section>
  );
}

function LessonScreen() {
  const { lessonId } = useParams();
  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);
  const structuredLesson = lesson as typeof lesson & LessonWithStructuredData;
  const { studentState, getLessonProgress } = useStudentProgress();

  const currentLessonId =
    lessonId ??
    (lesson.lesson_type === "evaluation"
      ? `g3-u${unit.unit_number}-w${week.week_number}-eval`
      : `g3-u${unit.unit_number}-w${week.week_number}-l${weekDayNumber}`);

  const lessonExperience = getLessonExperience(currentLessonId);
  const progress = getLessonProgress(currentLessonId);
  const evaluationCompletion = studentState.evaluationCompletions[currentLessonId];
  const displayProgress: LessonProgress = evaluationCompletion
    ? { ...progress, practiceComplete: true, lessonComplete: true }
    : progress;

  const concept = getConceptByLessonId(currentLessonId);
  const chapter = concept ? getChapterForConcept(concept.id) : undefined;
  const gradeLabel = formatGradeLabel(unit.grade_level);

  const nextCourseStep = getNextGrade3CourseStep(currentLessonId);
  const nextLessonId = nextCourseStep.kind === "lesson" ? nextCourseStep.lessonId : undefined;

  const nextStep = getNextStep({
    lessonId: currentLessonId,
    nextLessonId,
    progress,
  });

  const nextUnitPath = nextCourseStep.path;

  return (
    <PageLayout>
      <div data-name="lesson-overview-stack" className="flex min-h-0 flex-col">
        <LessonHero
          unitNumber={unit.unit_number}
          chapterTitle={chapter?.title}
          conceptTitle={concept?.title}
          title={lessonExperience?.title ?? lesson.lesson_title}
          description={lessonExperience?.kidGoal ?? lesson.objective}
          minutes={lesson.lesson_type === "evaluation" ? 35 : 25}
          grade={gradeLabel}
          lessonType={lesson.lesson_type}
          quizQuestionCount={lesson.quiz_question_count ?? 0}
          progress={displayProgress}
        />

        {lesson.lesson_type === "evaluation" ? (
          <EvaluationOverview
            lessonId={currentLessonId}
            questionCount={lesson.quiz_question_count ?? 0}
            reviewTypes={lesson.review_types ?? []}
            accuracy={evaluationCompletion?.accuracy}
            nextUnitPath={nextUnitPath}
          />
        ) : (
          <>
            <LessonActionBar nextStep={nextStep} />

            <section
              data-name="lesson-stage-grid"
              className="grid min-h-0 items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-[0.95fr_0.95fr_1fr_1.08fr]"
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
                    { icon: "🧮", title: "Guided Practice", subtitle: lesson.practice },
                    { icon: "✏️", title: "Independent Practice", subtitle: "Solve on your own" },
                    { icon: "🏆", title: "Challenge Yourself", subtitle: "Take it up a notch!" },
                  ]}
                />
              </LessonCardFrame>
            </section>
          </>
        )}
      </div>
    </PageLayout>
  );
}

export default LessonScreen;
