import { useNavigate } from 'react-router-dom'
import type { WarmUpData } from '../../types/warmup'
import { getWarmUpRounds, getWarmUpQuestionTotal } from '../../types/warmup'

type WarmUpCardProps = {
  factDrill: string
  warmup?: WarmUpData
  lessonId: string
  isComplete: boolean
}

function WarmUpCard({
  factDrill,
  warmup,
  lessonId,
  isComplete,
}: WarmUpCardProps) {
  const navigate = useNavigate()

  const rounds = getWarmUpRounds(warmup)
  const questionTotal = getWarmUpQuestionTotal(warmup)
  const roundTotal = rounds.length || 3

  function startWarmUp() {
    navigate(`/warmup/${lessonId}`)
  }

  return (
    <div
      className={`relative h-full min-h-[260px] overflow-hidden rounded-[1.75rem] border px-5 py-4 shadow-sm ${
        isComplete
          ? 'border-[#00AFB9]/35 bg-[#FDFDFC]'
          : 'border-[#F7B733]/45 bg-[#FFFCF2]'
      }`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-black text-white ${
                isComplete ? 'bg-[#00AFB9]' : 'bg-[#073B5A]'
              }`}
            >
              {isComplete ? '✓' : '1'}
            </span>

            <div>
              <h3 className="text-xl font-black text-[#073B5A]">Warm-Up</h3>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                {warmup?.title ?? 'Luma Charge'}
              </p>
            </div>
          </div>

          <p className="shrink-0 text-sm font-bold text-[#073B5A]/70">
            ◷ {warmup?.estimated_minutes ?? 5} min
          </p>
        </div>

        <p className="text-sm font-bold leading-relaxed text-[#073B5A]/75">
          {warmup?.instructions ??
            factDrill ??
            'Power up your star with quick review before today’s lesson.'}
        </p>

        <div className="mt-4 rounded-2xl border border-[#073B5A]/10 bg-white/80 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Warm-Up Plan
              </p>

              <p className="mt-1 text-sm font-black text-[#073B5A]">
                {roundTotal} rounds · {questionTotal || '12+'} questions
              </p>
            </div>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.max(roundTotal, 3) }).map(
                (_, index) => (
                  <span
                    key={index}
                    className={`h-3 w-3 rounded-full border ${
                      isComplete
                        ? 'border-[#00AFB9] bg-[#00AFB9]'
                        : index === 0
                          ? 'border-[#F7B733] bg-[#F7B733]'
                          : 'border-[#073B5A]/20 bg-white'
                    }`}
                  />
                ),
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={startWarmUp}
          className={`mt-4 w-fit rounded-xl px-5 py-2.5 text-sm font-black shadow-sm ${
            isComplete
              ? 'bg-[#E9F7F8] text-[#0081A7]'
              : 'bg-[#00AFB9] text-white'
          }`}
        >
          {isComplete ? 'Review Warm-Up ›' : 'Start Warm-Up ›'}
        </button>

        <div className="mt-auto flex justify-end pt-3">
          <div className="rounded-full bg-[#FDFCDC] px-3 py-1 text-xs font-black text-[#073B5A]/70">
            ⚡ Star power starts here
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FDFCDC] opacity-80 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#E9F7F8] opacity-80 blur-2xl" />
    </div>
  )
}

export default WarmUpCard
