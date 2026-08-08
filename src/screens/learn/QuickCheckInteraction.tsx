import { CheckCircle2 } from "lucide-react";
import type { QuickCheckQuestion } from "../../lib/quickCheck/schema";

type QuickCheckResponse = {
  answer: string;
  reason?: string;
};

type QuickCheckInteractionProps = {
  question: QuickCheckQuestion;
  response?: QuickCheckResponse;
  isCorrect: boolean;
  draftAnswer: string;
  onDraftAnswerChange: (answer: string) => void;
  onAnswer: (answer: string) => void;
  onReason: (reason: string) => void;
  onSubmitText: () => void;
};

function isPrimaryAnswerCorrect(question: QuickCheckQuestion, answer?: string) {
  if (!answer) {
    return false;
  }

  switch (question.interaction.type) {
    case "multiple_choice":
    case "true_false":
    case "mistake_detection":
      return answer === question.interaction.correctAnswer;
    case "text_entry":
      return false;
  }
}

function QuickCheckInteraction({
  question,
  response,
  isCorrect,
  draftAnswer,
  onDraftAnswerChange,
  onAnswer,
  onReason,
  onSubmitText,
}: QuickCheckInteractionProps) {
  function renderChoiceButton({ label, value }: { label: string; value: string }) {
    const isSelected = response?.answer === value;
    const isCorrectChoice = isSelected && isPrimaryAnswerCorrect(question, value);

    return (
      <button
        key={value}
        type="button"
        onClick={() => onAnswer(value)}
        disabled={isCorrect}
        className={`relative min-h-20 rounded-2xl border px-5 py-4 text-xl font-black shadow-sm transition sm:text-2xl ${
          isSelected && isCorrectChoice
            ? "border-[#00AFB9] bg-[#00AFB9] text-white"
            : isSelected
              ? "border-[#F07167] bg-[#FCE9E5] text-[#C84F46]"
              : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/35 hover:bg-[#F7FCFD]"
        } ${isCorrect ? "cursor-default" : ""}`}
      >
        {label}
        {isSelected && isCorrectChoice && (
          <CheckCircle2
            size={20}
            strokeWidth={3}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        )}
      </button>
    );
  }

  switch (question.interaction.type) {
    case "multiple_choice":
      return (
        <div data-name="quick-check-multiple-choice" className="mt-4">
          <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
            Choose your answer
          </p>

          <div className="mx-auto mt-2 grid max-w-[760px] gap-3 sm:grid-cols-3">
            {question.interaction.choices.map(renderChoiceButton)}
          </div>
        </div>
      );

    case "text_entry":
      return (
        <div data-name="quick-check-text-entry" className="mx-auto mt-4 max-w-[640px]">
          <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
            Type your answer
          </p>

          <div className="mt-2 flex gap-3">
            <input
              type="text"
              inputMode={question.interaction.answerType === "numeric" ? "decimal" : "text"}
              value={draftAnswer}
              onChange={(event) => onDraftAnswerChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSubmitText();
                }
              }}
              disabled={isCorrect}
              placeholder={question.interaction.placeholder ?? "Your answer"}
              aria-label="Quick Check answer"
              className="min-h-16 min-w-0 flex-1 rounded-2xl border-2 border-[#073B5A]/10 bg-white px-5 text-center text-2xl font-black text-[#073B5A] outline-none transition placeholder:text-[#9AB5C7] focus:border-[#00AFB9]"
            />

            <button
              type="button"
              onClick={onSubmitText}
              disabled={!draftAnswer.trim() || isCorrect}
              className={`rounded-2xl px-6 py-3 text-base font-black text-white shadow-sm transition ${
                !draftAnswer.trim() || isCorrect
                  ? "cursor-not-allowed bg-[#9AB5C7]"
                  : "bg-[#00AFB9] hover:bg-[#0081A7]"
              }`}
            >
              Check
            </button>
          </div>
        </div>
      );

    case "true_false":
      return (
        <div data-name="quick-check-true-false" className="mt-4">
          <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
            True or false?
          </p>

          <div className="mx-auto mt-2 grid max-w-[620px] grid-cols-2 gap-3">
            {[
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ].map(renderChoiceButton)}
          </div>
        </div>
      );

    case "mistake_detection": {
      const reasonChoices = question.interaction.reasonChoices ?? [];
      const showReasonChoices = Boolean(
        response?.answer === question.interaction.correctAnswer &&
          question.interaction.correctReason &&
          reasonChoices.length > 0,
      );

      return (
        <div data-name="quick-check-mistake-detection" className="mt-4">
          <p className="text-center text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
            Is the statement correct?
          </p>

          <div className="mx-auto mt-2 grid max-w-[620px] grid-cols-2 gap-3">
            {[
              { label: "Yes", value: "yes" },
              { label: "No", value: "no" },
            ].map(renderChoiceButton)}
          </div>

          {showReasonChoices && (
            <div className="mx-auto mt-4 max-w-[760px] rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-4">
              <p className="text-center text-sm font-black text-[#073B5A]">Now choose why.</p>

              <div className="mt-3 grid gap-2.5">
                {reasonChoices.map((reason) => {
                  const isSelected = response?.reason === reason;
                  const isCorrectReason = reason === question.interaction.correctReason;

                  return (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => onReason(reason)}
                      disabled={isCorrect}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-black shadow-sm transition ${
                        isSelected && isCorrectReason
                          ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                          : isSelected
                            ? "border-[#F07167] bg-[#FCE9E5] text-[#C84F46]"
                            : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/30"
                      }`}
                    >
                      {reason}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}

export default QuickCheckInteraction;
export type { QuickCheckResponse };
