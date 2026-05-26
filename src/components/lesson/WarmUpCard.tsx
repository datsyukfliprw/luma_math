type WarmUpCardProps = {
  factDrill: string
}

function WarmUpCard({ factDrill: _factDrill }: WarmUpCardProps) {
  return (
    <div className="relative h-full min-h-[150px] overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-[#FDFDFC] px-5 py-4 shadow-sm">
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-base font-black text-white">
              1
            </span>

            <h3 className="text-xl font-black text-[#073B5A]">Warm-Up</h3>
          </div>

          <p className="text-sm font-bold text-[#073B5A]/70">◷ 5 min</p>
        </div>

        <p className="mb-4 text-sm font-semibold leading-relaxed text-[#073B5A]/80">
          Fill in the missing number.
        </p>

        <div className="flex items-center gap-3 pr-48 text-2xl font-black text-[#073B5A]">
          <span className="rounded-xl bg-[#F3F7F8] px-4 py-2">3</span>
          <span>+</span>
          <span className="rounded-xl bg-[#F3F7F8] px-4 py-2">3</span>
          <span>+</span>
          <span className="rounded-xl bg-[#F3F7F8] px-4 py-2">3</span>
          <span>+</span>
          <span className="rounded-xl bg-[#F3F7F8] px-4 py-2">3</span>
          <span>=</span>
          <span className="rounded-xl border-2 border-dashed border-[#00AFB9] bg-white px-5 py-2">
            ?
          </span>
        </div>

        <button className="mt-3 rounded-lg bg-[#00AFB9] px-5 py-2 text-sm font-black text-white shadow-sm">
          Check Answer
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-1 right-4 hidden h-32 w-44 items-end justify-center md:flex">
        <img
          src="/images/warmup_plant.png"
          alt=""
          className="h-32 w-auto object-contain"
        />
      </div>
    </div>
  )
}

export default WarmUpCard
