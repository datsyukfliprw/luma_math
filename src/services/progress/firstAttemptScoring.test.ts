import { describe, expect, it } from "vitest";
import {
  buildFirstAttemptMetrics,
  recordFirstAttemptResult,
} from "./firstAttemptScoring";

describe("firstAttemptScoring", () => {
  it("stores an incorrect first attempt and ignores a later correct retry", () => {
    let results = recordFirstAttemptResult({}, 0, false);
    results = recordFirstAttemptResult(results, 0, true);

    expect(results[0]).toBe(false);
  });

  it("stores a correct first attempt and ignores duplicate submissions", () => {
    let results = recordFirstAttemptResult({}, 1, true);
    results = recordFirstAttemptResult(results, 1, false);

    expect(results[1]).toBe(true);
  });

  it("tracks separate problems independently", () => {
    let results = recordFirstAttemptResult({}, 0, false);
    results = recordFirstAttemptResult(results, 1, true);
    results = recordFirstAttemptResult(results, 2, true);

    expect(results).toEqual({
      0: false,
      1: true,
      2: true,
    });
  });

  it("does not mutate the previous results object", () => {
    const previous = { 0: true };
    const next = recordFirstAttemptResult(previous, 1, false);

    expect(previous).toEqual({ 0: true });
    expect(next).toEqual({ 0: true, 1: false });
    expect(next).not.toBe(previous);
  });

  it("is idempotent when recording an already tracked problem", () => {
    const first = recordFirstAttemptResult({}, 0, false);
    const second = recordFirstAttemptResult(first, 0, false);

    expect(second).toBe(first);
    expect(second[0]).toBe(false);
  });

  it("builds metrics that are not inflated by retries", () => {
    // 10 problems, 7 correct on the first attempt, 3 incorrect first attempts
    // that were later solved correctly.
    let results = recordFirstAttemptResult({}, 0, true);
    results = recordFirstAttemptResult(results, 1, true);
    results = recordFirstAttemptResult(results, 2, true);
    results = recordFirstAttemptResult(results, 3, true);
    results = recordFirstAttemptResult(results, 4, true);
    results = recordFirstAttemptResult(results, 5, true);
    results = recordFirstAttemptResult(results, 6, true);
    results = recordFirstAttemptResult(results, 7, false);
    results = recordFirstAttemptResult(results, 7, true);
    results = recordFirstAttemptResult(results, 8, false);
    results = recordFirstAttemptResult(results, 8, true);
    results = recordFirstAttemptResult(results, 9, false);
    results = recordFirstAttemptResult(results, 9, true);

    const metrics = buildFirstAttemptMetrics(results, 10);

    expect(metrics).toEqual({
      firstAttemptCorrectCount: 7,
      firstAttemptTotalCount: 10,
    });
  });

  it("uses the full session problem count as the denominator, not the number of recorded results", () => {
    const results = { 0: true, 1: true, 2: true, 3: false };

    const metrics = buildFirstAttemptMetrics(results, 10);

    expect(metrics.firstAttemptTotalCount).toBe(10);
    expect(metrics.firstAttemptCorrectCount).toBe(3);
  });

  it("returns a valid empty session with zero correct and the full session count", () => {
    const metrics = buildFirstAttemptMetrics({}, 5);

    expect(metrics).toEqual({
      firstAttemptCorrectCount: 0,
      firstAttemptTotalCount: 5,
    });
  });

  it("starts fresh when initialized with an empty result set", () => {
    const previous = recordFirstAttemptResult({}, 0, true);
    const next = recordFirstAttemptResult({}, 0, false);

    expect(previous).toEqual({ 0: true });
    expect(next).toEqual({ 0: false });
  });
});
