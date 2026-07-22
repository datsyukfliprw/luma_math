import type { ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  LockKeyhole,
  Target,
  Trophy,
} from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import { useProgressReport } from "../services/progress/useProgressReport";
import type { ConceptProgress } from "../services/progress/useProgressReport";

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
  icon: ElementType;
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

function ConceptStatusBadge({ concept }: { concept: ConceptProgress }) {
  if (concept.locked) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-xl bg-[#E4EBEE] px-3 py-1 text-xs font-black text-[#073B5A]/70">
        <LockKeyhole className="h-3.5 w-3.5" strokeWidth={2.8} />
        Locked
      </span>
    );
  }

  const styles: Record<string, string> = {
    not_started: "bg-[#E4EBEE] text-[#073B5A]/70",
    introduced: "bg-[#E7F5FF] text-[#2789D9]",
    developing: "bg-[#FFF8D5] text-[#F2A900]",
    provisionally_mastered: "bg-[#E8FAF7] text-[#00A9A5]",
    mastered: "bg-[#D7F5D7] text-[#2A9D2A]",
    refresh_scheduled: "bg-[#F3F0FF] text-[#8055D9]",
  };

  const labels: Record<string, string> = {
    not_started: "Not started",
    introduced: "Introduced",
    developing: "Developing",
    provisionally_mastered: "Almost mastered",
    mastered: "Mastered",
    refresh_scheduled: "Review due",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-black ${styles[concept.status]}`}>
      {concept.status === "mastered" && (
        <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.8} />
      )}
      {labels[concept.status]}
    </span>
  );
}

function ProgressScreen() {
  const report = useProgressReport();

  return (
    <PageLayout>
      {/* @SECTION Header */}
      <header className="mb-6 rounded-[2rem] bg-white p-6 shadow-sm lg:p-8">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#00AFB9]">
          Growth Report
        </p>

        <h1 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
          {report.studentName}&apos;s progress
        </h1>
        <p className="mt-2 text-base font-bold text-[#073B5A]/65 lg:text-lg">
          {report.pathwayTitle}
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-black text-[#073B5A]">
            <span>Pathway progress</span>
            <span>{report.progressPercent}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#E4EBEE]">
            <div
              className="h-full rounded-full bg-[#00AFB9] transition-all"
              style={{ width: `${report.progressPercent}%` }}
            />
          </div>
        </div>
      </header>

      {/* @SECTION Summary stats */}
      <section className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          value={`${report.summary.conceptsComplete}/${report.summary.conceptsTotal}`}
          label="Concepts strong"
          accent="bg-[#E8FAF7] text-[#00A9A5]"
        />
        <StatCard
          icon={Award}
          value={`${report.summary.skillsMastered}/${report.summary.skillsTotal}`}
          label="Skills mastered"
          accent="bg-[#FFF8D5] text-[#F2A900]"
        />
        <StatCard
          icon={Trophy}
          value={`${report.progressPercent}%`}
          label="Pathway complete"
          accent="bg-[#E7F5FF] text-[#2789D9]"
        />
        <StatCard
          icon={Calendar}
          value={String(report.summary.streakDays)}
          label="Active learning days"
          accent="bg-[#F3F0FF] text-[#8055D9]"
        />
      </section>

      {/* @SECTION Current mission */}
      {report.currentMission && (
        <SectionCard eyebrow="Next up" title="Current mission">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8FAF7] text-[#00A9A5]">
                <BookOpen className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <div>
                <p className="text-xl font-black text-[#073B5A]">{report.currentMission.title}</p>
                <p className="text-sm font-bold text-[#073B5A]/65">{report.currentMission.rationale}</p>
              </div>
            </div>

            <Link
              to={report.currentMission.to}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#00AFB9] px-6 text-sm font-black text-white shadow-sm transition hover:bg-[#00969B]"
            >
              Start mission
            </Link>
          </div>
        </SectionCard>
      )}

      {/* @SECTION Chapter breakdown */}
      <section className="mt-5 space-y-5">
        {report.chapters.map((chapter) => (
          <section
            key={chapter.id}
            className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">Chapter</p>
                <h2 className="mt-1 text-xl font-black text-[#073B5A]">{chapter.title}</h2>
              </div>
              <p className="text-sm font-black text-[#073B5A]/65">
                {chapter.completedConcepts}/{chapter.totalConcepts} concepts
              </p>
            </div>

            <ul className="mt-4 space-y-3">
              {chapter.concepts.map((concept) => (
                <li
                  key={concept.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#073B5A]/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-black text-[#073B5A]">{concept.title}</p>
                    <p className="text-sm font-bold text-[#073B5A]/65">
                      {concept.completedSkills}/{concept.totalSkills} skills
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-24 sm:w-28">
                      <div className="h-2 overflow-hidden rounded-full bg-[#E4EBEE]">
                        <div
                          className="h-full rounded-full bg-[#00AFB9]"
                          style={{ width: `${concept.percent}%` }}
                        />
                      </div>
                    </div>
                    <ConceptStatusBadge concept={concept} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </PageLayout>
  );
}

export default ProgressScreen;
