import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { useStudentProgress, StudentProgressProvider } from "./StudentProgressContext";

function TestComponent() {
  const value = useStudentProgress();
  return (
    <div>
      <span data-name="has-mark-try-it">{typeof value.markTryItComplete}</span>
    </div>
  );
}

describe("StudentProgressContext", () => {
  it("exposes markTryItComplete on the provider value", () => {
    const html = renderToStaticMarkup(
      <StudentProgressProvider studentId="context-test">
        <TestComponent />
      </StudentProgressProvider>,
    );

    expect(html).toContain('data-name="has-mark-try-it">function');
  });
});
