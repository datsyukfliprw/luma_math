import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleGauge,
  Flame,
  Layers3,
  LockKeyhole,
  Map,
  PencilLine,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDailyMission } from "../services/mission/useDailyMission";
import type { JourneyStepStatus } from "../services/mission/dailyMissionPlanner";

type QuickAction = {
  title: string;
  description: string;
  buttonLabel: string;
  to: string;
  icon: LucideIcon;
  accent: string;
  iconBackground: string;
  cardBackground: string;
  borderColor: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Learn",
    description: "Explore ideas with stories, models, and guided discovery.",
    buttonLabel: "Start Learning",
    to: "/lesson",
    icon: BookOpen,
    accent: "text-[#00A9A5]",
    iconBackground: "bg-[#00AFB9]",
    cardBackground: "bg-[#F5FEFD]",
    borderColor: "border-[#BCEBE8]",
  },
  {
    title: "Practice",
    description: "Build confidence with focused, just-right practice.",
    buttonLabel: "Go to Practice",
    to: "/practice",
    icon: PencilLine,
    accent: "text-[#F59E0B]",
    iconBackground: "bg-[#FFB21A]",
    cardBackground: "bg-[#FFFCF5]",
    borderColor: "border-[#FBE1AF]",
  },
  {
    title: "Flashcards",
    description: "Strengthen memory with quick, friendly review.",
    buttonLabel: "Review Cards",
    to: "/flashcards",
    icon: Layers3,
    accent: "text-[#8055D9]",
    iconBackground: "bg-[#8B5CE6]",
    cardBackground: "bg-[#FCFAFF]",
    borderColor: "border-[#DED2F8]",
  },
  {
    title: "Progress",
    description: "See the concepts you have grown and what comes next.",
    buttonLabel: "View Progress",
    to: "/progress",
    icon: Trophy,
    accent: "text-[#2789D9]",
    iconBackground: "bg-[#3B9DE3]",
    cardBackground: "bg-[#F8FCFF]",
    borderColor: "border-[#CBE5F7]",
  },
];

function CompanionOrb({ size = "large" }: { size?: "small" | "large" }) {
  const dimensions = size === "large" ? "h-28 w-28" : "h-20 w-20";

  return (
    <div
      aria-hidden="true"
      className={`relative ${dimensions} shrink-0 drop-shadow-[0_16px_22px_rgba(0,129,167,0.23)]`}
    >
      <div className="absolute inset-[10%] rounded-[46%_54%_52%_48%/48%_42%_58%_52%] bg-gradient-to-br from-[#51D9E1] via-[#00AFB9] to-[#0081A7] shadow-[inset_0_5px_12px_rgba(255,255,255,0.38)]" />
      <div className="absolute left-[32%] top-[43%] h-2.5 w-2.5 rounded-full bg-[#073B5A]" />
      <div className="absolute right-[32%] top-[43%] h-2.5 w-2.5 rounded-full bg-[#073B5A]" />
      <div className="absolute left-1/2 top-[58%] h-2.5 w-6 -translate-x-1/2 rounded-b-full border-b-[3px] border-[#073B5A]" />
      <div className="absolute left-[26%] top-[53%] h-2 w-3 rounded-full bg-[#FFAAA2]/75" />
      <div className="absolute right-[26%] top-[53%] h-2 w-3 rounded-full bg-[#FFAAA2]/75" />
      <div className="absolute left-1/2 top-0 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-[#FDFCDC] shadow-md">
        <Star className="h-6 w-6 fill-[#FFC61A] text-[#F3A900]" strokeWidth={2.2} />
      </div>
      <div className="absolute -bottom-1 left-1/2 h-5 w-[78%] -translate-x-1/2 rounded-[50%] bg-[#BCE8F0] blur-[1px]" />
    </div>
  );
}

