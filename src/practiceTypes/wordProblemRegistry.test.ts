import { describe, expect, it } from "vitest";
import {
  generateChooseOperationProblems,
  generateEstimateThenSolveProblems,
  generateOneStepWordProblems,
  generateTwoStepMeasurementEquationProblems,
  generateTwoStepUnknownProblems,
} from "./addSubWordProblems";
import {
  generateEqualGroupArrayProblems,
  generateEquationsWithUnknownsProblems,
  generateStripModelProblems,
  generateTwoStepMultDivPatternProblems,
} from "./multDivWordProblems";
import { practiceRegistry } from "./registry";

describe("word-problem registry wiring", () => {
  it("routes all five additive reasoning types to their exact generators", () => {
    expect(practiceRegistry.choose_operation).toBe(generateChooseOperationProblems);
    expect(practiceRegistry.estimate_then_solve).toBe(generateEstimateThenSolveProblems);
    expect(practiceRegistry.one_step_word_problems).toBe(generateOneStepWordProblems);
    expect(practiceRegistry.two_step_unknowns).toBe(generateTwoStepUnknownProblems);
    expect(practiceRegistry.two_step_measurement_equations).toBe(
      generateTwoStepMeasurementEquationProblems,
    );
  });

  it("routes all four Unit 18 application types to their exact generators", () => {
    expect(practiceRegistry.equal_group_array_problems).toBe(generateEqualGroupArrayProblems);
    expect(practiceRegistry.strip_models).toBe(generateStripModelProblems);
    expect(practiceRegistry.equations_with_unknowns).toBe(generateEquationsWithUnknownsProblems);
    expect(practiceRegistry.two_step_mult_div_patterns).toBe(generateTwoStepMultDivPatternProblems);
  });
});
