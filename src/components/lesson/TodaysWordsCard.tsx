type TodaysWordsCardProps = {
  words: string[]
}

function TodaysWordsCard({ words }: TodaysWordsCardProps) {
  return (
    <div className="flex h-full items-center gap-5 rounded-[1.25rem] border border-[#073B5A]/10 bg-white px-5 py-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
        📖
      </div>

      <h3 className="whitespace-nowrap text-base font-black text-[#073B5A]">
        Today’s Words
      </h3>

      <div className="flex flex-wrap gap-3">
        {words.map((word) => (
          <span
            key={word}
            className="rounded-xl border border-[#073B5A]/10 bg-[#F5FBFC] px-4 py-2 text-sm font-bold text-[#073B5A]/80"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TodaysWordsCard
