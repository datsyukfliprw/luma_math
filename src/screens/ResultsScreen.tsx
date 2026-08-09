import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, Target } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import type { PracticeMode } from "../practiceTypes/types";
import type { SessionResult } from "../types/sessionResults";

function getModeLabel(mode: PracticeMode) {
  if (mode === "guided") return "Guided Practice";
  if (mode === "independent") return "Independent Practice";
  return "Challenge";
}

function ResultStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-4 text-center shadow-sm">
      <p className="text-2xl font-black text-[#073B5A]">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[#6D9AB1]">{label}</p>
    </div>
  );
}

function MissingResultState() {
  return (
    <PageLayout>
      <main
        data-name="results-screen-missing-state"
        className="mx-auto flex min-h-[560px] w-full max-w-[760px] flex-col items-center justify-center rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 text-center shadow-sm"
      >
        <Target size={44} strokeWidth={2.4} className="text-[#00AFB9]" />
        <h1 className="mt-5 text-3xl font-black text-[#073B5A]">Results are no longer available</h1>
        <p className="mt-2 max-w-xl text-base font-bold leading-relaxed text-[#275875]">
          This page shows the result of the practice session you just finished. Return to your
          Learning Path to keep going.
        </p>
        <Link
          to="/learning-path"
          className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#00AFB9] px-6 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
        >
          Back to Learning Path
        </Link>
      </main>
    </PageLayout>
  );
}

function PracticeResults({ result }: { result: Extract<SessionResult, { kind: "practice" }> }) {
  const firstAttemptPercent =
    result.firstAttemptTotalCount > 0
      ? Math.round((result.firstAttemptCorrectCount / result.firstAttemptTotalCount) * 100)
      : 0;
  const nextStepLabel = result.nextLessonPath.includes("-eval")
    ? "Open Evaluation"
    : result.nextLessonPath === "/learning-path"
      ? "Learning Path"
      : "Next Lesson";

  return (
    <PageLayout>
      <main data-name="practice-results-screen" className="mx-auto w-full max-w-[880px]">
        <section className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8FAF7] text-[#00A9A5]">
              <CheckCircle2 size={44} strokeWidth={2.6} />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              {getModeLabel(result.mode)} complete
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
              Nice work.
            </h1>
            <p className="mt-2 max-w-2xl text-base font-bold leading-relaxed text-[#275875]">
              You finished {result.lessonTitle}. Here is how this round went.
            </p>
          </div>

          <div className="mx-auto mt-7 grid max-w-[560px] gap-3 sm:grid-cols-2">
            <ResultStat value={`${result.correctCount}/${result.totalCount}`} label="Solved" />
            <ResultStat value={`${firstAttemptPercent}%`} label="First try" />
          </div>

          {result.recommendedMode && (
            <section className="mt-6 rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#0081A7]">
                Extra practice available
              </p>
              <h2 className="mt-1 text-xl font-black text-[#073B5A]">
                Ready for {getModeLabel(result.recommendedMode)}?
              </h2>
              <p className="mt-1 text-sm font-bold leading-relaxed text-[#275875]">
                You can keep practicing this skill, or continue to the next part of your learning path.
              </p>
            </section>
          )}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={result.nextLessonPath}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#00AFB9] px-6 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
            >
              {nextStepLabel}
              <ArrowRight size={18} strokeWidth={3} />
            </Link>

            {result.recommendedMode && (
              <Link
                to={`/practice/${result.lessonId}?mode=${result.recommendedMode}`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#00AFB9]/25 bg-[#E9F7F8] px-6 text-base font-black text-[#0081A7] shadow-sm transition hover:bg-[#DDF4F6]"
              >
                {getModeLabel(result.recommendedMode)}
              </Link>
            )}

            <Link
              to={result.lessonPath}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-6 text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              Back to Lesson
            </Link>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

function EvaluationResults({ result }: { result: Extract<SessionResult, { kind: "evaluation" }> }) {
  const accuracyPercent = Math.round(result.accuracy * 100);
  const requiredPercent = Math.round(result.requiredAccuracy * 100);
  const passed = result.status === "passed";

  return (
    <PageLayout>
      <main data-name="evaluation-results-screen" className="mx-auto w-full max-w-[880px]">
        <section className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${
                passed ? "bg-[#E8FAF7] text-[#00A9A5]" : "bg-[#FFF3D9] text-[#C78300]"
              }`}
            >
              {passed ? (
                <CheckCircle2 size={44} strokeWidth={2.6} />
              ) : (
                <RotateCcw size={41} strokeWidth={2.6} />
              )}
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              Unit evaluation
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#073B5A] lg:text-4xl">
              {passed ? (result.alreadyCompleted ? "Passed again." : "Evaluation passed.") : "Almost there."}
            </h1>
            <p className="mt-2 max-w-2xl text-base font-bold leading-relaxed text-[#275875]">
              {passed
                ? "You showed that you are ready to move forward."
                : `You need ${requiredPercent}% to pass. Review the lesson work, then try the evaluation again.`}
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <ResultStat
              value={`${result.firstAttemptCorrectCount}/${result.firstAttemptTotalCount}`}
              label="First-try correct"
            />
            <ResultStat value={`${accuracyPercent}%`} label="Score" />
            <ResultStat value={`${requiredPercent}%`} label="Pass mark" />
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={result.lessonPath}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-6 text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              Back to Unit
            </Link>

            {passed ? (
              <Link
                to={result.nextUnitPath}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#00AFB9] px-6 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
              >
                Continue
                <ArrowRight size={18} strokeWidth={3} />
              </Link>
            ) : (
              <Link
                to={result.retryPath}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#00AFB9] px-6 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
              >
                <RotateCcw size={18} strokeWidth={3} />
                Try Again
              </Link>
            )}
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

function ResultsScreen() {
  const location = useLocation();
  const result = (location.state as { result?: SessionResult } | null)?.result;

  if (!result) {
    return <MissingResultState />;
  }

  if (result.kind === "evaluation") {
    return <EvaluationResults result={result} />;
  }

  return <PracticeResults result={result} />;
}

export default ResultsScreen;
