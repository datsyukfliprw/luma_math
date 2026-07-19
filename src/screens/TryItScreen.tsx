// @SECTION TRYIT_IMPORTS
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Lightbulb, Lock } from "lucide-react";

import PageLayout from "../components/layout/PageLayout";
import LumaAvatar from "../components/luma/LumaAvatar";
import { getLessonById } from "../lib/lessonLookup";
import { updateLessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";
import { requireLessonExperience } from "../data/lessonExperience";

const CURRENT_STUDENT_ID = "default-student";

// @SECTION TRYIT_TYPES
type TryItStepKey = "groups" | "inEach" | "equation";

type TryItProblem = {
  story: string;
  question: string;
  groups: string;
  inEach: string;
  total: string;
  groupLabel: string;
  inEachLabel: string;
  visualEmoji: string;
  visualEmpty?: boolean;
  equation: string;
  groupsChoices: string[];
  inEachChoices: string[];
  equationChoices: string[];
  successMessage: string;
  tip: string;
};

type ProblemAnswers = Partial<Record<TryItStepKey, string>>;

// @SECTION TRYIT_LESSON_ID_HELPER
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

// @SECTION TRYIT_CHOICE_CLASS
function getChoiceClass(
  currentAnswers: ProblemAnswers,
  step: TryItStepKey,
  choice: string,
  correct: string,
  isLocked = false,
) {
  const selected = currentAnswers[step];
  const isSelected = selected === choice;
  const isCorrect = choice === correct;

  if (isLocked) {
    return "cursor-not-allowed border-[#073B5A]/10 bg-[#F8FBFB] text-[#073B5A]/45";
  }

  if (isSelected && isCorrect) {
    return "border-[#00AFB9] bg-[#E9F7F8] text-[#073B5A] ring-2 ring-[#00AFB9]/20";
  }

  if (isSelected && !isCorrect) {
    return "border-[#F07167] bg-[#FCE9E5] text-[#F07167] ring-2 ring-[#F07167]/15";
  }

  return "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#F8FBFB]";
}

// @SECTION TRYIT_CHOICE_GROUP
type ChoiceGroupProps = {
  step: TryItStepKey;
  correct: string;
  choices: string[];
  currentAnswers: ProblemAnswers;
  onChoose: (step: TryItStepKey, choice: string) => void;
  isEquation?: boolean;
  isLocked?: boolean;
};

function ChoiceGroup({
  step,
  correct,
  choices,
  currentAnswers,
  onChoose,
  isEquation = false,
  isLocked = false,
}: ChoiceGroupProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2.5">
      {choices.map((choice) => {
        const isSelected = currentAnswers[step] === choice;
        const isCorrectSelected = isSelected && choice === correct;
        const isWrongSelected = isSelected && choice !== correct;

        return (
          <button
            key={choice}
            type="button"
            onClick={() => onChoose(step, choice)}
            disabled={isLocked}
            className={`relative rounded-2xl border text-center font-black shadow-sm transition ${
              isLocked ? "" : "hover:scale-[1.02]"
            } ${
              isEquation ? "min-w-[120px] px-5 py-3 text-base" : "min-w-[72px] px-5 py-3 text-lg"
            } ${getChoiceClass(currentAnswers, step, choice, correct, isLocked)}`}
          >
            {choice}

            {isCorrectSelected && (
              <CheckCircle2
                size={17}
                strokeWidth={3}
                className="absolute -right-1 -top-1 rounded-full bg-[#7CCB5B] text-white"
              />
            )}

            {isWrongSelected && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#F07167] text-xs text-white">
                ×
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// @SECTION TRYIT_SCREEN
function TryItScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);

  const currentLessonId = getCurrentLessonId({
    lessonId,
    unitNumber: unit.unit_number,
    weekNumber: week.week_number,
    dayNumber: weekDayNumber,
  });

  const starName = getStarProfile(CURRENT_STUDENT_ID).starName;
  const tryItExperience = requireLessonExperience(currentLessonId).tryIt;
  const tryItProblems: TryItProblem[] = tryItExperience.problems;
  const REQUIRED_TRY_IT_COUNT = tryItExperience.requiredCount;

  // @SECTION TRYIT_STATE
  const [problemIndex, setProblemIndex] = useState(0);
  const [answersByProblem, setAnswersByProblem] = useState<Record<number, ProblemAnswers>>({});

  const currentProblem = tryItProblems[problemIndex % tryItProblems.length];
  const currentAnswers = useMemo(
    () => answersByProblem[problemIndex] ?? {},
    [answersByProblem, problemIndex],
  );

  const isRequiredRound = problemIndex < REQUIRED_TRY_IT_COUNT;
  const isFinalRequiredProblem = problemIndex >= REQUIRED_TRY_IT_COUNT - 1;
  const displayProblemNumber = isRequiredRound
    ? problemIndex + 1
    : `Extra ${problemIndex - REQUIRED_TRY_IT_COUNT + 1}`;

  const problemBadgeText = isRequiredRound
    ? `Problem ${displayProblemNumber} of ${REQUIRED_TRY_IT_COUNT}`
    : `Extra Problem ${problemIndex - REQUIRED_TRY_IT_COUNT + 1}`;

  const correctStepCount = useMemo(() => {
    const requiredAnswers: Record<TryItStepKey, string> = {
      groups: currentProblem.groups,
      inEach: currentProblem.inEach,
      equation: currentProblem.equation,
    };

    return (Object.keys(requiredAnswers) as TryItStepKey[]).filter(
      (step) => currentAnswers[step] === requiredAnswers[step],
    ).length;
  }, [currentAnswers, currentProblem]);

  const isGroupsCorrect = currentAnswers.groups === currentProblem.groups;
  const isInEachCorrect = currentAnswers.inEach === currentProblem.inEach;
  const isEquationUnlocked = isGroupsCorrect && isInEachCorrect;
  const isProblemComplete = correctStepCount === 3;

  const completedRequiredCount = Math.min(
    problemIndex + (isProblemComplete && isRequiredRound ? 1 : 0),
    REQUIRED_TRY_IT_COUNT,
  );

  // @SECTION TRYIT_HELPERS
  function chooseAnswer(step: TryItStepKey, value: string) {
    if (step === "equation" && !isEquationUnlocked) {
      return;
    }

    setAnswersByProblem((current) => ({
      ...current,
      [problemIndex]: {
        ...(current[problemIndex] ?? {}),
        [step]: value,
      },
    }));
  }

  function goToNextProblem() {
    setProblemIndex((current) => current + 1);
  }

  function continueToPractice() {
    updateLessonProgress(currentLessonId, {
      tryItComplete: true,
    });

    navigate(`/practice/${currentLessonId}`);
  }

  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`);
  }

  return (
    <PageLayout>
      {/* @SECTION TRYIT_SCREEN_LAYOUT */}
      <div data-name="try-it-screen-wrapper" className="flex min-h-0 flex-col gap-4">
        {/* @SECTION TRYIT_HEADER */}
        <header
          data-name="try-it-header"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white/95 px-4 py-3 shadow-sm backdrop-blur"
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={backToLesson}
                data-name="try-it-back-button"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm transition hover:bg-[#E9F7F8]"
              >
                <ArrowLeft size={18} strokeWidth={3} />
                Back to Lesson
              </button>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#073B5A] text-lg font-black text-white shadow-sm">
                3
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="text-xl font-black text-[#073B5A]">Try It</h1>

                  <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                  <p className="text-sm font-black text-[#00AFB9]">Guided word problem</p>

                  <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                  <div className="flex items-center gap-1.5 text-sm font-black text-[#275875]">
                    <Clock3 size={16} strokeWidth={2.7} />
                    10 min
                  </div>
                </div>

                <p className="mt-1 truncate text-base font-black text-[#073B5A]">
                  {lesson.lesson_title}
                </p>
              </div>
            </div>

            {/* @SECTION TRYIT_HEADER_STEPPER */}
            <div className="hidden items-center gap-2 xl:flex">
              {["Warm-Up", "Learn", "Try It", "Practice"].map((label, index) => {
                const isDone = index < 2;
                const isActive = index === 2;

                return (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
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
                        className={`mt-1 whitespace-nowrap text-center text-[0.68rem] font-black ${
                          isActive ? "text-[#073B5A]" : "text-[#275875]/75"
                        }`}
                      >
                        {label}
                      </p>
                    </div>

                    {index < 3 && (
                      <div className="mt-[-18px] h-0.5 w-10 border-t-2 border-dashed border-[#9AB5C7]/45" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* @SECTION TRYIT_CONTENT_GRID */}
        <section
          data-name="try-it-content-grid"
          className="grid items-start gap-5 xl:grid-cols-[1.55fr_0.7fr]"
        >
          {/* @SECTION TRYIT_MAIN_CARD */}
          <main
            data-name="try-it-main-card"
            className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
          >
            {/* @SECTION TRYIT_MAIN_HEADER */}
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDF7F8] text-2xl">
                  🙌
                </div>

                <div>
                  <h2 className="text-2xl font-black text-[#073B5A]">Try It Together</h2>

                  <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                    Help {starName} solve one word problem at a time.
                  </p>
                </div>
              </div>

              {/* @SECTION TRYIT_PROGRESS_STRIP */}
              <div className="min-w-[260px] rounded-full border border-[#073B5A]/10 bg-white px-4 py-2 shadow-sm">
                <p className="mb-1 text-center text-sm font-black text-[#0081A7]">
                  Try It Progress
                </p>

                <div className="flex items-center justify-center gap-2">
                  {Array.from({ length: REQUIRED_TRY_IT_COUNT }).map((_, index) => {
                    const isComplete = index < completedRequiredCount;

                    return (
                      <div
                        key={index}
                        className={`flex h-9 w-9 items-center justify-center rounded-2xl text-xl shadow-inner ${
                          isComplete ? "bg-[#FFF3D9] text-[#F7B733]" : "bg-[#EEF3F5] text-[#C7D6DF]"
                        }`}
                      >
                        ★
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* @SECTION TRYIT_STORY_SCENE */}
            <section className="relative overflow-hidden rounded-[1.75rem] border border-[#F7B733]/25 bg-[#FFF7DD] shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_17%_20%,rgba(255,255,255,0.9),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(0,175,185,0.18),transparent_34%)]" />

              <div className="relative grid min-h-[185px] items-stretch overflow-hidden xl:grid-cols-[0.9fr_1.1fr]">
                <div className="flex flex-col justify-center px-7 py-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[#C78300]">
                    {problemBadgeText}
                  </p>

                  <p className="text-2xl font-black leading-relaxed text-[#073B5A]">
                    {currentProblem.story}
                  </p>

                  <p className="mt-1 text-2xl font-black leading-relaxed text-[#073B5A]">
                    {currentProblem.question}
                  </p>
                </div>

                <div className="relative flex min-h-[185px] items-center justify-center overflow-hidden bg-[#DDF7F8]/70 px-5 py-5">
                  <div className="absolute left-6 top-6 h-12 w-20 rounded-full bg-white/60 blur-sm" />
                  <div className="absolute right-8 top-8 h-14 w-24 rounded-full bg-white/55 blur-sm" />
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-[#FED9B7]/45" />

                  <span className="absolute left-5 top-5 text-xl text-[#F7B733]">✦</span>
                  <span className="absolute right-7 top-8 text-xl text-[#F7B733]">✦</span>
                  <span className="absolute bottom-8 left-12 text-lg text-[#F07167]">✦</span>

                  <div className="relative z-10 flex flex-wrap justify-center gap-2.5">
                    {Array.from({ length: Number(currentProblem.groups) }).map((_, index) => (
                      <div
                        key={index}
                        className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#00AFB9]/20 bg-white/92 text-3xl shadow-[0_10px_20px_rgba(7,59,90,0.10)]"
                      >
                        {currentProblem.visualEmpty ? (
                          <span className="text-[#9AB5C7]">∅</span>
                        ) : (
                          currentProblem.visualEmoji
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* @SECTION TRYIT_GUIDED_STEPS */}
            <section className="mt-4 grid gap-3">
              <div className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#F5FCFD] px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-[245px] items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-lg font-black text-white">
                      1
                    </span>

                    <div>
                      <p className="text-base font-black text-[#073B5A]">How many groups?</p>

                      <p className="mt-1 text-sm font-bold leading-relaxed text-[#073B5A]/65">
                        Look for how many equal groups are in the story.
                      </p>
                    </div>
                  </div>

                  <ChoiceGroup
                    step="groups"
                    correct={currentProblem.groups}
                    choices={currentProblem.groupsChoices}
                    currentAnswers={currentAnswers}
                    onChoose={chooseAnswer}
                  />
                </div>
              </div>

              <div
                className={`rounded-[1.5rem] border px-4 py-4 shadow-sm ${
                  isGroupsCorrect
                    ? "border-[#00AFB9]/20 bg-[#F5FCFD]"
                    : "border-[#073B5A]/10 bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-[245px] items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                        isGroupsCorrect ? "bg-[#00AFB9] text-white" : "bg-[#E6EEF2] text-[#6D9AB1]"
                      }`}
                    >
                      2
                    </span>

                    <div>
                      <p className="text-base font-black text-[#073B5A]">How many in each group?</p>

                      <p className="mt-1 text-sm font-bold leading-relaxed text-[#073B5A]/65">
                        Find the amount inside each group.
                      </p>
                    </div>
                  </div>

                  <ChoiceGroup
                    step="inEach"
                    correct={currentProblem.inEach}
                    choices={currentProblem.inEachChoices}
                    currentAnswers={currentAnswers}
                    onChoose={chooseAnswer}
                  />
                </div>
              </div>

              <div
                className={`rounded-[1.5rem] border px-4 py-4 shadow-sm ${
                  isEquationUnlocked
                    ? "border-[#00AFB9]/20 bg-[#F5FCFD]"
                    : "border-[#073B5A]/10 bg-[#F8FBFB]"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex min-w-[245px] items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                        isEquationUnlocked ? "bg-[#00AFB9] text-white" : "bg-[#6D7C86] text-white"
                      }`}
                    >
                      3
                    </span>

                    <div>
                      <p className="text-base font-black text-[#073B5A]">Which equation matches?</p>

                      <p className="mt-1 text-sm font-bold leading-relaxed text-[#073B5A]/65">
                        Match groups × in each = total.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ChoiceGroup
                      step="equation"
                      correct={currentProblem.equation}
                      choices={currentProblem.equationChoices}
                      isEquation
                      isLocked={!isEquationUnlocked}
                      currentAnswers={currentAnswers}
                      onChoose={chooseAnswer}
                    />

                    {!isEquationUnlocked && (
                      <Lock size={18} strokeWidth={2.8} className="text-[#6D7C86]" />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* @SECTION TRYIT_FEEDBACK */}
            <section
              className={`mt-4 rounded-[1.5rem] border px-5 py-4 shadow-sm ${
                isProblemComplete
                  ? "border-[#7CCB5B]/25 bg-[#EEF9EA]"
                  : "border-[#F7B733]/25 bg-[#FFF3D9]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-black shadow-sm ${
                      isProblemComplete ? "bg-[#FFF3D9] text-[#F7B733]" : "bg-white text-[#F7B733]"
                    }`}
                  >
                    {isProblemComplete ? "🌟" : "⭐"}
                  </div>

                  <div>
                    <p className="text-lg font-black text-[#073B5A]">
                      {isProblemComplete
                        ? `${currentProblem.successMessage} 🎉`
                        : "Pick one answer for each step."}
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
                      {isProblemComplete
                        ? "You used the word problem clues to write the equation."
                        : `${correctStepCount} of 3 steps are correct.`}
                    </p>
                  </div>
                </div>

                {isProblemComplete && (
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    {isFinalRequiredProblem ? (
                      <>
                        <button
                          type="button"
                          onClick={continueToPractice}
                          className="rounded-2xl bg-[#00AFB9] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                        >
                          Continue to Practice ›
                        </button>

                        <button
                          type="button"
                          onClick={goToNextProblem}
                          className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#0081A7] shadow-sm transition hover:bg-[#F8FBFB]"
                        >
                          ↻ Try Another
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={goToNextProblem}
                          className="rounded-2xl bg-[#00AFB9] px-8 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                        >
                          Next ›
                        </button>

                        <button
                          type="button"
                          onClick={goToNextProblem}
                          className="rounded-2xl border border-transparent bg-transparent px-3 py-2 text-sm font-black text-[#0081A7] transition hover:bg-white/55"
                        >
                          ↻ Try Another
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* @SECTION TRYIT_SIDEBAR */}
          <aside data-name="try-it-sidebar" className="flex flex-col gap-4">
            {/* @SECTION TRYIT_STAR_TIP */}
            <section className="relative min-h-[210px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.78),transparent_28%)]" />

              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7B733] text-white">
                    💬
                  </div>

                  <p className="text-lg font-black text-[#C78300]">{starName} Says</p>
                </div>

                <div className="relative w-fit max-w-[210px] rounded-2xl bg-white px-5 py-4 text-lg font-black leading-tight text-[#073B5A] shadow-sm">
                  Look for
                  <br />
                  groups, in each,
                  <br />
                  and total.
                  <span className="absolute -right-3 top-10 h-6 w-6 rotate-45 bg-white" />
                </div>

                <p className="mt-4 max-w-[230px] text-sm font-bold leading-relaxed text-[#073B5A]/75">
                  {currentProblem.tip}
                </p>
              </div>

              <span className="absolute right-16 top-10 text-2xl text-[#F7B733]">✦</span>
              <span className="absolute right-7 top-20 text-xl text-[#F7B733]">✦</span>

              <div className="absolute bottom-[-35px] right-[-18px] w-40">
                <LumaAvatar size="lg" state="happy" showEnergy={false} />
              </div>
            </section>

            {/* @SECTION TRYIT_CLUES_CARD */}
            <section className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#00AFB9] shadow-sm">
                  <Lightbulb size={24} strokeWidth={2.6} />
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#073B5A]">Word Problem Clues</h2>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Use the story
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-2xl">🪴</span>
                  <p className="text-sm font-black text-[#073B5A]">
                    Groups = {currentProblem.groupLabel}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-2xl">{currentProblem.visualEmoji}</span>
                  <p className="text-sm font-black text-[#073B5A]">
                    In each = {currentProblem.inEachLabel}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-2xl">⭐</span>
                  <p className="text-sm font-black text-[#073B5A]">Total = all together</p>
                </div>
              </div>
            </section>

            {/* @SECTION TRYIT_MATH_WORDS */}
            <section className="rounded-[1.5rem] border border-[#9C7BF2]/20 bg-[#F7F1FF] p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                  📖
                </div>

                <div>
                  <h2 className="text-xl font-black text-[#073B5A]">Math Words</h2>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#7B56D9]">
                    Today’s helpers
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {["equal groups", "factor", "product"].map((word) => (
                  <span
                    key={word}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#7B56D9] shadow-sm"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}

export default TryItScreen;
