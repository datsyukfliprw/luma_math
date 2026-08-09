import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ResultsScreen from "./ResultsScreen";
import type { SessionResult } from "../types/sessionResults";

function renderResult(result?: SessionResult) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[{ pathname: "/results", state: result ? { result } : undefined }]}>
      <Routes>
        <Route path="/results" element={<ResultsScreen />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ResultsScreen", () => {
  it("renders a completed practice result with next-step actions", () => {
    const html = renderResult({
      kind: "practice",
      lessonId: "g3-u1-w1-l1",
      lessonTitle: "Zero and Identity Rules",
      mode: "guided",
      correctCount: 6,
      totalCount: 6,
      firstAttemptCorrectCount: 5,
      firstAttemptTotalCount: 6,
      accuracy: 5 / 6,
      recommendedMode: "independent",
      nextLessonPath: "/lesson/g3-u1-w1-l2",
      lessonPath: "/lesson/g3-u1-w1-l1",
    });

    expect(html).toContain('data-name="practice-results-screen"');
    expect(html).toContain("Guided Practice complete");
    expect(html).toContain("Zero and Identity Rules");
    expect(html).toContain("Independent Practice");
  });

  it("renders a passed evaluation result", () => {
    const html = renderResult({
      kind: "evaluation",
      lessonId: "g3-u1-w1-eval",
      lessonTitle: "Unit 1 Evaluation",
      status: "passed",
      firstAttemptCorrectCount: 8,
      firstAttemptTotalCount: 10,
      accuracy: 0.8,
      requiredAccuracy: 0.8,
      nextUnitPath: "/lesson/g3-u2-w1-l1",
      lessonPath: "/lesson/g3-u1-w1-eval",
      retryPath: "/practice/g3-u1-w1-eval",
    });

    expect(html).toContain('data-name="evaluation-results-screen"');
    expect(html).toContain("Evaluation passed");
    expect(html).toContain("80%");
    expect(html).toContain("Continue");
  });

  it("renders a retry result for a failed evaluation", () => {
    const html = renderResult({
      kind: "evaluation",
      lessonId: "g3-u1-w1-eval",
      lessonTitle: "Unit 1 Evaluation",
      status: "retry",
      firstAttemptCorrectCount: 6,
      firstAttemptTotalCount: 10,
      accuracy: 0.6,
      requiredAccuracy: 0.8,
      nextUnitPath: "/lesson/g3-u2-w1-l1",
      lessonPath: "/lesson/g3-u1-w1-eval",
      retryPath: "/practice/g3-u1-w1-eval",
    });

    expect(html).toContain("Almost there");
    expect(html).toContain("Try Again");
  });

  it("has a safe recovery state when route state is missing", () => {
    const html = renderResult();

    expect(html).toContain('data-name="results-screen-missing-state"');
    expect(html).toContain("Results are no longer available");
    expect(html).toContain("Back to Learning Path");
  });
});
