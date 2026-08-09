import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { LessonFallbackScreen } from "../components/ui/LessonFallbackScreen";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import { getResolvedTryItExperience, type ResolvedTryItProblem } from "../lib/tryItResolver";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { TryItCompletionResult } from "../types/tryItProgress";

function isNumericString(value: string): boolean {
  const normalized = normalizeNumericAnswer(value);
  return normalized.length > 0 && !Number.isNaN(Number(normalized));
}

function normalizeAnswer(answer: string, expected: string): string {
  return isNumericString(expected) ? normalizeNumericAnswer(answer) : normalizeTextAnswer(answer);
}

function partIsCorrect(
  problem: ResolvedTryItProblem,
  partKey: string,
  answers: Record<string, string>,
) {
  const part = problem.parts.find((p) => p.key === partKey);
  if (!part) return false;
  const userAnswer = normalizeAnswer(answers[partKey] ?? "", part.correctAnswer);
  const expected = normalizeAnswer(part.correctAnswer, part.correctAnswer);
  return userAnswer === expected;
}

function getPartInstruction(
  part: ResolvedTryItProblem["parts"][number],
): string {
  const rawLabel = typeof part.label === "string" ? part.label.trim() : "";
  const label = rawLabel.toLowerCase();
  const hasChoices = Boolean(part.choices && part.choices.length > 0);

  if (part.key === "equation") {
    return hasChoices ? "Which equation matches?" : "Write the equation.";
  }

  if (part.key === "groups") {
    if (label.includes("factor")) {
      return label === "factors" ? "Which values are the factors?" : "Choose the first factor.";
    }

    return "How many groups are there?";
  }

  if (part.key === "inEach") {
    if (label.includes("factor") || label.includes("numbers being multiplied")) {
      return "Choose the second factor.";
    }

    return "How many are in each group?";
  }

  if (hasChoices) {
    return rawLabel
      ? `Choose the best answer for ${rawLabel.toLowerCase()}.`
      : "Choose the best answer.";
  }

  return rawLabel || "Enter your answer.";
}

function getPartHelperText(
  part: ResolvedTryItProblem["parts"][number],
): string | null {
  if (part.key === "groups") {
    return "Count the groups shown in the picture.";
  }

  if (part.key === "inEach") {
    return "Look at how many items are inside one group.";
  }

  if (part.key === "equation") {
    return "Use your first two answers to choose the matching equation.";
  }

  if (part.choices && part.choices.length > 0) {
    return "Choose the answer that best matches the problem.";
  }

  return null;
}

