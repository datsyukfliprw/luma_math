// @SECTION BUILDIT_IMPORTS
import { useState } from "react";
import { CircleDashed } from "lucide-react";
import { getBuildRounds, type LearnLesson } from "../../lib/learnContent";

// @SECTION BUILDIT_TYPES
type BuildItPageProps = {
  lesson: LearnLesson;
};

// @SECTION BUILDIT_PAGE
function BuildItPage({ lesson }: BuildItPageProps) {
  // @SECTION BUILDIT_DATA
  const buildRounds = getBuildRounds(lesson);

  // @SECTION BUILDIT_STATE
  const [roundIndex, setRoundIndex] = useState(0);
  const currentRound = buildRounds[roundIndex];

  const [groupCounts, setGroupCounts] = useState<number[]>(
    Array.from({ length: currentRound.groups }, () => 0),
  );
  const [hasChecked, setHasChecked] = useState(false);
  const [completedRounds, setCompletedRounds] = useState<number[]>([]);

  const totalItems = groupCounts.reduce((sum, count) => sum + count, 0);
  const isZeroRound = currentRound.targetCount === 0;
  const isCorrect = groupCounts.every((count) => count === currentRound.targetCount);
  const canMoveNextRound = hasChecked && isCorrect;

  // @SECTION BUILDIT_HELPERS
  function getItemWord(count: number) {
    return count === 1 ? "item" : "items";
  }

  function resetRound(nextRoundIndex: number) {
    const nextRound = buildRounds[nextRoundIndex];

    setRoundIndex(nextRoundIndex);
    setGroupCounts(Array.from({ length: nextRound.groups }, () => 0));
    setHasChecked(false);
  }

  function toggleGroup(index: number) {
    if (isZeroRound) {
      return;
    }

    setHasChecked(false);

    setGroupCounts((currentGroups) =>
      currentGroups.map((count, groupIndex) => {
        if (groupIndex !== index) {
          return count;
        }

        return count === currentRound.targetCount ? 0 : currentRound.targetCount;
      }),
    );
  }

  function checkGroups() {
    setHasChecked(true);

    if (isCorrect && !completedRounds.includes(roundIndex)) {
      setCompletedRounds((currentCompletedRounds) => {
        const nextCompletedRounds = [...currentCompletedRounds, roundIndex];

        return nextCompletedRounds;
      });
    }
  }

  function goToNextBuildRound() {
    if (roundIndex < buildRounds.length - 1) {
      resetRound(roundIndex + 1);
    }
  }

  function goToPreviousBuildRound() {
    if (roundIndex > 0) {
      resetRound(roundIndex - 1);
    }
  }

  return (
    <>
      {/* @SECTION BUILDIT_MAIN_CARD */}
      <main
        data-name="build-it-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* @SECTION BUILDIT_HEADER */}
        <div
          data-name="build-it-card-header"
          className="mb-5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              👐
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">Build It Together</h2>

              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                {currentRound.instruction}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Round {roundIndex + 1} of {buildRounds.length}
          </div>
        </div>

        {/* @SECTION BUILDIT_GROUP_BOXES */}
        <div
          data-name="build-it-group-boxes-card"
          className="rounded-[1.75rem] border border-[#BFEAF0] bg-[#F7FCFD] p-4"
        >
          <div
            data-name="build-it-group-boxes-grid"
            className={`grid gap-4 ${
              currentRound.groups === 6 ? "md:grid-cols-6" : "md:grid-cols-4"
            }`}
          >
            {groupCounts.map((count, index) => (
              <button
                key={index}
                type="button"
                data-name={`build-it-group-box-${index + 1}`}
                onClick={() => toggleGroup(index)}
                disabled={isZeroRound}
                className={`flex h-28 items-center justify-center rounded-[1.35rem] border-2 transition ${
                  isZeroRound
                    ? "cursor-default border-[#42C8DC]/75 bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)]"
                    : "border-[#42C8DC] bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)]"
                }`}
              >
                {count === currentRound.targetCount && !isZeroRound ? (
                  <div
                    aria-label={`${count} ${getItemWord(count)}`}
                    className="flex max-w-[78px] flex-wrap items-center justify-center gap-1.5"
                  >
                    {Array.from({ length: count }).map((_, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="h-5 w-5 rounded-full bg-[#F7B733] shadow-inner"
                      />
                    ))}
                  </div>
                ) : isZeroRound ? (
                  <div className="text-center">
                    <CircleDashed
                      size={20}
                      strokeWidth={2.6}
                      className="mx-auto mb-2 text-[#A9D7E1]"
                    />
                    <p className="text-sm font-black text-[#6D9AB1]">Empty</p>
                  </div>
                ) : (
                  <p className="text-sm font-black text-[#6D9AB1]">Tap</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* @SECTION BUILDIT_SUMMARY_BAR */}
        <div
          data-name="build-it-summary-bar"
          className="mt-4 grid overflow-hidden rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] text-center md:grid-cols-3"
        >
          <div className="flex items-center justify-center gap-3 px-4 py-3">
            <span className="text-2xl text-[#00AFB9]">👥</span>
            <p className="text-base font-black text-[#073B5A]">{currentRound.groups} groups</p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="h-5 w-5 rounded-full bg-[#F7B733] shadow-inner" />
            <p className="text-base font-black text-[#073B5A]">
              {currentRound.targetCount} in each
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00AFB9] text-base font-black text-white">
              =
            </span>
            <p className="text-base font-black text-[#073B5A]">{totalItems} total</p>
          </div>
        </div>

        {/* @SECTION BUILDIT_ACTIONS */}
        <div
          data-name="build-it-action-buttons"
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          {roundIndex > 0 && (
            <button
              type="button"
              onClick={goToPreviousBuildRound}
              className="rounded-2xl border border-[#073B5A]/10 bg-white px-7 py-3 text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              Previous
            </button>
          )}

          <button
            type="button"
            onClick={checkGroups}
            className="rounded-2xl bg-[#00AFB9] px-8 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
          >
            {isZeroRound ? "Check Empty Groups" : "Check My Groups"}
          </button>

          {roundIndex < buildRounds.length - 1 && canMoveNextRound && (
            <button
              type="button"
              onClick={goToNextBuildRound}
              className="rounded-2xl bg-[#073B5A] px-7 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#052A40]"
            >
              Next Round
            </button>
          )}
        </div>

        {/* @SECTION BUILDIT_RESULT_CARD */}
        <section
          data-name="build-it-result-card"
          className="mt-4 rounded-[1.5rem] border border-[#BFEAF0] bg-[#F6FCFD] p-4 shadow-sm"
        >
          <div
            data-name="build-it-result-header"
            className="flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div
                data-name="build-it-result-icon"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-xl"
              >
                💡
              </div>

              <div data-name="build-it-result-text">
                <h2 className="text-lg font-black text-[#073B5A]">What did you build?</h2>

                <p className="mt-1 text-sm font-bold leading-relaxed text-[#275875]">
                  {hasChecked && isCorrect
                    ? isZeroRound
                      ? `You built ${currentRound.groups} equal groups with 0 items in each.`
                      : `You built ${currentRound.groups} equal groups with 1 item in each.`
                    : hasChecked
                      ? `Almost! Each group needs exactly ${
                          currentRound.targetCount
                        } ${getItemWord(currentRound.targetCount)}.`
                      : "Build the groups, then check your work."}
                </p>
              </div>
            </div>

            {hasChecked && isCorrect && (
              <div
                data-name="build-it-result-success-badge"
                className="hidden shrink-0 rounded-full bg-white px-3 py-2 text-sm font-black text-[#0081A7] shadow-sm sm:block"
              >
                Nice!
              </div>
            )}
          </div>

          {hasChecked && isCorrect ? (
            <div
              data-name="build-it-result-success-summary"
              className="mt-4 rounded-[1.25rem] border border-white/80 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    data-name="build-it-result-item-badge"
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFF6D8] shadow-inner"
                  >
                    <span className="h-7 w-7 rounded-full bg-[#F7B733]" />
                  </div>

                  <div data-name="build-it-result-success-text">
                    <h3 className="text-xl font-black text-[#073B5A]">
                      {isZeroRound
                        ? `${currentRound.groups} groups of 0`
                        : `${currentRound.groups} groups of 1`}
                    </h3>

                    <p className="mt-1 text-sm font-bold text-[#355F7C]">{currentRound.summary}</p>
                  </div>
                </div>

                <div
                  data-name="build-it-result-equation-chip"
                  className="rounded-2xl bg-[#E9F7F8] px-4 py-3 text-lg font-black text-[#073B5A]"
                >
                  {currentRound.groups} × {currentRound.targetCount} ={" "}
                  {currentRound.groups * currentRound.targetCount}
                </div>
              </div>
            </div>
          ) : (
            <div
              data-name="build-it-result-waiting-message"
              className={`mt-4 rounded-2xl border px-4 py-4 text-center ${
                hasChecked
                  ? "border-[#F07167]/25 bg-[#FCE9E5]"
                  : "border-dashed border-[#00AFB9]/35 bg-white"
              }`}
            >
              <p className="text-base font-black text-[#073B5A]">
                {hasChecked
                  ? "Try fixing the groups, then check again."
                  : "Your result will appear here after you check."}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* @SECTION BUILDIT_SIDEBAR */}
      <aside data-name="build-it-right-sidebar" className="flex flex-col gap-4">
        {/* @SECTION BUILDIT_PROGRESS_CARD */}
        <section
          data-name="build-progress-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Build Progress</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Round {roundIndex + 1} of {buildRounds.length}
              </p>
            </div>

            <p className="text-sm font-black text-[#073B5A]">
              {completedRounds.length}/{buildRounds.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {buildRounds.map((round, index) => {
              const isDone = completedRounds.includes(index);
              const isCurrent = index === roundIndex;

              return (
                <button
                  key={`${round.groups}-${round.targetCount}`}
                  type="button"
                  onClick={() => resetRound(index)}
                  className={`rounded-2xl border px-2 py-3 text-center shadow-sm transition ${
                    isCurrent
                      ? "border-[#00AFB9] bg-[#E9F7F8]"
                      : isDone
                        ? "border-[#00AFB9]/30 bg-white"
                        : "border-[#073B5A]/10 bg-white"
                  }`}
                >
                  <p className="text-sm font-black text-[#073B5A]">{isDone ? "✓" : index + 1}</p>

                  <p className="mt-1 text-[0.68rem] font-bold text-[#073B5A]/65">
                    {round.groups}×{round.targetCount}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* @SECTION BUILDIT_PATTERN_CARD */}
        <section
          data-name="build-it-math-pattern-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              =
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Math Pattern</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Notice the rule
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black text-[#073B5A]">{currentRound.pattern}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.groups} × {currentRound.targetCount} ={" "}
                  {currentRound.groups * currentRound.targetCount}
                </p>

                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">This round</p>
              </div>

              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.targetCount === 0 ? "9 × 0 = 0" : "7 × 1 = 7"}
                </p>

                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">Same pattern</p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

export default BuildItPage;
