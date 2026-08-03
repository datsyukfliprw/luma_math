type TargetDigitQuestionProps = {
  number: string;
  targetDigitIndex: number;
  prompt?: string;
};

export default function TargetDigitQuestion({
  number,
  targetDigitIndex,
  prompt = "What is the value of the bold digit?",
}: TargetDigitQuestionProps) {
  return (
    <div className="flex flex-col items-center gap-7">
      <h2 className="max-w-[760px] text-3xl font-black leading-tight text-[#073B5A] sm:text-4xl lg:text-[2.75rem]">
        {prompt}
      </h2>

      <div className="flex items-center justify-center gap-3" aria-label={`Number ${number}`}>
        {number.split("").map((digit, index) => {
          const isTarget = index === targetDigitIndex;

          return (
            <div
              key={`${digit}-${index}`}
              data-target={isTarget ? "true" : undefined}
              className={`flex h-28 w-24 items-center justify-center rounded-2xl transition-all duration-200 lg:h-32 lg:w-28 ${
                isTarget
                  ? "border-2 border-[#0081A7] bg-[#00AFB9] text-white shadow-[0_10px_24px_rgba(0,175,185,0.25)]"
                  : "border-2 border-transparent text-[#073B5A]"
              }`}
            >
              <span className="text-6xl font-black sm:text-7xl lg:text-8xl">{digit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
