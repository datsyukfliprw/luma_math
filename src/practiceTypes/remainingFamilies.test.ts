import { describe, expect, it } from "vitest";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import type { Lesson } from "../data/curriculum/curriculumSchema";
import type { PracticeGenerationOptions } from "./types";
import {
  AREA_PERIMETER_PRACTICE_TYPES,
  generateAreaPerimeterProblems,
} from "./areaPerimeter";
import { DATA_GRAPH_PRACTICE_TYPES, generateDataGraphProblems } from "./dataGraphs";
import { GEOMETRY_PRACTICE_TYPES, generateGeometryProblems } from "./geometryShapes";
import {
  MEASUREMENT_TIME_PRACTICE_TYPES,
  generateMeasurementTimeProblems,
} from "./measurementTime";
import { generateEvaluationProblems } from "./evaluation";
import {
  evaluationReviewTypeAliases,
  resolveEvaluationReviewSource,
} from "./evaluationReviewResolver";
import { practiceRegistry } from "./registry";

const ALL_REMAINING_TYPES = [
  ...AREA_PERIMETER_PRACTICE_TYPES,
  ...DATA_GRAPH_PRACTICE_TYPES,
  ...GEOMETRY_PRACTICE_TYPES,
  ...MEASUREMENT_TIME_PRACTICE_TYPES,
] as const;

const TARGET_EVALUATION_UNITS = [20, 21, 22, 23, 24, 25, 33, 34, 35, 36] as const;

function lessonOptions(
  practiceType: string,
  seed = "remaining-family-seed",
): PracticeGenerationOptions {
  return {
    count: 6,
    seed,
    mode: "guided",
    lesson: {
      lesson_id: `${practiceType}-test-lesson`,
      practice_type: practiceType,
    },
  };
}

function expectValidChoiceProblem(problem: ReturnType<typeof generateAreaPerimeterProblems>[number]) {
  expect(problem.visualType).toBe("multiple_choice");
  const choices = problem.visualData?.choices ?? [];
  expect(choices).toHaveLength(4);
  expect(new Set(choices).size).toBe(4);
  expect(choices.filter((choice) => choice === problem.correctAnswer)).toHaveLength(1);
}

