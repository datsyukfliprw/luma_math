// @SECTION LEARN_SCREEN_IMPORTS
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { getLessonById } from "../lib/lessonLookup";
import { updateLessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";
import type { LearnLesson } from "../lib/learnContent";
import BigIdeaPage from "./learn/BigIdeaPage";
import BuildItPage from "./learn/BuildItPage";
import SeeItPage from "./learn/SeeItPage";
import WordsPage from "./learn/WordsPage";
import QuickCheckPage from "./learn/QuickCheckPage";

// @SECTION LEARN_SCREEN_CONSTANTS
const CURRENT_STUDENT_ID = "default-student";

const learnSteps = [
  {
    label: "Big Idea",
    nextLabel: "Next: Build It",
  },
  {
    label: "Build It",
    nextLabel: "Next: See It",
  },
  {
    label: "See It",
    nextLabel: "Next: Words",
  },
  {
    label: "Words",
    nextLabel: "Next: Quick Check",
  },
  {
    label: "Quick Check",
    nextLabel: "Finish Learn",
  },
];

// @SECTION LEARN_SCREEN_HELPERS
function getCurrentLessonId({
  lessonId,
  unitNumber,
  weekNumber,
  dayNumber,
}: {
  lessonId?: string;
  unitNumber: number;
  weekNumber: number;
  dayNumber: number;
}) {
  return lessonId ?? `unit-${unitNumber}-week-${weekNumber}-day-${dayNumber}`;
}

// @SECTION LEARN_STEPPER
function LearnStepper({
  currentStep,
  onPrevious,
  onNext,
}: {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const isFirstStep = currentStep === 0;

  return (
    <div data-name="learn-stepper-nav" className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        aria-label="Previous Learn page"
        data-name="learn-stepper-previous-button"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black shadow-sm transition ${
          isFirstStep
            ? "cursor-not-allowed border-[#073B5A]/10 bg-[#F1F5F7] text-[#9AB5C7]"
            : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#F8FBFB]"
        }`}
      >
        <ArrowLeft size={17} strokeWidth={3} />
      </button>

      <div data-name="learn-stepper-steps" className="flex items-start gap-0">
        {learnSteps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;

          return (
            <div
              key={step.label}
              data-name={`learn-stepper-step-${index + 1}`}
              className="flex items-start"
            >
              <div
                data-name={`learn-stepper-step-${index + 1}-content`}
                className="flex flex-col items-center"
              >
                <div
                  data-name={`learn-stepper-step-${index + 1}-circle`}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm ${
                    isActive
                      ? "border-[#00AFB9] bg-[#00AFB9] text-white shadow-[0_0_16px_rgba(0,175,185,0.38)]"
                      : isDone
                        ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]"
                        : "border-[#9AB5C7]/55 bg-white text-[#275875]"
                  }`}
                >
                  {isDone ? <CheckCircle2 size={18} strokeWidth={3} /> : index + 1}
                </div>

                <p
                  data-name={`learn-stepper-step-${index + 1}-label`}
                  className={`mt-1 whitespace-nowrap text-center text-[0.68rem] font-black ${
                    isActive ? "text-[#073B5A]" : "text-[#275875]/75"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < learnSteps.length - 1 && (
                <div
                  data-name={`learn-stepper-connector-${index + 1}`}
                  className="mt-5 h-0.5 w-10 border-t-2 border-dashed border-[#9AB5C7]/45"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next Learn page"
        data-name="learn-stepper-next-button"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-white shadow-[0_8px_18px_rgba(0,175,185,0.28)] transition hover:bg-[#0081A7]"
      >
        <ArrowRight size={18} strokeWidth={3} />
      </button>
    </div>
  );
}

// @SECTION SCROLL_MORE_HINT
function ScrollMoreHint({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-name="learn-scroll-more-hint"
      className="pointer-events-none fixed bottom-7 left-1/2 z-40 -translate-x-1/2 rounded-full border border-[#073B5A]/10 bg-white/95 px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm backdrop-blur"
    >
      Scroll for more ↓
    </div>
  );
}

// @SECTION LEARN_SCREEN
function LearnScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);

  const currentLessonId = getCurrentLessonId({
    lessonId,
    unitNumber: unit.unit_number,
    weekNumber: week.week_number,
    dayNumber: weekDayNumber,
  });

  const lessonPath = `/lesson/${currentLessonId}`;
  const starName = getStarProfile(CURRENT_STUDENT_ID).starName;

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const pageContentRef = useRef<HTMLDivElement | null>(null);

  const learnLesson = lesson as LearnLesson;

  useEffect(() => {
    setCurrentStep(0);
  }, [currentLessonId]);

  useEffect(() => {
    const sentinel = topSentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCompactHeader(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 1,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const scrollContainer = pageContentRef.current;

    if (!scrollContainer) {
      setShowScrollHint(false);
      return;
    }

    const updateScrollHint = () => {
      const hasOverflow = scrollContainer.scrollHeight > scrollContainer.clientHeight;
      const isNearBottom =
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 24;

      setShowScrollHint(hasOverflow && !isNearBottom);
    };

    updateScrollHint();
    scrollContainer.addEventListener("scroll", updateScrollHint);
    window.addEventListener("resize", updateScrollHint);

    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollHint);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [currentStep]);

  useEffect(() => {
    const scrollContainer = pageContentRef.current;

    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const page = useMemo(() => {
    if (currentStep === 0) {
      return <BigIdeaPage lesson={learnLesson} starName={starName} />;
    }

    if (currentStep === 1) {
      return (
        <BuildItPage
          lesson={learnLesson}
          starName={starName}
          onBuildComplete={() => {
            updateLessonProgress(currentLessonId, {
              learnComplete: true,
            });
          }}
        />
      );
    }

    if (currentStep === 2) {
      return <SeeItPage lesson={learnLesson} starName={starName} />;
    }

    if (currentStep === 3) {
      return <WordsPage lesson={learnLesson} starName={starName} />;
    }

    return <QuickCheckPage lessonId={currentLessonId} starName={starName} />;
  }, [currentLessonId, currentStep, learnLesson, starName]);

  function backToLesson() {
    navigate(lessonPath);
  }

  function goBack() {
    setCurrentStep((current) => Math.max(current - 1, 0));
  }

  function goNext() {
    if (currentStep >= learnSteps.length - 1) {
      updateLessonProgress(currentLessonId, {
        learnComplete: true,
      });
      navigate(lessonPath);
      return;
    }

    setCurrentStep((current) => Math.min(current + 1, learnSteps.length - 1));
  }

  return (
    <PageLayout>
      <div
        ref={pageContentRef}
        data-name="learn-screen"
        className="relative flex h-full min-h-0 flex-col gap-5 overflow-y-auto pr-1"
      >
        <div ref={topSentinelRef} data-name="learn-top-sentinel" className="h-0" />

        {/* @SECTION LEARN_HEADER */}
        <header
          data-name="learn-header"
          className={`sticky top-0 z-30 rounded-[1.5rem] border border-[#073B5A]/10 bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
            isCompactHeader ? "px-4 py-1.5" : "px-4 py-2.5"
          }`}
        >
          <div data-name="learn-header-row" className="flex items-center justify-between gap-6">
            <div data-name="learn-header-left" className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={backToLesson}
                data-name="back-to-lesson-button"
                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white text-sm font-black text-[#0081A7] shadow-sm transition hover:bg-[#E9F7F8] ${
                  isCompactHeader ? "px-3 py-1.5" : "px-4 py-2"
                }`}
              >
                <ArrowLeft size={18} strokeWidth={3} />
                Back to Lesson
              </button>

              <div
                data-name="learn-section-number-badge"
                className={`flex shrink-0 items-center justify-center rounded-full bg-[#073B5A] font-black text-white shadow-sm transition-all ${
                  isCompactHeader ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg"
                }`}
              >
                2
              </div>

              <div data-name="learn-header-title-block" className="min-w-0">
                <div
                  data-name="learn-header-meta-row"
                  className="flex flex-wrap items-center gap-x-3 gap-y-1"
                >
                  <h1
                    data-name="learn-header-title"
                    className={`font-black text-[#073B5A] transition-all ${
                      isCompactHeader ? "text-lg" : "text-xl"
                    }`}
                  >
                    Learn
                  </h1>

                  <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                  <p
                    data-name="learn-header-current-page"
                    className="text-sm font-black text-[#00AFB9]"
                  >
                    Page {currentStep + 1} • {learnSteps[currentStep].label}
                  </p>

                  {!isCompactHeader && (
                    <>
                      <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                      <div
                        data-name="learn-header-time"
                        className="flex items-center gap-1.5 text-sm font-black text-[#275875]"
                      >
                        <Clock3 size={16} strokeWidth={2.7} />
                        10 min
                      </div>
                    </>
                  )}
                </div>

                {!isCompactHeader && (
                  <p
                    data-name="learn-header-lesson-title"
                    className="mt-1 truncate text-base font-black text-[#073B5A]"
                  >
                    {lesson.lesson_title}
                  </p>
                )}
              </div>
            </div>

            <div data-name="learn-header-stepper-nav" className="hidden xl:block">
              <LearnStepper currentStep={currentStep} onPrevious={goBack} onNext={goNext} />
            </div>
          </div>
        </header>

        {/* @SECTION LEARN_PAGE_CONTENT_GRID */}
        <section
          data-name="learn-page-content-grid"
          className={`grid items-start gap-5 ${
            currentStep === 1 ? "xl:grid-cols-[1.55fr_0.75fr]" : "xl:grid-cols-[1.15fr_0.85fr]"
          }`}
        >
          {page}
        </section>

        {/* @SECTION LEARN_MOBILE_NAV */}
        <div className="flex items-center justify-between rounded-[1.25rem] border border-[#073B5A]/10 bg-white p-3 shadow-sm xl:hidden">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              currentStep === 0 ? "bg-[#F1F5F7] text-[#9AB5C7]" : "bg-[#E9F7F8] text-[#0081A7]"
            }`}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 text-sm font-black text-[#073B5A]">
            <BookOpen size={16} strokeWidth={2.7} />
            {currentStep + 1} / {learnSteps.length}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="rounded-xl bg-[#00AFB9] px-4 py-2 text-sm font-black text-white"
          >
            {currentStep === learnSteps.length - 1 ? "Finish" : "Next →"}
          </button>
        </div>

        <ScrollMoreHint isVisible={showScrollHint} />
      </div>
    </PageLayout>
  );
}

export default LearnScreen;
