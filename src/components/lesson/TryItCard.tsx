// @SECTION TRYIT_CARD_TYPES
import { useNavigate } from "react-router-dom";
import { requireLessonExperience } from "../../data/lessonExperience";

type TryItCardProps = {
  lessonId: string;
  isComplete?: boolean;
};

// @SECTION TRYIT_CARD
function TryItCard({ lessonId, isComplete = false }: TryItCardProps) {
  const navigate = useNavigate();
  const lesson = requireLessonExperience(lessonId);
  const preview = lesson.tryIt.problems[0];

  return (
    <button
      type="button"
      onClick={() => navigate(`/try-it/${lessonId}`)}
      data-name="lesson-try-it-launch-card"
      className="flex h-full w-full flex-col rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#00AFB9]/30 hover:shadow-md"
    >
      {/* @SECTION TRYIT_CARD_HEADER */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ${
              isComplete ? "bg-[#00AFB9]" : "bg-[#073B5A]"
            }`}
          >
            {isComplete ? "✓" : "3"}
          </span>

          <div>
            <h3 className="text-xl font-black leading-none tracking-[-0.02em] text-[#073B5A]">
              Try It
            </h3>

            <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              Guided Step
            </p>
          </div>
        </div>

        <p className="pt-1 text-sm font-bold text-[#073B5A]/70">10 min</p>
      </div>

      {/* @SECTION TRYIT_CARD_COPY */}
      <p className="mb-4 text-sm font-semibold leading-relaxed text-[#073B5A]">{preview.tip}</p>

      {/* @SECTION TRYIT_CARD_PREVIEW */}
      <div className="rounded-2xl border border-[#00AFB9]/15 bg-[#E9F7F8] p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
          Try It Together
        </p>

        <p className="mt-1 text-sm font-black leading-relaxed text-[#073B5A]">{preview.question}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xl">
          {Array.from({ length: Number(preview.groups) }).map((_, index) => (
            <span
              key={index}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-inner"
            >
              {preview.visualEmoji}
            </span>
          ))}
        </div>
      </div>

      {/* @SECTION TRYIT_CARD_ACTION */}
      <div className="mt-auto pt-4">
        <div
          className={`inline-flex rounded-xl px-5 py-2 text-sm font-black shadow-sm ${
            isComplete ? "bg-[#E9F7F8] text-[#0081A7]" : "bg-[#00AFB9] text-white"
          }`}
        >
          {isComplete ? "Review Try It ›" : "Start Try It ›"}
        </div>
      </div>
    </button>
  );
}

export default TryItCard;
