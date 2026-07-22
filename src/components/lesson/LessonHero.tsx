import LumaAvatar from "../luma/LumaAvatar";
import { useDelightAnimation } from "../animations/DelightAnimationProvider";
import type { LessonProgress } from "../../contexts/StudentProgressContext";

type LessonHeroProps = {
  unitNumber: number;
  chapterTitle?: string;
  conceptTitle?: string;
  title: string;
  topic: string;
  description: string;
  minutes: number;
  grade: string;
  lessonType: string;
  quizQuestionCount: number;
  progress: LessonProgress;
  starName: string;
};

type GoalItemProps = {
  label: string;
  complete: boolean;
};

function GoalItem({ label, complete }: GoalItemProps) {
  return (
    <div className="flex items-center gap-2">
      {complete ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-[10px] font-black text-white">
          ✓
        </span>
      ) : (
        <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[#0081A7] bg-white" />
      )}
      <span className={`text-[13px] font-black ${complete ? "text-[#073B5A]" : "text-[#073B5A]/65"}`}>
        {label}
      </span>
    </div>
  );
}

function GoalProgressBar({ completedCount, totalCount }: { completedCount: number; totalCount: number }) {
  const percent = Math.round((completedCount / Math.max(totalCount, 1)) * 100);

  return (
    <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-[#073B5A]/10">
      <div className="h-full rounded-full bg-[#F7B733]" style={{ width: `${percent}%` }} />
    </div>
  );
}

function LessonHero({
  unitNumber,
  chapterTitle,
  conceptTitle,
  title,
  description,
  minutes,
  grade,
  lessonType,
  quizQuestionCount,
  progress,
  starName,
}: LessonHeroProps) {
  const { registerStarTarget, starReaction } = useDelightAnimation();
  const isEvaluation = lessonType === "evaluation";

  const completedCount = isEvaluation
    ? progress.practiceComplete
      ? 1
      : 0
    : [progress.warmupComplete, progress.learnComplete, progress.tryItComplete, progress.practiceComplete].filter(Boolean).length;

  const totalCount = isEvaluation ? 1 : 4;

  const lumaState = progress.lessonComplete
    ? "celebrate"
    : completedCount === 0
      ? "sleepy"
      : completedCount >= totalCount
        ? "charged"
        : "happy";

  return (
    <section
      data-name="lesson-hero"
      className="mb-4 overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-white shadow-sm"
    >
      <div className="grid xl:grid-cols-[minmax(0,2.25fr)_minmax(250px,0.85fr)]">
        <div className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <p className="text-[13px] font-black leading-5 text-[#426B82]">
              Grade 3 <span className="mx-1.5 text-[#073B5A]/30">›</span> Unit {unitNumber}
              {chapterTitle && (
                <>
                  <span className="mx-1.5 text-[#073B5A]/30">›</span> {chapterTitle}
                </>
              )}
              {conceptTitle && (
                <>
                  <span className="mx-1.5 text-[#073B5A]/30">›</span> {conceptTitle}
                </>
              )}
            </p>

            <h1 className="mt-3 text-[2rem] font-black leading-[1.08] tracking-[-0.03em] text-[#073B5A] xl:text-[2.15rem]">
              {title}
            </h1>

            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#F4D589] bg-[#FEF3D9] text-xl shadow-sm">
                ⭐
              </div>
              <p className="max-w-2xl text-[15px] font-bold leading-7 text-[#073B5A]/78">{description}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] font-black text-[#073B5A]/75">
              <span className="flex items-center gap-2 rounded-xl border border-[#073B5A]/10 bg-[#F5FBFC] px-3 py-1.5">
                <span className="text-[#0081A7]">◷</span>
                {minutes} min
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-[#073B5A]/10 bg-[#F5FBFC] px-3 py-1.5">
                <span className="text-[#0081A7]">▥</span>
                {grade}
              </span>
            </div>
          </div>

          <div className="border-[#073B5A]/10 lg:border-l lg:pl-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0081A7]">Today&apos;s Goal</p>
            <h2 className="mt-2 text-[1.35rem] font-black text-[#073B5A]">
              {completedCount} of {totalCount} complete
            </h2>
            <GoalProgressBar completedCount={completedCount} totalCount={totalCount} />

            <div className="mt-3 space-y-2">
              {isEvaluation ? (
                <>
                  <GoalItem label="Evaluation" complete={progress.practiceComplete} />
                  <p className="text-[13px] font-bold leading-5 text-[#073B5A]/65">
                    Complete {quizQuestionCount} review questions.
                  </p>
                </>
              ) : (
                <>
                  <GoalItem label="Warm-Up" complete={progress.warmupComplete} />
                  <GoalItem label="Learn" complete={progress.learnComplete} />
                  <GoalItem label="Try It" complete={progress.tryItComplete} />
                  <GoalItem label="Practice" complete={progress.practiceComplete} />
                </>
              )}
            </div>
          </div>
        </div>

        <div
          ref={registerStarTarget}
          className="relative flex min-h-[220px] items-center justify-center overflow-hidden border-t border-[#F4D589] bg-[#FEF3D9] px-4 py-4 xl:border-l xl:border-t-0"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.35)_34%,rgba(254,243,217,0)_68%)]" />
          <div className="pointer-events-none absolute left-7 top-7 text-2xl text-white">✦</div>
          <div className="pointer-events-none absolute right-7 top-8 text-2xl text-[#F7B733]">✦</div>
          <div className="pointer-events-none absolute bottom-8 left-8 text-xl text-[#00AFB9]">✦</div>
          <div className="relative scale-90 xl:scale-95">
            <div className="absolute inset-5 rounded-full bg-white/60 blur-2xl" />
            <LumaAvatar
              name={starName || "Your star"}
              chargeCount={completedCount}
              totalCharge={totalCount}
              size="xl"
              state={starReaction ?? lumaState}
              showEnergy={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LessonHero;
