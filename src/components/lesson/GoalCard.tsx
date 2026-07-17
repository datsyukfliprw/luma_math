import type { LessonProgress } from "../../lib/lessonProgress";

type GoalCardProps = {
  lessonType: string;
  quizQuestionCount: number;
  progress: LessonProgress;
};

type GoalItemProps = {
  label: string;
  status?: string;
  complete: boolean;
};

function GoalItem({ label, status, complete }: GoalItemProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {complete ? (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-xs font-black text-white">
            ✓
          </span>
        ) : (
          <span className="h-7 w-7 shrink-0 rounded-full border-2 border-[#0081A7] bg-white" />
        )}

        <span className={`text-sm font-black ${complete ? "text-[#073B5A]" : "text-[#073B5A]/65"}`}>
          {label}
        </span>
      </div>

      {status && (
        <span className={`text-xs font-bold ${complete ? "text-[#0081A7]" : "text-[#073B5A]/55"}`}>
          {status}
        </span>
      )}
    </div>
  );
}

function GoalCard({ lessonType, quizQuestionCount, progress }: GoalCardProps) {
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
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const circleLength = 251;
  const strokeLength = (progressPercent / 100) * circleLength;

  return (
    <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-[#F4D589] bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.58)_18%,rgba(254,243,217,0.78)_40%,rgba(254,243,217,1)_78%),linear-gradient(90deg,#FEF3D9_0%,#FFF8E9_100%)] px-6 py-5 shadow-sm">
      <div className="grid h-full items-center gap-5 md:grid-cols-[150px_96px_1fr]">
        <div>
          <h3 className="text-xl font-black text-[#073B5A]">
            {isEvaluation ? "Evaluation Goal" : "Today’s Goal"}
          </h3>

          <p className="mt-3 text-sm font-semibold leading-relaxed text-[#073B5A]/75">
            {isEvaluation
              ? `Complete ${quizQuestionCount} review questions.`
              : "Complete each step to finish today’s math goal."}
          </p>
        </div>

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="10" />

            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00AFB9"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${strokeLength} ${circleLength}`}
            />
          </svg>

          <span className="relative text-xl font-black text-[#073B5A]">
            {completedCount}/{totalCount}
          </span>
        </div>

        <div className="space-y-3 border-l border-[#073B5A]/10 pl-5">
          {isEvaluation ? (
            <GoalItem
              label="Complete Evaluation"
              status={progress.practiceComplete ? "Done" : "To Do"}
              complete={progress.practiceComplete}
            />
          ) : (
            <>
              <GoalItem
                label="Warm-Up"
                status={progress.warmupComplete ? "Done" : "To Do"}
                complete={progress.warmupComplete}
              />
              <GoalItem
                label="Learn"
                status={progress.learnComplete ? "Done" : "To Do"}
                complete={progress.learnComplete}
              />
              <GoalItem
                label="Try It"
                status={progress.tryItComplete ? "Done" : "To Do"}
                complete={progress.tryItComplete}
              />
              <GoalItem
                label="Practice"
                status={progress.practiceComplete ? "Done" : "To Do"}
                complete={progress.practiceComplete}
              />
            </>
          )}
        </div>
      </div>

      <div className="absolute right-5 top-4 text-2xl text-[#F7B733]">✦</div>
    </div>
  );
}

export default GoalCard;