function JourneyNode({ step }: { step: { title: string; status: JourneyStepStatus } }) {
  const styles: Record<JourneyStepStatus, string> = {
    complete:
      "border-[#8EDB93] bg-gradient-to-b from-[#F2FFF3] to-[#D7F5D8] text-[#2F9E44] shadow-[0_10px_20px_rgba(47,158,68,0.16)]",
    current:
      "border-[#71D9DC] bg-gradient-to-b from-white to-[#E9FAFA] text-[#00A8B0] shadow-[0_0_0_9px_rgba(0,175,185,0.08),0_14px_28px_rgba(0,129,167,0.18)]",
    locked:
      "border-[#D5D9DE] bg-gradient-to-b from-[#FAFAFA] to-[#E7E9EC] text-[#9BA2AA]",
    reward:
      "border-[#F2C14E] bg-gradient-to-b from-[#FFFDF0] to-[#FFE59A] text-[#CB8B00] shadow-[0_14px_28px_rgba(203,139,0,0.18)]",
  };

  return (
    <div className="flex w-[126px] shrink-0 flex-col items-center text-center">
      <div
        className={`relative flex h-[82px] w-[92px] items-center justify-center rounded-[2rem] border-2 ${styles[step.status]}`}
      >
        <div className="absolute -bottom-2 h-5 w-[72%] rounded-[50%] bg-current opacity-10" />

        {step.status === "complete" && (
          <Check className="h-9 w-9" strokeWidth={3} />
        )}
        {step.status === "current" && (
          <Sparkles className="h-9 w-9" strokeWidth={2.5} />
        )}
        {step.status === "locked" && (
          <LockKeyhole className="h-9 w-9" strokeWidth={2.4} />
        )}
        {step.status === "reward" && (
          <Trophy className="h-9 w-9" strokeWidth={2.4} />
        )}
      </div>

      <p
        className={`mt-4 min-h-10 text-sm font-black leading-5 ${
          step.status === "current" ? "text-[#073B5A]" : "text-[#38546A]"
        }`}
      >
        {step.title}
      </p>

      <div
        className={`mt-2 h-3 w-3 rounded-full ${
          step.status === "complete"
            ? "bg-[#54C95B]"
            : step.status === "current"
              ? "bg-[#00AFB9] shadow-[0_0_0_5px_rgba(0,175,185,0.10)]"
              : "bg-[#BBC1C7]"
        }`}
      />
    </div>
  );
}

