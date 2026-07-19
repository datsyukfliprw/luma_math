// @SECTION QUICKCHECK_IMPORTS
import { useState } from "react";
import { CheckCircle2, Sparkles, Star } from "lucide-react";
import LumaAvatar from "../../components/luma/LumaAvatar";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../../components/ui/LessonFallbackScreen";

// @SECTION QUICKCHECK_TYPES
type QuickCheckPageProps = {
  lessonId: string;
  starName: string;
};

// @SECTION QUICKCHECK_PAGE
function QuickCheckPage({ lessonId, starName }: QuickCheckPageProps) {
  // @SECTION QUICKCHECK_DATA
  const lessonExperience = getLessonExperience(lessonId);

  // Show fallback screen if lesson experience is missing
  if (!lessonExperience) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;
  }

  const quickCheckQuestions = lessonExperience.quickCheck.questions;

  // @SECTION QUICKCHECK_STATE
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const currentQuestion = quickCheckQuestions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== undefined;
  const isCurrentCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const correctCount = quickCheckQuestions.filter(
    (question, index) => selectedAnswers[index] === question.correctAnswer,
  ).length;

  const isComplete = correctCount === quickCheckQuestions.length;
  const chargePercent = (correctCount / quickCheckQuestions.length) * 100;

  // @SECTION QUICKCHECK_HELPERS
  function chooseAnswer(answer: string) {
    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestionIndex]: answer,
    }));
  }

  function goToNextPuzzle() {
    if (currentQuestionIndex < quickCheckQuestions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  }

  return (
    <>
      {/* @SECTION QUICKCHECK_MAIN_CARD */}
      <main
        data-name="quick-check-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
      >
        {/* @SECTION QUICKCHECK_HEADER */}
        <div
          data-name="quick-check-card-header"
          className="mb-3 flex flex-wrap items-start justify-between gap-3"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              🚀
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">Luma Boost</h2>

              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                Power up {starName} with 3 quick math puzzles.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Check {currentQuestionIndex + 1} of {quickCheckQuestions.length}
          </div>
        </div>

        {/* @SECTION QUICKCHECK_TOPIC_REMINDER */}
        <section
          data-name="quick-check-topic-reminder"
          className="relative mb-4 overflow-hidden rounded-[1.5rem] border border-[#00AFB9]/25 bg-[#E9F7F8] p-4 shadow-sm"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(255,255,255,0.95),transparent_32%),radial-gradient(circle_at_82%_20%,rgba(253,252,220,0.9),transparent_26%)]" />

          <div className="relative z-10 grid items-center gap-4 lg:grid-cols-[auto_1fr_auto]">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-white/75 shadow-inner">
              <div className="absolute h-18 w-18 rounded-full border-4 border-dashed border-[#00AFB9]/30" />
              <div className="text-5xl drop-shadow-sm">⭐</div>
            </div>

            <div className="min-w-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#0081A7]">
                Rule reminder
              </p>

              <h3 className="mt-1 text-2xl font-black leading-tight text-[#073B5A]">
                Find the product
              </h3>

              <p className="mt-2 max-w-[460px] text-sm font-bold leading-relaxed text-[#275875]">
                The product is the answer to a multiplication problem. Use the picture, solve the
                equation, then click the product below.
              </p>
            </div>

            <div className="rounded-[1.35rem] bg-white/85 px-4 py-3 shadow-sm">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Boost charge
              </p>

              <div className="flex gap-2">
                {quickCheckQuestions.map((question, index) => {
                  const isCharged = selectedAnswers[index] === question.correctAnswer;

                  return (
                    <div
                      key={question.prompt}
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl shadow-inner ${
                        isCharged ? "bg-[#FFF3D9] text-[#F7B733]" : "bg-[#F1F5F7] text-[#9AB5C7]"
                      }`}
                    >
                      ★
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#E6EEF2] shadow-inner">
                <div
                  className="h-full rounded-full bg-[#F7B733] transition-all duration-300"
                  style={{ width: `${chargePercent}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* @SECTION QUICKCHECK_PUZZLE_CARD */}
        <section
          data-name="quick-check-current-puzzle-card"
          className="rounded-[1.75rem] border border-[#073B5A]/10 bg-[#F8FBFB] p-4 shadow-sm"
        >
          <div
            data-name="quick-check-current-puzzle-header"
            className="mb-4 flex flex-wrap items-start justify-between gap-3"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Your puzzle
              </p>

              <h3 className="mt-1 text-2xl font-black text-[#073B5A]">{currentQuestion.prompt}</h3>

              <p className="mt-2 max-w-xl text-sm font-black leading-relaxed text-[#275875]">
                Look at the picture, solve the equation, then click the product below.
              </p>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm">
              {currentQuestion.ruleType}
            </div>
          </div>

          {/* @SECTION QUICKCHECK_VISUAL_GROUPS */}
          <div
            data-name="quick-check-current-puzzle-visual"
            className="rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-black text-[#073B5A]">
              {Array.from({ length: currentQuestion.visualGroups }).map((_, groupIndex) => (
                <div key={groupIndex} className="flex items-center gap-2">
                  <div className="flex h-12 w-16 items-center justify-center rounded-2xl border border-[#00AFB9]/20 bg-[#F8FBFB] text-2xl shadow-inner">
                    {currentQuestion.visualCount === 0 ? (
                      <span className="text-[#9AB5C7]">∅</span>
                    ) : (
                      "⭐"
                    )}
                  </div>

                  {groupIndex < currentQuestion.visualGroups - 1 && (
                    <span className="text-[#9AB5C7]">+</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* @SECTION QUICKCHECK_EQUATION_CHAIN */}
          <div
            data-name="quick-check-current-puzzle-equation-chain"
            className="mt-4 rounded-[1.5rem] bg-white px-5 py-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-center gap-4 text-2xl font-black text-[#073B5A]">
              <span>{currentQuestion.equationStart}</span>

              <span
                className={`flex min-h-12 min-w-16 items-center justify-center rounded-2xl border-2 border-dashed px-4 ${
                  hasAnswered
                    ? isCurrentCorrect
                      ? "border-[#00AFB9]/30 bg-[#E9F7F8] text-[#0081A7]"
                      : "border-[#F07167]/30 bg-[#FCE9E5] text-[#F07167]"
                    : "border-[#9AB5C7]/45 bg-[#F1F5F7] text-[#9AB5C7]"
                }`}
              >
                {selectedAnswer ?? "?"}
              </span>

              <span className="text-base text-[#275875]">{currentQuestion.productPrompt}</span>

              <span
                className={`flex min-h-12 min-w-16 items-center justify-center rounded-2xl border-2 border-dashed px-4 ${
                  hasAnswered
                    ? isCurrentCorrect
                      ? "border-[#00AFB9]/30 bg-[#E9F7F8] text-[#0081A7]"
                      : "border-[#F07167]/30 bg-[#FCE9E5] text-[#F07167]"
                    : "border-[#9AB5C7]/45 bg-[#F1F5F7] text-[#9AB5C7]"
                }`}
              >
                {selectedAnswer ?? "?"}
              </span>
            </div>
          </div>

          {/* @SECTION QUICKCHECK_ANSWER_DIRECTIONS */}
          <div className="mt-4 rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3 text-center shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
              Choose the product
            </p>

            <p className="mt-1 text-sm font-bold text-[#275875]">
              Click the answer to {currentQuestion.equationStart}.
            </p>
          </div>

          {/* @SECTION QUICKCHECK_ANSWER_CHOICES */}
          <div
            data-name="quick-check-current-puzzle-answer-choices"
            className="mt-3 grid grid-cols-3 gap-3"
          >
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedAnswer === choice;
              const isCorrectChoice = choice === currentQuestion.correctAnswer;

              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => chooseAnswer(choice)}
                  className={`relative rounded-2xl border px-4 py-5 text-2xl font-black shadow-sm transition hover:shadow-md lg:px-5 lg:py-6 ${
                    isSelected && isCorrectChoice
                      ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                      : isSelected
                        ? "border-[#F07167] bg-[#F07167] text-white"
                        : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
                  }`}
                >
                  {choice}

                  {isSelected && isCorrectChoice && (
                    <CheckCircle2 size={20} strokeWidth={3} className="absolute right-3 top-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* @SECTION QUICKCHECK_FEEDBACK */}
          {hasAnswered && (
            <section
              data-name="quick-check-current-puzzle-feedback"
              className={`mt-4 rounded-[1.5rem] border px-4 py-3 shadow-sm ${
                isCurrentCorrect
                  ? "border-[#7CCB5B]/25 bg-[#EEF9EA]"
                  : "border-[#F07167]/25 bg-[#FCE9E5]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg font-black ${
                      isCurrentCorrect ? "bg-[#7CCB5B] text-white" : "bg-[#F07167] text-white"
                    }`}
                  >
                    {isCurrentCorrect ? "✓" : "?"}
                  </div>

                  <p className="text-sm font-black text-[#073B5A]">
                    {isCurrentCorrect ? currentQuestion.success : currentQuestion.hint}
                  </p>
                </div>

                {isCurrentCorrect && currentQuestionIndex < quickCheckQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={goToNextPuzzle}
                    data-name="quick-check-next-puzzle-button"
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Next Puzzle →
                  </button>
                )}
              </div>
            </section>
          )}

          {/* @SECTION QUICKCHECK_COMPLETE_CARD */}
          {isComplete && (
            <section
              data-name="quick-check-complete-card"
              className="mt-4 rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C78300]">
                    {starName} fully boosted
                  </p>

                  <h3 className="mt-1 text-xl font-black text-[#073B5A]">
                    Nice work — all 3 puzzles are powered up!
                  </h3>
                </div>

                <Sparkles size={28} strokeWidth={2.7} className="text-[#F7B733]" />
              </div>
            </section>
          )}
        </section>
      </main>

      {/* @SECTION QUICKCHECK_SIDEBAR */}
      <aside data-name="quick-check-right-sidebar" className="flex flex-col gap-4">
        {/* @SECTION QUICKCHECK_LUMA_TIP */}
        <section
          data-name="quick-check-luma-tip-card"
          className="relative min-h-[150px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star size={22} strokeWidth={2.7} className="fill-[#F7B733] text-[#F7B733]" />

              <p className="text-lg font-black text-[#C78300]">{starName} Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-lg font-black leading-tight text-[#073B5A] shadow-sm">
              {currentQuestion.tipTitle}
            </div>

            <p className="mt-3 max-w-[210px] text-sm font-black leading-relaxed text-[#073B5A]/70">
              {currentQuestion.tipText}
            </p>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* @SECTION QUICKCHECK_PROGRESS_CARD */}
        <section
          data-name="quick-check-progress-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Boost Progress</h2>

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
              const isCurrent = index === currentQuestionIndex;

              return (
                <div
                  key={question.prompt}
                  className={`rounded-2xl border px-3 py-4 text-center shadow-sm ${
                    isDone
                      ? "border-[#00AFB9]/30 bg-[#E9F7F8]"
                      : isCurrent
                        ? "border-[#F7B733]/40 bg-[#FFF3D9]"
                        : "border-[#073B5A]/10 bg-[#F8FBFB]"
                  }`}
                >
                  <p className="text-lg font-black text-[#073B5A]">{isDone ? "✓" : index + 1}</p>

                  <p className="mt-1 text-[0.68rem] font-bold text-[#073B5A]/65">Puzzle</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* @SECTION QUICKCHECK_RULE_REMINDER */}
        <section
          data-name="quick-check-rule-reminder-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Rule Reminder</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Two patterns
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-[#073B5A]">Any number × 1 = the same number</p>

              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">5 × 1 = 5</p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-sm font-black text-[#073B5A]">Any number × 0 = 0</p>

              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">5 × 0 = 0</p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

export default QuickCheckPage;
