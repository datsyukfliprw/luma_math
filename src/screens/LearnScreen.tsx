// @SECTION FILE_OVERVIEW
// LearnScreen.tsx
// LumaMath Learn flow shell for the Grade 3 zero and identity multiplication rules lesson.
//
// Navigation standard:
// - Search @SECTION in Neovim to jump between major areas.
// - Search a specific tag like LEARN_SCREEN_HEADER or LEARN_PAGE_ROUTING.
// - Keep data-name attributes for browser/devtools inspection.
//
// @SECTION_INDEX
// FILE_OVERVIEW
// IMPORTS
// LEARN_CONSTANTS
// LEARN_SCROLL_HELPERS
// LEARN_LESSON_ID_HELPER
// LEARN_SCREEN
// LEARN_SCREEN_STATE
// LEARN_PAGE_ROUTING
// LEARN_COMPACT_HEADER_SCROLL_THRESHOLD
// LEARN_SCROLL_HINT_OBSERVER
// LEARN_NAVIGATION_HELPERS
// LEARN_SCREEN_LAYOUT
// LEARN_SCREEN_HEADER
// LEARN_HEADER_STEPPER
// LEARN_SCREEN_CONTENT_GRID

// @SECTION IMPORTS
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock3 } from "lucide-react";

import PageLayout from "../components/layout/PageLayout";
import { getLessonById } from "../lib/lessonLookup";
import { updateLessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";

import BigIdeaPage from "./learn/BigIdeaPage";
import BuildItPage from "./learn/BuildItPage";
import LearnStepper, { learnSteps } from "./learn/LearnStepper";
import QuickCheckPage from "./learn/QuickCheckPage";
import ScrollMoreHint from "./learn/ScrollMoreHint";
import SeeItPage from "./learn/SeeItPage";
import WordsPage from "./learn/WordsPage";

// @SECTION LEARN_CONSTANTS
const CURRENT_STUDENT_ID = "default-student";
const COMPACT_HEADER_SCROLL_THRESHOLD = 96;
const MEANINGFUL_SCROLL_DISTANCE = 180;

// @SECTION LEARN_SCROLL_HELPERS
function getScrollParent(element: HTMLElement | null) {
  let currentElement = element?.parentElement ?? null;

  while (currentElement) {
    const styles = window.getComputedStyle(currentElement);
    const overflowY = styles.overflowY;

    if (overflowY === "auto" || overflowY === "scroll") {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return document.documentElement;
}

// @SECTION LEARN_LESSON_ID_HELPER
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

  // @SECTION LEARN_SCREEN_STATE
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [isBuildItComplete, setIsBuildItComplete] = useState(false);

  const pageContentRef = useRef<HTMLDivElement | null>(null);

  const starName = getStarProfile(CURRENT_STUDENT_ID).starName;

  // @SECTION LEARN_PAGE_ROUTING
  const page = useMemo(() => {
    if (currentStep === 0) {
      return <BigIdeaPage starName={starName} />;
    }

    if (currentStep === 1) {
      return (
        <BuildItPage
          starName={starName}
          onBuildComplete={() => setIsBuildItComplete(true)}
        />
      );
    }

    if (currentStep === 2) {
      return <SeeItPage starName={starName} />;
    }

    if (currentStep === 3) {
      return <WordsPage starName={starName} />;
    }

    return <QuickCheckPage starName={starName} />;
  }, [currentStep, starName]);
  // @SECTION LEARN_COMPACT_HEADER_SCROLL_THRESHOLD
  useEffect(() => {
    const pageContent = pageContentRef.current;

    if (!pageContent) {
      return;
    }

    const scrollElement = getScrollParent(pageContent);

    const updateCompactHeader = () => {
      const scrollableDistance =
        scrollElement.scrollHeight - scrollElement.clientHeight;

      const hasMeaningfulScrollableContent =
        scrollableDistance > MEANINGFUL_SCROLL_DISTANCE;

      setIsCompactHeader(
        hasMeaningfulScrollableContent &&
          scrollElement.scrollTop > COMPACT_HEADER_SCROLL_THRESHOLD,
      );
    };

    requestAnimationFrame(updateCompactHeader);

    scrollElement.addEventListener("scroll", updateCompactHeader, {
      passive: true,
    });
    window.addEventListener("resize", updateCompactHeader);

    return () => {
      scrollElement.removeEventListener("scroll", updateCompactHeader);
      window.removeEventListener("resize", updateCompactHeader);
    };
  }, [currentStep]);

  // @SECTION LEARN_SCROLL_HINT_OBSERVER
  useEffect(() => {
    const pageContent = pageContentRef.current;

    if (!pageContent) {
      return;
    }

    const scrollElement = getScrollParent(pageContent);

    const checkScrollPosition = () => {
      const scrollableDistance =
        scrollElement.scrollHeight - scrollElement.clientHeight;

      const hasMeaningfulScrollableContent =
        scrollableDistance > MEANINGFUL_SCROLL_DISTANCE;

      const isNearBottom =
        scrollElement.scrollTop + scrollElement.clientHeight >=
        scrollElement.scrollHeight - 96;

      setShowScrollHint(hasMeaningfulScrollableContent && !isNearBottom);
    };

    requestAnimationFrame(checkScrollPosition);

    scrollElement.addEventListener("scroll", checkScrollPosition, {
      passive: true,
    });
    window.addEventListener("resize", checkScrollPosition);

    return () => {
      scrollElement.removeEventListener("scroll", checkScrollPosition);
      window.removeEventListener("resize", checkScrollPosition);
    };
  }, [currentStep]);

  // @SECTION LEARN_NAVIGATION_HELPERS
  function scrollLearnPageToTop() {
    const pageContent = pageContentRef.current;

    if (!pageContent) {
      return;
    }

    const scrollElement = getScrollParent(pageContent);

    requestAnimationFrame(() => {
      scrollElement.scrollTo({
        top: 0,
        behavior: "auto",
      });

      setIsCompactHeader(false);
      setShowScrollHint(false);
    });
  }

  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`);
  }

  function goNext() {
    if (currentStep >= learnSteps.length - 1) {
      updateLessonProgress(currentLessonId, {
        learnComplete: true,
      });

      navigate(`/lesson/${currentLessonId}`);
      return;
    }

    setIsCompactHeader(false);
    setShowScrollHint(false);
    setCurrentStep((current) => current + 1);
    scrollLearnPageToTop();
  }

  function goBack() {
    if (currentStep === 0) {
      backToLesson();
      return;
    }

    setIsCompactHeader(false);
    setShowScrollHint(false);
    setCurrentStep((current) => current - 1);
    scrollLearnPageToTop();
  }

  return (
    <PageLayout>
      {/* @SECTION LEARN_SCREEN_LAYOUT */}
      <div
        ref={pageContentRef}
        data-name="learn-screen-wrapper"
        className="flex min-h-0 flex-col gap-4 pb-0"
      >
        {/* @SECTION LEARN_SCREEN_HEADER */}
        <header
          data-name="learn-header"
          className={`sticky top-0 z-30 rounded-[1.5rem] border border-[#073B5A]/10 bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
            isCompactHeader ? "px-4 py-1.5" : "px-4 py-2.5"
          }`}
        >
          <div
            data-name="learn-header-row"
            className="flex items-center justify-between gap-6"
          >
            <div
              data-name="learn-header-left"
              className="flex min-w-0 items-center gap-4"
            >
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

            {/* @SECTION LEARN_HEADER_STEPPER */}
            <div
              data-name="learn-header-stepper-nav"
              className="hidden xl:block"
            >
              <LearnStepper
                currentStep={currentStep}
                onPrevious={goBack}
                onNext={goNext}
                isNextHighlighted={currentStep === 1 && isBuildItComplete}
              />
            </div>
          </div>
        </header>

        {/* @SECTION LEARN_SCREEN_CONTENT_GRID */}
        <section
          data-name="learn-page-content-grid"
          className="grid items-start gap-5 xl:grid-cols-[1.55fr_0.7fr]"
        >
          {page}
        </section>

        <ScrollMoreHint isVisible={showScrollHint} />
      </div>
    </PageLayout>
  );
}

export default LearnScreen;
