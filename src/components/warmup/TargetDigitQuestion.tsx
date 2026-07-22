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
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl font-black leading-tight text-[#073B5A]">
        {prompt}
      </h2>

      <p className="text-5xl font-black tracking-widest text-[#073B5A]">
        {number.split("").map((digit, index) => {
          const isTarget = index === targetDigitIndex;

          if (isTarget) {
            return (
              <strong
                key={index}
                data-target="true"
                className="inline-block rounded-lg border-2 border-[#073B5A] bg-[#E9F7F8] px-2 text-[#073B5A]"
                aria-label="target digit"
              >
                {digit}
              </strong>
            );
          }

          return <span key={index}>{digit}</span>;
        })}
      </p>
    </div>
  );
}
