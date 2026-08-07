// @SECTION QUICKCHECK_IMPORTS
import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../../components/ui/LessonFallbackScreen";

// @SECTION QUICKCHECK_TYPES
type QuickCheckPageProps = {
  lessonId: string;
};

// @SECTION QUICKCHECK_PAGE
function QuickCheckPage({ lessonId }: QuickCheckPageProps) {
  // @SECTION QUICKCHECK_DATA
  const lessonExperience = getLessonExperience(lessonId);
  const quickCheckQuestions = lessonExperience?.quickCheck?.questions ?? [];

  // @SECTION QUICKCHECK_STATE
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  if (!lessonExperience || quickCheckQuestions.length === 0) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;
  }

  const currentQuestion = quickCheckQuestions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const hasAnswered = selectedAnswer !== undefined;
  const isCurrentCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const correctCount = quickCheckQuestions.filter(
    (question, index) => selectedAnswers[index] === question.correctAnswer,
  ).length;

  const isComplete = correctCount === quickCheckQuestions.length;
  const completionPercent = (correctCount / quickCheckQuestions.length) * 100;
  const visualGroups = Math.max(0, currentQuestion.visualGroups ?? 0);
  const visualCount = Math.max(0, currentQuestion.visualCount ?? 0);

  // @SECTION QUICKCHECK_HELPERS
  function chooseAnswer(answer: string) {
    if (isCurrentCorrect) {
      return;
    }

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestionIndex]: answer,
    }));
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < quickCheckQuestions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
    }
  }

  return (
    <main
      data-name="quick-check-main-card"
      className="mx-auto w-full max-w-[980px] rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
    >
      {/* @SECTION QUICKCHECK_HEADER */}
      <header
        data-name="quick-check-header"
        className="flex flex-wrap items-center justify-between gap-4 border-b border-[#073B5A]/10 pb-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
            <ClipboardCheck size={25} strokeWidth={2.7} />
          </div>

          <div>
            <h2 className="text-2xl font-black leading-tight text-[#073B5A]">Quick Check</h2>
            <p className="mt-0.5 text-sm font-bold text-[#275875]">
              Answer {quickCheckQuestions.length} questions about what you just learned.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex" data-name="quick-check-progress-dots">
            {quickCheckQuestions.map((question, index) => {
              const isDone = selectedAnswers[index] === question.correctAnswer;
              const isCurrent = index === currentQuestionIndex && !isComplete;

              return (
                <div
                  key={question.prompt}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black transition ${
                    isDone
                      ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                      : isCurrent
                        ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]"
                        : "border-[#073B5A]/10 bg-[#F8FBFB] text-[#6D9AB1]"
                  }`}
                >
                  {isDone ? "✓" : index + 1}
                </div>
              );
            })}
          </div>

          <div className="rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            {isComplete
              ? `${quickCheckQuestions.length} of ${quickCheckQuestions.length}`
              : `${currentQuestionIndex + 1} of ${quickCheckQuestions.length}`}
          </div>
        </div>
      </header>

      <div
        data-name="quick-check-progress-bar"
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#E6EEF2]"
      >
        <div
          className="h-full rounded-full bg-[#00AFB9] transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {isComplete ? (
        /* @SECTION QUICKCHECK_COMPLETE */
        <section
          data-name="quick-check-complete-card"
          className="mt-4 flex min-h-[430px] flex-col items-center justify-center rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#F7FCFD] px-6 py-10 text-center"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#00AFB9] text-white shadow-sm">
            <CheckCircle2 size={43} strokeWidth={2.7} />
          </div>

          <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
            Quick Check complete
          </p>

          <h3 className="mt-2 text-3xl font-black text-[#073B5A]">You got it.</h3>

          <p className="mt-2 max-w-[520px] text-base font-bold leading-relaxed text-[#275875]">
            You answered all {quickCheckQuestions.length} questions correctly. Use the arrow above
            to finish Learn and return to your lesson.
          </p>

          <div className="mt-6 rounded-2xl bg-white px-6 py-3 text-lg font-black text-[#0081A7] shadow-sm">
            {correctCount} of {quickCheckQuestions.length} correct
          </div>
        </section>
      ) : (
        /* @SECTION QUICKCHECK_QUESTION */
        <section
          data-name="quick-check-question-card"
          className="mt-4 rounded-[1.5rem] border border-[#073B5A]/10 bg-[#F8FBFB] p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
                Question {currentQuestionIndex + 1}
              </p>
              <h3 className="mt-1 text-3xl font-black leading-tight text-[#073B5A]">
                {currentQuestion.prompt}
              </h3>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#0081A7] shadow-sm">
              {currentQuestion.ruleType}
            </div>
          </div>

          {/* @SECTION QUICKCHECK_VISUAL */}
          {visualGroups > 0 && (
            <div
              data-name="quick-check-visual-model"
              className="mt-4 rounded-[1.35rem] border border-[#00AFB9]/15 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {Array.from({ length: visualGroups }).map((_, groupIndex) => (
                  <div
                    key={groupIndex}
                    className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-[#00AFB9]/20 bg-[#F7FCFD] px-2 shadow-inner"
                  >
                    {visualCount === 0 ? (
                      <span className="text-xl font-black text-[#9AB5C7]">∅</span>
                    ) : (
                      <div className="flex max-w-[48px] flex-wrap items-center justify-center gap-1">
                        {Array.from({ length: visualCount }).map((_, itemIndex) => (
                          <span
                            key={`${groupIndex}-${itemIndex}`}
                            className="h-3.5 w-3.5 rounded-full bg-[#F7B733]"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-center text-xs font-black uppercase tracking-[0.12em] text-[#6D9AB1]">
                {visualGroups} groups · {visualCount} in each
              </p>
            </div>
          )}

          {/* @SECTION QUICKCHECK_EQUATION */}
          <div
            data-name="quick-check-equation"
            className="mx-auto mt-4 flex min-h-20 max-w-[620px] items-center justify-center rounded-[1.35rem] bg-white px-5 py-3 text-center shadow-sm"
          >
            <p className="text-3xl font-black text-[#073B5A]">
              {currentQuestion.equationStart}{" "}
              <span
                className={`inline-flex min-w-14 items-center justify-center rounded-xl border-2 border-dashed px-3 py-1.5 ${
                  hasAnswered
                    ? isCurrentCorrect
                      ? "border-[#00AFB9]/35 bg-[#E9F7F8] text-[#0081A7]"
                      : "border-[#F07167]/35 bg-[#FCE9E5] text-[#F07167]"
                    : "border-[#9AB5C7]/45 bg-[#F1F5F7] text-[#9AB5C7]"
                }`}
              >
                {selectedAnswer ?? "?"}
              </span>
            </p>
          </div>

          {/* @SECTION QUICKCHECK_CHOICES */}
          <div className="mt-4">
            <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
              Choose your answer
            </p>

            <div
              data-name="quick-check-answer-choices"
              className="mx-auto mt-2 grid max-w-[720px] grid-cols-3 gap-3"
            >
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedAnswer === choice;
                const isCorrectChoice = choice === currentQuestion.correctAnswer;

                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => chooseAnswer(choice)}
                    disabled={isCurrentCorrect}
                    className={`relative min-h-16 rounded-2xl border px-4 py-3 text-2xl font-black shadow-sm transition ${
                      isSelected && isCorrectChoice
                        ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                        : isSelected
                          ? "border-[#F07167] bg-[#FCE9E5] text-[#C84F46]"
                          : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/35 hover:bg-[#F7FCFD]"
                    } ${isCurrentCorrect ? "cursor-default" : ""}`}
                  >
                    {choice}
                    {isSelected && isCorrectChoice && (
                      <CheckCircle2
                        size={19}
                        strokeWidth={3}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* @SECTION QUICKCHECK_FEEDBACK */}
          {hasAnswered && (
            <div
              data-name="quick-check-feedback"
              className={`mx-auto mt-4 max-w-[720px] rounded-[1.25rem] border px-4 py-3 ${
                isCurrentCorrect
                  ? "border-[#7CCB5B]/30 bg-[#EEF9EA]"
                  : "border-[#F07167]/25 bg-[#FCE9E5]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base font-black text-white ${
                      isCurrentCorrect ? "bg-[#7CCB5B]" : "bg-[#F07167]"
                    }`}
                  >
                    {isCurrentCorrect ? "✓" : "?"}
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#073B5A]">
                      {isCurrentCorrect ? "That's right." : "Try again."}
                    </p>
                    <p className="mt-0.5 text-sm font-bold leading-snug text-[#275875]">
                      {isCurrentCorrect ? currentQuestion.success : currentQuestion.hint}
                    </p>
                  </div>
                </div>

                {isCurrentCorrect && currentQuestionIndex < quickCheckQuestions.length - 1 && (
                  <button
                    type="button"
                    onClick={goToNextQuestion}
                    data-name="quick-check-next-question-button"
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Next Question →
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default QuickCheckPage;
