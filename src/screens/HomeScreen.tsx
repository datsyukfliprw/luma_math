import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleGauge,
  Layers3,
  Map,
  PencilLine,
  Star,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import type { JourneyStepStatus } from "../services/mission/dailyMissionPlanner";
import { useDailyMission } from "../services/mission/useDailyMission";

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

type JourneyNodeProps = {
  step: {
    title: string;
    status: JourneyStepStatus;
  };
  stageImage: string;
  timelineLabel: "Current" | "Up Next" | "After That";
  lessonLabel: string;
};

const quickActions: QuickAction[] = [
  {
    title: "Learn",
    description: "Explore new ideas with guided stories and models.",
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
    description: "Build confidence with focused practice.",
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
    description: "Strengthen memory with quick review.",
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
    description: "See what you have learned and what comes next.",
    buttonLabel: "View Progress",
    to: "/progress",
    icon: Trophy,
    accent: "text-[#2789D9]",
    iconBackground: "bg-[#3B9DE3]",
    cardBackground: "bg-[#F8FCFF]",
    borderColor: "border-[#CBE5F7]",
  },
];

const DEFAULT_MISSION_BACKGROUND =
  "/images/missions/current-mission-generic.png";

const JOURNEY_STAGE_IMAGES = [
  "/images/journey/grade-3/unit-01/place-value-stage-1.png",
  "/images/journey/grade-3/unit-01/place-value-stage-2.png",
  "/images/journey/grade-3/unit-01/place-value-stage-3.png",
  "/images/journey/grade-3/unit-01/place-value-stage-4.png",
  "/images/journey/grade-3/unit-01/place-value-stage-5.png",
] as const;

const JOURNEY_TIMELINE_LABELS = [
  "Current",
  "Up Next",
  "After That",
] as const;

const GARDEN_REWARD_TARGET = 150;

function CompanionOrb() {
  return (
    <div
      aria-hidden="true"
      className="relative h-16 w-16 shrink-0 drop-shadow-[0_12px_18px_rgba(0,129,167,0.22)]"
    >
      <div className="absolute inset-[10%] rounded-[46%_54%_52%_48%/48%_42%_58%_52%] bg-gradient-to-br from-[#51D9E1] via-[#00AFB9] to-[#0081A7] shadow-[inset_0_5px_12px_rgba(255,255,255,0.38)]" />
      <div className="absolute left-[32%] top-[43%] h-2 w-2 rounded-full bg-[#073B5A]" />
      <div className="absolute right-[32%] top-[43%] h-2 w-2 rounded-full bg-[#073B5A]" />
      <div className="absolute left-1/2 top-[58%] h-2 w-5 -translate-x-1/2 rounded-b-full border-b-[3px] border-[#073B5A]" />
      <div className="absolute left-[26%] top-[53%] h-1.5 w-2.5 rounded-full bg-[#FFAAA2]/75" />
      <div className="absolute right-[26%] top-[53%] h-1.5 w-2.5 rounded-full bg-[#FFAAA2]/75" />
      <div className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#FDFCDC] shadow-md">
        <Star
          className="h-5 w-5 fill-[#FFC61A] text-[#F3A900]"
          strokeWidth={2.2}
        />
      </div>
      <div className="absolute -bottom-1 left-1/2 h-4 w-[78%] -translate-x-1/2 rounded-[50%] bg-[#BCE8F0] blur-[1px]" />
    </div>
  );
}

