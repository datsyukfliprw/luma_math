import { useNavigate } from "react-router-dom";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../ui/LessonFallbackScreen";

type LearnCardProps = {
  lessonId: string;
  concept: string;
  isComplete: boolean;
};

function LearnCard({ lessonId, concept, isComplete }: LearnCardProps) {
  const navigate = useNavigate();
  const lesson = getLessonExperience(lessonId);

  if (!lesson) return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;

  return (
    <button
      type="button"
      onClick={() => navigate(`/learn/${lessonId}`)}
      data-name="lesson-learn-launch-card"
      className={`relative flex h-full min-h-[220px] w-full flex-col overflow-hidden rounded-[1.6rem] border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isComplete ? "border-[#00AFB9]/30" : "border-[#073B5A]/10"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white ${isComplete ? "bg-[#00AFB9]" : "bg-[#073B5A]"}`}>
            {isComplete ? "✓" : "2"}
          </span>
          <div>
            <h3 className="text-lg font-black text-[#073B5A]">Learn</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0081A7]">Big Idea</p>
          </div>
        </div>
        <p className="text-xs font-bold text-[#073B5A]/65">10 min</p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-bold leading-6 text-[#073B5A]/75">{concept}</p>

      <div className="mt-4 rounded-2xl bg-[#FFF3D9] px-4 py-3 text-center">
        <p className="text-base font-black text-[#073B5A]">{lesson.bigIdea.examples[0].expression}</p>
        <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-[#073B5A]/65">
          {lesson.bigIdea.examples[0].note}
        </p>
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

export default LearnCard;
