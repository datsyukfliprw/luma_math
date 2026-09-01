import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import WeekCard from "./WeekCard";

type LessonStatus = "complete" | "current" | "available" | "locked";
type WeekStatus = "complete" | "current" | "available" | "locked";

type UnitCardProps = {
  unitNumber: number;
  title: string;
  description: string;
  progress: number;
  isCurrent?: boolean;
  weeks: {
    weekNumber: number;
    title: string;
    status: WeekStatus;
    lessons: {
      id: string;
      title: string;
      status: LessonStatus;
    }[];
  }[];
};

function UnitCard({
  unitNumber,
  title,
  description,
  progress,
  isCurrent = false,
  weeks,
}: UnitCardProps) {
  const [isExpanded, setIsExpanded] = useState(isCurrent);

  return (
    <article className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 lg:p-8 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((s) => !s)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setIsExpanded((s) => !s);
          }
        }}
        className="mb-5 flex cursor-pointer items-start justify-between gap-4 rounded-2xl transition hover:bg-[#FAF9F4] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#00AFB9]/20"
      >
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
            Unit {unitNumber}
          </p>

          <h2 className="mt-2 flex items-center gap-3 text-2xl font-black lg:text-3xl">
            {title}
            {isExpanded ? (
              <ChevronUp size={24} strokeWidth={2.5} className="text-[#00AFB9]" />
            ) : (
              <ChevronDown size={24} strokeWidth={2.5} className="text-[#073B5A]/50" />
            )}
          </h2>

          <p className="mt-3 max-w-2xl text-sm lg:text-base font-medium leading-relaxed text-[#073B5A]/70">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FDFCDC] px-5 py-3 text-center">
          <p className="text-2xl font-black">{progress}%</p>
          <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/65">Complete</p>
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-[#073B5A]/10">
        <div className="h-full rounded-full bg-[#00AFB9]" style={{ width: `${progress}%` }} />
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {weeks.map((week) => (
            <WeekCard key={week.weekNumber} title={week.title} status={week.status}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {week.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    to={lesson.status === "locked" ? "#" : `/lesson/${lesson.id}`}
                    className={`rounded-2xl border bg-white/75 p-4 lg:p-5 text-left transition hover:shadow-md ${
                      lesson.status === "complete"
                        ? "border-[#00AFB9]/35"
                        : lesson.status === "current"
                          ? "border-[#F07167]/50 shadow-sm"
                          : lesson.status === "available"
                            ? "border-[#073B5A]/15 hover:border-[#00AFB9]/25"
                            : "pointer-events-none border-[#073B5A]/10 opacity-70"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-end">
                      <span className="font-black">
                        {lesson.status === "complete"
                          ? "✓"
                          : lesson.status === "current"
                            ? "▶"
                            : lesson.status === "available"
                              ? "○"
                              : "🔒"}
                      </span>
                    </div>

                    <h4 className="text-sm lg:text-base font-black leading-snug">{lesson.title}</h4>
                  </Link>
                ))}
              </div>
            </WeekCard>
          ))}
        </div>
      )}
    </article>
  );
}

export default UnitCard;
