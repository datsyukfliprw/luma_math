import { useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import LumaAvatar from "../components/luma/LumaAvatar";
import { useDelightAnimation } from "../components/animations/delightAnimationContext";
import { getLessonById } from "../lib/lessonLookup";
import { updateLessonProgress } from "../lib/lessonProgress";
import { getStarProfile } from "../lib/starProfile";
import type { WarmUpData, WarmUpQuestion } from "../types/warmup";
import { getWarmUpRounds } from "../types/warmup";

const CURRENT_STUDENT_ID = "default-student";

type LessonWithWarmUp = {
  warmup?: WarmUpData;
};

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replaceAll(" ", "");
}

function getFallbackWarmup(): WarmUpData {
  return {
    title: "Luma Charge",
    estimated_minutes: 5,
    instructions: "Power up your star with quick review rounds before today’s lesson.",
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
    lessonId ?? `unit-${unit.unit_number}-week-${week.week_number}-day-${weekDayNumber}`;

  const warmup = structuredLesson.warmup ?? getFallbackWarmup();
  const rounds = getWarmUpRounds(warmup);
  const questions = useMemo(() => flattenQuestions(rounds), [rounds]);

  const checkButtonRef = useRef<HTMLButtonElement | null>(null);
  const starTargetRef = useRef<HTMLDivElement | null>(null);

  const { registerStarTarget, sendSparkleToStar } = useDelightAnimation();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [starPower, setStarPower] = useState(0);

  const starName = getStarProfile(CURRENT_STUDENT_ID).starName || "Your star";

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
  const progressPercent = totalQuestions > 0 ? Math.round((starPower / totalQuestions) * 100) : 0;

  function registerStar(element: HTMLDivElement | null) {
    starTargetRef.current = element;
    registerStarTarget(element);
  }

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
    if (!activeQuestion) {
      return;
    }

    const userAnswer = normalizeAnswer(answer);
    const correctAnswer = normalizeAnswer(activeQuestion.correct_answer);

    if (userAnswer === correctAnswer) {
      sendSparkleToStar({
        fromElement: checkButtonRef.current,
      });

      setFeedback("correct");
      setStarPower((current) => current + 1);
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
      <div className="flex min-h-full flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={backToLesson}
            className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm"
          >
            ← Back to Lesson
          </button>

          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0081A7]">Warm-Up</p>
            <h1 className="text-3xl font-black text-[#073B5A]">
              ⚡ {warmup.title ?? "Luma Charge"}
            </h1>
          </div>

          <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm">
            ◷ {warmup.estimated_minutes ?? 5}:00
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-3">
          {rounds.map((round, index) => {
            const isActive = index === (activeQuestion?.roundIndex ?? 0);
            const isDone = index < (activeQuestion?.roundIndex ?? 0);

            return (
              <div
                key={round.id}
                className={`rounded-[1.5rem] border p-4 shadow-sm ${
                  isActive
                    ? "border-[#00AFB9]/45 bg-[#00AFB9] text-white"
                    : isDone
                      ? "border-[#00AFB9]/20 bg-[#E9F7F8] text-[#073B5A]"
                      : "border-[#073B5A]/10 bg-white text-[#073B5A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-black ${
                      isActive
                        ? "bg-white text-[#00AFB9]"
                        : isDone
                          ? "bg-[#00AFB9] text-white"
                          : "bg-[#F3F7F8] text-[#073B5A]"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>

                  <div>
                    <h2 className="text-lg font-black">{round.title}</h2>
                    <p
                      className={`text-sm font-bold ${
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

        <section className="grid flex-1 gap-6 xl:grid-cols-[1fr_340px]">
          <main className="relative overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-white shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(253,252,220,0.95),transparent_34%),radial-gradient(circle_at_80%_15%,rgba(233,247,248,0.9),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#FDFCDC_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#E9F7F8] to-transparent" />

            <div className="relative z-10 grid min-h-[520px] gap-8 p-8 lg:grid-cols-[260px_1fr]">
              <div className="flex flex-col items-center justify-center">
                <div ref={registerStar} className="relative">
                  <LumaAvatar
                    name={starName}
                    size="xl"
                    state={feedback === "correct" ? "charging" : "happy"}
                    showEnergy={false}
                  />
                </div>

                <div className="mt-5 rounded-3xl border border-[#073B5A]/10 bg-white/85 p-5 text-center shadow-sm">
                  <p className="text-lg font-black text-[#073B5A]">Let’s power up!</p>
                  <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
                    Answer questions to charge {starName} and get ready for today’s lesson.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-[#073B5A] shadow-sm">
                    Question {questionIndex + 1} of {totalQuestions}
                  </span>

                  <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm">
                    {activeQuestion?.skill.replaceAll("_", " ") ?? currentRound?.title}
                  </span>
                </div>

                <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white/88 p-8 text-center shadow-sm backdrop-blur">
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0081A7]">
                    {activeQuestion?.roundTitle ?? currentRound?.title}
                  </p>

                  <h2 className="mt-4 text-3xl font-black leading-tight text-[#073B5A]">
                    {activeQuestion?.prompt ?? "Ready?"}
                  </h2>

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
                    className="mx-auto mt-7 block w-full max-w-[420px] rounded-2xl border-2 border-[#00AFB9] bg-white px-5 py-4 text-center text-xl font-black text-[#073B5A] outline-none focus:border-[#F07167]"
                    placeholder="Type your answer"
                    autoFocus
                  />

                  <button
                    ref={checkButtonRef}
                    type="button"
                    onClick={checkAnswer}
                    disabled={answer.trim().length === 0}
                    className={`mt-5 rounded-2xl px-8 py-3 text-base font-black shadow-sm ${
                      answer.trim().length === 0
                        ? "bg-[#DDEEEF] text-[#073B5A]/45"
                        : "bg-[#00AFB9] text-white"
                    }`}
                  >
                    Check Answer
                  </button>
                </div>

                <div className="mt-5 rounded-[1.5rem] border border-[#073B5A]/10 bg-white/85 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-base font-black text-[#073B5A]">Need a hint?</p>

                      <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
                        {showHint && activeQuestion
                          ? activeQuestion.hint
                          : "Use what you already know. You’ve got this!"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="rounded-xl border border-[#073B5A]/10 bg-white px-4 py-2 text-sm font-black text-[#073B5A] shadow-sm"
                    >
                      Show Hint
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <aside className="flex flex-col gap-5">
            <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#073B5A]">Your Progress</h2>

              <div className="mt-5 flex items-center gap-3">
                {rounds.map((round, index) => {
                  const isActive = index === (activeQuestion?.roundIndex ?? 0);
                  const isDone = index < (activeQuestion?.roundIndex ?? 0);

                  return (
                    <div key={round.id} className="flex items-center gap-3">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${
                          isActive
                            ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                            : isDone
                              ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]"
                              : "border-[#073B5A]/15 bg-white text-[#073B5A]/65"
                        }`}
                      >
                        {index + 1}
                      </span>

                      {index < rounds.length - 1 && <span className="h-0.5 w-8 bg-[#073B5A]/10" />}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-[#F8FBFB] p-4">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                  Current Round
                </p>
                <p className="mt-2 text-lg font-black text-[#073B5A]">
                  {activeQuestion?.roundTitle ?? currentRound?.title}
                </p>
                <p className="mt-1 text-sm font-bold text-[#073B5A]/65">
                  {activeQuestion?.roundDescription ?? currentRound?.description}
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#073B5A]">Star Power</h2>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <p className="text-2xl font-black text-[#073B5A]">
                    {starPower} / {totalQuestions}
                  </p>
                  <p className="text-sm font-bold text-[#073B5A]/65">{progressPercent}% charged</p>
                </div>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#DDEEEF]">
                <div
                  className="h-full rounded-full bg-[#F7B733] transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="mt-4 text-sm font-bold leading-relaxed text-[#073B5A]/70">
                Answer correctly to send sparkle energy to your star.
              </p>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 rounded-[1.75rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm lg:grid-cols-2">
          <div>
            <p className="text-lg font-black text-[#073B5A]">Why are we warming up?</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              Warm-ups help your brain wake up, review important skills, and get ready to learn new
              things.
            </p>
          </div>

          <div>
            <p className="text-lg font-black text-[#073B5A]">You’re building your brain!</p>
            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              Every question you answer helps your star grow stronger and brighter.
            </p>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default WarmUpScreen;
