function WarmUpCard() {
  return (
    <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#073B5A] text-lg font-black text-white">
            1
          </p>
          <h3 className="inline-block pl-3 text-xl font-black">Warm-Up</h3>
        </div>

        <p className="font-bold text-[#073B5A]/70">◷ 5 min</p>
      </div>

      <p className="mb-5 font-medium">Fill in the missing number.</p>

      <div className="flex flex-wrap items-center gap-3 text-3xl font-black">
        <span className="rounded-xl bg-[#F5F8F8] px-4 py-3">3</span>
        <span>+</span>
        <span className="rounded-xl bg-[#F5F8F8] px-4 py-3">3</span>
        <span>+</span>
        <span className="rounded-xl bg-[#F5F8F8] px-4 py-3">3</span>
        <span>+</span>
        <span className="rounded-xl bg-[#F5F8F8] px-4 py-3">3</span>
        <span>=</span>
        <span className="rounded-xl border-2 border-dashed border-[#00AFB9] px-5 py-3">
          ?
        </span>
      </div>

      <button className="mt-5 rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm">
        Check Answer
      </button>
    </div>
  )
}

export default WarmUpCard
