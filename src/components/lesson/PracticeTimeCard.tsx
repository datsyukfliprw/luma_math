import { Calculator, Check, Pencil, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { getLessonExperience } from "../../data/lessonExperience";
import { LessonFallbackScreen } from "../ui/LessonFallbackScreen";

type PracticeTimeCardProps = {
  lessonId?: string;
  activities: {
    icon: string;
    title: string;
    subtitle: string;
  }[];
};

const practiceModes = [
  { icon: Calculator, label: "Guided" },
  { icon: Pencil, label: "Independent" },
  { icon: Trophy, label: "Challenge" },
];

function PracticeTimeCard({ lessonId }: PracticeTimeCardProps) {
  const basePracticePath = lessonId ? `/practice/${lessonId}` : "/practice";
  const lesson = lessonId ? getLessonExperience(lessonId) : undefined;

  if (lessonId && !lesson) return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;

  return (
    <Link
      to={`${basePracticePath}?mode=guided`}
      data-name="lesson-practice-launch-card"
      className="flex h-full min-h-[220px] w-full flex-col rounded-[1.6rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#00AFB9]/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#073B5A] text-sm font-black text-white">4</span>
          <div>
            <h3 className="text-lg font-black text-[#073B5A]">Practice Time</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0081A7]">3 Activities</p>
          </div>
        </div>
        <p className="text-xs font-bold text-[#073B5A]/65">15 min</p>
      </div>

      <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-[#073B5A]">
        {lesson?.practice.description ?? "Choose a practice mode and build confidence."}
      </p>

      <div className="mt-4 space-y-2">
        {practiceModes.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 rounded-xl bg-[#F3FAFB] px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#0081A7] shadow-sm">
              <Icon size={15} strokeWidth={2.7} />
            </span>
            <span className="text-sm font-black text-[#073B5A]">{label}</span>
            <Check className="ml-auto h-4 w-4 text-[#00AFB9]/40" strokeWidth={3} />
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-4">
        <span className="text-sm font-black text-[#00AFB9]">Start Practice</span>
        <span className="text-lg font-black text-[#0081A7]">›</span>
      </div>
    </Link>
  );
}

export default PracticeTimeCard;
