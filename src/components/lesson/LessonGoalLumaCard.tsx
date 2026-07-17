import LumaAvatar from "../luma/LumaAvatar";
import type { LessonProgress } from "../../lib/lessonProgress";

type LessonGoalLumaCardProps = {
  lessonType: string;
  quizQuestionCount: number;
  progress: LessonProgress;
  starName: string;
  nextStep: string;
  onContinue?: () => void;
};

type GoalItemProps = {
  label: string;
  complete: boolean;
};

function GoalItem({ label, complete }: GoalItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 shadow-sm">
      {complete ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-xs font-black text-white">
          ✓
        </span>
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[#0081A7] bg-white" />
      )}

      <span className={`text-sm font-black ${complete ? "text-[#073B5A]" : "text-[#073B5A]/65"}`}>
        {label}
      </span>
    </div>
  );
}

function EnergyPips({
  completedCount,
  totalCount,
}: {
  completedCount: number;
  totalCount: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalCount }).map((_, index) => {
        const isCharged = index < completedCount;

        return (
          <span
            key={index}
            className={`h-3.5 w-3.5 rounded-full border ${
              isCharged ? "border-[#F4C542] bg-[#F7B733]" : "border-[#073B5A]/15 bg-white"
            }`}
          />
        );
      })}
    </div>
  );
}

function LessonGoalLumaCard({
  lessonType,
  quizQuestionCount,
  progress,
  starName,
  nextStep,
  onContinue,
}: LessonGoalLumaCardProps) {
  const isEvaluation = lessonType === "evaluation";

  const completedCount = isEvaluation
    ? progress.practiceComplete
      ? 1
      : 0
    : [
        progress.warmupComplete,
        progress.learnComplete,
        progress.tryItComplete,
        progress.practiceComplete,
      ].filter(Boolean).length;

  const totalCount = isEvaluation ? 1 : 4;

  const lumaState = progress.lessonComplete
    ? "celebrate"
    : completedCount === 0
      ? "sleepy"
      : completedCount >= totalCount
        ? "charged"
        : "happy";

  const displayStarName = starName || "Your star";

  return (
    <aside className="relative overflow-hidden rounded-[1.75rem] border border-[#F4D589] bg-[#FEF3D9] p-5 shadow-sm">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-[#FFF8E9] blur-2xl" />
      <div className="pointer-events-none absolute right-5 top-4 text-2xl text-[#F7B733]">✦</div>

      <div className="relative z-10 grid h-full gap-4 md:grid-cols-[1fr_210px]">
        <div className="flex min-w-0 flex-col">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0081A7]">
            Today’s Goal
          </p>

          <h2 className="mt-2 text-2xl font-black text-[#073B5A]">
            {completedCount}/{totalCount} Complete
          </h2>

          <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/65">
            {isEvaluation
              ? `Complete ${quizQuestionCount} review questions.`
              : `${displayStarName} is helping you finish today’s lesson.`}
          </p>

          <div className="mt-4 rounded-2xl bg-white/65 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                Star Energy
              </p>

              <p className="text-xs font-black text-[#073B5A]/60">
                {completedCount}/{totalCount}
              </p>
            </div>

            <div className="mt-2">
              <EnergyPips completedCount={completedCount} totalCount={totalCount} />
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {isEvaluation ? (
              <GoalItem label="Evaluation" complete={progress.practiceComplete} />
            ) : (
              <>
                <GoalItem label="Warm-Up" complete={progress.warmupComplete} />
                <GoalItem label="Learn" complete={progress.learnComplete} />
                <GoalItem label="Try It" complete={progress.tryItComplete} />
                <GoalItem label="Practice" complete={progress.practiceComplete} />
              </>
            )}
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/65 p-3 shadow-sm">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                  Next
                </p>

                <p className="text-lg font-black text-[#073B5A]">{nextStep}</p>
              </div>

              <button
                type="button"
                onClick={onContinue}
                className="shrink-0 rounded-xl bg-[#00AFB9] px-4 py-3 text-sm font-black text-white shadow-sm"
              >
                Continue ›
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <LumaAvatar
            name={displayStarName}
            chargeCount={completedCount}
            totalCharge={totalCount}
            size="xl"
            state={lumaState}
            showEnergy={false}
          />
        </div>
      </div>
    </aside>
  );
}

export default LessonGoalLumaCard;
