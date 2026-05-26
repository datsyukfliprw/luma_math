import { useRef, useState, type ReactNode } from 'react'
import { useDelightAnimation } from '../animations/DelightAnimationProvider'
import { updateLessonProgress } from '../../lib/lessonProgress'

type WarmUpCardProps = {
  factDrill: string
  lessonId: string
  isComplete: boolean
  onComplete: () => void
}

function NumberBox({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#F3F7F8] px-2 text-lg font-black text-[#073B5A]">
      {children}
    </span>
  )
}

function WarmUpCard({
  factDrill: _factDrill,
  lessonId,
  isComplete,
  onComplete,
}: WarmUpCardProps) {
  const checkButtonRef = useRef<HTMLButtonElement | null>(null)
  const { sendSparkleToStar } = useDelightAnimation()

  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(
    isComplete ? 'correct' : null,
  )


  function checkAnswer() {
  const normalizedAnswer = answer.trim()

  if (normalizedAnswer === '12') {
    sendSparkleToStar({
      fromElement: checkButtonRef.current,
    })

    setFeedback('correct')

    window.setTimeout(() => {
      updateLessonProgress(lessonId, {
        warmupComplete: true,
      })

      onComplete()
    }, 1200)

    return
  }

  setFeedback('incorrect')
}
  return (
    <div
      className={`relative h-full min-h-[150px] overflow-hidden rounded-[1.75rem] border px-5 py-4 shadow-sm ${
        isComplete
          ? 'border-[#00AFB9]/30 bg-[#FDFDFC]'
          : 'border-[#073B5A]/10 bg-[#FDFDFC]'
      }`}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-base font-black text-white ${
                isComplete ? 'bg-[#00AFB9]' : 'bg-[#073B5A]'
              }`}
            >
              {isComplete ? '✓' : '1'}
            </span>

            <div>
              <h3 className="text-xl font-black text-[#073B5A]">Warm-Up</h3>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                Luma Charge
              </p>
            </div>
          </div>

          <p className="shrink-0 text-sm font-bold text-[#073B5A]/70">
            ◷ 5 min
          </p>
        </div>

        <p className="mb-3 text-sm font-semibold leading-relaxed text-[#073B5A]/80">
          Fill in the missing number.
        </p>

        <div className="w-full rounded-2xl bg-white/75 p-3 shadow-[inset_0_0_0_1px_rgba(7,59,90,0.06)]">
          <div className="flex w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-2 text-lg font-black text-[#073B5A]">
            <NumberBox>3</NumberBox>

            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>+</span>
              <NumberBox>3</NumberBox>
            </span>

            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>+</span>
              <NumberBox>3</NumberBox>
            </span>

            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>+</span>
              <NumberBox>3</NumberBox>
            </span>

            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span>=</span>

              <input
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value)
                  if (!isComplete) {
                    setFeedback(null)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    checkAnswer()
                  }
                }}
                className="h-9 w-12 rounded-lg border-2 border-dashed border-[#00AFB9] bg-white px-2 text-center text-lg font-black text-[#0081A7] outline-none focus:border-[#F07167]"
                placeholder="?"
              />
            </span>
          </div>
        </div>

        <button
          ref={checkButtonRef}
          type="button"
          onClick={checkAnswer}
          className="mt-3 w-fit rounded-lg bg-[#00AFB9] px-5 py-2 text-sm font-black text-white shadow-sm"
        >
          Check Answer
        </button>

        {feedback === 'correct' && (
          <div className="mt-3 rounded-2xl border border-[#00AFB9]/25 bg-[#E9F7F8] px-4 py-3">
            <p className="text-sm font-black text-[#073B5A]">
              Nice! 3 + 3 + 3 + 3 = 12 ✨
            </p>
          </div>
        )}

        {feedback === 'incorrect' && (
          <div className="mt-3 rounded-2xl border border-[#F07167]/25 bg-[#FCE9E5] px-4 py-3">
            <p className="text-sm font-black text-[#073B5A]">
              Not quite. Count by 3s: 3, 6, 9, 12.
            </p>
          </div>
        )}

        <div className="mt-auto hidden justify-end md:flex">
          <img
            src="/images/warmup_plant.png"
            alt=""
            className="h-16 w-auto object-contain opacity-90"
          />
        </div>
      </div>
    </div>
  )
}

export default WarmUpCard
