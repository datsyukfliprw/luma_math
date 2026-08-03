import type { PracticeCompletionMetrics } from "../../types/practiceProgress";

// @SECTION FIRST_ATTEMPT_RESULTS
// Session-local first-attempt results keyed by problem index.
// A value of true means the first submitted answer was correct.
// A value of false means the first submitted answer was incorrect.
// Once recorded, the value must not be rewritten by later retries.

export type FirstAttemptResults = Readonly<Record<number, boolean>>;

// Record the first submitted-attempt result for a problem.
// If the problem index has already been recorded, the previous result is
// returned unchanged. The previous object is never mutated.
export function recordFirstAttemptResult(
  current: FirstAttemptResults,
  problemIndex: number,
  isCorrect: boolean,
): FirstAttemptResults {
  if (Object.prototype.hasOwnProperty.call(current, problemIndex)) {
    return current;
  }

  return {
    ...current,
    [problemIndex]: isCorrect,
  };
}

// Build the canonical completion metrics for a completed session.
// The denominator is always the full session problem count, not the number of
// recorded results, so missing entries can never artificially raise the score.
export function buildFirstAttemptMetrics(
  results: FirstAttemptResults,
  sessionProblemCount: number,
): PracticeCompletionMetrics {
  const firstAttemptCorrectCount = Object.values(results).filter(Boolean).length;

  return {
    firstAttemptCorrectCount,
    firstAttemptTotalCount: sessionProblemCount,
  };
}