function HomeScreen() {
    const { currentMission, journeySteps, progress, summary, pathway } = useDailyMission();

    const currentConceptCount = currentMission ? 1 : 0;

    return (
    <main
      data-name="home-screen"
      className="min-h-full w-full min-w-0 overflow-x-hidden bg-[#FDFBF6] px-4 pb-28 pt-5 sm:px-5 lg:px-6 lg:pb-6 lg:pt-6"
    >
      <div className="mx-auto w-full max-w-[1080px]">
        {/* @SECTION Home header */}
        <header
          data-name="home-header"
          className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
        >
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-[0.18em] text-[#00A9B4]">
              Today&apos;s adventure
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#062E50] sm:text-4xl">
              Welcome back, Ava!
            </h1>
            <p className="mt-2 text-base font-bold text-[#5A7188] sm:text-lg">
              Your next math mission is ready when you are.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-[#DCE6EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(7,59,90,0.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8FAF7] text-[#00A9A5]">
                <Flame className="h-5 w-5" strokeWidth={2.8} />
              </div>
              <div>
                <p className="text-lg font-black leading-none text-[#073B5A]">{summary.streakDays}</p>
                <p className="mt-1 text-xs font-bold text-[#6B7F91]">Learning days</p>
              </div>
            </div>

            <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-[#DCE6EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(7,59,90,0.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8D5] text-[#F2A900]">
                <Star className="h-5 w-5 fill-[#FFC61A]" strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-lg font-black leading-none text-[#073B5A]">120</p>
                <p className="mt-1 text-xs font-bold text-[#6B7F91]">Stars collected</p>
              </div>
            </div>
          </div>
        </header>

        {/* @SECTION Mission and journey */}
        <section
          data-name="home-primary-grid"
          className="grid items-stretch gap-4 xl:grid-cols-[285px_minmax(0,1fr)]"
        >
          <article className="relative overflow-hidden rounded-[2rem] border border-[#DBE5E8] bg-white shadow-[0_16px_38px_rgba(7,59,90,0.10)]">
            <div className="relative min-h-[300px] overflow-hidden bg-gradient-to-b from-white via-white to-[#F3FBF8] px-6 pb-24 pt-6">
              <div className="absolute -right-16 top-4 h-44 w-44 rounded-full bg-[#E8F8FC]" />
              <div className="absolute -left-12 bottom-8 h-36 w-52 rounded-[50%] bg-[#B9DF69]" />
              <div className="absolute left-20 bottom-7 h-24 w-56 rounded-[50%] bg-[#8FD05D]" />
              <div className="absolute right-7 bottom-6">
                <CompanionOrb size="large" />
              </div>

              <p className="relative text-sm font-black uppercase tracking-[0.12em] text-[#00A9B4]">
                Current mission
              </p>
              <h2 className="relative mt-6 max-w-[230px] text-3xl font-black leading-tight text-[#062E50]">
                {currentMission?.title ?? "No mission available"}
              </h2>
              <p className="relative mt-4 max-w-[230px] text-sm font-bold leading-6 text-[#60758A]">
                {currentMission?.subtitle ?? "Check back soon for your next mission."}
              </p>
            </div>

            <div className="space-y-3 border-t border-[#E4ECEE] bg-white p-5">
              <Link
                to={currentMission?.to ?? "/lesson"}
                className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#00AFB9] px-5 text-base font-black text-white shadow-[0_12px_24px_rgba(0,175,185,0.24)] transition hover:-translate-y-0.5 hover:bg-[#009DA7] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00AFB9]/20"
              >
                {currentMission ? "Continue Mission" : "Go to Learning Path"}
                <ArrowRight className="h-5 w-5" strokeWidth={3} />
              </Link>

              <Link
                to="/learning-path"
                className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-[#9EDFE2] px-5 text-sm font-black text-[#24506C] transition hover:bg-[#F1FCFC] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00AFB9]/15"
              >
                View mission details
              </Link>
            </div>
          </article>

          <article className="min-w-0 rounded-[2rem] border border-[#DBE5E8] bg-white p-5 shadow-[0_16px_38px_rgba(7,59,90,0.10)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#00A9B4]">
                  Your learning journey
                </p>
                <h2 className="mt-1 text-xl font-black text-[#073B5A]">
                  {pathway.title}
                </h2>
              </div>

              <Link
                to="/learning-path"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#D6E1E5] bg-white px-4 text-sm font-black text-[#234C68] transition hover:bg-[#F4FAFB]"
              >
                <Map className="h-5 w-5 text-[#00AFB9]" strokeWidth={2.5} />
                View Full Map
              </Link>
            </div>

            <div className="mt-8 overflow-x-auto pb-3">
              <div className="flex min-w-max items-start px-1 pb-2">
                {journeySteps.map((step, index) => (
                  <div key={step.id} className="flex items-start">
                    <JourneyNode step={step} />
                    {index < journeySteps.length - 1 && (
                      <div className="mt-10 w-12 border-t-[3px] border-dashed border-[#B8C0C7] sm:w-16 xl:w-20" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#DBE5E8] bg-[#FBFDFD] px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FAF9] text-[#00A9A5]">
                    <CircleGauge className="h-5 w-5" strokeWidth={2.7} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#073B5A]">Pathway progress</p>
                    <p className="text-xs font-bold text-[#718395]">
                      {summary.conceptsComplete} concept{summary.conceptsComplete === 1 ? "" : "s"} strong · {currentConceptCount} currently growing
                    </p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#00A9A5]">You&apos;re building momentum!</p>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#E5EBEE]">
                <div
                  className="h-full rounded-full bg-[#00AFB9]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </article>
        </section>

        {/* @SECTION Quick action cards */}
        <section
          data-name="home-quick-actions"
          className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_210px]"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <article
                key={action.title}
                className={`flex min-h-[250px] flex-col rounded-[2rem] border ${action.borderColor} ${action.cardBackground} p-5 shadow-[0_12px_30px_rgba(7,59,90,0.07)]`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full ${action.iconBackground} text-white shadow-[0_10px_22px_rgba(7,59,90,0.16)]`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.4} />
                </div>

                <h3 className={`mt-4 text-xl font-black ${action.accent}`}>{action.title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-[#60758A]">
                  {action.description}
                </p>

                <Link
                  to={action.to}
                  className={`mt-auto flex min-h-12 items-center justify-between rounded-2xl border ${action.borderColor} bg-white/80 px-4 text-sm font-black ${action.accent} transition hover:-translate-y-0.5 hover:bg-white`}
                >
                  {action.buttonLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={3} />
                </Link>
              </article>
            );
          })}

          <article className="relative overflow-hidden rounded-[2rem] border border-[#D8E8EC] bg-gradient-to-b from-[#F1FBFD] to-white p-5 text-center shadow-[0_12px_30px_rgba(7,59,90,0.08)] md:col-span-2 xl:col-span-1">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#00A9B4]">
              Next garden reward
            </p>

            <div className="mt-4 flex justify-center">
              <CompanionOrb size="small" />
            </div>

            <p className="mt-3 text-xl font-black text-[#073B5A]">150 Stars</p>
            <p className="mx-auto mt-2 max-w-[180px] text-sm font-bold leading-5 text-[#647A8D]">
              Keep learning to grow a new star-garden surprise.
            </p>

            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-[#E4EBEE]">
              <div className="h-full w-[80%] rounded-full bg-[#00AFB9]" />
            </div>
            <p className="mt-2 text-right text-xs font-black text-[#587086]">120 / 150</p>
          </article>
        </section>
      </div>
    </main>
  );
}

export default HomeScreen;
