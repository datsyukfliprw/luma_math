function PracticeTimeCard() {
  const activities = [
    ['🧮', 'Guided Practice', 'Step-by-step problems with hints'],
    ['✏️', 'Independent Practice', 'Solve on your own'],
    ['🏆', 'Challenge Yourself', 'Take it up a notch!'],
  ]

  return (
    <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <h3 className="text-xl font-black">
          <span className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#073B5A] text-white">
            4
          </span>
          Practice Time
        </h3>

        <p className="font-bold text-[#073B5A]/70">15 min</p>
      </div>

      <p className="mb-5 font-medium">Choose a practice activity.</p>

      <div className="space-y-3">
        {activities.map(([icon, title, subtitle]) => (
          <button
            key={title}
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F5F8F8] p-4 text-left hover:bg-[#E9F7F8]"
          >
            <span className="text-3xl">{icon}</span>

            <span className="flex-1">
              <span className="block font-black">{title}</span>
              <span className="text-sm font-medium text-[#073B5A]/70">
                {subtitle}
              </span>
            </span>

            <span className="font-black">›</span>
          </button>
        ))}
      </div>

      <button className="mt-5 font-black text-[#0081A7]">
        See All Activities ›
      </button>
    </div>
  )
}

export default PracticeTimeCard
