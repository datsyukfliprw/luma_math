type WeekCardProps = {
  weekNumber: number;
  title: string;
  status: "complete" | "current" | "locked";
  children: React.ReactNode;
};

function WeekCard({ weekNumber, title, status, children }: WeekCardProps) {
  return (
    <section
      className={`rounded-[1.75rem] border p-5 ${
        status === "complete"
          ? "border-[#00AFB9]/30 bg-[#E9F7F8]"
          : status === "current"
            ? "border-[#F07167]/40 bg-[#FED9B7]/35"
            : "border-[#073B5A]/10 bg-[#F5F5F2] opacity-75"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#073B5A]/60">
            Week {weekNumber}
          </p>

          <h3 className="mt-1 text-2xl font-black">{title}</h3>
        </div>

        <span className="text-2xl">
          {status === "complete" ? "✓" : status === "current" ? "▶" : "🔒"}
        </span>
      </div>

      {children}
    </section>
  );
}

export default WeekCard;