function TryItScreen() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const { markTryItComplete } = useStudentProgress();

  const experience = useMemo(() => getResolvedTryItExperience(lessonId), [lessonId]);

  const [problemIndex, setProblemIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [touchedParts, setTouchedParts] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<TryItCompletionResult | null>(null);

  if (!lessonId || !experience) {
    return <LessonFallbackScreen lessonId={lessonId} contentType="curriculum" />;
  }

  const currentLessonId = lessonId;

  const currentProblem = experience.problems[problemIndex];
  const totalProblems = experience.problems.length;
  const isLastProblem = problemIndex >= totalProblems - 1;
  const progressPercent = totalProblems > 0 ? Math.round((problemIndex / totalProblems) * 100) : 0;
  const allPartsFilled = currentProblem.parts.every(
    (part) => (answers[part.key] ?? "").trim().length > 0,
  );

  function handleAnswerChange(partKey: string, value: string) {
    setAnswers((prev) => ({ ...prev, [partKey]: value }));
    setTouchedParts((prev) => ({ ...prev, [partKey]: true }));
    setFeedback(null);
  }

  function advanceOrComplete() {
    if (isLastProblem) {
      const result = markTryItComplete(currentLessonId);
      setCompletionResult(result);
      setCompleted(true);
      return;
    }

    window.setTimeout(() => {
      setProblemIndex((current) => current + 1);
      setAnswers({});
      setTouchedParts({});
      setFeedback(null);
      setShowHint(false);
    }, 900);
  }

  function checkAnswer() {
    if (!currentProblem || feedback === "correct" || completed) return;

    let allCorrect = true;
    const nextTouched: Record<string, boolean> = { ...touchedParts };

    for (const part of currentProblem.parts) {
      nextTouched[part.key] = true;
      if (!partIsCorrect(currentProblem, part.key, answers)) {
        allCorrect = false;
      }
    }

    setTouchedParts(nextTouched);

    if (allCorrect) {
      setFeedback("correct");
      advanceOrComplete();
      return;
    }

    setFeedback("incorrect");
    setShowHint(true);
  }

  function handleRetryCompletion() {
    const result = markTryItComplete(currentLessonId);
    setCompletionResult(result);
  }

  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`);
  }

  function renderVisual() {
    if (!currentProblem.visualData) return null;

    const groups = Math.max(0, currentProblem.visualData.groups);
    const itemsPerGroup = Math.max(0, currentProblem.visualData.itemsPerGroup);
    const visibleGroups = Math.min(groups, 12);
    const remainingGroups = Math.max(0, groups - visibleGroups);
    const useCompactItemCount = itemsPerGroup > 8;

    return (
      <div data-name="try-it-visual" className="mt-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: visibleGroups }).map((_, groupIndex) => (
            <div
              key={groupIndex}
              data-name="try-it-visual-group"
              className="flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-xl border border-[#073B5A]/10 bg-white p-2"
            >
              {currentProblem.visualEmpty || itemsPerGroup === 0 ? (
                <span
                  aria-label="empty group"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#073B5A]/12 bg-[#F8FBFB]"
                />
              ) : useCompactItemCount ? (
                <div className="flex items-center gap-1.5 text-sm font-black text-[#073B5A]">
                  <span>{currentProblem.visualEmoji ?? "⭐"}</span>
                  <span>× {itemsPerGroup}</span>
                </div>
              ) : (
                <div className="flex max-w-[120px] flex-wrap items-center justify-center gap-1">
                  {Array.from({ length: itemsPerGroup }).map((_, itemIndex) => (
                    <span
                      key={itemIndex}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-[#E9F7F8] text-sm"
                    >
                      {currentProblem.visualEmoji ?? "⭐"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {remainingGroups > 0 && (
            <div className="flex min-h-12 items-center rounded-xl border border-dashed border-[#00AFB9]/35 bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
              + {remainingGroups} more group{remainingGroups === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {groups > 0 && (
          <p className="mt-2 text-xs font-bold text-[#275875]/65">
            {groups} group{groups === 1 ? "" : "s"} · {itemsPerGroup} in each
          </p>
        )}
      </div>
    );
  }

  if (completed) {
    const allSolvedCount = experience.problems.length;

    return (
      <PageLayout>
        <div data-name="try-it-screen" className="flex min-h-full flex-col gap-4">
          <section data-name="try-it-header" className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={backToLesson}
              className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:px-6 lg:py-4 lg:text-base"
            >
              ← Back to Lesson
            </button>
            <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm lg:px-6 lg:py-4 lg:text-base">
              Try It Complete
            </div>
          </section>

          <section
            data-name="completion-panel"
            className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 text-center shadow-sm"
          >
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#EAF8EC] text-5xl">
              🌟
            </div>
            <h2 className="text-2xl font-black text-[#073B5A] lg:text-3xl">
              Nice work! You finished Try It.
            </h2>
            <p className="mt-3 max-w-[560px] text-base font-bold leading-relaxed text-[#073B5A]/70 lg:text-lg">
              You completed {allSolvedCount} Try It problem
              {allSolvedCount === 1 ? "" : "s"}. Ready to practice what you learned?
            </p>

            {completionResult?.ok === false ? (
              <div data-name="feedback-area" className="mt-6 max-w-md">
                <p className="text-sm font-bold text-[#D85B52]">
                  We had trouble saving your progress. You can try again.
                </p>
                <button
                  type="button"
                  onClick={handleRetryCompletion}
                  className="mt-3 min-w-[200px] rounded-2xl bg-[#00AFB9] px-6 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                >
                  Retry Save
                </button>
              </div>
            ) : (
              <div className="mt-8 flex w-full max-w-[360px] flex-col gap-3">
                <Link
                  to={`/practice/${currentLessonId}?mode=guided`}
                  data-name="try-it-start-practice-button"
                  className="w-full rounded-2xl bg-[#00AFB9] px-8 py-4 text-center text-lg font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0081A7]"
                >
                  Start Practice →
                </Link>

                <button
                  type="button"
                  onClick={backToLesson}
                  className="w-full rounded-2xl border border-[#073B5A]/12 bg-white px-8 py-4 text-base font-black text-[#073B5A] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#F8FBFB]"
                >
                  Back to Lesson
                </button>
              </div>
            )}
          </section>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div data-name="try-it-screen" className="flex min-h-full flex-col gap-4">
        <section data-name="try-it-header" className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={backToLesson}
            className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:px-6 lg:py-4 lg:text-base"
          >
            ← Back to Lesson
          </button>

          <div className="flex items-center gap-3">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0081A7]">Try It</p>
            <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-sm font-black text-[#073B5A] shadow-sm lg:px-6 lg:py-4 lg:text-base">
              {problemIndex + 1} of {totalProblems}
            </div>
          </div>
        </section>

        <section className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <main
            data-name="problem-card"
            className="relative flex min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(253,252,220,0.95),transparent_34%),radial-gradient(circle_at_82%_16%,rgba(233,247,248,0.9),transparent_32%),linear-gradient(180deg,#FFFFFF_0%,#FDFCDC_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#E9F7F8] to-transparent" />

            <div className="relative z-10 flex flex-1 flex-col">
              <div className="flex-1">
                <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                  {experience.title}
                </p>
                <h1 className="mt-2 text-2xl font-black leading-8 text-[#073B5A] sm:text-3xl sm:leading-10">
                  {currentProblem.prompt}
                </h1>

                {renderVisual()}

                {currentProblem.parts.length > 1 && (
                  <div
                    data-name="try-it-directions"
                    className="mt-6 max-w-[560px] rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3"
                  >
                    <p className="text-sm font-black text-[#073B5A]">
                      Choose one answer in each row, then tap Check Answer.
                    </p>
                  </div>
                )}

                <div
                  data-name="response-controls"
                  className={`${currentProblem.parts.length > 1 ? "mt-5" : "mt-8"} grid w-full max-w-[560px] gap-4`}
                >
                  {currentProblem.parts.map((part) => {
                    const partValue = answers[part.key] ?? "";

                    return (
                      <div key={part.key} data-name="try-it-part" className="w-full">
                        <p className="text-base font-black text-[#073B5A]">
                          {getPartInstruction(part)}
                        </p>

                        {getPartHelperText(part) && (
                          <p className="mt-0.5 text-xs font-bold leading-relaxed text-[#275875]/65">
                            {getPartHelperText(part)}
                          </p>
                        )}

                        {part.choices && part.choices.length > 0 ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {part.choices.map((choice) => {
                              const isSelected = partValue === choice;

                              return (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() => handleAnswerChange(part.key, String(choice))}
                                  aria-pressed={isSelected}
                                  className={`rounded-xl border-2 px-4 py-3 text-base font-black transition sm:px-6 sm:text-lg ${
                                    isSelected
                                      ? "border-[#00AFB9] bg-[#E9F7F8] text-[#073B5A] shadow-[0_0_0_3px_rgba(0,175,185,0.10)]"
                                      : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/50"
                                  }`}
                                >
                                  {choice}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={partValue}
                            onChange={(event) => handleAnswerChange(part.key, event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" && allPartsFilled) {
                                checkAnswer();
                              }
                            }}
                            className="mt-2 block w-full rounded-2xl border-2 border-[#00AFB9] bg-white px-6 py-4 text-center text-xl font-black text-[#073B5A] outline-none transition focus:border-[#0081A7] focus:ring-4 focus:ring-[#00AFB9]/10"
                            placeholder="Type your answer"
                            autoFocus={problemIndex === 0 && part === currentProblem.parts[0]}
                          />
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={checkAnswer}
                    disabled={!allPartsFilled}
                    className={`mt-4 min-w-[220px] rounded-2xl px-9 py-4 text-base font-black shadow-sm transition lg:text-lg ${
                      allPartsFilled
                        ? "bg-[#00AFB9] text-white hover:-translate-y-0.5 hover:bg-[#009DA7]"
                        : "cursor-not-allowed bg-[#DDEEEF] text-[#073B5A]/45"
                    }`}
                  >
                    Check Answer
                  </button>

                  {feedback && (
                    <div data-name="feedback-area" className="mt-2 text-base font-black">
                      {feedback === "correct" ? (
                        <p className="text-[#2F9E44]">{currentProblem.successMessage}</p>
                      ) : (
                        <p className="text-[#D85B52]">
                          Not quite. {showHint ? currentProblem.tip : "Try again!"}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          <aside data-name="progress-area" className="flex min-h-0 flex-col gap-5">
            <section className="flex min-h-[315px] flex-1 flex-col rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#073B5A]">Try It Progress</h2>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Problem
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#073B5A]">
                    {problemIndex + 1} of {totalProblems}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Done
                  </p>
                  <p className="mt-1 text-2xl font-black text-[#073B5A]">
                    {problemIndex} of {totalProblems}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {experience.problems.map((problem, index) => {
                  const isDone = index < problemIndex;
                  const isCurrent = index === problemIndex;

                  return (
                    <span
                      key={problem.id}
                      aria-label={`Problem ${index + 1}`}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${
                        isDone
                          ? "border-[#54C95B] bg-[#EAF8EC] text-[#2F9E44]"
                          : isCurrent
                            ? "border-[#00AFB9] bg-[#00AFB9] text-white shadow-[0_0_0_5px_rgba(0,175,185,0.10)]"
                            : "border-[#073B5A]/15 bg-white text-[#073B5A]/45"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                  );
                })}
              </div>

              <div className="mt-auto pt-5">
                <div className="flex items-center justify-between gap-3 text-sm font-black">
                  <span className="text-[#073B5A]">Overall progress</span>
                  <span className="text-[#0081A7]">{progressPercent}%</span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#DDEEEF]">
                  <div
                    className="h-full rounded-full bg-[#00AFB9] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </section>

            <section className="flex h-[220px] shrink-0 flex-col overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-[#073B5A]">Need a Hint?</h2>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="text-sm font-bold leading-6 text-[#073B5A]/70">
                  {showHint && currentProblem
                    ? currentProblem.tip
                    : "Use what you learned. When you’re ready, reveal one small clue."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowHint((current) => !current)}
                className="mt-4 min-h-11 w-full rounded-xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-2 text-sm font-black text-[#073B5A] shadow-sm transition hover:bg-[#EEF7F8] lg:text-base"
              >
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>
            </section>
          </aside>
        </section>
      </div>
    </PageLayout>
  );
}

export default TryItScreen;
