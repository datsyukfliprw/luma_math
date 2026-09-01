import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";
import { useStudentProgress, StudentProgressProvider } from "./StudentProgressContext";
import type { EvaluationCompletionResult } from "../types/evaluationProgress";

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null;
    },
    removeItem(key: string) {
      values.delete(key);
    },
    setItem(key: string, value: string) {
      values.set(key, String(value));
    },
  };
}

function TestComponent() {
  const value = useStudentProgress();
  return (
    <div>
      <span data-name="has-mark-try-it">{typeof value.markTryItComplete}</span>
      <span data-name="has-mark-evaluation">{typeof value.markEvaluationComplete}</span>
    </div>
  );
}

function RapidLessonCompletionTestComponent() {
  const { updateLessonProgress, markTryItComplete } = useStudentProgress();
  const [result] = useState(() => {
    updateLessonProgress("g3-u1-w1-l1", {
      warmupComplete: true,
      learnComplete: true,
      practiceComplete: true,
    });

    return markTryItComplete("g3-u1-w1-l1");
  });

  return <span data-name="rapid-lesson-result">{result.ok ? "complete" : result.reason}</span>;
}

function RapidDuplicateTestComponent() {
  const { markEvaluationComplete } = useStudentProgress();
  const [first] = useState<EvaluationCompletionResult>(() =>
    markEvaluationComplete("g3-u1-w1-eval", {
      firstAttemptCorrectCount: 8,
      firstAttemptTotalCount: 8,
    }),
  );
  const [second] = useState<EvaluationCompletionResult>(() =>
    markEvaluationComplete("g3-u1-w1-eval", {
      firstAttemptCorrectCount: 0,
      firstAttemptTotalCount: 0,
    }),
  );

  return (
    <div>
      <span data-name="first-ok">{first.ok ? "true" : "false"}</span>
      <span data-name="second-reason">{second.ok ? "ok" : second.reason}</span>
    </div>
  );
}

describe("StudentProgressContext", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("exposes markTryItComplete and markEvaluationComplete on the provider value", () => {
    const html = renderToStaticMarkup(
      <StudentProgressProvider studentId="context-test">
        <TestComponent />
      </StudentProgressProvider>,
    );

    expect(html).toContain('data-name="has-mark-try-it">function');
    expect(html).toContain('data-name="has-mark-evaluation">function');
  });

  it("commits one evaluation completion and returns already_completed on rapid duplicate", () => {
    const html = renderToStaticMarkup(
      <StudentProgressProvider studentId="rapid-duplicate-test">
        <RapidDuplicateTestComponent />
      </StudentProgressProvider>,
    );

    expect(html).toContain('data-name="first-ok">true');
    expect(html).toContain('data-name="second-reason">already_completed');
  });

  it("persists rapid lesson-step completion synchronously for the active student", () => {
    const localStorage = createMemoryStorage();
    vi.stubGlobal("window", { localStorage });

    const html = renderToStaticMarkup(
      <StudentProgressProvider studentId="persistence-test">
        <RapidLessonCompletionTestComponent />
      </StudentProgressProvider>,
    );

    expect(html).toContain('data-name="rapid-lesson-result">complete');

    const stored = JSON.parse(localStorage.getItem("lumamath_lesson_progress") ?? "{}");
    expect(stored["persistence-test"]["g3-u1-w1-l1"]).toMatchObject({
      warmupComplete: true,
      learnComplete: true,
      tryItComplete: true,
      practiceComplete: true,
      lessonComplete: true,
    });
  });
});
