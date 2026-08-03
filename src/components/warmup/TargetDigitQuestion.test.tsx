import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import TargetDigitQuestion from "./TargetDigitQuestion";

describe("TargetDigitQuestion", () => {
  it("renders exactly one highlighted target digit for the first digit", () => {
    const html = renderToStaticMarkup(<TargetDigitQuestion number="456" targetDigitIndex={0} />);
    const matches = html.match(/data-target="true"/g);
    expect(matches).toHaveLength(1);
  });

  it("renders exactly one highlighted target digit for a middle digit", () => {
    const html = renderToStaticMarkup(<TargetDigitQuestion number="3721" targetDigitIndex={1} />);
    const matches = html.match(/data-target="true"/g);
    expect(matches).toHaveLength(1);
  });

  it("renders exactly one highlighted target digit for the last digit", () => {
    const html = renderToStaticMarkup(<TargetDigitQuestion number="456" targetDigitIndex={2} />);
    const matches = html.match(/data-target="true"/g);
    expect(matches).toHaveLength(1);
  });

  it("includes a non-color-only visual cue (border and background) on the target", () => {
    const html = renderToStaticMarkup(<TargetDigitQuestion number="456" targetDigitIndex={0} />);
    expect(html).toContain("border-2");
    expect(html).toContain("rounded-2xl");
    expect(html).toContain("bg-[");
  });

  it("uses the standard prompt text", () => {
    const html = renderToStaticMarkup(<TargetDigitQuestion number="456" targetDigitIndex={0} />);
    expect(html).toContain("What is the value of the bold digit?");
  });

  it("can override the prompt", () => {
    const html = renderToStaticMarkup(
      <TargetDigitQuestion
        number="456"
        targetDigitIndex={0}
        prompt="What is the value of the highlighted digit?"
      />,
    );
    expect(html).toContain("What is the value of the highlighted digit?");
  });
});
