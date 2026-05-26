type NextUpCardProps = {
  nextStep: string
  description: string
}

function NextUpCard({ nextStep, description }: NextUpCardProps) {
  return (
    <div className="flex h-full items-center justify-between gap-5 rounded-[1.25rem] border border-[#073B5A]/10 bg-white px-5 py-4 shadow-sm">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FEF3D9] text-2xl">
          🚀
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-black text-[#073B5A]">
            Next Up: <span className="text-[#0081A7]">{nextStep}</span>
          </h3>

          <p className="mt-1 text-sm font-bold leading-snug text-[#073B5A]/70">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 whitespace-nowrap rounded-xl bg-[#00AFB9] px-5 py-2.5 text-sm font-black text-white shadow-sm"
      >
        Continue Lesson ›
      </button>
    </div>
  )
}

export default NextUpCard
