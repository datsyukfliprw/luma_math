// @SECTION PRACTICE_TIME_CARD_IMPORTS
import { Calculator, Pencil, Sparkles, Trophy } from "lucide-react";
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

// @SECTION PRACTICE_TIME_CARD
function PracticeTimeCard({ lessonId }: PracticeTimeCardProps) {
  const basePracticePath = lessonId ? `/practice/${lessonId}` : "/practice";
  const lesson = lessonId ? getLessonExperience(lessonId) : undefined;

  // Show fallback if lesson experience is missing
  if (lessonId && !lesson) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="experience" />;
  }

  const activities = [
    {
      icon: Calculator,
      title: "Guided Practice",
      subtitle: "Step-by-step problems with hints",
      reward: "Common accessory",
      rewardIcon: "🎒",
      rowClass: "bg-[#E9F7F8]",
      iconClass: "bg-[#00AFB9]/20 text-[#0081A7]",
      rewardClass: "bg-white text-[#0081A7]",
      to: `${basePracticePath}?mode=guided`,
    },
    {
      icon: Pencil,
      title: "Independent Practice",
      subtitle: "Solve on your own",
      reward: "Rare accessory",
      rewardIcon: "✨",
      rowClass: "bg-[#FFF4E3]",
      iconClass: "bg-[#FED9B7]/70 text-[#F07167]",
      rewardClass: "bg-white text-[#C78300]",
      to: `${basePracticePath}?mode=independent`,
    },
    {
      icon: Trophy,
      title: "Challenge Yourself",
      subtitle: "Take it up a notch!",
      reward: "Epic accessory",
      rewardIcon: "👑",
      rowClass: "bg-[#FCE9E5]",
      iconClass: "bg-[#F07167]/20 text-[#F07167]",
      rewardClass: "bg-white text-[#F07167]",
      to: `${basePracticePath}?mode=challenge`,
    },
  ];

  return (
    <div className="h-full rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-3.5 shadow-sm">
      {/* @SECTION PRACTICE_TIME_CARD_HEADER */}
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold text-[#073B5A]">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-sm text-white">
            4
          </span>
          Practice Time
        </h3>

        <p className="shrink-0 text-sm font-bold text-[#073B5A]/70">15 min</p>
      </div>

      <p className="mb-3 text-sm font-semibold leading-snug text-[#073B5A]">
        {lesson?.practice.description ?? "Choose a practice mode and earn a star accessory."}
      </p>

      {/* @SECTION PRACTICE_TIME_MODE_LINKS */}
      <div className="space-y-2">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <Link
              key={activity.title}
              to={activity.to}
              className={`flex w-full items-center gap-2.5 rounded-xl p-2.5 lg:p-3.5 text-left transition hover:shadow-md ${activity.rowClass}`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconClass}`}
              >
                <Icon size={22} strokeWidth={2.7} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black leading-tight text-[#073B5A]">
                  {activity.title}
                </span>

                <span className="mt-0.5 block text-xs font-semibold leading-snug text-[#073B5A]/70">
                  {activity.subtitle}
                </span>

                <span
                  className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.64rem] font-black ${activity.rewardClass}`}
                >
                  <span>{activity.rewardIcon}</span>
                  {activity.reward}
                </span>
              </span>

              <span className="text-lg font-black text-[#073B5A]">›</span>
            </Link>
          );
        })}
      </div>

      {/* @SECTION PRACTICE_TIME_RECOMMENDED_LINK */}
      <Link
        to={`${basePracticePath}?mode=guided`}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#0081A7]"
      >
        <Sparkles size={14} strokeWidth={2.8} />
        Recommended: Guided Practice ›
      </Link>
    </div>
  );
}

export default PracticeTimeCard;
