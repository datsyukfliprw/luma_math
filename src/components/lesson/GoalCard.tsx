type GoalCardProps = {
  objective: string
  lessonType: string
  quizQuestionCount: number
}

function GoalCard({
  lessonType,
  quizQuestionCount,
}: GoalCardProps) {
  const isEvaluation = lessonType === 'evaluation'

  return (
    <div className="relative h-full overflow-hidden rounded-[1.5rem] border border-[#F4D589] bg-[#FEF3D9] px-6 py-5 shadow-sm">
      <div className="grid h-full items-center gap-6 md:grid-cols-[1fr_100px_1.1fr]">
        <div>
          <h3 className="text-xl font-extrabold text-[#073B5A]">
            {isEvaluation ? 'Evaluation Goal' : 'Today’s Goal'}
          </h3>

          <p className="mt-3 max-w-[240px] text-sm font-semibold leading-relaxed text-[#073B5A]/75">
            {isEvaluation
              ? 'Complete the review and show what you know.'
              : 'Complete 3 activities and score 80% or higher.'}
          </p>
        </div>

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="10"
            />

            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#00AFB9"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="170 251"
            />
          </svg>

          <span className="relative text-xl font-extrabold text-[#073B5A]">
            {isEvaluation ? quizQuestionCount : '2/3'}
          </span>
        </div>

        <div className="space-y-3 border-l border-[#073B5A]/10 pl-5">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-xs font-black text-white">
              ✓
            </span>
            <span className="text-sm font-bold text-[#073B5A]/80">Warm-Up</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-xs font-black text-white">
              ✓
            </span>
            <span className="text-sm font-bold text-[#073B5A]/80">
              {isEvaluation ? 'Review' : 'Learn'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-7 w-7 shrink-0 rounded-full border-2 border-[#0081A7] bg-transparent" />
            <span className="text-sm font-bold text-[#073B5A]/80">
              {isEvaluation ? 'Evaluation' : 'Try It or Practice'}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-4 text-2xl text-[#F7B733]">✦</div>
    </div>
  )
}

export default GoalCard
