// @SECTION QUICKCHECK_IMPORTS
import { useState } from "react";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../../components/ui/LessonFallbackScreen";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../../lib/answerValidation";
import type { QuickCheckQuestion } from "../../lib/quickCheck/schema";
import QuickCheckInteraction, { type QuickCheckResponse } from "./QuickCheckInteraction";
import QuickCheckVisual from "./QuickCheckVisual";

// @SECTION QUICKCHECK_TYPES
type QuickCheckPageProps = {
  lessonId: string;
};

// @SECTION QUICKCHECK_HELPERS
function getRoleLabel(role: QuickCheckQuestion["role"]) {
  switch (role) {
    case "direct":
      return "Solve It";
    case "conceptual":
      return "See It";
    case "reasoning":
      return "Think It Through";
  }
}

function isResponseCorrect(question: QuickCheckQuestion, response?: QuickCheckResponse) {
  if (!response) {
    return false;
  }

  switch (question.interaction.type) {
    case "multiple_choice":
      return response.answer === question.interaction.correctAnswer;

    case "text_entry": {
      const normalize =
        question.interaction.answerType === "numeric" ? normalizeNumericAnswer : normalizeTextAnswer;

      return normalize(response.answer) === normalize(question.interaction.correctAnswer);
    }

    case "true_false":
      return response.answer === question.interaction.correctAnswer;

    case "mistake_detection":
      return (
        response.answer === question.interaction.correctAnswer &&
        (!question.interaction.correctReason || response.reason === question.interaction.correctReason)
      );
  }
}

function hasEvaluatedResponse(question: QuickCheckQuestion, response?: QuickCheckResponse) {
  if (!response) {
    return false;
  }

  if (
    question.interaction.type === "mistake_detection" &&
    response.answer === question.interaction.correctAnswer &&
    question.interaction.correctReason &&
    !response.reason
  ) {
    return false;
  }

  return true;
}

// @SECTION QUICKCHECK_SESSION
function QuickCheckSession({ lessonId }: QuickCheckPageProps) {
  const lessonExperience = getLessonExperience(lessonId);
  const quickCheck = lessonExperience?.canonicalQuickCheck;
  const quickCheckQuestions = quickCheck?.questions ?? [];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, QuickCheckResponse>>({});
  const [draftAnswer, setDraftAnswer] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);

  if (!lessonExperience || !quickCheck || quickCheckQuestions.length === 0) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;
  }

  const currentQuestion = quickCheckQuestions[currentQuestionIndex];
  const currentResponse = responses[currentQuestionIndex];
  const isCurrentCorrect = isResponseCorrect(currentQuestion, currentResponse);
  const hasEvaluated = hasEvaluatedResponse(currentQuestion, currentResponse);

  const correctCount = quickCheckQuestions.filter((question, index) =>
    isResponseCorrect(question, responses[index]),
  ).length;

  const isAllCorrect = correctCount === quickCheckQuestions.length;
  const completionPercent = (correctCount / quickCheckQuestions.length) * 100;

  function saveAnswer(answer: string) {
    if (isCurrentCorrect) {
      return;
    }

    setResponses((currentResponses) => ({
      ...currentResponses,
      [currentQuestionIndex]: { answer },
    }));
  }

  function saveReason(reason: string) {
    if (!currentResponse || currentQuestion.interaction.type !== "mistake_detection") {
      return;
    }

    setResponses((currentResponses) => ({
      ...currentResponses,
      [currentQuestionIndex]: { ...currentResponse, reason },
    }));
  }

  function submitTextAnswer() {
    const trimmedAnswer = draftAnswer.trim();

    if (!trimmedAnswer || isCurrentCorrect) {
      return;
    }

    saveAnswer(trimmedAnswer);
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < quickCheckQuestions.length - 1) {
      setCurrentQuestionIndex((current) => current + 1);
      setDraftAnswer("");
    }
  }

  const displayedStem =
    currentQuestion.interaction.type === "mistake_detection"
      ? currentQuestion.interaction.statement
      : currentQuestion.stem;

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
            <h2 className="text-2xl font-black leading-tight text-[#073B5A]">
              {quickCheck.title || "Quick Check"}
            </h2>
            <p className="mt-0.5 text-sm font-bold text-[#275875]">
              {quickCheck.subtitle || `Answer ${quickCheckQuestions.length} questions about what you just learned.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex" data-name="quick-check-progress-dots">
            {quickCheckQuestions.map((question, index) => {
              const isDone = isResponseCorrect(question, responses[index]);
              const isCurrent = index === currentQuestionIndex && !showCompletion;

              return (
                <div
                  key={question.id}
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
            {showCompletion
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

      {showCompletion ? (
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
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
                Question {currentQuestionIndex + 1}
              </p>
              <h3 className="mt-1 text-3xl font-black leading-tight text-[#073B5A]">
                {currentQuestion.prompt}
              </h3>
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-[#0081A7] shadow-sm">
              {getRoleLabel(currentQuestion.role)}
            </div>
          </div>

          <QuickCheckVisual visual={currentQuestion.visual} />

          {displayedStem && (
            <div
              data-name="quick-check-stem"
              className="mx-auto mt-4 flex min-h-20 max-w-[720px] items-center justify-center rounded-[1.35rem] bg-white px-5 py-3 text-center shadow-sm"
            >
              <p className="text-3xl font-black text-[#073B5A]">{displayedStem}</p>
            </div>
          )}

          <QuickCheckInteraction
            question={currentQuestion}
            response={currentResponse}
            isCorrect={isCurrentCorrect}
            draftAnswer={draftAnswer}
            onDraftAnswerChange={setDraftAnswer}
            onAnswer={saveAnswer}
            onReason={saveReason}
            onSubmitText={submitTextAnswer}
          />

          {/* @SECTION QUICKCHECK_FEEDBACK */}
          {hasEvaluated && (
            <div
              data-name="quick-check-feedback"
              className={`mx-auto mt-4 max-w-[760px] rounded-[1.25rem] border px-4 py-3 ${
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
                      {isCurrentCorrect ? currentQuestion.feedback.success : currentQuestion.feedback.hint}
                    </p>
                    {isCurrentCorrect && currentQuestion.feedback.explanation && (
                      <p className="mt-1 text-sm font-bold leading-snug text-[#275875]/80">
                        {currentQuestion.feedback.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {isCurrentCorrect && !isAllCorrect && (
                  <button
                    type="button"
                    onClick={goToNextQuestion}
                    data-name="quick-check-next-question-button"
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Next Question →
                  </button>
                )}

                {isCurrentCorrect && isAllCorrect && (
                  <button
                    type="button"
                    onClick={() => setShowCompletion(true)}
                    data-name="quick-check-finish-button"
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Finish Quick Check →
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

// Keying by lesson prevents answers from leaking when React Router reuses this screen.
function QuickCheckPage({ lessonId }: QuickCheckPageProps) {
  return <QuickCheckSession key={lessonId} lessonId={lessonId} />;
}

export default QuickCheckPage;
