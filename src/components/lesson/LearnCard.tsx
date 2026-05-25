function LearnCard() {
  return (
    <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-xl font-black">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#073B5A] text-white">
            2
          </span>
          Learn
        </h3>

        <p className="font-bold text-[#073B5A]/70">10 min</p>
      </div>

      <div className="rounded-2xl bg-[#FDFCDC] p-5 text-center">
        <p className="font-black">
          Turning Repeated Addition into Multiplication
        </p>

        <div className="my-4 flex justify-center gap-3">
          {[1, 2, 3, 4].map((group) => (
            <div
              key={group}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-[#0081A7] bg-white"
            >
              🔴🔴🔴
            </div>
          ))}
        </div>

        <p className="text-2xl font-black">3 + 3 + 3 + 3 = 12</p>
        <p className="text-2xl font-black">4 × 3 = 12</p>
      </div>

      <button className="mt-4 rounded-xl bg-[#E9F7F8] px-4 py-3 font-black text-[#0081A7]">
        View Lesson Slides
      </button>
    </div>
  )
}

export default LearnCard
