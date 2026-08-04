import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { StudentProgressProvider } from "../contexts/StudentProgressContext";
import TryItScreen from "./TryItScreen";

function renderWithDeps(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <StudentProgressProvider studentId="tryit-test">
        <Routes>
          <Route path="/try-it/:lessonId" element={<TryItScreen />} />
        </Routes>
      </StudentProgressProvider>
    </MemoryRouter>,
  );
}

describe("TryItScreen", () => {
  it("renders the authored Try It experience for g3-u1-w1-l1", () => {
    const html = renderWithDeps("/try-it/g3-u1-w1-l1");

    expect(html).toContain('data-name="try-it-screen"');
    expect(html).toContain('data-name="response-controls"');
    expect(html).toContain("Check Answer");

    // Authored Unit 1 first Try It problem uses a flower-pot story.
    expect(html).toContain("There are 5 flower pots");
    expect(html).toContain("Each pot has 1 sprout");

    // All three answer parts should be available.
    expect(html).toContain(">5<");
    expect(html).toContain(">1<");
    expect(html).toContain(">5 × 1 = 5<");
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
