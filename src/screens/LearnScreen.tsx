// LearnScreen.tsx
// LumaMath Learn flow for the Grade 3 zero and identity multiplication rules lesson.
//
// This file intentionally uses searchable JSX comments and data-name attributes
// around major layout sections. That makes the UI easier to inspect, search,
// and safely patch without accidentally breaking unrelated Learn phases.

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Star,
} from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import LumaAvatar from "../components/luma/LumaAvatar";
import { getLessonById } from "../lib/lessonLookup";
import { updateLessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";

// Temporary student id until student selection is wired into this screen.
const CURRENT_STUDENT_ID = "default-student";

// Embedded lesson video used by Page 1 after the custom thumbnail is clicked.
const lessonVideoUrl = "https://www.youtube.com/embed/gLcD7otUHxw";

// Header stepper labels for the five-part Learn flow.
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

// Builds a stable lesson id when React Router does not provide one.
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

// Compact stepper shown in the sticky Learn header.
function LearnStepper({
  currentStep,
  onPrevious,
  onNext,
  isNextHighlighted = false,
}: {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  isNextHighlighted?: boolean;
}) {
  const isFirstStep = currentStep === 0;

  return (
    <div
      data-name="learn-stepper-nav"
      className="flex items-center justify-end gap-2"
    >
      {/* Learn header: previous page button */}
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

      {/* Learn header: five-step progress row */}
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
                  {isDone ? "✓" : index + 1}
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

      {/* Learn header: next page button */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next Learn page"
        data-name="learn-stepper-next-button"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-[#0081A7] ${
          isNextHighlighted
            ? "animate-pulse bg-[#F7B733] shadow-[0_0_0_5px_rgba(247,183,51,0.20),0_10px_22px_rgba(247,183,51,0.35)] ring-2 ring-[#F7B733]/35"
            : "bg-[#00AFB9] shadow-[0_8px_18px_rgba(0,175,185,0.28)]"
        }`}
      >
        <ArrowRight size={18} strokeWidth={3} />
      </button>
    </div>
  );
}

// Page 1: Big Idea introduces the lesson mission with a compact video-first layout.
function BigIdeaPage() {
  // The thumbnail keeps the initial page lightweight and lets our custom art set the tone.
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // This mission map previews the full 10-minute Learn flow without making Page 1 too text-heavy.
  const missionSteps = [
    "Watch the idea",
    "Build equal groups",
    "Turn groups into math",
    "Learn the words",
    "Quick check",
  ];

  return (
    <>
      {/* Page 1: Big Idea main teaching card */}
      <main
        data-name="big-idea-main-card"
        className="self-start rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* Page 1: Big Idea title row */}
        <div
          data-name="big-idea-card-header"
          className="mb-4 flex items-start justify-between gap-4"
        >
          <div
            data-name="big-idea-title-group"
            className="flex items-start gap-4"
          >
            <div
              data-name="big-idea-title-icon"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-[#F7B733]"
            >
              <Lightbulb size={28} strokeWidth={2.6} />
            </div>

            <div data-name="big-idea-title-text">
              <h2 className="text-2xl font-black text-[#073B5A]">
                Today’s Big Idea
              </h2>
              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                Equal groups help us see why multiplying by 1 keeps the number,
                and multiplying by 0 makes zero.
              </p>
            </div>
          </div>

          <div
            data-name="big-idea-page-badge"
            className="hidden shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7] md:block"
          >
            Page 1 of 5
          </div>
        </div>

        {/* Page 1: Custom video thumbnail that opens the embedded video on click */}
        <div
          data-name="big-idea-video-card"
          className="overflow-hidden rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#073B5A] shadow-sm"
        >
          <div
            data-name="big-idea-video-frame"
            className="aspect-[16/8.4] w-full overflow-hidden"
          >
            {isVideoOpen ? (
              <iframe
                title="Zero and Identity Rules lesson video"
                src={`${lessonVideoUrl}?autoplay=1`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                data-name="big-idea-video-thumbnail-button"
                className="group relative h-full w-full overflow-hidden bg-[#073B5A] text-left"
                aria-label="Play Zero and Identity Rules lesson video"
              >
                <img
                  src="/images/learn/thumbnails/zero-one-rules.webp"
                  alt="Zero and Identity Rules lesson video"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />

                <div
                  data-name="big-idea-video-thumbnail-scrim"
                  className="absolute inset-0 bg-[#073B5A]/20"
                />

                <div
                  data-name="big-idea-video-play-button-wrap"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    data-name="big-idea-video-play-button"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F07167] text-white shadow-[0_14px_30px_rgba(7,59,90,0.35)] transition group-hover:scale-105"
                  >
                    <span className="ml-1 text-4xl leading-none">▶</span>
                  </div>
                </div>

                <div
                  data-name="big-idea-video-caption"
                  className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/92 px-4 py-2.5 shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Watch first
                  </p>
                  <p className="mt-0.5 text-base font-black text-[#073B5A]">
                    Why ×1 keeps the number and ×0 makes zero
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Page 1: Two compact rule cards under the video */}
        <div
          data-name="big-idea-rule-cards-grid"
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <div
            data-name="big-idea-rule-times-one-card"
            className="rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              Multiplying by 1
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-black text-[#073B5A]">4 × 1 = 4</p>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#0081A7] shadow-sm">
                Same number
              </div>
            </div>

            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              One in each group keeps the total the same as the number of
              groups.
            </p>
          </div>

          <div
            data-name="big-idea-rule-times-zero-card"
            className="rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#F07167]">
              Multiplying by 0
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-black text-[#073B5A]">4 × 0 = 0</p>
              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#F07167] shadow-sm">
                Zero total
              </div>
            </div>

            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              Zero in each group means there are no items to count.
            </p>
          </div>
        </div>
      </main>

      {/* Page 1: Big Idea right sidebar */}
      <aside data-name="big-idea-right-sidebar" className="flex flex-col gap-4">
        {/* Page 1: Luma guidance card */}
        <section
          data-name="big-idea-luma-tip-card"
          className="relative min-h-[165px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              Look for
              <br />
              equal groups!
            </div>
          </div>

          <div className="absolute bottom-[-34px] right-[-8px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* Page 1: Compact mission map */}
        <section
          data-name="big-idea-mission-map-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
              <GraduationCap size={27} strokeWidth={2.6} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Today’s Mission
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                One idea, five steps
              </p>
            </div>
          </div>

          {/* Page 1: Big Idea mission step list */}
          <div data-name="big-idea-mission-steps" className="space-y-2.5">
            {missionSteps.map((step, index) => (
              <div
                key={step}
                data-name={`big-idea-mission-step-${index + 1}`}
                className="flex items-center gap-3 rounded-2xl bg-[#F8FBFB] px-4 py-2.5"
              >
                <div
                  data-name={`big-idea-mission-step-${index + 1}-number`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    index === 0
                      ? "bg-[#00AFB9] text-white"
                      : "bg-white text-[#0081A7]"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="text-sm font-black text-[#073B5A]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Page 1: Compact guiding question */}
        <section
          data-name="big-idea-core-question-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-5 py-4 shadow-sm"
        >
          <div
            data-name="big-idea-core-question-content"
            className="flex items-start gap-3"
          >
            <div
              data-name="big-idea-core-question-icon"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#00AFB9] shadow-sm"
            >
              ?
            </div>

            <div data-name="big-idea-core-question-text">
              <h2 className="text-lg font-black text-[#073B5A]">
                Big Question
              </h2>

              <p className="mt-1 text-sm font-black leading-relaxed text-[#073B5A]">
                What changes when each group has 1 item or 0 items?
              </p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

// Page 2: Build It lets the student create equal groups before seeing equations.

function BuildItPage({ onBuildComplete }: { onBuildComplete?: () => void }) {
  const buildRounds = [
    {
      groups: 4,
      targetCount: 1,
      instruction: "Put 1 star in each group.",
      summary: "4 groups of 1 = 4 total",
      pattern:
        "When each group has 1, the total stays the same as the number of groups.",
    },
    {
      groups: 4,
      targetCount: 0,
      instruction: "Make 4 groups with 0 stars in each group.",
      summary: "4 groups of 0 = 0 total",
      pattern: "When each group has 0, there are no stars to count.",
    },
    {
      groups: 6,
      targetCount: 1,
      instruction: "Put 1 star in each group.",
      summary: "6 groups of 1 = 6 total",
      pattern: "Multiplying by 1 keeps the number the same.",
    },
    {
      groups: 6,
      targetCount: 0,
      instruction: "Make 6 groups with 0 stars in each group.",
      summary: "6 groups of 0 = 0 total",
      pattern: "Multiplying by 0 always gives 0.",
    },
  ];

  const [roundIndex, setRoundIndex] = useState(0);
  const currentRound = buildRounds[roundIndex];

  const [groupCounts, setGroupCounts] = useState<number[]>(
    Array.from({ length: currentRound.groups }, () => 0),
  );
  const [hasChecked, setHasChecked] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<number[]>([]);

  const totalStars = groupCounts.reduce((sum, count) => sum + count, 0);
  const isZeroRound = currentRound.targetCount === 0;
  const isCorrect = groupCounts.every(
    (count) => count === currentRound.targetCount,
  );
  const canMoveNextRound = hasChecked && isCorrect;

  function getStarWord(count: number) {
    return count === 1 ? "star" : "stars";
  }

  // Resets the group boxes whenever the student changes Build It rounds.
  function resetRound(nextRoundIndex: number) {
    const nextRound = buildRounds[nextRoundIndex];

    setRoundIndex(nextRoundIndex);
    setGroupCounts(Array.from({ length: nextRound.groups }, () => 0));
    setHasChecked(false);
  }

  // For ×1 rounds, tapping a group adds/removes the one star.
  // For ×0 rounds, groups stay empty on purpose.
  function toggleGroup(index: number) {
    if (isZeroRound) {
      return;
    }

    setHasChecked(false);

    setGroupCounts((currentGroups) =>
      currentGroups.map((count, groupIndex) => {
        if (groupIndex !== index) {
          return count;
        }

        return count === currentRound.targetCount
          ? 0
          : currentRound.targetCount;
      }),
    );
  }

  // Page 2: marks the current round complete.
  // When all Build It rounds are complete, tell the parent screen to highlight the header Next button.
  function checkGroups() {
    setHasChecked(true);

    if (isCorrect && !completedRounds.includes(roundIndex)) {
      setCompletedRounds((currentCompletedRounds) => {
        const nextCompletedRounds = [...currentCompletedRounds, roundIndex];

        if (nextCompletedRounds.length === buildRounds.length) {
          onBuildComplete?.();
        }

        return nextCompletedRounds;
      });
    }
  }

  function goToNextBuildRound() {
    if (roundIndex < buildRounds.length - 1) {
      resetRound(roundIndex + 1);
    }
  }

  function goToPreviousBuildRound() {
    if (roundIndex > 0) {
      resetRound(roundIndex - 1);
    }
  }

  return (
    <>
      {/* Page 2: Build It main interactive card */}
      <main
        data-name="build-it-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* Page 2: Build It title and round badge */}
        <div
          data-name="build-it-card-header"
          className="mb-5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              👐
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">
                Build It Together
              </h2>
              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                {currentRound.instruction}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Round {roundIndex + 1} of {buildRounds.length}
          </div>
        </div>

        {/* Page 2: Interactive group boxes */}
        <div
          data-name="build-it-group-boxes-card"
          className="rounded-[1.75rem] border border-[#BFEAF0] bg-[#F7FCFD] p-4"
        >
          <div
            data-name="build-it-group-boxes-grid"
            className={`grid gap-4 ${
              currentRound.groups === 6 ? "md:grid-cols-6" : "md:grid-cols-4"
            }`}
          >
            {groupCounts.map((count, index) => (
              <button
                key={index}
                type="button"
                data-name={`build-it-group-box-${index + 1}`}
                onClick={() => toggleGroup(index)}
                disabled={isZeroRound}
                className={`flex h-28 items-center justify-center rounded-[1.35rem] border-2 transition ${
                  isZeroRound
                    ? "cursor-default border-[#42C8DC]/75 bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)]"
                    : "border-[#42C8DC] bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)] hover:scale-[1.02]"
                }`}
              >
                {count === currentRound.targetCount && !isZeroRound ? (
                  <span className="text-4xl drop-shadow-sm">⭐</span>
                ) : isZeroRound ? (
                  <div className="text-center">
                    <Sparkles
                      size={17}
                      strokeWidth={2.8}
                      className="mx-auto mb-2 text-[#A9D7E1]"
                    />
                    <p className="text-sm font-black text-[#6D9AB1]">Empty</p>
                  </div>
                ) : (
                  <p className="text-sm font-black text-[#6D9AB1]">Tap</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Page 2: Live groups/in-each/total summary */}
        <div
          data-name="build-it-summary-bar"
          className="mt-4 grid overflow-hidden rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] text-center md:grid-cols-3"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-3">
            <span className="text-2xl text-[#00AFB9]">👥</span>
            <p className="text-base font-black text-[#073B5A]">
              {currentRound.groups} groups
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="text-2xl text-[#00AFB9]">⭐</span>
            <p className="text-base font-black text-[#073B5A]">
              {currentRound.targetCount} in each
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00AFB9] text-base font-black text-white">
              =
            </span>
            <p className="text-base font-black text-[#073B5A]">
              {totalStars} total
            </p>
          </div>
        </div>

        {/* Page 2: Build It action buttons */}
        <div
          data-name="build-it-action-buttons"
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          {roundIndex > 0 && (
            <button
              type="button"
              onClick={goToPreviousBuildRound}
              className="rounded-2xl border border-[#073B5A]/10 bg-white px-7 py-3 text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              Previous
            </button>
          )}

          <button
            type="button"
            onClick={checkGroups}
            className="rounded-2xl bg-[#00AFB9] px-8 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
          >
            {isZeroRound ? "Check Empty Groups" : "Check My Groups"}
          </button>

          {roundIndex < buildRounds.length - 1 && canMoveNextRound && (
            <button
              type="button"
              onClick={goToNextBuildRound}
              className="rounded-2xl bg-[#073B5A] px-7 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#052A40]"
            >
              Next Round
            </button>
          )}
        </div>

        {/* Page 2: Result area that explains what the student built */}
        {/* Page 2: Build It compact result card */}
        <section
          data-name="build-it-result-card"
          className="mt-4 rounded-[1.5rem] border border-[#BFEAF0] bg-[#F6FCFD] p-4 shadow-sm"
        >
          <div
            data-name="build-it-result-header"
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div
                data-name="build-it-result-icon"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-xl"
              >
                💡
              </div>

              <div data-name="build-it-result-text">
                <h2 className="text-lg font-black text-[#073B5A]">
                  What did you build?
                </h2>

                <p className="mt-1 text-sm font-bold leading-relaxed text-[#275875]">
                  {hasChecked && isCorrect
                    ? isZeroRound
                      ? `You built ${currentRound.groups} equal groups with 0 stars in each.`
                      : `You built ${currentRound.groups} equal groups with 1 star in each.`
                    : hasChecked
                      ? `Almost! Each group needs exactly ${
                          currentRound.targetCount
                        } ${getStarWord(currentRound.targetCount)}.`
                      : "Build the groups, then check your work."}
                </p>
              </div>
            </div>

            {hasChecked && isCorrect && (
              <div
                data-name="build-it-result-success-badge"
                className="hidden shrink-0 rounded-full bg-white px-3 py-2 text-sm font-black text-[#0081A7] shadow-sm sm:block"
              >
                Nice!
              </div>
            )}
          </div>

          {hasChecked && isCorrect ? (
            <div
              data-name="build-it-result-success-summary"
              className="mt-4 rounded-[1.25rem] border border-white/80 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    data-name="build-it-result-star-badge"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF6D8] text-3xl shadow-inner"
                  >
                    ⭐
                  </div>

                  <div data-name="build-it-result-success-text">
                    <h3 className="text-xl font-black text-[#073B5A]">
                      {isZeroRound
                        ? `${currentRound.groups} groups of 0`
                        : `${currentRound.groups} groups of 1`}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-[#355F7C]">
                      {currentRound.summary}
                    </p>
                  </div>
                </div>

                <div
                  data-name="build-it-result-equation-chip"
                  className="rounded-2xl bg-[#E9F7F8] px-4 py-3 text-lg font-black text-[#073B5A]"
                >
                  {currentRound.groups} × {currentRound.targetCount} ={" "}
                  {currentRound.groups * currentRound.targetCount}
                </div>
              </div>
            </div>
          ) : (
            <div
              data-name="build-it-result-waiting-message"
              className={`mt-4 rounded-2xl border px-4 py-4 text-center ${
                hasChecked
                  ? "border-[#F07167]/25 bg-[#FCE9E5]"
                  : "border-dashed border-[#00AFB9]/35 bg-white"
              }`}
            >
              <p className="text-base font-black text-[#073B5A]">
                {hasChecked
                  ? "Try fixing the groups, then check again."
                  : "Your result will appear here after you check."}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Page 2: Build It right sidebar */}
      <aside data-name="build-it-right-sidebar" className="flex flex-col gap-4">
        {/* Page 2: Build progress card */}
        <section
          data-name="build-progress-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Build Progress
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Round {roundIndex + 1} of {buildRounds.length}
              </p>
            </div>

            <p className="text-sm font-black text-[#073B5A]">
              {completedRounds.length}/{buildRounds.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {buildRounds.map((round, index) => {
              const isDone = completedRounds.includes(index);
              const isCurrent = index === roundIndex;

              return (
                <button
                  key={`${round.groups}-${round.targetCount}`}
                  type="button"
                  onClick={() => resetRound(index)}
                  className={`rounded-2xl border px-2 py-3 text-center shadow-sm transition ${
                    isCurrent
                      ? "border-[#00AFB9] bg-[#E9F7F8]"
                      : isDone
                        ? "border-[#00AFB9]/30 bg-white"
                        : "border-[#073B5A]/10 bg-white"
                  }`}
                >
                  <p className="text-sm font-black text-[#073B5A]">
                    {isDone ? "✓" : index + 1}
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold text-[#073B5A]/65">
                    {round.groups}×{round.targetCount}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Page 2: Luma Tip card */}
        <section
          data-name="build-it-luma-tip-card"
          className="relative min-h-[150px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              {isZeroRound ? (
                <>
                  Leave each box
                  <br />
                  empty!
                </>
              ) : (
                <>
                  Tap each box
                  <br />
                  to add 1 star!
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* Page 2: Pattern card */}
        <section
          data-name="build-it-math-pattern-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Math Pattern
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Notice the rule
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black text-[#073B5A]">
              {currentRound.pattern}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.groups} × {currentRound.targetCount} ={" "}
                  {currentRound.groups * currentRound.targetCount}
                </p>
                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                  This round
                </p>
              </div>

              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.targetCount === 0 ? "9 × 0 = 0" : "7 × 1 = 7"}
                </p>
                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                  Same pattern
                </p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

// Page 3: See It turns the same group models into multiplication equations.

// Page 3: See It compares ×1 and ×0 side-by-side so the two rules feel connected.
function SeeItPage() {
  const examples = [
    {
      title: "Groups of 1",
      subtitle: "Each group has 1 star.",
      groups: 4,
      inEach: 1,
      equation: "4 × 1 = 4",
      sentence: "4 groups of 1 makes 4 total.",
      rule: "The total stays the same as the number of groups.",
      color: "bg-[#E9F7F8]",
      border: "border-[#00AFB9]/25",
      labelColor: "text-[#0081A7]",
      chipColor: "text-[#0081A7]",
      symbol: "⭐",
    },
    {
      title: "Groups of 0",
      subtitle: "Each group has 0 stars.",
      groups: 4,
      inEach: 0,
      equation: "4 × 0 = 0",
      sentence: "4 groups of 0 makes 0 total.",
      rule: "Empty groups have nothing to count.",
      color: "bg-[#FCE9E5]",
      border: "border-[#F07167]/25",
      labelColor: "text-[#F07167]",
      chipColor: "text-[#F07167]",
      symbol: "∅",
    },
  ];

  return (
    <>
      {/* Page 3: See It main comparison card */}
      <main
        data-name="see-it-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* Page 3: Header */}
        <div
          data-name="see-it-card-header"
          className="mb-5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              👀
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">
                See It as Math
              </h2>
              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                Compare the groups, then turn each picture into a multiplication
                equation.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Page 3 of 5
          </div>
        </div>

        {/* Page 3: Side-by-side visual comparison */}
        <div
          data-name="see-it-comparison-grid"
          className="grid gap-4 lg:grid-cols-2"
        >
          {examples.map((example, exampleIndex) => (
            <section
              key={example.title}
              data-name={`see-it-comparison-card-${exampleIndex + 1}`}
              className={`rounded-[1.75rem] border ${example.border} ${example.color} p-4 shadow-sm`}
            >
              {/* Page 3: Comparison card header */}
              <div
                data-name={`see-it-comparison-card-${exampleIndex + 1}-header`}
                className="mb-4 flex items-start justify-between gap-3"
              >
                <div>
                  <p
                    className={`text-xs font-black uppercase tracking-[0.14em] ${example.labelColor}`}
                  >
                    {example.title}
                  </p>

                  <h3 className="mt-1 text-lg font-black text-[#073B5A]">
                    {example.subtitle}
                  </h3>
                </div>

                <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#073B5A] shadow-sm">
                  {example.groups} groups
                </div>
              </div>

              {/* Page 3: Compact group visual */}
              <div
                data-name={`see-it-comparison-card-${exampleIndex + 1}-visual`}
                className="rounded-[1.35rem] border border-white/80 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: example.groups }).map(
                    (_, groupIndex) => (
                      <div key={groupIndex} className="flex items-center gap-2">
                        <div className="flex h-12 w-14 items-center justify-center rounded-2xl border border-[#00AFB9]/20 bg-[#F8FBFB] text-2xl shadow-inner">
                          {example.inEach === 0 ? (
                            <span className="text-[#9AB5C7]">∅</span>
                          ) : (
                            example.symbol
                          )}
                        </div>

                        {groupIndex < example.groups - 1 && (
                          <span className="text-lg font-black text-[#9AB5C7]">
                            +
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Page 3: Compact say/write/rule stack */}
              <div
                data-name={`see-it-comparison-card-${exampleIndex + 1}-say-write-grid`}
                className="mt-3 grid gap-2"
              >
                <div className="grid gap-2 xl:grid-cols-2">
                  <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                      Say it
                    </p>
                    <p className="mt-0.5 text-base font-black text-[#073B5A]">
                      {example.groups} groups of {example.inEach}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#073B5A] px-4 py-2.5 text-white shadow-sm">
                    <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/70">
                      Write it
                    </p>
                    <p className="mt-0.5 text-xl font-black">
                      {example.equation}
                    </p>
                  </div>
                </div>

                <div
                  data-name={`see-it-comparison-card-${exampleIndex + 1}-rule`}
                  className="rounded-2xl bg-white/80 px-4 py-2.5"
                >
                  <p className="text-sm font-black text-[#073B5A]">
                    {example.sentence}
                  </p>
                  <p className="mt-0.5 text-xs font-bold leading-relaxed text-[#073B5A]/65">
                    {example.rule}
                  </p>
                </div>
              </div>

              {/* Page 3: Rule sentence */}
            </section>
          ))}
        </div>

        {/* Page 3: Bottom connection strip */}
        <section
          data-name="see-it-connection-strip"
          className="mt-4 rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-5 py-4 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                The connection
              </p>
              <h3 className="mt-1 text-lg font-black text-[#073B5A]">
                groups × in each = total
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-2xl bg-white px-4 py-2 text-base font-black text-[#073B5A] shadow-sm">
                4 × 1 = 4
              </div>
              <div className="rounded-2xl bg-white px-4 py-2 text-base font-black text-[#073B5A] shadow-sm">
                4 × 0 = 0
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Page 3: See It right sidebar */}
      <aside data-name="see-it-right-sidebar" className="flex flex-col gap-4">
        {/* Page 3: Luma Tip card */}
        <section
          data-name="see-it-luma-tip-card"
          className="relative min-h-[150px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              Pictures can
              <br />
              become
              <br />
              equations!
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* Page 3: Compact math pattern card */}
        <section
          data-name="see-it-math-pattern-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Math Pattern
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Notice the rule
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl bg-white p-4">
            <div>
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 1 stays the same.
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                4 × 1 = 4
              </p>
            </div>

            <div className="h-px bg-[#073B5A]/10" />

            <div>
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 0 becomes 0.
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                4 × 0 = 0
              </p>
            </div>
          </div>
        </section>

        {/* Page 3: Compact remember card */}
        <section
          data-name="see-it-remember-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FCE9E5] text-[#F07167]">
              <Lightbulb size={25} strokeWidth={2.6} />
            </div>

            <h2 className="text-xl font-black text-[#F07167]">Remember</h2>
          </div>

          <p className="text-sm font-bold leading-relaxed text-[#073B5A]">
            Multiplication is a quick way to show equal groups.
          </p>

          <div className="mt-4 rounded-2xl bg-[#F8FBFB] px-4 py-3">
            <p className="text-center text-lg font-black text-[#073B5A]">
              groups × in each = total
            </p>
          </div>
        </section>
      </aside>
    </>
  );
}

function WordsPage() {
  const vocabularyWords = [
    {
      word: "equal groups",
      definition: "Same amount in each group.",
      example: "4 groups of 1",
      visual: ["⭐", "⭐", "⭐", "⭐"],
      equation: "4 groups of 1",
      color: "bg-[#E9F7F8]",
      border: "border-[#00AFB9]/25",
      labelColor: "text-[#0081A7]",
    },
    {
      word: "repeated addition",
      definition: "Adding the same number again and again.",
      example: "1 + 1 + 1 + 1",
      visual: ["1", "+", "1", "+", "1", "+", "1"],
      equation: "1 + 1 + 1 + 1 = 4",
      color: "bg-[#FFF3D9]",
      border: "border-[#F7B733]/30",
      labelColor: "text-[#C78300]",
    },
    {
      word: "factor",
      definition: "A number being multiplied.",
      example: "4 and 1 are factors",
      visual: ["4", "×", "1"],
      equation: "factor × factor",
      color: "bg-[#FCE9E5]",
      border: "border-[#F07167]/25",
      labelColor: "text-[#F07167]",
    },
    {
      word: "product",
      definition: "The answer to a multiplication problem.",
      example: "4 is the product",
      visual: ["4", "×", "1", "=", "4"],
      equation: "product = answer",
      color: "bg-[#F8FBFB]",
      border: "border-[#073B5A]/10",
      labelColor: "text-[#073B5A]",
    },
  ];

  const matchingCards = [
    {
      id: "equal-groups-visual",
      correctWord: "equal groups",
      title: "Same-size groups",
      color: "bg-[#E9F7F8]",
      border: "border-[#00AFB9]/25",
    },
    {
      id: "repeated-addition-visual",
      correctWord: "repeated addition",
      title: "Add again and again",
      color: "bg-[#FFF3D9]",
      border: "border-[#F7B733]/30",
    },
    {
      id: "factor-visual",
      correctWord: "factor",
      title: "Numbers being multiplied",
      color: "bg-[#FCE9E5]",
      border: "border-[#F07167]/25",
    },
    {
      id: "product-visual",
      correctWord: "product",
      title: "The answer",
      color: "bg-[#F8FBFB]",
      border: "border-[#073B5A]/10",
    },
  ];

  const [wordsStep, setWordsStep] = useState<"learn" | "match">("learn");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [matchMessage, setMatchMessage] = useState(
    "Tap a word choice, then tap its matching picture.",
  );

  const matchedWords = Object.values(matches);
  const matchedCount = matchedWords.length;
  const isMatchingComplete = matchedCount === matchingCards.length;

  function isWordMatched(word: string) {
    return matchedWords.includes(word);
  }

  function chooseWord(word: string) {
    if (isWordMatched(word)) {
      return;
    }

    setSelectedWord(word);
    setMatchMessage(`Now tap the picture that shows "${word}".`);
  }

  function chooseVisual(cardId: string, correctWord: string) {
    if (matches[cardId]) {
      return;
    }

    if (!selectedWord) {
      setMatchMessage(
        "Pick a word choice first, then tap its matching picture.",
      );
      return;
    }

    if (selectedWord === correctWord) {
      setMatches((currentMatches) => ({
        ...currentMatches,
        [cardId]: selectedWord,
      }));

      setSelectedWord(null);
      setMatchMessage(`Nice! "${correctWord}" matches that picture.`);
      return;
    }

    setMatchMessage(
      `Almost! Try matching "${selectedWord}" to another picture.`,
    );
  }

  function renderMatchingVisual(cardId: string) {
    if (cardId === "equal-groups-visual") {
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#00AFB9]/20 bg-white text-base shadow-inner"
            >
              ⭐
            </div>
          ))}
        </div>
      );
    }

    if (cardId === "repeated-addition-visual") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 text-base font-black text-[#073B5A]">
          {["1", "+", "1", "+", "1", "+", "1"].map((piece, index) => (
            <span
              key={`${piece}-${index}`}
              className={`flex h-7 min-w-7 items-center justify-center rounded-lg ${
                piece === "+"
                  ? "bg-transparent text-[#9AB5C7]"
                  : "bg-white px-1.5 shadow-inner"
              }`}
            >
              {piece}
            </span>
          ))}
        </div>
      );
    }

    if (cardId === "factor-visual") {
      return (
        <div className="flex items-center justify-center gap-1.5 text-lg font-black text-[#073B5A]">
          <span className="rounded-xl bg-white px-3 py-1.5 text-[#F07167] shadow-inner">
            4
          </span>
          <span className="text-[#9AB5C7]">×</span>
          <span className="rounded-xl bg-white px-3 py-1.5 text-[#F07167] shadow-inner">
            1
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1.5 text-lg font-black text-[#073B5A]">
        <span>4</span>
        <span className="text-[#9AB5C7]">×</span>
        <span>1</span>
        <span className="text-[#9AB5C7]">=</span>
        <span className="rounded-xl bg-white px-3 py-1.5 text-[#00AFB9] shadow-inner">
          4
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Page 4: Words main vocabulary and matching card */}
      <main
        data-name="words-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
      >
        {/* Page 4: Combined Math Words header and activity navigation */}
        <section
          data-name="words-header-and-navigation-card"
          className="mb-3 rounded-[1.5rem] border border-[#073B5A]/10 bg-[#F8FBFB] p-3 shadow-sm"
        >
          <div
            data-name="words-header-and-navigation-top-row"
            className="mb-3 flex flex-wrap items-start justify-between gap-3"
          >
            <div
              data-name="words-header-title-group"
              className="flex items-start gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
                <BookOpen size={26} strokeWidth={2.7} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#073B5A]">
                  Math Words
                </h2>
                <p className="mt-0.5 text-sm font-bold leading-relaxed text-[#275875]">
                  Learn each word, then match it to the picture it explains.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
              Page 4 of 5
            </div>
          </div>

          {/* Page 4: Internal Words activity navigation */}
          <div
            data-name="words-internal-step-tabs"
            className="grid gap-2 sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setWordsStep("learn")}
              data-name="words-step-learn-button"
              className={`rounded-2xl px-4 py-2.5 text-left transition ${
                wordsStep === "learn"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 1
              </p>
              <p className="mt-0.5 text-sm font-black">Learn word cards</p>
            </button>

            <button
              type="button"
              onClick={() => setWordsStep("match")}
              data-name="words-step-match-button"
              className={`rounded-2xl px-4 py-2.5 text-left transition ${
                wordsStep === "match"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 2
              </p>
              <p className="mt-0.5 text-sm font-black">Matching activity</p>
            </button>
          </div>
        </section>

        {wordsStep === "learn" ? (
          <>
            {/* Page 4: Compact vocabulary grid */}
            <div
              data-name="words-vocabulary-grid"
              className="grid gap-2.5 md:grid-cols-2"
            >
              {vocabularyWords.map((item, index) => (
                <section
                  key={item.word}
                  data-name={`words-vocabulary-card-${index + 1}`}
                  className={`rounded-[1.5rem] border ${item.border} ${item.color} p-4 shadow-sm`}
                >
                  {/* Page 4: Vocabulary card title */}
                  <div
                    data-name={`words-vocabulary-card-${index + 1}-header`}
                    className="mb-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p
                        className={`text-[0.68rem] font-black uppercase tracking-[0.14em] ${item.labelColor}`}
                      >
                        Word {index + 1}
                      </p>

                      <h3 className="mt-0.5 text-xl font-black text-[#073B5A]">
                        {item.word}
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-black text-[#00AFB9] shadow-sm">
                      ✦
                    </div>
                  </div>

                  {/* Page 4: Short definition */}
                  <p
                    data-name={`words-vocabulary-card-${index + 1}-definition`}
                    className="text-sm font-black leading-relaxed text-[#073B5A]"
                  >
                    {item.definition}
                  </p>

                  {/* Page 4: Compact visual/equation example */}
                  <div
                    data-name={`words-vocabulary-card-${index + 1}-visual`}
                    className="mt-3 rounded-2xl border border-white/80 bg-white p-3 shadow-sm"
                  >
                    <div className="flex min-h-10 flex-wrap items-center justify-center gap-1.5 text-xl font-black text-[#073B5A]">
                      {item.visual.map((piece, pieceIndex) => (
                        <span
                          key={`${item.word}-${piece}-${pieceIndex}`}
                          className={`flex min-h-8 min-w-8 items-center justify-center rounded-xl px-1.5 ${
                            piece === "+" || piece === "×" || piece === "="
                              ? "bg-transparent text-[#9AB5C7]"
                              : "bg-[#F8FBFB]"
                          }`}
                        >
                          {piece}
                        </span>
                      ))}
                    </div>

                    <p className="mt-2 text-center text-xs font-black text-[#0081A7]">
                      {item.equation}
                    </p>
                  </div>

                  {/* Page 4: Tiny example footer */}
                  <div
                    data-name={`words-vocabulary-card-${index + 1}-example`}
                    className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/75 px-3 py-2"
                  >
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#275875]/70">
                      Example
                    </p>
                    <p className="text-xs font-black text-[#073B5A]">
                      {item.example}
                    </p>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Page 4: Compact matching instruction and feedback strip */}
            <section
              data-name="words-matching-instructions"
              className="mb-3 rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Matching activity
                  </p>

                  <h3 className="mt-0.5 text-base font-black text-[#073B5A]">
                    {isMatchingComplete
                      ? "Great matching! Luma is fully charged!"
                      : matchMessage}
                  </h3>
                </div>

                {isMatchingComplete && (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#C78300] shadow-sm">
                    Full charge!
                    <Sparkles
                      size={18}
                      strokeWidth={2.7}
                      className="text-[#F7B733]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Page 4: 2x2 picture matching grid */}
            <section
              data-name="words-matching-visual-grid"
              className="grid gap-2.5 sm:grid-cols-2"
            >
              {matchingCards.map((card, index) => {
                const matchedWord = matches[card.id];
                const isMatched = Boolean(matchedWord);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => chooseVisual(card.id, card.correctWord)}
                    disabled={isMatched}
                    data-name={`words-matching-visual-card-${index + 1}`}
                    className={`min-h-[118px] rounded-[1.35rem] border ${card.border} ${card.color} p-3 text-left shadow-sm transition ${
                      isMatched
                        ? "cursor-default ring-2 ring-[#00AFB9]/25"
                        : "hover:scale-[1.01] hover:shadow-md"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                          Picture {index + 1}
                        </p>
                        <h3 className="mt-0.5 text-sm font-black text-[#073B5A]">
                          {card.title}
                        </h3>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${
                          isMatched
                            ? "bg-white text-[#0081A7]"
                            : "bg-white/75 text-[#275875]/60"
                        }`}
                      >
                        {matchedWord ? `✓ ${matchedWord}` : "Tap"}
                      </div>
                    </div>

                    <div
                      data-name={`words-matching-visual-card-${index + 1}-picture`}
                      className="flex min-h-[54px] items-center justify-center rounded-2xl bg-white/80 px-3 py-2 shadow-inner"
                    >
                      {renderMatchingVisual(card.id)}
                    </div>
                  </button>
                );
              })}
            </section>

            {/* Page 4: 2x2 word choice grid under the pictures */}
            <section
              data-name="words-matching-word-choice-grid"
              className="mt-3 grid gap-2.5 sm:grid-cols-2"
            >
              {vocabularyWords.map((item) => {
                const isSelected = selectedWord === item.word;
                const isMatched = isWordMatched(item.word);

                return (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => chooseWord(item.word)}
                    disabled={isMatched}
                    data-name={`words-matching-word-${item.word.replaceAll(
                      " ",
                      "-",
                    )}`}
                    className={`rounded-2xl border px-4 py-2.5 text-left shadow-sm transition ${
                      isMatched
                        ? "cursor-default border-[#00AFB9]/25 bg-[#E9F7F8] text-[#0081A7]"
                        : isSelected
                          ? "border-[#F7B733] bg-[#FFF3D9] text-[#073B5A] ring-2 ring-[#F7B733]/30"
                          : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] opacity-70">
                          Word choice
                        </p>
                        <p className="mt-0.5 text-sm font-black">{item.word}</p>
                      </div>

                      {isMatched && <CheckCircle2 size={18} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </section>
          </>
        )}
      </main>

      {/* Page 4: Words right sidebar */}
      <aside data-name="words-right-sidebar" className="flex flex-col gap-4">
        {/* Page 4: Dynamic Luma Tip / Charge card */}
        <section
          data-name="words-luma-charge-card"
          className="relative min-h-[155px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/30 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            {/* Page 4: Luma charge card title */}
            <div
              data-name="words-luma-charge-title-row"
              className="mb-3 flex items-center gap-2"
            >
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />

              <p className="text-lg font-black text-[#C78300]">
                {wordsStep === "match" ? "Luma’s Charge" : "Luma Tip"}
              </p>
            </div>

            {wordsStep === "match" ? (
              <div
                data-name="words-luma-charge-content"
                className="max-w-[190px]"
              >
                {/* Page 4: Luma charge progress badge */}
                <div
                  data-name="words-luma-charge-progress-box"
                  className="inline-flex items-end gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-3xl font-black leading-none text-[#073B5A]">
                    {matchedCount}
                  </span>

                  <span className="pb-0.5 text-base font-black text-[#073B5A]/70">
                    / {matchingCards.length} matched
                  </span>
                </div>

                {/* Page 4: Luma charge helper text */}
                <p className="mt-2 text-sm font-black leading-relaxed text-[#073B5A]/70">
                  {isMatchingComplete
                    ? "Full charge! Great matching."
                    : "Match words to power up Luma."}
                </p>

                {/* Page 4: Luma charge progress bar */}
                <div
                  data-name="words-luma-charge-progress-bar"
                  className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/80 shadow-inner"
                >
                  <div
                    className="h-full rounded-full bg-[#F7B733] transition-all duration-300"
                    style={{
                      width: `${(matchedCount / matchingCards.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Page 4: Regular Luma tip box */}
                <div
                  data-name="words-luma-tip-box"
                  className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm"
                >
                  Math words
                  <br />
                  explain your
                  <br />
                  thinking!
                </div>
              </>
            )}
          </div>

          {/* Page 4: Luma mascot art */}
          <div className="absolute bottom-[-34px] right-[-8px] w-32">
            <LumaAvatar
              size="lg"
              state={isMatchingComplete ? "celebrate" : "happy"}
              showEnergy={false}
            />
          </div>
        </section>
        {/* Page 4: Say It card */}
        <section
          data-name="words-say-it-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              💬
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Say It Like This
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Math talk
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3">
              <p className="text-sm font-black text-[#0081A7]">Say it</p>
              <p className="mt-1 text-xl font-black text-[#073B5A]">
                4 groups of 1
              </p>
            </div>

            <div className="rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-3">
              <p className="text-sm font-black text-[#0081A7]">Write it</p>
              <p className="mt-1 text-xl font-black text-[#073B5A]">
                4 × 1 = 4
              </p>
            </div>
          </div>
        </section>

        {/* Page 4: Mini Pattern card */}
        <section
          data-name="words-mini-pattern-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Mini Pattern
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Keep it straight
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-center text-lg font-black text-[#073B5A]">
                groups × in each = total
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-center text-lg font-black text-[#073B5A]">
                factor × factor = product
              </p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

// Page 5: Quick Check is a short confidence check, not a full quiz.
function QuickCheckPage({ starName }: { starName?: string }) {
  const quickCheckQuestions = [
    {
      prompt: "5 groups of 1",
      equationStart: "5 × 1 =",
      productPrompt: "Product:",
      choices: ["0", "1", "5"],
      correctAnswer: "5",
      hint: "Multiplying by 1 keeps the number the same.",
      success: "Yes! 5 groups of 1 makes 5 total.",
      visualGroups: 5,
      visualCount: 1,
    },
    {
      prompt: "5 groups of 0",
      equationStart: "5 × 0 =",
      productPrompt: "Product:",
      choices: ["0", "1", "5"],
      correctAnswer: "0",
      hint: "Each group is empty, so there are no items to count.",
      success: "Correct! 5 empty groups makes 0 total.",
      visualGroups: 5,
      visualCount: 0,
    },
    {
      prompt: "In 4 × 1 = 4, what is the product?",
      equationStart: "4 × 1 = 4",
      productPrompt: "Product:",
      choices: ["4", "1", "×"],
      correctAnswer: "4",
      hint: "The product is the answer to a multiplication problem.",
      success: "Nice! The product is 4.",
      visualGroups: 4,
      visualCount: 1,
    },
  ];

  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});

  const correctCount = quickCheckQuestions.filter(
    (question, index) => selectedAnswers[index] === question.correctAnswer,
  ).length;

  const isComplete = correctCount === quickCheckQuestions.length;

  function chooseAnswer(questionIndex: number, answer: string) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answer,
    }));
  }

  return (
    <>
      {/* Page 5: Quick Check main interaction card */}
      <main
        data-name="quick-check-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        <div
          data-name="quick-check-card-header"
          className="mb-5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              ✅
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">
                Quick Check
              </h2>
              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                Connect the groups, equation, and product. This is a quick
                confidence check before Try It.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            {correctCount}/{quickCheckQuestions.length} correct
          </div>
        </div>

        {/* Page 5: Quick Check question list */}
        <div data-name="quick-check-question-list" className="grid gap-4">
          {quickCheckQuestions.map((question, questionIndex) => {
            const selectedAnswer = selectedAnswers[questionIndex];
            const hasAnswered = selectedAnswer !== undefined;
            const isCorrect = selectedAnswer === question.correctAnswer;

            return (
              <section
                key={question.prompt}
                data-name={`quick-check-question-${questionIndex + 1}-card`}
                className={`rounded-[1.75rem] border p-4 shadow-sm ${
                  isCorrect
                    ? "border-[#00AFB9]/25 bg-[#E9F7F8]"
                    : hasAnswered
                      ? "border-[#F07167]/25 bg-[#FCE9E5]"
                      : "border-[#073B5A]/10 bg-[#F8FBFB]"
                }`}
              >
                <div
                  data-name={`quick-check-question-${questionIndex + 1}-header`}
                  className="mb-4 flex flex-wrap items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                      Check {questionIndex + 1}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-[#073B5A]">
                      {question.prompt}
                    </h3>
                  </div>

                  {isCorrect && (
                    <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-black text-[#0081A7] shadow-sm">
                      <CheckCircle2 size={17} strokeWidth={3} />
                      Got it
                    </div>
                  )}
                </div>

                <div
                  data-name={`quick-check-question-${questionIndex + 1}-visual`}
                  className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-[#073B5A]">
                    {Array.from({ length: question.visualGroups }).map(
                      (_, groupIndex) => (
                        <div
                          key={groupIndex}
                          className="flex items-center gap-2"
                        >
                          <div className="flex h-12 w-16 items-center justify-center rounded-2xl border border-[#00AFB9]/20 bg-[#F8FBFB] text-2xl shadow-inner">
                            {question.visualCount === 0 ? (
                              <span className="text-[#9AB5C7]">∅</span>
                            ) : (
                              "⭐"
                            )}
                          </div>

                          {groupIndex < question.visualGroups - 1 && (
                            <span className="text-[#9AB5C7]">+</span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div
                  data-name={`quick-check-question-${questionIndex + 1}-answer-row`}
                  className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"
                >
                  <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                      Complete the chain
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xl font-black text-[#073B5A]">
                      <span>{question.equationStart}</span>

                      <span
                        className={`flex min-h-11 min-w-16 items-center justify-center rounded-2xl px-4 ${
                          hasAnswered
                            ? isCorrect
                              ? "bg-[#E9F7F8] text-[#0081A7]"
                              : "bg-[#FCE9E5] text-[#F07167]"
                            : "bg-[#F1F5F7] text-[#9AB5C7]"
                        }`}
                      >
                        {selectedAnswer ?? "?"}
                      </span>

                      <span className="text-base text-[#275875]">
                        {question.productPrompt}
                      </span>

                      <span
                        className={`flex min-h-11 min-w-16 items-center justify-center rounded-2xl px-4 ${
                          hasAnswered
                            ? isCorrect
                              ? "bg-[#E9F7F8] text-[#0081A7]"
                              : "bg-[#FCE9E5] text-[#F07167]"
                            : "bg-[#F1F5F7] text-[#9AB5C7]"
                        }`}
                      >
                        {selectedAnswer ?? "?"}
                      </span>
                    </div>
                  </div>

                  <div
                    data-name={`quick-check-question-${questionIndex + 1}-choices`}
                    className="grid grid-cols-3 gap-2 lg:min-w-[230px]"
                  >
                    {question.choices.map((choice) => {
                      const isSelected = selectedAnswer === choice;
                      const isCorrectChoice = choice === question.correctAnswer;

                      return (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => chooseAnswer(questionIndex, choice)}
                          className={`rounded-2xl border px-4 py-4 text-xl font-black shadow-sm transition hover:scale-[1.02] ${
                            isSelected && isCorrectChoice
                              ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                              : isSelected
                                ? "border-[#F07167] bg-[#F07167] text-white"
                                : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hasAnswered && (
                  <div
                    data-name={`quick-check-question-${questionIndex + 1}-feedback`}
                    className={`mt-4 rounded-2xl border px-4 py-3 ${
                      isCorrect
                        ? "border-[#00AFB9]/25 bg-white"
                        : "border-[#F07167]/25 bg-white"
                    }`}
                  >
                    <p className="text-sm font-black text-[#073B5A]">
                      {isCorrect ? question.success : question.hint}
                    </p>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {isComplete && (
          <section
            data-name="quick-check-complete-card"
            className="mt-5 rounded-[1.75rem] border border-[#00AFB9]/25 bg-[#E9F7F8] p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                  Learn complete
                </p>

                <h3 className="mt-1 text-2xl font-black text-[#073B5A]">
                  Nice work — you connected the whole chain!
                </h3>

                <p className="mt-2 text-base font-bold leading-relaxed text-[#275875]">
                  You used groups, equations, math words, and products.{" "}
                  {starName || "Your star"} thinks you’re ready for Try It.
                </p>
              </div>

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-sm">
                ⭐
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Page 5: Quick Check right sidebar */}
      <aside
        data-name="quick-check-right-sidebar"
        className="flex flex-col gap-4"
      >
        <section
          data-name="quick-check-luma-tip-card"
          className="relative min-h-[150px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              Use the rule
              <br />
              before you
              <br />
              count!
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        <section
          data-name="quick-check-progress-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Check Progress
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Quick finish
              </p>
            </div>

            <p className="text-lg font-black text-[#0081A7]">
              {correctCount}/{quickCheckQuestions.length}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickCheckQuestions.map((question, index) => {
              const isDone = selectedAnswers[index] === question.correctAnswer;
              const hasAnswered = selectedAnswers[index] !== undefined;

              return (
                <div
                  key={question.prompt}
                  className={`rounded-2xl border px-3 py-4 text-center shadow-sm ${
                    isDone
                      ? "border-[#00AFB9]/30 bg-[#E9F7F8]"
                      : hasAnswered
                        ? "border-[#F07167]/30 bg-[#FCE9E5]"
                        : "border-[#073B5A]/10 bg-[#F8FBFB]"
                  }`}
                >
                  <p className="text-lg font-black text-[#073B5A]">
                    {isDone ? "✓" : index + 1}
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold text-[#073B5A]/65">
                    Check
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section
          data-name="quick-check-rule-reminder-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Rule Reminder
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Two patterns
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 1 = the same number
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                5 × 1 = 5
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 0 = 0
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                5 × 0 = 0
              </p>
            </div>
          </div>
        </section>

        {isComplete && (
          <section
            data-name="quick-check-ready-card"
            className="rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Sparkles
                size={24}
                strokeWidth={2.7}
                className="shrink-0 text-[#F7B733]"
              />

              <div>
                <h2 className="text-xl font-black text-[#073B5A]">
                  Ready for Try It
                </h2>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
                  Press the next arrow in the Learn header to finish this Learn
                  section.
                </p>
              </div>
            </div>
          </section>
        )}
      </aside>
    </>
  );
}

// Floating hint shown only when the current Learn page can scroll further down.
function ScrollMoreHint({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      data-name="scroll-more-hint"
      className="pointer-events-none fixed bottom-24 right-8 z-40 hidden xl:block"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#073B5A]/10 bg-white/95 text-2xl font-black text-[#0081A7] shadow-lg backdrop-blur">
        <span className="animate-bounce leading-none">↓</span>
      </div>
    </div>
  );
}

// Main Learn screen shell: routes between the five Learn phases and owns page-level navigation.
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

  const [currentStep, setCurrentStep] = useState(0);
  const [isCompactHeader, setIsCompactHeader] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Learn flow: turns on the pulsing header Next button after all Build It rounds are done.
  const [isBuildItComplete, setIsBuildItComplete] = useState(false);

  const topSentinelRef = useRef<HTMLDivElement | null>(null);

  const pageContentRef = useRef<HTMLDivElement | null>(null);

  const starName = getStarProfile(CURRENT_STUDENT_ID).starName;

  // Chooses the active Learn phase based on the current header stepper position.
  const page = useMemo(() => {
    if (currentStep === 0) {
      return <BigIdeaPage />;
    }

    if (currentStep === 1) {
      return <BuildItPage onBuildComplete={() => setIsBuildItComplete(true)} />;
    }

    if (currentStep === 2) {
      return <SeeItPage />;
    }

    if (currentStep === 3) {
      return <WordsPage />;
    }

    return <QuickCheckPage starName={starName} />;
  }, [currentStep, starName]);

  // Shrinks the header after the top sentinel scrolls out of view.
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
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Shows the scroll hint when the active Learn phase has more content below the fold.
  useEffect(() => {
    const pageContent = pageContentRef.current;

    if (!pageContent) {
      return;
    }

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

    const scrollElement = getScrollParent(pageContent);

    const checkScrollPosition = () => {
      const hasScrollableContent =
        scrollElement.scrollHeight > scrollElement.clientHeight + 24;

      const isNearBottom =
        scrollElement.scrollTop + scrollElement.clientHeight >=
        scrollElement.scrollHeight - 96;

      setShowScrollHint(hasScrollableContent && !isNearBottom);
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

  // Keeps each Learn phase starting at the top when the student changes pages.
  function scrollLearnPageToTop() {
    const pageContent = pageContentRef.current;

    if (!pageContent) {
      return;
    }

    let scrollElement = pageContent.parentElement;

    while (scrollElement) {
      const styles = window.getComputedStyle(scrollElement);
      const overflowY = styles.overflowY;

      if (overflowY === "auto" || overflowY === "scroll") {
        break;
      }

      scrollElement = scrollElement.parentElement;
    }

    const target = scrollElement ?? document.documentElement;

    requestAnimationFrame(() => {
      target.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Sends the student back to the parent Lesson screen.
  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`);
  }

  // Advances the Learn phase, or marks Learn complete when the last page is done.
  function goNext() {
    if (currentStep >= learnSteps.length - 1) {
      updateLessonProgress(currentLessonId, {
        learnComplete: true,
      });

      navigate(`/lesson/${currentLessonId}`);
      return;
    }

    setCurrentStep((current) => current + 1);
    scrollLearnPageToTop();
  }

  // Moves backward through Learn, or returns to Lesson from the first page.
  function goBack() {
    if (currentStep === 0) {
      backToLesson();
      return;
    }

    setCurrentStep((current) => current - 1);
    scrollLearnPageToTop();
  }

  return (
    <PageLayout>
      {/* Learn screen: sticky header plus the active Learn phase content */}
      <div
        ref={pageContentRef}
        data-name="learn-screen-wrapper"
        className="flex min-h-0 flex-col gap-4 pb-0"
      >
        <div
          ref={topSentinelRef}
          data-name="learn-top-sentinel"
          className="h-0"
        />

        {/* Learn screen: sticky top header with back button, page label, and stepper */}
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

            <div
              data-name="learn-header-stepper-nav"
              className="hidden xl:block"
            >
              {/* Learn header: stepper navigation with completion highlight */}
              <LearnStepper
                currentStep={currentStep}
                onPrevious={goBack}
                onNext={goNext}
                isNextHighlighted={currentStep === 1 && isBuildItComplete}
              />
            </div>
          </div>
        </header>

        {/* Learn screen: active page content grid */}

        {/* Learn screen: active page content grid */}
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
