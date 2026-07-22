import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useParentDashboard } from "../services/dashboard/useParentDashboard";
import type { InterventionItem } from "../services/dashboard/useParentDashboard";

type SectionCardProps = {
  title: string;
  eyebrow: string;
  children: ReactNode;
};

function SectionCard({ title, eyebrow, children }: SectionCardProps) {
  return (
    <section className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm sm:p-6">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-black text-[#073B5A]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  accent,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-[#073B5A]/10 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-6 w-6" strokeWidth={2.4} />
      </div>
      <p className="mt-4 text-3xl font-black text-[#073B5A]">{value}</p>
      <p className="mt-1 text-sm font-bold text-[#073B5A]/65">{label}</p>
    </div>
  );
}

function InterventionBadge({ level }: { level: InterventionItem["level"] }) {
  const styles: Record<string, string> = {
    extra_hint: "bg-[#E8FAF7] text-[#00A9A5]",
    worked_example: "bg-[#FFF8D5] text-[#F2A900]",
    concept_review: "bg-[#FFEBEB] text-[#E03131]",
    pause: "bg-[#E7F5FF] text-[#2789D9]",
  };

  const labels: Record<string, string> = {
    extra_hint: "Extra hint",
    worked_example: "Worked example",
    concept_review: "Concept review",
    pause: "Take a break",
  };

  return (
    <span className={`rounded-xl px-3 py-1 text-xs font-black ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

function ParentAreaScreen() {
  const dashboard = useParentDashboard();

  const gradeLabel = dashboard.grade === 0 ? "Kindergarten" : `${dashboard.grade}${getOrdinalSuffix(dashboard.grade)} Grade`;

  return (
    <PageLayout>
      {/* @SECTION Header */}
      <header className="mb-6 rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#00AFB9]">
          Parent Dashboard
        </p>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
              {dashboard.studentName}&apos;s learning overview
            </h1>
            <p className="mt-2 text-base font-bold text-[#073B5A]/65 lg:text-lg">
              {gradeLabel} · {dashboard.pathwayTitle}
            </p>
          </div>

          <Link
            to="/settings"
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#DCE6EA] bg-white px-5 text-sm font-black text-[#234C68] shadow-sm transition hover:bg-[#F4FAFB]"
          >
            Edit profile
          </Link>
        </div>
      </header>

      {/* @SECTION Summary stats */}
      <section className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          value={`${dashboard.summary.conceptsComplete}/${dashboard.summary.conceptsTotal}`}
          label="Concepts strong"
          accent="bg-[#E8FAF7] text-[#00A9A5]"
        />
        <StatCard
          icon={Award}
          value={`${dashboard.summary.skillsMastered}/${dashboard.summary.skillsTotal}`}
          label="Skills mastered"
          accent="bg-[#FFF8D5] text-[#F2A900]"
        />
        <StatCard
          icon={TrendingUp}
          value={`${dashboard.progressPercent}%`}
          label="Pathway progress"
          accent="bg-[#E7F5FF] text-[#2789D9]"
        />
        <StatCard
          icon={Calendar}
          value={String(dashboard.summary.streakDays)}
          label="Active learning days"
          accent="bg-[#F3F0FF] text-[#8055D9]"
        />
      </section>

      {/* @SECTION Mission + Pacing */}
      <section className="mb-5 grid gap-4 lg:grid-cols-2">
        <SectionCard eyebrow="Today" title="Current mission">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8FAF7] text-[#00A9A5]">
              <BookOpen className="h-6 w-6" strokeWidth={2.4} />
            </div>
            <div>
              <p className="text-xl font-black text-[#073B5A]">
                {dashboard.currentMissionTitle ?? "No mission available"}
              </p>
              <p className="mt-1 text-sm font-bold text-[#073B5A]/65">
                {dashboard.pacing.estimatedMinutesPerDay} min estimated session
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Pacing" title="Projected pace">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[#F5FBFC] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/55">
                Concepts left
              </p>
              <p className="mt-1 text-2xl font-black text-[#073B5A]">
                {dashboard.pacing.remainingConcepts}
              </p>
            </div>

            <div className="rounded-2xl bg-[#F5FBFC] p-4">
              <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/55">
                Estimated finish
              </p>
              <div className="mt-1 flex items-center gap-2 text-2xl font-black text-[#073B5A]">
                <Clock className="h-6 w-6 text-[#00AFB9]" strokeWidth={2.4} />
                {dashboard.pacing.projectedFinishDate ?? "Complete"}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm font-bold text-[#073B5A]/65">
            Projection assumes one mission per day and includes today&apos;s session.
          </p>
        </SectionCard>
      </section>

      {/* @SECTION Retention */}
      <SectionCard eyebrow="Memory" title="Retention reviews due">
        {dashboard.retentionDue.length === 0 ? (
          <p className="rounded-2xl bg-[#E8FAF7] p-4 text-sm font-black text-[#00A9A5]">
            No reviews due — great retention!
          </p>
        ) : (
          <ul className="space-y-3">
            {dashboard.retentionDue.map((item) => (
              <li
                key={item.skillId}
                className="flex items-center justify-between rounded-2xl border border-[#073B5A]/10 p-4"
              >
                <div>
                  <p className="font-black text-[#073B5A]">{item.title}</p>
                  <p className="text-sm font-bold text-[#073B5A]/65">
                    {item.isOverdue ? "Overdue" : "Due"} {new Date(item.dueAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8D5] text-[#F2A900]">
                  <GraduationCap className="h-5 w-5" strokeWidth={2.4} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* @SECTION Interventions */}
      <SectionCard eyebrow="Support" title="Intervention alerts">
        {dashboard.interventions.length === 0 ? (
          <p className="rounded-2xl bg-[#E8FAF7] p-4 text-sm font-black text-[#00A9A5]">
            No interventions needed right now.
          </p>
        ) : (
          <ul className="space-y-3">
            {dashboard.interventions.map((item) => (
              <li
                key={item.skillId}
                className="rounded-2xl border border-[#073B5A]/10 p-4"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-[#E03131]" strokeWidth={2.4} />
                  <p className="font-black text-[#073B5A]">{item.title}</p>
                  <InterventionBadge level={item.level} />
                </div>
                <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/65">
                  {item.message}
                  {item.fallbackConceptTitle && ` Revisit ${item.fallbackConceptTitle}.`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </PageLayout>
  );
}

function getOrdinalSuffix(value: number): string {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return "th";

  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default ParentAreaScreen;
