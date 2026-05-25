function GoalCard() {
  return (
    <div className="rounded-[2rem] border border-[#F0C36A]/50 bg-[#FDFCDC] p-7 shadow-sm">
      <div className="grid gap-6 md:grid-cols-[1fr_140px_190px] md:items-center">
        <div>
          <h3 className="text-2xl font-black">Today’s Goal</h3>
          <p className="mt-3 font-medium leading-relaxed text-[#073B5A]/75">
            Complete 3 activities and score 80% or higher.
          </p>
        </div>

        <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-[#00AFB9] bg-white text-2xl font-black">
          2/3
        </div>

        <div className="space-y-3 border-l border-[#073B5A]/10 pl-6">
          <p className="font-bold">✅ Warm-Up</p>
          <p className="font-bold">✅ Learn</p>
          <p className="font-bold">◯ Try It or Practice</p>
        </div>
      </div>
    </div>
  )
}

export default GoalCard
