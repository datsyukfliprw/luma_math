// @SECTION LEARN_STEPPER_IMPORTS
import { ArrowLeft, ArrowRight } from "lucide-react";

// @SECTION LEARN_STEPPER_DATA
// eslint-disable-next-line react-refresh/only-export-components
export const learnSteps = [
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

// @SECTION LEARN_STEPPER_COMPONENT
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
    <div data-name="learn-stepper-nav" className="flex items-center justify-end gap-2 lg:gap-3">
      {/* @SECTION LEARN_STEPPER_PREVIOUS_BUTTON */}
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep}
        aria-label="Previous Learn page"
        data-name="learn-stepper-previous-button"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black shadow-sm transition lg:h-12 lg:w-12 lg:text-base ${
          isFirstStep
            ? "cursor-not-allowed border-[#073B5A]/10 bg-[#F1F5F7] text-[#9AB5C7]"
            : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#F8FBFB]"
        }`}
      >
        <ArrowLeft size={20} strokeWidth={3} />
      </button>

      {/* @SECTION LEARN_STEPPER_STEPS */}
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
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black shadow-sm lg:h-12 lg:w-12 lg:text-base ${
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
                  className={`mt-1 whitespace-nowrap text-center text-[0.68rem] font-black lg:text-xs ${
                    isActive ? "text-[#073B5A]" : "text-[#275875]/75"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {index < learnSteps.length - 1 && (
                <div
                  data-name={`learn-stepper-connector-${index + 1}`}
                  className="mt-5 h-0.5 w-10 border-t-2 border-dashed border-[#9AB5C7]/45 lg:w-12 lg:mt-6"
                />
              )}
            </div>
          );
        })}
      </div>

      {/* @SECTION LEARN_STEPPER_NEXT_BUTTON */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next Learn page"
        data-name="learn-stepper-next-button"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-[#0081A7] lg:h-12 lg:w-12 ${
          isNextHighlighted
            ? "animate-pulse bg-[#F7B733] shadow-[0_0_0_5px_rgba(247,183,51,0.20),0_10px_22px_rgba(247,183,51,0.35)] ring-2 ring-[#F7B733]/35"
            : "bg-[#00AFB9] shadow-[0_8px_18px_rgba(0,175,185,0.28)]"
        }`}
      >
        <ArrowRight size={20} strokeWidth={3} />
      </button>
    </div>
  );
}

export default LearnStepper;
