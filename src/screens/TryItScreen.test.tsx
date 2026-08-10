import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StudentProgressProvider } from "../contexts/StudentProgressContext";
import TryItScreen from "./TryItScreen";

function renderWithDeps(path: string, locationKey = "default") {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[{ pathname: path, key: locationKey }]}>
      <StudentProgressProvider studentId="tryit-test">
        <Routes>
          <Route path="/try-it/:lessonId" element={<TryItScreen />} />
        </Routes>
      </StudentProgressProvider>
    </MemoryRouter>,
  );
}

describe("TryItScreen", () => {
  it("keeps one Try It attempt stable but varies a fresh route visit", () => {
    const firstAttempt = renderWithDeps("/try-it/g3-u1-w1-l1", "attempt-a");
    const sameAttempt = renderWithDeps("/try-it/g3-u1-w1-l1", "attempt-a");
    const freshAttempt = renderWithDeps("/try-it/g3-u1-w1-l1", "attempt-b");

    expect(sameAttempt).toBe(firstAttempt);
    expect(freshAttempt).not.toBe(firstAttempt);
  });

  it("renders a generated Try It experience for g3-u1-w1-l1", () => {
    const html = renderWithDeps("/try-it/g3-u1-w1-l1");

    expect(html).toContain('data-name="try-it-screen"');
    expect(html).toContain('data-name="response-controls"');
    expect(html).toContain("Check Answer");

    // Generator-first prompts use the templates but produce fresh numbers.
    expect(html).toMatch(/There are \d+ /);
    expect(html).toContain(" in all?");

    // All three answer parts should be available with clear directions.
    expect(html).toContain("Choose one answer in each row, then tap Check Answer.");
    expect(html).toContain("How many groups are there?");
    expect(html).toContain("Count the groups shown in the picture.");
    expect(html).toContain("How many are in each group?");
    expect(html).toContain("Look at how many items are inside one group.");
    expect(html).toContain("Which equation matches?");
    expect(html).toContain("Use your first two answers to choose the matching equation.");

    // Visual caption and rendered groups must be in sync.
    const captionMatch = html.match(/(\d+) groups · (\d+) in each/);
    expect(captionMatch).toBeTruthy();
    const groupCount = Number(captionMatch![1]);
    const inEach = Number(captionMatch![2]);
    const groupMatches = html.match(/data-name="try-it-visual-group"/g) ?? [];
    expect(groupMatches).toHaveLength(groupCount);
    expect(html).toContain(`${groupCount} groups · ${inEach} in each`);
  });

  it("renders a fallback Try It experience for an unauthored lesson", () => {
    const html = renderWithDeps("/try-it/g3-u9-w1-l1");

    expect(html).toContain('data-name="try-it-screen"');
    expect(html).toContain('data-name="response-controls"');
    expect(html).toContain("Check Answer");

    expect(html).not.toContain("Lesson Content Unavailable");
    expect(html).not.toContain("Lesson Not Found");
  });

  it("shows the safe fallback for an unknown lesson ID", () => {
    const html = renderWithDeps("/try-it/g3-u99-w1-l1");

    expect(html).toContain("Lesson Not Found");
    expect(html).not.toContain('data-name="response-controls"');
  });

  it("contains the expected page sections", () => {
    const html = renderWithDeps("/try-it/g3-u1-w1-l1");

    expect(html).toContain('data-name="try-it-screen"');
    expect(html).toContain('data-name="try-it-header"');
    expect(html).toContain('data-name="problem-card"');
    expect(html).toContain('data-name="try-it-visual"');
    expect(html).toContain('data-name="progress-area"');
  });
});
