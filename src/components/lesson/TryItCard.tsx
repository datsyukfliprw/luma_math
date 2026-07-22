import { useNavigate } from "react-router-dom";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../ui/LessonFallbackScreen";

type TryItCardProps = {
  lessonId: string;
  practice: string;
  practiceType: string;
  isComplete?: boolean;
};

function TryItCard({ lessonId, isComplete = false }: TryItCardProps) {
  const navigate = useNavigate();
  const lesson = getLessonExperience(lessonId);

  if (!lesson || !lesson.tryIt?.problems.length)
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;

  const preview = lesson.tryIt.problems[0];
  const groupCount = Math.min(Number(preview.groups) || 0, 5);

  return (
    <button
      type="button"
      onClick={() => navigate(`/try-it/${lessonId}`)}
      data-name="lesson-try-it-launch-card"
      className="flex h-full min-h-[220px] w-full flex-col rounded-[1.6rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#00AFB9]/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white ${isComplete ? "bg-[#00AFB9]" : "bg-[#073B5A]"}`}
          >
            {isComplete ? "✓" : "3"}
          </span>
          <div>
            <h3 className="text-lg font-black text-[#073B5A]">Try It</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0081A7]">
              Guided Step
            </p>
          </div>
        </div>
        <p className="text-xs font-bold text-[#073B5A]/65">10 min</p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-[#073B5A]">
        {preview.tip}
      </p>

      <div className="mt-4 rounded-2xl border border-[#00AFB9]/15 bg-[#E9F7F8] px-3 py-3">
        <p className="line-clamp-2 text-sm font-black leading-5 text-[#073B5A]">
          {preview.question}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-lg">
          {Array.from({ length: groupCount }).map((_, index) => (
            <span
              key={index}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-inner"
            >
              {preview.visualEmoji}
            </span>
          ))}
        </div>
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

export default TryItCard;
