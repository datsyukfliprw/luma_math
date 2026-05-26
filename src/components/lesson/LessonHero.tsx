import LumaAvatar from '../luma/LumaAvatar'
import type { LessonProgress } from '../../lib/lessonProgress'

type LessonHeroProps = {
  unitNumber: number
  weekNumber: number
  dayNumber: number
  title: string
  topic: string
  description: string
  minutes: number
  grade: string
  lessonType: string
  quizQuestionCount: number
  progress: LessonProgress
}

type GoalItemProps = {
  label: string
  complete: boolean
}

function GoalItem({ label, complete }: GoalItemProps) {
  return (
    <div className="flex items-center gap-2">
      {complete ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-[0.7rem] font-black text-white">
          ✓
        </span>
      ) : (
        <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[#0081A7] bg-white" />
      )}

      <span
        className={`text-sm font-black ${
          complete ? 'text-[#073B5A]' : 'text-[#073B5A]/60'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function LessonHero({
  unitNumber,
  weekNumber,
  dayNumber,
  title,
  description,
  minutes,
  grade,
  lessonType,
  quizQuestionCount,
  progress,
}: LessonHeroProps) {
  const isEvaluation = lessonType === 'evaluation'

  const completedCount = isEvaluation
    ? progress.practiceComplete
      ? 1
      : 0
    : [
        progress.warmupComplete,
        progress.learnComplete,
        progress.tryItComplete,
        progress.practiceComplete,
      ].filter(Boolean).length

  const totalCount = isEvaluation ? 1 : 4
  const progressPercent = Math.round((completedCount / totalCount) * 100)
  const circleLength = 251
  const strokeLength = (progressPercent / 100) * circleLength

  return (
    <section className="mb-5 rounded-[1.5rem] border border-[#073B5A]/10 bg-white px-7 py-6 shadow-sm">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_560px] xl:items-center">
        <div>
          <p className="text-sm font-black text-[#426B82]">
            Grade 3 <span className="mx-2 text-[#073B5A]/30">›</span> Unit{' '}
            {unitNumber} <span className="mx-2 text-[#073B5A]/30">›</span>{' '}
            Week {weekNumber}{' '}
            <span className="mx-2 text-[#073B5A]/30">›</span> Day {dayNumber}
          </p>

          <h1 className="mt-3 text-[2.35rem] font-black leading-tight tracking-[-0.03em] text-[#073B5A]">
            {title}
          </h1>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#F4D589] bg-[#FEF3D9] text-2xl shadow-sm">
              ⭐
            </div>

            <div>
              <p className="max-w-3xl text-base font-bold leading-relaxed text-[#073B5A]/78">
                {description}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm font-black text-[#073B5A]/75">
                <span className="flex items-center gap-2">
                  <span className="text-[#0081A7]">◷</span>
                  {minutes} min
                </span>

                <span className="h-5 w-px bg-[#073B5A]/15" />

                <span className="flex items-center gap-2">
                  <span className="text-[#0081A7]">▥</span>
                  {grade}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[1.35rem] border border-[#F4D589] bg-[radial-gradient(circle_at_82%_45%,rgba(255,255,255,0.82)_0%,rgba(255,255,255,0.42)_18%,rgba(254,243,217,0.76)_42%,rgba(254,243,217,1)_78%),linear-gradient(90deg,#FEF3D9_0%,#FFF8E9_100%)] px-5 py-4 shadow-sm">
          <div className="grid items-center gap-4 lg:grid-cols-[95px_1fr_175px]">
            <div>
              <h3 className="text-lg font-black leading-tight text-[#073B5A]">
                {isEvaluation ? 'Evaluation Goal' : 'Today’s Goal'}
              </h3>

              <div className="relative mt-3 flex h-20 w-20 items-center justify-center">
                <svg
                  className="absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 100 100"
                >
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
                    strokeDasharray={`${strokeLength} ${circleLength}`}
                  />
                </svg>

                <span className="relative text-lg font-black text-[#073B5A]">
                  {completedCount}/{totalCount}
                </span>
              </div>
            </div>

            <div className="space-y-3 border-[#073B5A]/10 lg:border-l lg:pl-5">
              {isEvaluation ? (
                <>
                  <GoalItem
                    label="Complete Evaluation"
                    complete={progress.practiceComplete}
                  />

                  <p className="text-xs font-bold leading-relaxed text-[#073B5A]/65">
                    Complete {quizQuestionCount} review questions and show what
                    you know.
                  </p>
                </>
              ) : (
                <>
                  <GoalItem
                    label="Warm-Up"
                    complete={progress.warmupComplete}
                  />
                  <GoalItem label="Learn" complete={progress.learnComplete} />
                  <GoalItem label="Try It" complete={progress.tryItComplete} />
                  <GoalItem
                    label="Practice"
                    complete={progress.practiceComplete}
                  />
                </>
              )}
            </div>

            <div className="flex justify-end">
              <LumaAvatar
                chargeCount={completedCount}
                totalCharge={totalCount}
                size="md"
              />
            </div>
          </div>

          <div className="absolute right-5 top-4 text-2xl text-[#F7B733]">
            ✦
          </div>
        </div>
      </div>
    </section>
  )
}

export default LessonHero
