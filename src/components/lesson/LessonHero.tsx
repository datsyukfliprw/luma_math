import { BookOpen, Check, Clock3, GraduationCap } from "lucide-react";
import type { LessonProgress } from "../../contexts/StudentProgressContext";

type LessonHeroProps = {
  unitNumber: number;
  chapterTitle?: string;
  conceptTitle?: string;
  title: string;
  description: string;
  minutes: number;
  grade: string;
  lessonType: string;
  quizQuestionCount: number;
  progress: LessonProgress;
};

type GoalItemProps = {
  label: string;
  complete: boolean;
};

function GoalItem({ label, complete }: GoalItemProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-[#F8FBFB] px-3 py-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black ${
          complete
            ? "border-[#00AFB9] bg-[#00AFB9] text-white"
            : "border-[#9AB5C7]/55 bg-white text-transparent"
        }`}
      >
        <Check size={13} strokeWidth={3} />
      </span>
      <span className={`text-[13px] font-black ${complete ? "text-[#073B5A]" : "text-[#073B5A]/65"}`}>
        {label}
      </span>
    </div>
  );
}

function GoalProgressBar({ completedCount, totalCount }: { completedCount: number; totalCount: number }) {
  const percent = Math.round((completedCount / Math.max(totalCount, 1)) * 100);

  return (
    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#073B5A]/10">
      <div className="h-full rounded-full bg-[#00AFB9]" style={{ width: `${percent}%` }} />
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
}: LessonHeroProps) {
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

  return (
    <section
      data-name="lesson-hero"
      className="mb-4 overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-white shadow-sm"
    >
      <div className="grid gap-6 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-7">
        <div className="min-w-0">
          <p className="text-[13px] font-black leading-5 text-[#426B82]">
            {grade} <span className="mx-1.5 text-[#073B5A]/30">›</span> Unit {unitNumber}
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

          <h1 className="mt-3 text-[2rem] font-black leading-[1.08] tracking-[-0.03em] text-[#073B5A] xl:text-[2.2rem]">
            {title}
          </h1>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#00AFB9]/15 bg-[#F5FBFC] px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#00AFB9] shadow-sm">
              <BookOpen size={21} strokeWidth={2.6} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#0081A7]">
                {isEvaluation ? "Unit Checkpoint" : "Today’s Focus"}
              </p>
              <p className="mt-1 max-w-3xl text-[15px] font-bold leading-6 text-[#073B5A]/78">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px] font-black text-[#073B5A]/75">
            <span className="flex items-center gap-2 rounded-xl border border-[#073B5A]/10 bg-white px-3 py-1.5">
              <Clock3 size={15} strokeWidth={2.6} className="text-[#0081A7]" />
              {minutes} min
            </span>
            <span className="flex items-center gap-2 rounded-xl border border-[#073B5A]/10 bg-white px-3 py-1.5">
              <GraduationCap size={16} strokeWidth={2.6} className="text-[#0081A7]" />
              {grade}
            </span>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FAFCFC] p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            {isEvaluation ? "Checkpoint" : "Lesson Progress"}
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <h2 className="text-xl font-black text-[#073B5A]">
              {completedCount} of {totalCount} complete
            </h2>
            <span className="text-sm font-black text-[#0081A7]">
              {Math.round((completedCount / Math.max(totalCount, 1)) * 100)}%
            </span>
          </div>
          <GoalProgressBar completedCount={completedCount} totalCount={totalCount} />

          <div className="mt-4 space-y-2">
            {isEvaluation ? (
              <>
                <GoalItem label="Evaluation" complete={progress.practiceComplete} />
                <p className="px-1 text-[12px] font-bold leading-5 text-[#073B5A]/65">
                  Complete {quizQuestionCount} review questions to finish this unit.
                </p>
              </>
            ) : (
              <>
                <GoalItem label="Warm-Up" complete={progress.warmupComplete} />
                <GoalItem label="Learn" complete={progress.learnComplete} />
                <GoalItem label="Try It" complete={progress.tryItComplete} />
                <GoalItem label="Guided Practice" complete={progress.practiceComplete} />
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

export default LessonHero;
