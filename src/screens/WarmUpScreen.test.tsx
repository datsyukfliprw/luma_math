import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StudentProgressProvider } from "../contexts/StudentProgressContext";
import WarmUpScreen from "./WarmUpScreen";

function renderWithDeps(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <StudentProgressProvider studentId="warmup-test">
        <Routes>
          <Route path="/warmup/:lessonId" element={<WarmUpScreen />} />
        </Routes>
      </StudentProgressProvider>
    </MemoryRouter>,
  );
}

describe("WarmUpScreen", () => {
  it("renders a target-digit warm-up question with the TargetDigitQuestion component", () => {
    const html = renderWithDeps("/warmup/g3-u11-w1-l1");

    expect(html).toContain("What is the value of the bold digit?");
    expect(html).toContain('data-target="true"');
    expect(html).toContain('aria-label="Number 456"');
  });

  it("renders the warm-up header and round information", () => {
    const html = renderWithDeps("/warmup/g3-u11-w1-l1");

    expect(html).toContain("Warm-Up");
    expect(html).toContain("Place Value");
    expect(html).toContain("Question 1 of");
  });

  it("renders tap choices for Grade 3 numeric warm-ups", () => {
    const html = renderWithDeps("/warmup/g3-u1-w1-l1");

    expect(html).toContain('data-name="warm-up-answer-choices"');
    expect(html).toContain(">0<");
    expect(html).toContain(">7<");
    expect(html).not.toContain('placeholder="Type your answer"');
  });

  it("keeps text entry for complex Grade 3 text responses", () => {
    const html = renderWithDeps("/warmup/g3-u2-w1-l2");

    expect(html).toContain('placeholder="Type your answer"');
    expect(html).toContain('autofocus=""');
  });

  it("starts with zero overall progress", () => {
    const html = renderWithDeps("/warmup/g3-u11-w1-l1");

    expect(html).toContain(">0%<");
  });
});
