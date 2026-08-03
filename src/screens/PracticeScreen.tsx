import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { getLessonById } from "../lib/lessonLookup";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import { generateProblemsForPracticeType } from "../practiceTypes/registry";
import { normalizeNumericAnswer, normalizeTextAnswer } from "../lib/answerValidation";
import type { PracticeMode } from "../practiceTypes/types";
import type { PracticeCompletionRejectionReason } from "../types/practiceProgress";
import {
  buildFirstAttemptMetrics,
  recordFirstAttemptResult,
  type FirstAttemptResults,
} from "../services/progress/firstAttemptScoring";

// @SECTION PRACTICE_HELPERS
function formatPracticeType(practiceType: string) {
  return practiceType
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function isNumericString(value: string): boolean {
  const normalized = normalizeNumericAnswer(value);
  return normalized.length > 0 && !Number.isNaN(Number(normalized));
}

function normalizeForComparison(answer: string, expected: string): string {
  if (isNumericString(expected)) {
    return normalizeNumericAnswer(answer);
  }
  return normalizeTextAnswer(answer).replaceAll("×", "x").replaceAll("*", "x");
}

function normalizePracticeMode(mode: string | null): PracticeMode {
  if (mode === "independent" || mode === "challenge") {
    return mode;
  }

  return "guided";
}

// @SECTION PRACTICE_MODE_CONFIG
const PRACTICE_MODE_CONFIG = {
  guided: {
    title: "Guided Practice",
    eyebrow: "Step-by-step support",
    description: "Use hints and visual support while you build confidence with today’s skill.",
    rewardTitle: "Earn a Common Accessory",
    rewardTier: "🎒 Common Reward",
    rewardDescription:
      "Complete Guided Practice to earn a common accessory for your star. Want something rarer? Try Independent Practice for rare rewards or Challenge Yourself for epic rewards.",
    rewardIcon: "🎒",
    skillDescription: "Use equal groups to find the total.",
    hintTitle: "Helpful Hint",
    accentClass: "border-[#00AFB9]/25 bg-[#E9F7F8]",
    badgeClass: "bg-[#E9F7F8] text-[#0081A7]",
  },
  independent: {
    title: "Independent Practice",
    eyebrow: "Solo round",
    description: "Your turn! Show what you know and power up a rare reward.",
    rewardTitle: "Rare Reward",
    rewardTier: "✨ Rare Reward",
    rewardDescription: "Finish Independent Practice to unlock a rare accessory for your star.",
    rewardIcon: "✨",
    skillDescription: "Solve the skill on your own with fewer hints.",
    hintTitle: "Need a Hint?",
    accentClass: "border-[#F7B733]/30 bg-[#FFF3D9]",
    badgeClass: "bg-[#FFF3D9] text-[#C78300]",
  },
  challenge: {
    title: "Challenge Yourself",
    eyebrow: "Bonus difficulty",
    description: "Try a tougher version of the skill with less support and a bigger reward.",
    rewardTitle: "Earn an Epic Accessory",
    rewardTier: "👑 Epic Reward",
    rewardDescription:
      "Complete Challenge Practice to earn an epic accessory for your star. Challenge problems ask you to spot mistakes and explain your thinking.",
    rewardIcon: "👑",
    skillDescription: "Solve trickier questions that test your reasoning.",
    hintTitle: "Need a Hint?",
    accentClass: "border-[#F07167]/25 bg-[#FCE9E5]",
    badgeClass: "bg-[#FCE9E5] text-[#F07167]",
  },
} as const;

type CompletionModalState = {
  firstCompletion: boolean;
  recommendedMode: PracticeMode | null;
};

function getHintText(visualType?: string) {
  if (visualType === "fair_sharing") {
    return "Fair sharing means splitting items equally so each group gets the same amount.";
  }

  if (visualType === "array_rows_columns") {
    return "Rows go across. Columns go up and down. Count both to find the product.";
  }

  if (visualType === "multiple_choice") {
    return "The commutative property means you can switch the order of the factors and keep the same product.";
  }

  if (visualType === "repeated_addition") {
    return "Repeated addition adds the same number again and again. Count how many times it repeats.";
  }

  if (visualType === "factor_product") {
    return "Factors are the numbers being multiplied. The product is the answer.";
  }

  return "Equal groups have the same number of items in each group.";
}

function buildAnswerChoices(correctAnswer: string, groups?: number) {
  const correct = Number(correctAnswer);

  if (Number.isNaN(correct)) {
    return [correctAnswer];
  }

  if (correct === 0) {
    return Array.from(new Set(["0", "1", String(groups ?? 2)])).slice(0, 3);
  }

  if (correct === 1) {
    return ["0", "1", "2"];
  }

  return Array.from(new Set(["0", "1", String(correct)])).slice(0, 3);
}

function getRewardChargeLabel(mode: PracticeMode) {
  if (mode === "guided") return "Common Reward Charge";
  if (mode === "independent") return "Rare Reward Charge";
  return "Epic Reward Charge";
}

function getFactorProductSlotOrder(problemIndex: number) {
  const orders = [
    ["factorA", "factorB", "product"],
    ["product", "factorA", "factorB"],
    ["factorA", "product", "factorB"],
  ] as const;

  return orders[problemIndex % orders.length];
}

function getModePath(lessonId: string, mode: PracticeMode) {
  return `/practice/${lessonId}?mode=${mode}`;
}

function getModeLabel(mode: PracticeMode) {
  if (mode === "guided") return "Guided Practice";
  if (mode === "independent") return "Independent Practice";
  return "Challenge Yourself";
}

function getModeRewardLabel(mode: PracticeMode) {
  if (mode === "guided") return "common accessory";
  if (mode === "independent") return "rare accessory";
  return "epic accessory";
}

function getNextLessonPath({
  unitNumber,
  weekNumber,
  dayNumber,
}: {
  unitNumber: number;
  weekNumber: number;
  dayNumber: number;
}) {
  return `/lesson/g3-u${unitNumber}-w${weekNumber}-l${dayNumber + 1}`;
}

// @SECTION PRACTICE_SCREEN
function PracticeScreen() {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const practiceMode = normalizePracticeMode(searchParams.get("mode"));
  const modeConfig = PRACTICE_MODE_CONFIG[practiceMode];

  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId);
  const { getRecommendedNextPracticeMode, hasPracticeReward, markPracticeReward } =
    useStudentProgress();

  const currentLessonId =
    lessonId ?? `g3-u${unit.unit_number}-w${week.week_number}-l${weekDayNumber}`;
  const nextLessonPath = getNextLessonPath({
    unitNumber: unit.unit_number,
    weekNumber: week.week_number,
    dayNumber: weekDayNumber,
  });

  const problems = generateProblemsForPracticeType(lesson.practice_type, {
    mode: practiceMode,
    lesson,
  });

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [factorAAnswer, setFactorAAnswer] = useState("");
  const [factorBAnswer, setFactorBAnswer] = useState("");
  const [productAnswer, setProductAnswer] = useState("");
  const [rowsAnswer, setRowsAnswer] = useState("");
  const [columnsAnswer, setColumnsAnswer] = useState("");
  const [quotientAnswer, setQuotientAnswer] = useState("");
  const [selectedChoice, setSelectedChoice] = useState("");
  const [mistakeJudgment, setMistakeJudgment] = useState("");
  const [mistakeReason, setMistakeReason] = useState("");
  const [showHint, setShowHint] = useState(practiceMode === "guided");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [correctProblemIndexes, setCorrectProblemIndexes] = useState<number[]>([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [completionModal, setCompletionModal] = useState<CompletionModalState | null>(null);
  const [rejectionModal, setRejectionModal] = useState<{
    reason: PracticeCompletionRejectionReason;
    firstAttemptCorrectCount?: number;
    firstAttemptTotalCount?: number;
    accuracy?: number;
    requiredAccuracy?: number;
  } | null>(null);

  // Tracks whether each problem was correct on its first submitted attempt.
  // A ref is used so retries in the same render cycle cannot rewrite the result.
  const firstAttemptResultsRef = useRef<FirstAttemptResults>({});

  useEffect(() => {
    // Reset state when practiceMode or currentLessonId changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentProblemIndex(0);
    setAnswer("");
    setFactorAAnswer("");
    setFactorBAnswer("");
    setProductAnswer("");
    setRowsAnswer("");
    setColumnsAnswer("");
    setQuotientAnswer("");
    setSelectedChoice("");
    setMistakeJudgment("");
    setMistakeReason("");
    setShowHint(practiceMode === "guided");
    setFeedback(null);
    setCorrectProblemIndexes([]);
    setCurrentStreak(0);
    setCompletionModal(null);
    setRejectionModal(null);
    firstAttemptResultsRef.current = {};
  }, [practiceMode, currentLessonId]);

  const currentProblem = problems[currentProblemIndex];

  if (problems.length === 0 || !currentProblem) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mb-4 text-4xl">🚧</div>
          <h1 className="text-2xl font-black text-[#073B5A]">Practice being prepared</h1>
          <p className="mt-2 font-semibold text-[#073B5A]/75">
            This practice activity is not ready yet.
          </p>
          <Link
            to={`/lesson/${currentLessonId}`}
            className="mt-6 inline-block rounded-xl bg-[#00AFB9] px-6 py-3 font-black text-white hover:bg-[#0081A7]"
          >
            Back to Lesson
          </Link>
        </div>
      </PageLayout>
    );
  }

  const visualData = currentProblem.visualData;

  const lessonPath = lessonId ? `/lesson/${lessonId}` : "/lesson";
  const solvedProblemCount = correctProblemIndexes.length;
  const rewardChargePercent =
    problems.length > 0 ? (solvedProblemCount / problems.length) * 100 : 0;

  const isEqualGroupsChoiceMode =
    (practiceMode === "guided" || practiceMode === "independent") &&
    currentProblem?.visualType === "equal_groups";
  const answerChoices = currentProblem
    ? buildAnswerChoices(currentProblem.correctAnswer, visualData?.groups)
    : [];

  function openCompletionModal(firstCompletion: boolean) {
    const recommendedMode = getRecommendedNextPracticeMode(currentLessonId, practiceMode);

    setCompletionModal({
      firstCompletion,
      recommendedMode,
    });
  }

  function recordFeedback(isCorrect: boolean) {
    setFeedback(isCorrect ? "correct" : "incorrect");

    // Record the first submitted attempt for this problem. Later retries do not
    // rewrite the first-attempt result, so the metrics are not inflated by
    // eventually-correct answers.
    firstAttemptResultsRef.current = recordFirstAttemptResult(
      firstAttemptResultsRef.current,
      currentProblemIndex,
      isCorrect,
    );

    // In Challenge mode, judgment + reason are checked together.
    // If either part is wrong, the streak resets.
    if (!isCorrect) {
      setCurrentStreak(0);
      return;
    }

    setCurrentStreak((current) => current + 1);

    setCorrectProblemIndexes((current) => {
      const nextCorrectIndexes = current.includes(currentProblemIndex)
        ? current
        : [...current, currentProblemIndex];

      const justFinishedLastQuestion =
        currentProblemIndex >= problems.length - 1 && !current.includes(currentProblemIndex);

      if (justFinishedLastQuestion) {
        const firstCompletion = !hasPracticeReward(currentLessonId, practiceMode);
        const metrics = buildFirstAttemptMetrics(firstAttemptResultsRef.current, problems.length);

        const result = markPracticeReward(currentLessonId, practiceMode, metrics);

        window.setTimeout(() => {
          if (!result.ok) {
            if (result.reason === "already_completed") {
              openCompletionModal(false);
            } else {
              setRejectionModal({
                reason: result.reason,
                firstAttemptCorrectCount: metrics.firstAttemptCorrectCount,
                firstAttemptTotalCount: metrics.firstAttemptTotalCount,
                accuracy: result.accuracy,
                requiredAccuracy: result.requiredAccuracy,
              });
            }
          } else {
            openCompletionModal(firstCompletion);
          }
        }, 350);
      }

      return nextCorrectIndexes;
    });
  }
  function checkAnswer() {
    if (!currentProblem) return;

    if (isEqualGroupsChoiceMode) {
      recordFeedback(
        normalizeForComparison(selectedChoice, currentProblem.correctAnswer) ===
          normalizeForComparison(currentProblem.correctAnswer, currentProblem.correctAnswer),
      );

      return;
    }

    if (currentProblem.visualType === "factor_product") {
      const expected = currentProblem.answerData;

      const expectedFactorA = expected?.factorA ?? "";
      const expectedFactorB = expected?.factorB ?? "";
      const expectedProduct = expected?.product ?? "";

      const studentFactors = [
        normalizeForComparison(factorAAnswer, expectedFactorA),
        normalizeForComparison(factorBAnswer, expectedFactorB),
      ].sort();

      const expectedFactors = [
        normalizeForComparison(expectedFactorA, expectedFactorA),
        normalizeForComparison(expectedFactorB, expectedFactorB),
      ].sort();

      const factorsAreCorrect =
        studentFactors[0] === expectedFactors[0] && studentFactors[1] === expectedFactors[1];

      const productIsCorrect =
        normalizeForComparison(productAnswer, expectedProduct) ===
        normalizeForComparison(expectedProduct, expectedProduct);

      recordFeedback(factorsAreCorrect && productIsCorrect);
      return;
    }

    if (currentProblem.visualType === "array_rows_columns") {
      const expected = currentProblem.answerData;

      const expectedRows = expected?.rows ?? "";
      const expectedColumns = expected?.columns ?? "";
      const expectedProduct = expected?.product ?? "";

      const rowsAreCorrect =
        normalizeForComparison(rowsAnswer, expectedRows) ===
        normalizeForComparison(expectedRows, expectedRows);

      const columnsAreCorrect =
        normalizeForComparison(columnsAnswer, expectedColumns) ===
        normalizeForComparison(expectedColumns, expectedColumns);

      const productIsCorrect =
        normalizeForComparison(productAnswer, expectedProduct) ===
        normalizeForComparison(expectedProduct, expectedProduct);

      recordFeedback(rowsAreCorrect && columnsAreCorrect && productIsCorrect);
      return;
    }

    if (currentProblem.visualType === "mistake_check") {
      const challengeData = currentProblem.challengeData;

      recordFeedback(
        mistakeJudgment === challengeData?.correctJudgment &&
          mistakeReason === challengeData?.correctReason,
      );

      return;
    }

    if (currentProblem.visualType === "multiple_choice") {
      recordFeedback(
        normalizeForComparison(selectedChoice, currentProblem.correctAnswer) ===
          normalizeForComparison(currentProblem.correctAnswer, currentProblem.correctAnswer),
      );

      return;
    }

    if (currentProblem.visualType === "fair_sharing") {
      const expected = currentProblem.answerData;
      const expectedQuotient = expected?.quotient ?? "";

      recordFeedback(
        normalizeForComparison(quotientAnswer, expectedQuotient) ===
          normalizeForComparison(expectedQuotient, expectedQuotient),
      );

      return;
    }

    const expected = currentProblem.correctAnswer;
    const userAnswer = normalizeForComparison(answer, expected);
    const correctAnswer = normalizeForComparison(expected, expected);

    recordFeedback(userAnswer === correctAnswer);
  }

  function goToNextQuestion() {
    setAnswer("");
    setFactorAAnswer("");
    setFactorBAnswer("");
    setProductAnswer("");
    setRowsAnswer("");
    setColumnsAnswer("");
    setQuotientAnswer("");
    setSelectedChoice("");
    setMistakeJudgment("");
    setMistakeReason("");
    setShowHint(practiceMode === "guided");
    setFeedback(null);

    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex((current) => current + 1);
    }
  }

  function renderHintVisual() {
    if (currentProblem?.visualType === "mistake_check") {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
            Detective clue
          </p>

          <p className="mt-2 text-xl font-black text-[#073B5A]">Check the factor after ×.</p>

          <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
            If the equation says ×0, each group has 0. If it says ×1, each group has 1.
          </p>
        </div>
      );
    }

    if (currentProblem?.visualType === "factor_product") {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <p className="text-2xl font-black text-[#073B5A]">
            {visualData?.equation ?? "3 × 4 = 12"}
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-3 py-1 text-[#0081A7]">
              Factors are the numbers being multiplied
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-[#F07167]">
              Product is the answer
            </span>
          </div>
        </div>
      );
    }

    if (currentProblem?.visualType === "array_rows_columns") {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <div className="mx-auto grid w-fit grid-cols-4 gap-1.5 rounded-xl bg-white p-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <span key={index} className="h-3 w-3 rounded-full bg-[#F07167]" />
            ))}
          </div>

          <p className="mt-2 text-xs font-black text-[#073B5A]/70">3 rows × 4 columns</p>
        </div>
      );
    }

    if (currentProblem?.visualType === "multiple_choice") {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <p className="text-xl font-black text-[#073B5A]">3 × 4</p>
          <p className="text-sm font-black text-[#0081A7]">flips to</p>
          <p className="text-xl font-black text-[#073B5A]">4 × 3</p>
        </div>
      );
    }

    if (currentProblem?.visualType === "fair_sharing") {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((group) => (
              <div
                key={group}
                className="rounded-xl border border-dashed border-[#00AFB9] bg-white p-2"
              >
                <p className="text-xs font-black text-[#0081A7]">Group</p>
                <p className="text-lg">🍎🍎🍎🍎</p>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((group) => (
            <div
              key={group}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-[#00AFB9] bg-white"
            >
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((dot) => (
                  <span key={dot} className="h-2 w-2 rounded-full bg-[#00AFB9]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderProblemVisual() {
    if (!currentProblem || !visualData) return null;

    if (currentProblem.visualType === "factor_product") {
      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-5 py-5 text-center">
          <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
          <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Factor + Product Hunt
          </p>

          <p className="mt-3 text-[2.85rem] font-black leading-none tracking-wide text-[#073B5A]">
            {visualData.equation}
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-[#073B5A]/70">
            Find the two factors being multiplied and the product they make.
          </p>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    if (currentProblem.visualType === "equal_groups") {
      const groups = visualData.groups ?? 0;
      const itemsPerGroup = visualData.itemsPerGroup ?? 0;
      const totalItems = groups * itemsPerGroup;
      const shouldUseCompactGroups = groups > 5 || itemsPerGroup > 4 || totalItems > 12;

      if (shouldUseCompactGroups) {
        const shouldUseDenseGroupView = itemsPerGroup > 6 || groups > 6 || totalItems > 24;

        const starSizeClass = totalItems > 24 ? "text-[1.1rem]" : "text-[1.18rem]";

        const groupCardClass =
          groups > 5 ? "h-14 min-w-20 px-3 py-2" : "h-[4.25rem] min-w-24 px-4 py-2";

        return (
          <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-1">
            <span className="absolute left-8 top-10 text-xl text-[#00AFB9]/65">✦</span>
            <span className="absolute left-16 top-20 text-lg text-[#F7B733]">✦</span>
            <span className="absolute right-14 top-14 text-lg text-[#F7B733]">✦</span>
            <span className="absolute right-24 top-28 text-sm text-[#00AFB9]/65">✦</span>

            <div className="mb-3 flex flex-wrap justify-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
              <span className="rounded-full bg-[#E9F7F8] px-3 py-1.5 text-[#0081A7] shadow-sm">
                {groups} groups
              </span>

              <span className="rounded-full bg-[#FFF3D9] px-3 py-1.5 text-[#C78300] shadow-sm">
                {itemsPerGroup} in each
              </span>
            </div>

            <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-3">
              {Array.from({ length: groups }).map((_, groupIndex) => (
                <div
                  key={groupIndex}
                  className={`flex items-center justify-center rounded-2xl border border-[#00AFB9]/35 bg-[#E9F7F8] shadow-sm ${groupCardClass}`}
                >
                  {shouldUseDenseGroupView ? (
                    <div className="grid grid-cols-4 gap-0.5 text-[0.82rem] leading-none">
                      {Array.from({ length: itemsPerGroup }).map((_, starIndex) => (
                        <span key={starIndex}>⭐</span>
                      ))}
                    </div>
                  ) : (
                    <div className={`grid grid-cols-3 gap-1 leading-none ${starSizeClass}`}>
                      {Array.from({ length: itemsPerGroup }).map((_, starIndex) => (
                        <span key={starIndex}>⭐</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
          </div>
        );
      }

      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-4 pb-4 pt-1">
          <span className="absolute left-8 top-10 text-xl text-[#00AFB9]/65">✦</span>
          <span className="absolute left-16 top-20 text-lg text-[#F7B733]">✦</span>
          <span className="absolute right-14 top-14 text-lg text-[#F7B733]">✦</span>
          <span className="absolute right-24 top-28 text-sm text-[#00AFB9]/65">✦</span>

          <div className="mb-3 flex flex-wrap justify-center gap-2 text-xs font-black uppercase tracking-[0.12em]">
            <span className="rounded-full bg-[#E9F7F8] px-3 py-1.5 text-[#0081A7] shadow-sm">
              {groups} groups
            </span>

            <span className="rounded-full bg-[#FFF3D9] px-3 py-1.5 text-[#C78300] shadow-sm">
              {itemsPerGroup} in each
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: groups }).map((_, groupIndex) => (
              <div
                key={groupIndex}
                className="flex min-h-16 min-w-28 items-center justify-center rounded-2xl border border-[#00AFB9]/35 bg-[#E9F7F8] px-5 py-2.5 shadow-sm"
              >
                <div
                  className={`grid gap-1.5 leading-none ${
                    itemsPerGroup === 3 ? "grid-cols-3 text-[1.65rem]" : "grid-cols-2 text-[1.8rem]"
                  }`}
                >
                  {Array.from({ length: itemsPerGroup }).map((_, starIndex) => (
                    <span key={starIndex}>⭐</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    if (currentProblem.visualType === "repeated_addition") {
      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-5 py-5 text-center">
          <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
          <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Spot the groups
          </p>

          <p className="mt-3 text-[2.65rem] font-black leading-none tracking-wide text-[#073B5A]">
            {visualData.repeatedAddition}
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-[#073B5A]/70">
            Write this repeated addition as a multiplication sentence.
          </p>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    if (currentProblem.visualType === "array_rows_columns") {
      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-5 py-5 text-center">
          <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
          <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Array Builder
          </p>

          <div
            className="mx-auto mt-3 grid w-fit gap-2 rounded-3xl border border-[#00AFB9]/20 bg-[#E9F7F8] p-4 shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${visualData.columns ?? 1}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({
              length: (visualData.rows ?? 0) * (visualData.columns ?? 0),
            }).map((_, index) => (
              <span key={index} className="h-7 w-7 rounded-full bg-[#F07167] shadow-sm" />
            ))}
          </div>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-[#073B5A]/70">
            Count the rows and columns, then find the product.
          </p>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    if (currentProblem.visualType === "multiple_choice") {
      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-5 py-5 text-center">
          <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
          <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Find the match
          </p>

          <p className="mt-3 text-[2.85rem] font-black leading-none tracking-wide text-[#073B5A]">
            {visualData.equation}
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-[#073B5A]/70">
            Choose the equation or idea that matches.
          </p>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    if (currentProblem.visualType === "fair_sharing") {
      return (
        <div className="relative mt-3 overflow-hidden rounded-3xl bg-white px-5 py-5 text-center">
          <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
          <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Fair Sharing
          </p>

          <p className="mt-2 text-[2.35rem] font-black leading-none tracking-wide text-[#073B5A]">
            {visualData.equation}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {Array.from({ length: visualData.groupsToShare ?? 0 }).map((_, groupIndex) => (
              <div
                key={groupIndex}
                className="rounded-2xl border border-[#00AFB9]/35 bg-[#E9F7F8] px-4 py-3 shadow-sm"
              >
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#0081A7]">
                  Group {groupIndex + 1}
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-xl">
                  {Array.from({
                    length: visualData.itemsPerGroup ?? 0,
                  }).map((_, itemIndex) => (
                    <span key={itemIndex}>🍎</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-3 max-w-xl text-sm font-bold text-[#073B5A]/70">
            Share {visualData.items} items equally into {visualData.groupsToShare} groups.
          </p>

          <div className="mx-auto mt-4 max-w-4xl border-t border-dashed border-[#9AB5C7]/55" />
        </div>
      );
    }

    return null;
  }
  return (
    <PageLayout>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00AFB9]">
              {modeConfig.eyebrow}
            </p>

            <span className="hidden h-4 w-px bg-[#073B5A]/15 sm:block" />

            <p className="text-sm font-black text-[#073B5A]/60">
              Unit {unit.unit_number} · Week {week.week_number} · Day {weekDayNumber}
            </p>
          </div>

          <h1 className="mt-0.5 text-[1.35rem] font-black leading-tight tracking-[-0.02em] text-[#073B5A]">
            {modeConfig.title}
          </h1>

          <p className="mt-0.5 max-w-2xl text-sm font-bold leading-snug text-[#073B5A]/70">
            {modeConfig.description}
          </p>
        </div>

        <div className="hidden rounded-xl border border-[#073B5A]/10 bg-white px-3 py-1.5 shadow-sm md:flex md:items-center md:gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FED9B7] text-lg">
            👧
          </div>

          <div>
            <p className="text-xs font-black text-[#073B5A]">Ava Johnson</p>
            <p className="text-[0.7rem] font-bold text-[#073B5A]/60">3rd Grade</p>
          </div>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {currentProblem ? (
          <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="rounded-full border border-[#00AFB9]/20 bg-[#E9F7F8] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Question {currentProblemIndex + 1} of {problems.length}
              </p>

              <p className="rounded-full bg-[#E9F7F8] px-3 py-1 text-xs font-bold text-[#0081A7]">
                {formatPracticeType(currentProblem.visualType)}
              </p>
            </div>

            <div
              className={`${
                practiceMode === "independent" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
              }`}
            >
              <h2 className="text-[1.12rem] font-black leading-tight tracking-[-0.01em] text-[#073B5A]">
                {currentProblem.visualType === "mistake_check"
                  ? "Find the mistake"
                  : currentProblem.questionText}
              </h2>
            </div>

            {renderProblemVisual()}

            {currentProblem.visualType === "factor_product" ? (
              <div className="mx-auto mt-4 grid max-w-3xl gap-3 md:grid-cols-3">
                {getFactorProductSlotOrder(currentProblemIndex).map((slot) => {
                  const isProduct = slot === "product";

                  const value =
                    slot === "factorA"
                      ? factorAAnswer
                      : slot === "factorB"
                        ? factorBAnswer
                        : productAnswer;

                  const setValue =
                    slot === "factorA"
                      ? setFactorAAnswer
                      : slot === "factorB"
                        ? setFactorBAnswer
                        : setProductAnswer;

                  return (
                    <label key={slot} className="block">
                      <span
                        className={`mb-1.5 block text-center text-xs font-black uppercase tracking-wide ${
                          isProduct ? "text-[#F07167]" : "text-[#0081A7]"
                        }`}
                      >
                        {isProduct ? "Product" : "Factor"}
                      </span>

                      <input
                        value={value}
                        onChange={(event) => {
                          setValue(event.target.value);
                          setFeedback(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") checkAnswer();
                        }}
                        className="w-full rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                        placeholder="Enter a number"
                      />
                    </label>
                  );
                })}

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="mx-auto rounded-2xl bg-[#00AFB9] px-8 py-3 lg:px-10 lg:py-4 font-black text-white shadow-sm transition hover:bg-[#0081A7] md:col-span-3"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === "array_rows_columns" ? (
              <div className="mx-auto mt-4 grid max-w-3xl gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#0081A7]">
                    Rows
                  </span>

                  <input
                    value={rowsAnswer}
                    onChange={(event) => {
                      setRowsAnswer(event.target.value);
                      setFeedback(null);
                    }}
                    className="w-full rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#0081A7]">
                    Columns
                  </span>

                  <input
                    value={columnsAnswer}
                    onChange={(event) => {
                      setColumnsAnswer(event.target.value);
                      setFeedback(null);
                    }}
                    className="w-full rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#F07167]">
                    Product
                  </span>

                  <input
                    value={productAnswer}
                    onChange={(event) => {
                      setProductAnswer(event.target.value);
                      setFeedback(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") checkAnswer();
                    }}
                    className="w-full rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                    placeholder="?"
                  />
                </label>

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="mx-auto rounded-2xl bg-[#00AFB9] px-8 py-3 lg:px-10 lg:py-4 font-black text-white shadow-sm transition hover:bg-[#0081A7] md:col-span-3"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === "mistake_check" ? (
              <div className="mx-auto mt-4 max-w-4xl">
                <div className="relative overflow-hidden rounded-3xl border border-[#F07167]/20 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.95),transparent_30%),linear-gradient(90deg,#FFF8E9,#FCE9E5)] px-5 py-4 text-center shadow-sm">
                  <span className="absolute left-8 top-8 text-lg text-[#00AFB9]/65">✦</span>
                  <span className="absolute right-10 top-10 text-xl text-[#F7B733]">✦</span>

                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F07167]">
                    Detective Challenge
                  </p>

                  <p className="mt-2 text-[2.65rem] font-black leading-none tracking-wide text-[#073B5A]">
                    {currentProblem.challengeData?.equationToCheck}
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#073B5A]/70">
                    Decide if the equation is correct. Then choose the reason.
                  </p>
                </div>

                <div className="mt-3 rounded-[1.35rem] border border-[#073B5A]/10 bg-white p-3.5 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                    Is this correct?
                  </p>

                  <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                    {currentProblem.challengeData?.judgmentChoices.map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => {
                          setMistakeJudgment(choice);
                          setMistakeReason("");
                          setFeedback(null);
                        }}
                        className={`rounded-2xl border px-5 py-3 lg:px-6 lg:py-4 text-lg lg:text-xl font-black shadow-sm transition hover:shadow-md ${
                          mistakeJudgment === choice
                            ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7] ring-2 ring-[#00AFB9]/20"
                            : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#F8FBFB]"
                        }`}
                      >
                        {choice === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>

                {mistakeJudgment && (
                  <div className="mt-2.5 rounded-[1.35rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-3.5 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C78300]">
                      Why?
                    </p>

                    <div className="mt-2.5 grid gap-2">
                      {currentProblem.challengeData?.reasonChoices.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => {
                            setMistakeReason(reason);
                            setFeedback(null);
                          }}
                          className={`rounded-2xl border px-4 py-2.5 text-left text-sm lg:px-5 lg:py-3.5 lg:text-base font-black shadow-sm transition hover:shadow-md ${
                            mistakeReason === reason
                              ? "border-[#00AFB9] bg-white text-[#0081A7] ring-2 ring-[#00AFB9]/20"
                              : "border-[#073B5A]/10 bg-white/80 text-[#073B5A] hover:bg-white"
                          }`}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!mistakeJudgment || !mistakeReason}
                  className={`mt-2.5 w-full rounded-xl px-6 py-2.5 font-black shadow-sm ${
                    mistakeJudgment && mistakeReason
                      ? "bg-[#00AFB9] text-white"
                      : "bg-[#DDEEEF] text-[#073B5A]/55"
                  }`}
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === "multiple_choice" ? (
              <div className="mx-auto mt-4 grid max-w-3xl gap-3">
                {visualData?.choices?.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      setSelectedChoice(choice);
                      setFeedback(null);
                    }}
                    className={`rounded-2xl border px-5 py-3 text-left text-lg lg:px-6 lg:py-4 font-black shadow-sm transition hover:shadow-md ${
                      selectedChoice === choice
                        ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]"
                        : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/40 hover:bg-[#F5FBFC]"
                    }`}
                  >
                    {choice}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!selectedChoice}
                  className={`mt-1 rounded-xl px-6 py-3 lg:px-8 lg:py-4 font-black shadow-sm ${
                    selectedChoice ? "bg-[#00AFB9] text-white" : "bg-[#DDEEEF] text-[#073B5A]/55"
                  }`}
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === "fair_sharing" ? (
              <div className="mx-auto mt-5 flex max-w-xl gap-3">
                <input
                  value={quotientAnswer}
                  onChange={(event) => {
                    setQuotientAnswer(event.target.value);
                    setFeedback(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") checkAnswer();
                  }}
                  className="min-w-0 flex-1 rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                  placeholder="How many in each group?"
                />

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-2xl bg-[#00AFB9] px-6 py-3 lg:px-8 lg:py-4 font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : isEqualGroupsChoiceMode ? (
              <div
                className={`mx-auto max-w-4xl ${practiceMode === "independent" ? "-mt-1" : "mt-4"}`}
              >
                <div className="text-center">
                  <p className="text-sm font-black text-[#00AFB9]">
                    {practiceMode === "guided" ? "Complete the sentence:" : "Solve it:"}
                  </p>

                  <p className="mt-1.5 text-[2.8rem] font-black leading-none tracking-wide text-[#073B5A]">
                    {visualData?.groups} × {visualData?.itemsPerGroup} ={" "}
                    <span className="inline-flex h-16 min-w-16 translate-y-1 items-center justify-center rounded-2xl border-2 border-dashed border-[#00AFB9]/45 bg-white px-4 text-[#9AB5C7]">
                      ?
                    </span>
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#073B5A]/70">
                    {practiceMode === "guided"
                      ? `Use the picture: ${visualData?.groups} groups with ${visualData?.itemsPerGroup} in each group.`
                      : "Choose the correct answer."}
                  </p>
                </div>

                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {answerChoices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => {
                        setSelectedChoice(choice);
                        setFeedback(null);
                      }}
                      className={`rounded-2xl border px-5 py-3 text-2xl lg:px-6 lg:py-4 font-black shadow-sm transition hover:shadow-md ${
                        selectedChoice === choice
                          ? "border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7] ring-2 ring-[#00AFB9]/20"
                          : "border-[#00AFB9]/55 bg-white text-[#073B5A] hover:bg-[#F8FBFB]"
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!selectedChoice}
                  className={`mx-auto mt-3 block rounded-xl px-10 py-2.5 lg:px-12 lg:py-3.5 font-black shadow-sm ${
                    selectedChoice ? "bg-[#00AFB9] text-white" : "bg-[#DDEEEF] text-[#073B5A]/55"
                  }`}
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : (
              <div className="mx-auto mt-4 max-w-3xl rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-4 text-center shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
                  Your answer
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={answer}
                    onChange={(event) => {
                      setAnswer(event.target.value);
                      setFeedback(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") checkAnswer();
                    }}
                    className="min-w-0 flex-1 rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 text-center text-lg font-black text-[#073B5A] outline-none shadow-sm focus:border-[#00AFB9] focus:ring-2 focus:ring-[#00AFB9]/15"
                    placeholder={
                      currentProblem.visualType === "repeated_addition"
                        ? "Example: 3 × 5 = 15"
                        : "Type your answer"
                    }
                  />

                  <button
                    type="button"
                    onClick={checkAnswer}
                    disabled={!answer.trim()}
                    className={`rounded-2xl px-6 py-3 lg:px-8 lg:py-4 font-black shadow-sm ${
                      answer.trim() ? "bg-[#00AFB9] text-white" : "bg-[#DDEEEF] text-[#073B5A]/55"
                    }`}
                  >
                    ✓ Check Answer
                  </button>
                </div>
              </div>
            )}

            {feedback === null && (
              <div className="mx-auto mt-4 flex max-w-4xl items-center gap-4 rounded-3xl border border-[#00AFB9]/25 bg-[#E9F7F8] px-5 py-3 shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#BDEFF2] text-3xl shadow-sm">
                  {practiceMode === "challenge" ? "🕵️" : practiceMode === "guided" ? "🎒" : "🌟"}
                </div>

                <div>
                  <p className="text-base font-black text-[#073B5A]">
                    {practiceMode === "challenge"
                      ? "Pattern detective mode!"
                      : practiceMode === "guided"
                        ? "Step-by-step power!"
                        : "You’ve got this!"}
                  </p>

                  <p className="text-sm font-bold text-[#073B5A]/70">
                    {practiceMode === "challenge"
                      ? "Every solved mistake powers up your Epic Reward!"
                      : practiceMode === "guided"
                        ? "Every correct answer powers up your Common Reward!"
                        : "Every correct answer powers up your Rare Reward!"}
                  </p>
                </div>
              </div>
            )}

            {feedback === "correct" && (
              <div className="mx-auto mt-2.5 max-w-2xl rounded-2xl border border-[#00AFB9]/30 bg-[#E9F7F8] p-2.5 text-center">
                <p className="font-black text-[#073B5A]">
                  {practiceMode === "independent"
                    ? "Nice solo solve! Rare reward charge +1 ⚡"
                    : practiceMode === "challenge"
                      ? "Great detective work! Epic reward charge +1 👑"
                      : "Nice guided solve! Common reward charge +1 🎒"}
                </p>
              </div>
            )}

            {feedback === "incorrect" && (
              <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-[#F07167]/25 bg-[#FCE9E5] p-3 text-center">
                <p className="font-black text-[#073B5A]">
                  {currentProblem.visualType === "mistake_check"
                    ? "Not quite. The answer and the reason both need to match."
                    : "Not quite. Try again."}
                </p>

                <p className="mt-1 text-sm font-semibold text-[#073B5A]/70">
                  {currentProblem.visualType === "mistake_check"
                    ? currentProblem.challengeData?.feedback
                    : getHintText(currentProblem.visualType)}
                </p>
              </div>
            )}

            <div className="mt-2.5 grid items-center gap-3 border-t border-[#073B5A]/10 pt-2.5 md:grid-cols-[auto_1fr_auto]">
              <Link
                to={lessonPath}
                className="rounded-xl border border-[#00AFB9]/40 bg-white px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base font-black text-[#0081A7]"
              >
                ← Back to Lesson
              </Link>

              <div className="flex flex-wrap justify-center gap-2">
                {problems.map((problem, index) => (
                  <div
                    key={problem.id}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[0.68rem] lg:h-9 lg:w-9 lg:text-xs font-black ${
                      index === currentProblemIndex
                        ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                        : index < currentProblemIndex
                          ? "border-[#00AFB9]/30 bg-[#E9F7F8] text-[#0081A7]"
                          : "border-[#073B5A]/15 bg-white text-[#073B5A]/45"
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={goToNextQuestion}
                disabled={feedback !== "correct" || currentProblemIndex >= problems.length - 1}
                className={`rounded-xl px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base font-black shadow-sm ${
                  feedback === "correct" && currentProblemIndex < problems.length - 1
                    ? "bg-[#00AFB9] text-white"
                    : "bg-[#DDEEEF] text-[#073B5A]/55"
                }`}
              >
                Next Question →
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-5">
            <p className="font-black text-[#073B5A]">
              No practice generator exists for this practice type yet.
            </p>

            <p className="mt-2 font-semibold text-[#073B5A]/70">
              Practice type: {lesson.practice_type}
            </p>
          </div>
        )}

        <aside className="space-y-3">
          <div className="overflow-hidden rounded-[1.5rem] border border-[#F4D589] bg-[radial-gradient(circle_at_80%_35%,rgba(255,255,255,0.95),transparent_32%),linear-gradient(90deg,#FFF3D9,#FFF8E9)] p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C78300]">
              {practiceMode === "challenge"
                ? "👑 Epic Reward"
                : practiceMode === "guided"
                  ? "🎒 Common Reward"
                  : "✨ Rare Reward"}
            </p>

            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                {practiceMode === "challenge" ? "👑" : practiceMode === "guided" ? "🎒" : "🎁"}
              </div>

              <p className="text-sm font-black leading-relaxed text-[#073B5A]">
                {practiceMode === "challenge"
                  ? "Finish Challenge Practice to unlock an epic accessory!"
                  : practiceMode === "guided"
                    ? "Finish Guided Practice to unlock a common accessory!"
                    : "Finish Independent Practice to unlock a rare accessory!"}
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              {getRewardChargeLabel(practiceMode)}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#073B5A]/10">
                <div
                  className="h-full rounded-full bg-[#00AFB9]"
                  style={{ width: `${rewardChargePercent}%` }}
                />
              </div>

              <p className="text-xs font-black text-[#073B5A]/70">
                {solvedProblemCount}/{problems.length} solved
              </p>
            </div>
          </div>

          {practiceMode !== "guided" && (
            <div className="rounded-[1.5rem] border border-[#FED9B7] bg-[#FFF4E3] p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F07167]">
                🔥 Streak
              </p>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-4xl font-black text-[#F07167]">{currentStreak}</p>

                  <p className="text-sm font-black text-[#073B5A]">in a row</p>

                  <p className="mt-1 text-xs font-bold text-[#073B5A]/65">Keep it going!</p>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                  🏅
                </div>
              </div>
            </div>
          )}
        </aside>

        <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FFFDF7] p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            {modeConfig.hintTitle}
          </p>

          {showHint ? (
            <>
              {renderHintVisual()}

              <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-bold leading-relaxed text-[#073B5A]/80">
                {getHintText(currentProblem?.visualType)}
              </p>
            </>
          ) : (
            <p className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-sm font-bold leading-relaxed text-[#073B5A]/60">
              Use a hint if you get stuck.
            </p>
          )}

          <button
            type="button"
            onClick={() => setShowHint((current) => !current)}
            className="mt-3 w-full rounded-xl border border-[#00AFB9]/40 bg-white px-4 py-2.5 text-sm lg:px-6 lg:py-3.5 lg:text-base font-black text-[#0081A7]"
          >
            {showHint ? "Hide Hint" : "💡 Show Hint"}
          </button>
        </div>

        <div className="rounded-[1.5rem] border border-[#F4D589] bg-[#FEF3D9] p-4 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Today&apos;s Goals
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
              🎯
            </div>

            <div className="space-y-2 text-sm font-bold text-[#073B5A]/80">
              <p>◎ Finish {problems.length} questions</p>
              <p>◎ Score 80% or higher</p>
              <p>
                ◎ Earn {practiceMode === "challenge" ? "an" : "a"}{" "}
                {getModeRewardLabel(practiceMode)}
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-[#F4D589] pt-3">
            <p className="font-black text-[#073B5A]">
              {practiceMode === "independent" ? "You're on your way! ⭐" : "You've got this! ⭐"}
            </p>
          </div>
        </div>
      </section>

      {completionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#073B5A]/45 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 text-center shadow-2xl">
            <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_30%_20%,rgba(253,252,220,0.95),transparent_34%),radial-gradient(circle_at_75%_30%,rgba(0,175,185,0.20),transparent_36%)]" />

            <div className="relative z-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#FFF3D9] text-5xl shadow-sm">
                {modeConfig.rewardIcon}
              </div>

              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-[#00AFB9]">
                Practice Complete
              </p>

              <h2 className="mt-2 text-3xl font-black text-[#073B5A]">
                {completionModal.firstCompletion ? "You did it!" : "Nice work!"}
              </h2>

              {completionModal.firstCompletion ? (
                <p className="mx-auto mt-3 max-w-md text-base font-bold leading-relaxed text-[#073B5A]/75">
                  You completed {modeConfig.title} and earned a{" "}
                  <span className="font-black text-[#0081A7]">
                    {getModeRewardLabel(practiceMode)}
                  </span>{" "}
                  for your star.
                </p>
              ) : completionModal.recommendedMode ? (
                <p className="mx-auto mt-3 max-w-md text-base font-bold leading-relaxed text-[#073B5A]/75">
                  You already earned this reward. Try{" "}
                  <span className="font-black text-[#0081A7]">
                    {getModeLabel(completionModal.recommendedMode)}
                  </span>{" "}
                  to unlock more accessories.
                </p>
              ) : (
                <p className="mx-auto mt-3 max-w-md text-base font-bold leading-relaxed text-[#073B5A]/75">
                  You completed this practice again. Great review!
                </p>
              )}

              {completionModal.recommendedMode && (
                <div className="mx-auto mt-5 rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] p-4">
                  <p className="text-sm font-black text-[#073B5A]">Want something rarer?</p>

                  <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
                    {getModeLabel(completionModal.recommendedMode)} can unlock a{" "}
                    {getModeRewardLabel(completionModal.recommendedMode)}.
                  </p>
                </div>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {completionModal.recommendedMode ? (
                  <Link
                    to={getModePath(currentLessonId, completionModal.recommendedMode)}
                    onClick={() => setCompletionModal(null)}
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 lg:px-7 lg:py-4 lg:text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Try {getModeLabel(completionModal.recommendedMode)} ›
                  </Link>
                ) : (
                  <Link
                    to={nextLessonPath}
                    onClick={() => setCompletionModal(null)}
                    className="rounded-2xl bg-[#00AFB9] px-5 py-3 lg:px-7 lg:py-4 lg:text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
                  >
                    Next Lesson ›
                  </Link>
                )}

                <Link
                  to={lessonPath}
                  onClick={() => setCompletionModal(null)}
                  className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 lg:px-7 lg:py-4 lg:text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
                >
                  Back to Lesson
                </Link>
              </div>

              {completionModal.recommendedMode && (
                <Link
                  to={nextLessonPath}
                  onClick={() => setCompletionModal(null)}
                  className="mt-3 inline-flex text-sm lg:text-base font-black text-[#0081A7]"
                >
                  Continue to next lesson instead ›
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {rejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#073B5A]/45 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 text-center shadow-2xl">
            <h2 className="text-2xl font-black text-[#073B5A]">
              {rejectionModal.reason === "guided_required" && "Complete Guided Practice First"}
              {rejectionModal.reason === "independent_required" &&
                "Complete Independent Practice First"}
              {rejectionModal.reason === "insufficient_accuracy" && "Keep Practicing!"}
              {rejectionModal.reason === "invalid_session_result" && "Oops, something went wrong"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base font-bold leading-relaxed text-[#073B5A]/75">
              {rejectionModal.reason === "guided_required" &&
                "Start with Guided Practice to build confidence before trying this activity."}
              {rejectionModal.reason === "independent_required" &&
                "Show what you can do on your own before taking on the Challenge."}
              {rejectionModal.reason === "insufficient_accuracy" &&
                (practiceMode === "challenge"
                  ? `You solved every problem, but Challenge Practice needs at least 80% correct on the first try. You got ${Math.round((rejectionModal.accuracy ?? 0) * 100)}% correct on the first try. Give it another shot!`
                  : `You answered ${rejectionModal.firstAttemptCorrectCount ?? 0} out of ${rejectionModal.firstAttemptTotalCount ?? 0} correctly on your first try. Independent Practice needs 80% correct on the first try to earn the reward and record mastery evidence. Keep practicing — you still solved the problems!`)}
              `
              {rejectionModal.reason === "invalid_session_result" &&
                "We could not save this practice result. Let's go back to the lesson and try again."}
            </p>
            <div className="mt-6 grid gap-3">
              {(rejectionModal.reason === "guided_required" ||
                rejectionModal.reason === "independent_required") && (
                <Link
                  to={
                    rejectionModal.reason === "guided_required"
                      ? getModePath(currentLessonId, "guided")
                      : getModePath(currentLessonId, "independent")
                  }
                  onClick={() => setRejectionModal(null)}
                  className="rounded-2xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm transition hover:bg-[#0081A7] lg:px-7 lg:py-4 lg:text-base"
                >
                  {rejectionModal.reason === "guided_required"
                    ? "Start Guided Practice ›"
                    : "Start Independent Practice ›"}
                </Link>
              )}
              <Link
                to={lessonPath}
                onClick={() => setRejectionModal(null)}
                className="rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB] lg:px-7 lg:py-4 lg:text-base"
              >
                Back to Lesson
              </Link>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default PracticeScreen;