describe("remaining Grade 3 generator families", () => {
  it("registers all 39 area/perimeter, data, geometry, measurement, and time practice types", () => {
    expect(ALL_REMAINING_TYPES).toHaveLength(39);
    for (const practiceType of ALL_REMAINING_TYPES) {
      expect(practiceRegistry[practiceType]).toBeDefined();
    }
  });

  it("replays deterministically with unique canonical problems and exactly one correct choice", () => {
    for (const practiceType of ALL_REMAINING_TYPES) {
      const options = lessonOptions(practiceType);
      const first = practiceRegistry[practiceType](options);
      const second = practiceRegistry[practiceType](options);
      expect(second).toEqual(first);
      expect(first).toHaveLength(6);
      expect(new Set(first.map((problem) => problem.problemKey)).size).toBe(6);
      first.forEach(expectValidChoiceProblem);
    }
  });

  it("computes missing rectangle sides from area using the inverse operation", () => {
    const problems = generateAreaPerimeterProblems(
      "missing_side_length",
      lessonOptions("missing_side_length", "missing-side-semantics"),
    );

    for (const problem of problems) {
      const match = problem.problemKey.match(/area=(\d+):known-(?:length|width)=(\d+)/);
      expect(match).not.toBeNull();
      const area = Number(match?.[1]);
      const knownSide = Number(match?.[2]);
      expect(Number(problem.correctAnswer)).toBe(area / knownSide);
      expect(area % knownSide).toBe(0);
    }
  });

  it("keeps area and perimeter as different measures", () => {
    const problems = generateAreaPerimeterProblems(
      "area_perimeter_word_problems",
      lessonOptions("area_perimeter_word_problems", "area-perimeter-semantics"),
    );

    for (const problem of problems) {
      const match = problem.problemKey.match(/l=(\d+):w=(\d+)/);
      expect(match).not.toBeNull();
      const length = Number(match?.[1]);
      const width = Number(match?.[2]);
      expect(problem.correctAnswer).toBe(
        `Perimeter ${2 * (length + width)} feet; area ${length * width} square feet`,
      );
    }
  });

  it("uses graph scales multiplicatively rather than counting symbols/spaces as raw values", () => {
    const pictureProblems = generateDataGraphProblems(
      "read_picture_graphs",
      lessonOptions("read_picture_graphs", "picture-scale-semantics"),
    );
    const barProblems = generateDataGraphProblems(
      "read_bar_graphs",
      lessonOptions("read_bar_graphs", "bar-scale-semantics"),
    );

    for (const problem of [...pictureProblems, ...barProblems]) {
      const match = problem.problemKey.match(/scale=(\d+):(symbols|spaces)=(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(problem.correctAnswer)).toBe(Number(match?.[1]) * Number(match?.[3]));
    }
  });

  it("preserves the inclusive Grade 3 quadrilateral hierarchy", () => {
    const classifications = generateGeometryProblems(
      "classify_squares_rectangles_rhombuses",
      lessonOptions("classify_squares_rectangles_rhombuses", "inclusive-square-seed"),
    );
    const squareMembership = classifications.find((problem) =>
      problem.problemKey.includes("kind=square:ask=membership"),
    );
    expect(squareMembership?.correctAnswer).toBe("square, rectangle, and rhombus");

    const hierarchy = generateGeometryProblems(
      "parallelograms_trapezoids",
      lessonOptions("parallelograms_trapezoids", "inclusive-trapezoid-seed"),
    );
    const square = hierarchy.find((problem) => problem.problemKey.includes("case=square:"));
    const onePair = hierarchy.find((problem) =>
      problem.problemKey.includes("case=one-pair-trapezoid:"),
    );
    expect(square?.correctAnswer).toBe("It is both a parallelogram and a trapezoid.");
    expect(onePair?.correctAnswer).toBe("It is a trapezoid but not a parallelogram.");
  });

  it("represents quarter-inch measurements exactly", () => {
    const problems = generateMeasurementTimeProblems(
      "quarter_inch_measurement",
      lessonOptions("quarter_inch_measurement", "quarter-inch-semantics"),
    );
    for (const problem of problems) {
      const quarters = Number(problem.problemKey.match(/quarters=(\d+)/)?.[1]);
      expect(Number.isInteger(quarters)).toBe(true);
      expect(quarters).toBeGreaterThan(0);
      expect(problem.correctAnswer).toMatch(/^(\d+ )?(1\/4|1\/2|3\/4) inches?$|^\d+ inches?$/);
    }
  });

  it("computes elapsed minutes from the learner-visible start and end times", () => {
    const problems = generateMeasurementTimeProblems(
      "elapsed_time",
      lessonOptions("elapsed_time", "elapsed-time-semantics"),
    );
    for (const problem of problems) {
      if (!problem.problemKey.includes(":ask=duration")) continue;
      const match = problem.problemKey.match(/start=(\d+):end=(\d+)/);
      expect(match).not.toBeNull();
      expect(Number(problem.correctAnswer)).toBe(Number(match?.[2]) - Number(match?.[1]));
    }
  });
});

describe("remaining-family Evaluation integration", () => {
  it("no longer needs review-type aliases once all 143 Grade 3 practice types are specialized", () => {
    expect(evaluationReviewTypeAliases).toEqual({});
  });

  it.each(TARGET_EVALUATION_UNITS)(
    "resolves every Unit %i review type through its exact specialized generator",
    (unitNumber) => {
      const unit = getCurriculum(3, unitNumber);
      expect(unit).toBeDefined();
      const evaluation = unit?.weeks
        .flatMap((week) => week.lessons)
        .find((lesson) => lesson.lesson_type === "evaluation") as Lesson | undefined;
      expect(evaluation?.lesson_id).toBeTruthy();
      expect(evaluation?.review_types?.length).toBeGreaterThan(0);

      for (const reviewType of evaluation?.review_types ?? []) {
        const resolved = resolveEvaluationReviewSource(evaluation?.lesson_id ?? "", reviewType);
        expect(resolved.generatorPracticeType).toBe(reviewType);
        expect(resolved.resolution).toBe("specialized");
      }
    },
  );

  it.each(TARGET_EVALUATION_UNITS)(
    "generates a complete balanced Unit %i evaluation from the new families",
    (unitNumber) => {
      const unit = getCurriculum(3, unitNumber);
      const evaluation = unit?.weeks
        .flatMap((week) => week.lessons)
        .find((lesson) => lesson.lesson_type === "evaluation") as Lesson | undefined;
      expect(evaluation).toBeDefined();

      const problems = generateEvaluationProblems({
        mode: "guided",
        seed: `unit-${unitNumber}-remaining-family-evaluation`,
        lesson: evaluation,
      });
      const expectedCount =
        evaluation?.quiz_question_count ?? evaluation?.practice_block?.question_count ?? 9;
      expect(problems).toHaveLength(expectedCount);
      expect(new Set(problems.map((problem) => problem.problemKey)).size).toBe(expectedCount);

      const counts = (evaluation?.review_types ?? []).map(
        (reviewType) =>
          problems.filter((problem) =>
            problem.problemKey.startsWith(`evaluation-${evaluation?.lesson_id}-${reviewType}-`),
          ).length,
      );
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    },
  );
});
