type TryItCardProps = {
  practice: string;
  practiceType: string;
};

function TryItCard({
  practice: _practice,
  practiceType: _practiceType,
}: TryItCardProps) {
  return (
    <div className="h-full rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#073B5A]">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-sm text-white">
            3
          </span>
          Try It
        </h3>

        <p className="text-sm font-bold text-[#073B5A]/70">10 min</p>
      </div>

      <p className="mb-4 max-w-[280px] text-sm font-semibold leading-relaxed text-[#073B5A]">
        Write a multiplication sentence for the repeated addition.
      </p>

      <div className="mb-4 grid max-w-[285px] grid-cols-8 gap-1.5 text-2xl">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index}>⭐</span>
        ))}
      </div>

      <p className="mb-4 text-center text-xl font-black text-[#073B5A]">
        5 + 5 + 5 = 15
      </p>

      <div className="flex items-center justify-center gap-3 text-lg font-black text-[#073B5A]">
        <span className="min-w-16 rounded-lg border border-[#073B5A]/10 bg-white px-5 py-2.5 text-center shadow-sm">
          ?
        </span>
        <span>×</span>
        <span className="min-w-16 rounded-lg border border-[#073B5A]/10 bg-white px-5 py-2.5 text-center shadow-sm">
          ?
        </span>
        <span>=</span>
        <span className="min-w-16 rounded-lg border border-[#073B5A]/10 bg-white px-5 py-2.5 text-center shadow-sm">
          ?
        </span>
      </div>

      <button className="mt-5 rounded-lg bg-[#00AFB9] px-5 py-2 text-sm font-black text-white shadow-sm">
        Check My Answer
      </button>
    </div>
  );
}

export default TryItCard;
