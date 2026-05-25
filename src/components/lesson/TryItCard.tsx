function TryItCard() {
  return (
    <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-xl font-black">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#073B5A] text-white">
            3
          </span>
          Try It
        </h3>

        <p className="font-bold text-[#073B5A]/70">10 min</p>
      </div>

      <p className="mb-4 font-medium">
        Write a multiplication sentence for the repeated addition.
      </p>

      <div className="mb-4 grid grid-cols-6 gap-2 text-3xl">
        {Array.from({ length: 18 }).map((_, index) => (
          <span key={index}>⭐</span>
        ))}
      </div>

      <p className="text-center text-2xl font-black">5 + 5 + 5 = 15</p>

      <div className="mt-5 flex items-center justify-center gap-3 text-2xl font-black">
        <span className="rounded-xl border border-[#073B5A]/10 px-5 py-3">?</span>
        <span>×</span>
        <span className="rounded-xl border border-[#073B5A]/10 px-5 py-3">?</span>
        <span>=</span>
        <span className="rounded-xl border border-[#073B5A]/10 px-5 py-3">?</span>
      </div>

      <button className="mt-5 rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white">
        Check My Answer
      </button>
    </div>
  )
}

export default TryItCard