function JourneyNode({
  step,
  stageImage,
  timelineLabel,
  lessonLabel,
}: JourneyNodeProps) {
  const isComplete = step.status === "complete";
  const isCurrent = step.status === "current";
  const isNotYet = !isComplete && !isCurrent;

  const circleClass = isComplete
    ? "border-[#65CB70] bg-[#F3FFF4] shadow-[0_10px_22px_rgba(47,158,68,0.13)]"
    : isCurrent
      ? "border-[#00AFB9] bg-white shadow-[0_0_0_8px_rgba(0,175,185,0.08),0_14px_28px_rgba(0,129,167,0.18)]"
      : "border-[#CAD1D7] bg-[#F8FAFB]";

  const timelineLabelClass =
    timelineLabel === "Current"
      ? "text-[#008D99]"
      : timelineLabel === "Up Next"
        ? "text-[#526D82]"
        : "text-[#8796A3]";

  const displayTitle = step.title
    .replace(/^unit evaluation:\s*/i, "")
    .replace(/^evaluation:\s*/i, "");

  return (
    <div className="flex w-[138px] shrink-0 flex-col items-center text-center">
      <p
        className={`mb-2 text-[0.68rem] font-black uppercase tracking-[0.16em] ${timelineLabelClass}`}
      >
        {timelineLabel}
      </p>

      <div
        className={`relative flex h-[108px] w-[108px] items-center justify-center overflow-hidden rounded-full border-2 ${circleClass}`}
      >
        <img
          src={stageImage}
          alt=""
          aria-hidden="true"
          draggable={false}
          className={`pointer-events-none h-[104px] w-[104px] select-none object-cover object-center ${
            isNotYet ? "grayscale opacity-55" : ""
          }`}
        />

        {isComplete && (
          <span className="absolute right-0.5 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#42BF50] text-white shadow-md">
            <Check className="h-5 w-5" strokeWidth={3.2} />
          </span>
        )}
      </div>

      <p className="mt-3 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8796A3]">
        {lessonLabel}
      </p>

      <p
        className={`mt-1 min-h-[44px] text-sm font-black leading-[1.25rem] ${
          isCurrent ? "text-[#073B5A]" : "text-[#38546A]"
        }`}
      >
        {displayTitle}
      </p>
    </div>
  );
}

