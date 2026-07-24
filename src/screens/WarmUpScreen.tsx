import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import { getLessonById } from "../lib/lessonLookup";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { WarmUpData, WarmUpQuestion } from "../types/warmup";
import { getWarmUpRounds } from "../types/warmup";

type LessonWithWarmUp = {
  warmup?: WarmUpData;
};

function isNumericString(value: string): boolean {
  const normalized = normalizeNumericAnswer(value);
  return normalized.length > 0 && !Number.isNaN(Number(normalized));
}

function normalizeForQuestion(answer: string, expected: string): string {
  return isNumericString(expected) ? normalizeNumericAnswer(answer) : normalizeTextAnswer(answer);
}

function getFallbackWarmup(): WarmUpData {
  return {
    title: "Warm-Up",
    estimated_minutes: 5,
    instructions: "Review a few familiar skills before today’s lesson.",
    rounds: [
      {
        id: "quick_recall",
        title: "Quick Recall",
        description: "Fast review to warm up your brain!",
        questions: [
          {
            id: "fallback-1",
            prompt: "Count by 2s: 2, 4, 6, __",
            correct_answer: "8",
            hint: "Add 2 to the last number.",
            skill: "skip_counting",
          },
          {
            id: "fallback-2",
            prompt: "What is 5 + 0?",
            correct_answer: "5",
            hint: "Adding zero keeps the number the same.",
            skill: "zero_review",
          },
          {
            id: "fallback-3",
            prompt: "What is 7 + 1?",
            correct_answer: "8",
            hint: "Adding one means count up one.",
            skill: "one_more",
          },
        ],
      },
    ],
  };
}

function flattenQuestions(rounds: ReturnType<typeof getWarmUpRounds>) {
  return rounds.flatMap((round, roundIndex) =>
    round.questions.map((question) => ({
      ...question,
      roundIndex,
      roundTitle: round.title,
      roundDescription: round.description,
    })),
  );
}

function WarmUpScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);
  const structuredLesson = lesson as typeof lesson & LessonWithWarmUp;

  const currentLessonId =
    lessonId ?? `g3-u${unit.unit_number}-w${week.week_number}-l${weekDayNumber}`;

  const warmup = structuredLesson.warmup ?? getFallbackWarmup();
  const rounds = getWarmUpRounds(warmup);
  const questions = useMemo(() => flattenQuestions(rounds), [rounds]);

  const { updateLessonProgress } = useStudentProgress();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const activeQuestion = questions[questionIndex] as
    | (WarmUpQuestion & {
        roundIndex: number;
        roundTitle: string;
        roundDescription: string;
      })
    | undefined;

  const totalQuestions = questions.length;
  const currentRound = rounds[activeQuestion?.roundIndex ?? 0];
  const isLastQuestion = questionIndex >= totalQuestions - 1;
  const progressPercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isTransitioning = feedback === "correct";

  function finishWarmUp() {
    updateLessonProgress(currentLessonId, {
      warmupComplete: true,
    });

    window.setTimeout(() => {
      navigate(`/lesson/${currentLessonId}`);
    }, 900);
  }

  function goToNextQuestion() {
    window.setTimeout(() => {
      if (isLastQuestion) {
        finishWarmUp();
        return;
      }

      setQuestionIndex((current) => current + 1);
      setAnswer("");
      setFeedback(null);
      setShowHint(false);
    }, 900);
  }

  function checkAnswer() {
    if (!activeQuestion || isTransitioning) {
      return;
    }

    const expected = activeQuestion.correct_answer;
    const userAnswer = normalizeForQuestion(answer, expected);
    const correctAnswer = normalizeForQuestion(expected, expected);

    if (userAnswer === correctAnswer) {
      setFeedback("correct");
      setCorrectCount((current) => current + 1);
      goToNextQuestion();
      return;
    }

    setFeedback("incorrect");
    setShowHint(true);
  }

  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`);
  }

  return (
    <PageLayout>
      <div data-name="warm-up-screen" className="flex min-h-full flex-col gap-4">
        {/* @SECTION Warm-up header */}
        <header data-name="warm-up-header" className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={backToLesson}
            className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:px-6 lg:py-4 lg:text-base"
          >
            ← Back to Lesson
          </button>

          <div className="flex items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0081A7]">Warm-Up</p>

            <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm lg:px-6 lg:py-4 lg:text-base">
              ◷ {warmup.estimated_minutes ?? 5}:00
            </div>
          </div>
        </header>

        {/* @SECTION Warm-up rounds */}
        <section data-name="warm-up-rounds" className="flex gap-3 overflow-x-auto pb-1">
          {rounds.map((round, index) => {
            const isActive = index === (activeQuestion?.roundIndex ?? 0);
            const isDone = index < (activeQuestion?.roundIndex ?? 0);

            return (
              <div
                key={round.id}
                className={`min-w-[220px] flex-1 rounded-[1.5rem] border px-5 py-4 shadow-sm ${
                  isActive
                    ? "border-[#00AFB9]/45 bg-[#00AFB9] text-white"
                    : isDone
                      ? "border-[#00AFB9]/20 bg-[#E9F7F8] text-[#073B5A]"
                      : "border-[#073B5A]/10 bg-white text-[#073B5A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black ${
                      isActive
                        ? "bg-white text-[#00AFB9]"
                        : isDone
                          ? "bg-[#00AFB9] text-white"
                          : "bg-[#F3F7F8] text-[#073B5A]"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>

                  <div className="min-w-0">
                    <h2 className="text-lg font-black">{round.title}</h2>
                    <p
                      className={`truncate text-sm font-bold ${
                        isActive ? "text-white/85" : "text-[#073B5A]/65"
                      }`}
                    >
                      {round.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* @SECTION Warm-up workspace */}
        <section
          data-name="warm-up-workspace"
          className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]"
        >
          {/* @SECTION Warm-up question */}
          <main
            data-name="warm-up-question-card"
            className="relative flex min-h-[560px] overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-white shadow-sm"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(253,252,220,0.95),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(233,247,248,0.9),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#FDFCDC_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#E9F7F8] to-transparent" />

            <div className="relative z-10 flex w-full flex-col p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-black text-[#073B5A] shadow-sm lg:px-5 lg:py-3 lg:text-base">
                  Question {Math.min(questionIndex + 1, Math.max(totalQuestions, 1))} of{" "}
                  {totalQuestions}
                </span>

                <span className="rounded-full bg-white/85 px-4 py-2 text-sm font-black capitalize text-[#0081A7] shadow-sm lg:px-5 lg:py-3 lg:text-base">
                  {activeQuestion?.skill.replaceAll("_", " ") ?? currentRound?.title}
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0081A7]">
                  {activeQuestion?.roundTitle ?? currentRound?.title}
                </p>

                <h1 className="mt-5 max-w-[760px] text-3xl font-black leading-tight text-[#073B5A] sm:text-4xl lg:text-[2.75rem]">
                  {activeQuestion?.prompt ?? "Ready?"}
                </h1>

                <input
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value);
                    setFeedback(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      checkAnswer();
                    }
                  }}
                  disabled={isTransitioning}
                  className="mt-8 block w-full max-w-[560px] rounded-2xl border-2 border-[#00AFB9] bg-white px-6 py-5 text-center text-xl font-black text-[#073B5A] outline-none transition focus:border-[#F07167] disabled:cursor-not-allowed disabled:opacity-70 lg:text-2xl"
                  placeholder="Type your answer"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={answer.trim().length === 0 || isTransitioning}
                  className={`mt-5 min-w-[220px] rounded-2xl px-9 py-4 text-base font-black shadow-sm transition lg:text-lg ${
                    answer.trim().length === 0 || isTransitioning
                      ? "cursor-not-allowed bg-[#DDEEEF] text-[#073B5A]/45"
                      : "bg-[#00AFB9] text-white hover:-translate-y-0.5 hover:bg-[#009DA7]"
                  }`}
                >
                  {isTransitioning ? "Great work!" : "Check Answer"}
                </button>

                <div className="mt-4 min-h-6 text-sm font-black lg:text-base">
                  {feedback === "correct" && (
                    <p className="text-[#2F9E44]">That’s correct. Moving to the next question!</p>
                  )}

                  {feedback === "incorrect" && (
                    <p className="text-[#D85B52]">Not quite yet. Take a look at the hint.</p>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* @SECTION Warm-up support rail */}
          <aside data-name="warm-up-support-rail" className="flex min-h-0 flex-col gap-5">
            <section
              data-name="warm-up-progress-card"
              className="flex min-h-[315px] flex-1 flex-col rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-black text-[#073B5A]">Warm-Up Progress</h2>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Question
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#073B5A]">
                    {Math.min(questionIndex + 1, Math.max(totalQuestions, 1))} of {totalQuestions}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Correct
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#073B5A]">
                    {correctCount} of {totalQuestions}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {questions.map((question, index) => {
                  const isDone =
                    index < questionIndex || (index === questionIndex && feedback === "correct");
                  const isCurrent = index === questionIndex && !isDone;

                  return (
                    <span
                      key={question.id}
                      aria-label={`Question ${index + 1}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${
                        isDone
                          ? "border-[#54C95B] bg-[#EAF8EC] text-[#2F9E44]"
                          : isCurrent
                            ? "border-[#00AFB9] bg-[#00AFB9] text-white shadow-[0_0_0_5px_rgba(0,175,185,0.10)]"
                            : "border-[#073B5A]/15 bg-white text-[#073B5A]/45"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl bg-[#F8FBFB] p-4">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                  Current Round
                </p>
                <p className="mt-2 text-lg font-black text-[#073B5A]">
                  {activeQuestion?.roundTitle ?? currentRound?.title}
                </p>
                <p className="mt-1 text-sm font-bold leading-5 text-[#073B5A]/65">
                  {activeQuestion?.roundDescription ?? currentRound?.description}
                </p>
              </div>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-3 text-sm font-black">
                  <span className="text-[#073B5A]">Overall progress</span>
                  <span className="text-[#0081A7]">{progressPercent}%</span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#DDEEEF]">
                  <div
                    className="h-full rounded-full bg-[#00AFB9] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            <section
              data-name="warm-up-hint-card"
              className="flex h-[220px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-black text-[#073B5A]">Need a Hint?</h2>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="text-sm font-bold leading-6 text-[#073B5A]/70">
                  {showHint && activeQuestion
                    ? activeQuestion.hint
                    : "Use what you already know. When you’re ready, reveal one small clue."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHint((current) => !current)}
                disabled={!activeQuestion?.hint}
                className="mt-4 min-h-11 w-full rounded-xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-2 text-sm font-black text-[#073B5A] shadow-sm transition hover:bg-[#EEF7F8] disabled:cursor-not-allowed disabled:opacity-50 lg:text-base"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
            </section>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}

export default WarmUpScreen;
