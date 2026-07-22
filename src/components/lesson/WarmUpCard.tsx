import { useNavigate } from "react-router-dom";
import type { WarmUpData } from "../../types/warmup";
import { getWarmUpQuestionTotal } from "../../types/warmup";

type WarmUpCardProps = {
  factDrill: string;
  warmup?: WarmUpData;
  lessonId: string;
  isComplete: boolean;
};

function WarmUpCard({ factDrill, warmup, lessonId, isComplete }: WarmUpCardProps) {
  const navigate = useNavigate();
  const questionTotal = getWarmUpQuestionTotal(warmup);

  return (
    <button
      type="button"
      onClick={() => navigate(`/warmup/${lessonId}`)}
      data-name="lesson-warmup-launch-card"
      className={`relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.6rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isComplete ? "border-[#00AFB9]/35 bg-[#FDFDFC]" : "border-[#F7B733]/45 bg-[#FFFCF2]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white ${isComplete ? "bg-[#00AFB9]" : "bg-[#073B5A]"}`}>
            {isComplete ? "✓" : "1"}
          </span>
          <div>
            <h3 className="text-lg font-black text-[#073B5A]">Warm-Up</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0081A7]">Quick Review</p>
          </div>
        </div>
        <p className="text-xs font-bold text-[#073B5A]/65">{warmup?.estimated_minutes ?? 5} min</p>
      </div>

      <p className="mt-4 text-sm font-bold leading-6 text-[#073B5A]/75">
        {warmup?.instructions ?? factDrill ?? "Quick review before today’s lesson."}
      </p>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#073B5A]/10 bg-white/80 px-4 py-3">
        <span className="text-xs font-black uppercase tracking-[0.12em] text-[#0081A7]">Warm-Up Plan</span>
        <span className="text-sm font-black text-[#073B5A]">{questionTotal || 5} questions</span>
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className={`text-sm font-black ${isComplete ? "text-[#0081A7]" : "text-[#00AFB9]"}`}>
          {isComplete ? "Review" : "Start"}
        </span>
        <span className="text-lg font-black text-[#0081A7]">›</span>
      </div>
    </button>
  );
}

export default WarmUpCard;
