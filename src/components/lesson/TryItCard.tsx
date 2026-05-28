// @SECTION TRYIT_CARD_TYPES
import { useNavigate } from 'react-router-dom'

type TryItCardProps = {
  lessonId: string
  practice: string
  practiceType: string
}

// @SECTION TRYIT_CARD
function TryItCard({
  lessonId,
  practice: _practice,
  practiceType: _practiceType,
}: TryItCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(`/try-it/${lessonId}`)}
      data-name="lesson-try-it-launch-card"
      className="h-full w-full rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#00AFB9]/30 hover:shadow-md"
    >
      {/* @SECTION TRYIT_CARD_HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#073B5A]">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-sm text-white">
            3
          </span>
          Try It
        </h3>

        <p className="text-sm font-bold text-[#073B5A]/70">10 min</p>
      </div>

      {/* @SECTION TRYIT_CARD_COPY */}
      <p className="mb-4 max-w-[280px] text-sm font-semibold leading-relaxed text-[#073B5A]">
        Solve a guided word problem with support before practice.
      </p>

      {/* @SECTION TRYIT_CARD_PREVIEW */}
      <div className="mb-4 rounded-2xl border border-[#00AFB9]/15 bg-[#E9F7F8] p-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
          Try It Together
        </p>

        <p className="mt-1 text-sm font-black leading-relaxed text-[#073B5A]">
          Find groups, in each, and the matching equation.
        </p>

        <div className="mt-3 flex items-center gap-2 text-xl">
          {Array.from({ length: 5 }).map((_, index) => (
            <span
              key={index}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-inner"
            >
              🌱
            </span>
          ))}
        </div>
      </div>

      {/* @SECTION TRYIT_CARD_ACTION */}
      <div className="inline-flex rounded-xl bg-[#00AFB9] px-5 py-2 text-sm font-black text-white shadow-sm">
        Start Try It ›
      </div>
    </button>
  )
}

export default TryItCard
