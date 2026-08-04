import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";
import { useStudentProgress, StudentProgressProvider } from "./StudentProgressContext";
import type { EvaluationCompletionResult } from "../types/evaluationProgress";

function TestComponent() {
  const value = useStudentProgress();
  return (
    <div>
      <span data-name="has-mark-try-it">{typeof value.markTryItComplete}</span>
      <span data-name="has-mark-evaluation">{typeof value.markEvaluationComplete}</span>
    </div>
  );
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
});
