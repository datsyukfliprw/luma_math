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

  // Show fallback if lesson experience is missing
  if (!lesson) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;
  }

  function startLearn() {
    navigate(`/learn/${lessonId}`);
  }

  return (
    <div
      className={`relative h-full min-h-[260px] overflow-hidden rounded-[1.75rem] border bg-white px-5 py-4 shadow-sm ${
        isComplete ? "border-[#00AFB9]/30" : "border-[#073B5A]/10"
      }`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-black text-white ${
                isComplete ? "bg-[#00AFB9]" : "bg-[#073B5A]"
              }`}
            >
              {isComplete ? "✓" : "2"}
            </span>

            <div>
              <h3 className="text-xl font-black text-[#073B5A]">Learn</h3>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                Big Idea
              </p>
            </div>
          </div>

          <p className="shrink-0 text-sm font-bold text-[#073B5A]/70">10 min</p>
        </div>

        <p className="text-sm font-bold leading-relaxed text-[#073B5A]/75">{concept}</p>

        <div className="mt-4 rounded-2xl bg-[#FFF3D9] p-4 text-center">
          <p className="text-sm font-black leading-snug text-[#073B5A]">{lesson.title}</p>

          <div className="mt-3 rounded-2xl bg-white/65 p-3">
            <p className="text-lg font-black text-[#073B5A]">
              {lesson.bigIdea.examples[0].expression}
            </p>
            <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
              {lesson.bigIdea.examples[0].note}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={startLearn}
          className={`mt-4 w-fit rounded-xl px-5 py-2.5 text-sm lg:px-7 lg:py-3.5 lg:text-base font-black shadow-sm ${
            isComplete ? "bg-[#E9F7F8] text-[#0081A7]" : "bg-[#00AFB9] text-white"
          }`}
        >
          {isComplete ? "Review Learn ›" : "Start Learn ›"}
        </button>
      </div>

      <div className="pointer-events-none absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-[#E9F7F8] opacity-80 blur-2xl" />
    </div>
  );
}

export default LearnCard;