function HomeScreen() {
  const { studentState } = useStudentProgress();
  const { currentMission, journeySteps, progress, summary, pathway } =
    useDailyMission();

  const studentName =
    studentState.starProfile.studentName || "Explorer";

  const starsCollected = Object.values(studentState.practiceRewards)
    .flatMap((lessonReward) => Object.values(lessonReward))
    .filter((reward) => reward.completed).length;

  const lessonJourneySteps = journeySteps.filter((step) => {
    const normalizedTitle = step.title.trim().toLowerCase();

    return step.status !== "reward" && normalizedTitle !== "start";
  });

  const currentConceptCount = lessonJourneySteps.filter(
    (step) => step.status === "current",
  ).length;

  const currentStepIndex = Math.max(
    0,
    lessonJourneySteps.findIndex((step) => step.status === "current"),
  );

  const visibleJourneySteps = lessonJourneySteps.slice(
    currentStepIndex,
    currentStepIndex + 3,
  );

  const gardenProgress = Math.min(
    100,
    Math.round((starsCollected / GARDEN_REWARD_TARGET) * 100),
  );

  return (
    <main
      data-name="home-screen"
      className="h-full min-h-0 w-full min-w-0 overflow-hidden bg-[#FDFBF6] px-4 pb-28 pt-5 sm:px-5 lg:px-6 lg:pb-6 lg:pt-6"
    >
      <div className="mx-auto flex h-full min-h-0 w-full max-w-[1080px] flex-col">
        {/* @SECTION Home header */}
        <header
          data-name="home-header"
          className="mb-4 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
        >
          <div>
            <p className="mb-1 text-sm font-black uppercase tracking-[0.18em] text-[#00A9B4]">
              Today&apos;s adventure
            </p>

            <h1 className="text-3xl font-black tracking-tight text-[#062E50] sm:text-4xl">
              Welcome back, {studentName}!
            </h1>

            <p className="mt-2 text-base font-bold text-[#5A7188] sm:text-lg">
              Your next math mission is ready when you are.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-[#DCE6EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(7,59,90,0.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8FAF7] text-[#00A9A5]">
                <CircleGauge className="h-5 w-5" strokeWidth={2.8} />
              </div>

              <div>
                <p className="text-lg font-black leading-none text-[#073B5A]">
                  {summary.streakDays}
                </p>
                <p className="mt-1 text-xs font-bold text-[#6B7F91]">
                  Learning sessions
                </p>
              </div>
            </div>

            <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-[#DCE6EA] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(7,59,90,0.06)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8D5] text-[#F2A900]">
                <Star
                  className="h-5 w-5 fill-[#FFC61A]"
                  strokeWidth={2.4}
                />
              </div>

              <div>
                <p className="text-lg font-black leading-none text-[#073B5A]">
                  {starsCollected}
                </p>
                <p className="mt-1 text-xs font-bold text-[#6B7F91]">
                  Stars collected
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* @SECTION Mission and journey */}
        <section
          data-name="home-primary-grid"
          className="grid items-stretch gap-4 xl:grid-cols-[330px_minmax(0,1fr)]"
        >
          <article
            data-name="current-mission-card"
            className="relative isolate overflow-hidden rounded-[2rem] border border-[#DBE5E8] bg-white shadow-[0_16px_38px_rgba(7,59,90,0.10)]"
          >
            <img
              src={DEFAULT_MISSION_BACKGROUND}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="pointer-events-none absolute inset-0 -z-20 h-full w-full select-none object-cover object-center"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.84)_35%,rgba(255,255,255,0.18)_66%,rgba(255,255,255,0.28)_100%)]"
            />

            <div
              data-name="current-mission-artwork"
              className="relative min-h-[300px] px-6 pb-24 pt-6"
            >
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#008D99]">
                Current mission
              </p>

              <h2 className="mt-6 max-w-[275px] text-[1.8rem] font-black leading-tight text-[#062E50]">
                {currentMission?.title ?? "No mission available"}
              </h2>

              <p className="mt-4 max-w-[260px] text-sm font-bold leading-6 text-[#526D82]">
                {currentMission?.subtitle ??
                  "Check back soon for your next mission."}
              </p>
            </div>

            <div className="relative space-y-3 border-t border-white/55 bg-white/10 p-5 backdrop-blur-[2px]">
              <Link
                to={currentMission?.to ?? "/learning-path"}
                className="flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#00AFB9] px-5 text-base font-black text-white shadow-[0_12px_24px_rgba(0,175,185,0.28)] transition hover:-translate-y-0.5 hover:bg-[#009DA7] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00AFB9]/20"
              >
                {currentMission
                  ? "Continue Mission"
                  : "Go to Learning Path"}
                <ArrowRight className="h-5 w-5" strokeWidth={3} />
              </Link>

              <Link
                to="/learning-path"
                className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-white/80 bg-white/80 px-5 text-sm font-black text-[#24506C] shadow-[0_8px_18px_rgba(7,59,90,0.10)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/95 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00AFB9]/15"
              >
                View mission details
              </Link>
            </div>
          </article>

          <article
            data-name="learning-journey-card"
            className="min-w-0 rounded-[2rem] border border-[#DBE5E8] bg-white p-5 shadow-[0_16px_38px_rgba(7,59,90,0.10)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.12em] text-[#00A9B4]">
                  Your learning journey
                </p>

                <h2 className="mt-1 text-[1.35rem] font-black text-[#073B5A]">
                  {pathway.title}
                </h2>
              </div>

              <Link
                to="/learning-path"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#D6E1E5] bg-white px-4 text-sm font-black text-[#234C68] transition hover:bg-[#F4FAFB]"
              >
                <Map
                  className="h-5 w-5 text-[#00AFB9]"
                  strokeWidth={2.5}
                />
                View Full Map
              </Link>
            </div>

            <div className="mt-4 min-w-0 overflow-hidden">
              <div className="grid grid-cols-[138px_minmax(28px,1fr)_138px_minmax(28px,1fr)_138px] items-start justify-center px-1">
                {visibleJourneySteps.map((step, index) => {
                  const globalStepIndex = lessonJourneySteps.findIndex(
                    (journeyStep) => journeyStep.id === step.id,
                  );

                  const unitStageIndex =
                    Math.max(globalStepIndex, 0) % JOURNEY_STAGE_IMAGES.length;

                  const stageImage = JOURNEY_STAGE_IMAGES[unitStageIndex];
                  const lessonLabel =
                    unitStageIndex === 4
                      ? "Final Mission"
                      : `Lesson ${unitStageIndex + 1}`;

                  return (
                    <div key={step.id} className="contents">
                      <JourneyNode
                        step={step}
                        stageImage={stageImage}
                        timelineLabel={JOURNEY_TIMELINE_LABELS[index]}
                        lessonLabel={lessonLabel}
                      />

                      {index < visibleJourneySteps.length - 1 && (
                        <div className="mt-[83px] w-full border-t-[3px] border-dashed border-[#B8C0C7]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#DBE5E8] bg-[#FBFDFD] px-5 py-3.5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6FAF9] text-[#00A9A5]">
                    <CircleGauge
                      className="h-5 w-5"
                      strokeWidth={2.7}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#073B5A]">
                      Pathway progress
                    </p>

                    <p className="text-xs font-bold text-[#718395]">
                      {summary.conceptsComplete} concept
                      {summary.conceptsComplete === 1 ? "" : "s"} strong
                      {" · "}
                      {currentConceptCount} currently growing
                    </p>
                  </div>
                </div>

                <p className="text-sm font-black text-[#00A9A5]">
                  You&apos;re building momentum!
                </p>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#E5EBEE]">
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
          className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <article
                key={action.title}
                className={`flex min-h-[185px] flex-col rounded-[1.75rem] border ${action.borderColor} ${action.cardBackground} p-4 shadow-[0_12px_30px_rgba(7,59,90,0.07)]`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${action.iconBackground} text-white shadow-[0_10px_22px_rgba(7,59,90,0.16)]`}
                  >
                    <Icon
                      className="h-6 w-6"
                      strokeWidth={2.4}
                    />
                  </div>

                  <h3 className={`text-xl font-black ${action.accent}`}>
                    {action.title}
                  </h3>
                </div>

                <p className="mt-3 text-sm font-bold leading-6 text-[#60758A]">
                  {action.description}
                </p>

                <Link
                  to={action.to}
                  className={`mt-auto inline-flex min-h-11 items-center justify-between rounded-xl px-1 text-sm font-black ${action.accent} transition hover:translate-x-0.5`}
                >
                  {action.buttonLabel}
                  <ArrowRight
                    className="h-4 w-4"
                    strokeWidth={3}
                  />
                </Link>
              </article>
            );
          })}
        </section>

        {/* @SECTION Full-width garden reward */}
        <section
          data-name="home-garden-reward"
          className="mt-4 flex min-h-[78px] items-center gap-5 rounded-[1.75rem] border border-[#D8E8EC] bg-gradient-to-r from-[#F5FCFD] via-white to-white px-5 py-3 shadow-[0_12px_30px_rgba(7,59,90,0.07)]"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black uppercase tracking-[0.12em] text-[#00A9B4]">
              Next garden reward
            </p>

            <p className="mt-1 text-sm font-bold text-[#647A8D]">
              Keep learning to grow a new star-garden surprise.
            </p>
          </div>

          <CompanionOrb />

          <p className="shrink-0 text-2xl font-black text-[#073B5A]">
            {GARDEN_REWARD_TARGET} Stars
          </p>

          <div className="flex min-w-[250px] flex-1 items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#E4EBEE]">
              <div
                className="h-full rounded-full bg-[#00AFB9]"
                style={{ width: `${gardenProgress}%` }}
              />
            </div>

            <p className="shrink-0 text-xs font-black text-[#587086]">
              {starsCollected} / {GARDEN_REWARD_TARGET}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default HomeScreen;
