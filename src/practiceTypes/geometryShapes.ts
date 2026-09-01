import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const GEOMETRY_PRACTICE_TYPES = [
  "sides_and_vertices",
  "parallel_sides_quadrilaterals",
  "classify_squares_rectangles_rhombuses",
  "parallelograms_trapezoids",
] as const;

export type GeometryPracticeType = (typeof GEOMETRY_PRACTICE_TYPES)[number];
type Rng = SeededRng;

const POLYGONS = [
  { name: "triangle", sides: 3 },
  { name: "quadrilateral", sides: 4 },
  { name: "pentagon", sides: 5 },
  { name: "hexagon", sides: 6 },
  { name: "heptagon", sides: 7 },
  { name: "octagon", sides: 8 },
] as const;

const QUADRILATERAL_CASES = [
  { id: "square", description: "a square", parallelPairs: 2, membership: "both" },
  { id: "rectangle", description: "a non-square rectangle", parallelPairs: 2, membership: "both" },
  { id: "rhombus", description: "a non-square rhombus", parallelPairs: 2, membership: "both" },
  { id: "parallelogram", description: "a parallelogram with no right-angle or equal-side promise", parallelPairs: 2, membership: "both" },
  { id: "one-pair-trapezoid", description: "a quadrilateral with exactly one pair of parallel sides", parallelPairs: 1, membership: "trapezoid-only" },
  { id: "irregular", description: "a quadrilateral with no parallel sides", parallelPairs: 0, membership: "neither" },
] as const;

function getSeed(
  practiceType: GeometryPracticeType,
  options: PracticeGenerationOptions | undefined,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function getTargetCount(options?: PracticeGenerationOptions): number {
  if (options?.count !== undefined) return options.count;
  const lessonCount = options?.lesson?.practice_block?.question_count;
  if (typeof lessonCount === "number" && lessonCount > 0) return lessonCount;
  return getPracticeProblemCount(options);
}

function stringChoices(correct: string, distractors: readonly string[], rng: Rng): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < 3) throw new Error(`Need three unique geometry distractors for ${correct}`);
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, 3)]);
}

function buildUniqueProblems(
  count: number,
  build: (index: number) => PracticeProblem,
): PracticeProblem[] {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
  const result: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;
  while (result.length < count && attempts < 300) {
    attempts += 1;
    const problem = build(result.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    result.push(problem);
  }
  if (result.length < count) throw new RangeError(`Could not generate ${count} unique geometry problems`);
  return result;
}

function makeSidesVertices(index: number, mode: string, rng: Rng): PracticeProblem {
  const polygon = rng.pick(POLYGONS);
  const task = rng.next() < 0.5 ? "attributes" : "name";
  if (task === "name") {
    const correct = polygon.name;
    return {
      id: `sides-and-vertices-${mode}-${index + 1}`,
      questionText: `A polygon has ${polygon.sides} sides and ${polygon.sides} vertices. What is its name?`,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: `geometry:polygon:sides=${polygon.sides}:vertices=${polygon.sides}:ask=name`,
      visualData: {
        choices: stringChoices(correct, POLYGONS.map((candidate) => candidate.name), rng),
      },
    };
  }
  const correct = `${polygon.sides} sides and ${polygon.sides} vertices`;
  return {
    id: `sides-and-vertices-${mode}-${index + 1}`,
    questionText: `Which attributes correctly describe a ${polygon.name}?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `geometry:polygon:name=${polygon.name}:ask=sides-and-vertices`,
    visualData: {
      choices: stringChoices(correct, [
        `${polygon.sides - 1} sides and ${polygon.sides} vertices`,
        `${polygon.sides} sides and ${polygon.sides + 1} vertices`,
        `${polygon.sides + 1} sides and ${polygon.sides + 1} vertices`,
        `${Math.max(1, polygon.sides - 2)} sides and ${Math.max(1, polygon.sides - 2)} vertices`,
      ], rng),
    },
  };
}

function makeParallelSides(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rng.pick(QUADRILATERAL_CASES);
  const correct = `${state.parallelPairs} pair${state.parallelPairs === 1 ? "" : "s"}`;
  return {
    id: `parallel-sides-quadrilaterals-${mode}-${index + 1}`,
    questionText: `Consider ${state.description}. How many pairs of parallel sides does it have?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `geometry:quadrilateral:case=${state.id}:ask=parallel-pairs`,
    visualData: {
      choices: stringChoices(correct, ["0 pairs", "1 pair", "2 pairs", "4 pairs", "not enough information"], rng),
    },
  };
}

type SquareRectangleRhombusKind = "square" | "rectangle" | "rhombus";

function makeSquareRectangleRhombus(index: number, mode: string, rng: Rng): PracticeProblem {
  const kind = rng.pick<SquareRectangleRhombusKind>(["square", "rectangle", "rhombus"]);
  const description = kind === "square"
    ? "4 equal sides and 4 right angles"
    : kind === "rectangle"
      ? "4 right angles, with opposite sides equal but not all 4 sides equal"
      : "4 equal sides, with angles that are not all right angles";
  const membership = kind === "square"
    ? "square, rectangle, and rhombus"
    : kind === "rectangle"
      ? "rectangle only (among these three names)"
      : "rhombus only (among these three names)";
  const task = rng.next() < 0.5 ? "classify" : "attributes";
  if (task === "classify") {
    return {
      id: `classify-squares-rectangles-rhombuses-${mode}-${index + 1}`,
      questionText: `A quadrilateral has ${description}. Which list includes every name from square, rectangle, and rhombus that applies?`,
      correctAnswer: membership,
      visualType: "multiple_choice",
      problemKey: `geometry:inclusive-class:kind=${kind}:ask=membership`,
      visualData: {
        choices: stringChoices(membership, [
          "square only",
          "rectangle only (among these three names)",
          "rhombus only (among these three names)",
          "square, rectangle, and rhombus",
          "rectangle and rhombus, but not square",
        ], rng),
      },
    };
  }
  return {
    id: `classify-squares-rectangles-rhombuses-${mode}-${index + 1}`,
    questionText: `Which description must be true for a ${kind === "rectangle" ? "non-square rectangle" : kind === "rhombus" ? "non-square rhombus" : "square"}?`,
    correctAnswer: description,
    visualType: "multiple_choice",
    problemKey: `geometry:inclusive-class:kind=${kind}:ask=attributes`,
    visualData: {
      choices: stringChoices(description, [
        "4 equal sides and 4 right angles",
        "4 right angles, with opposite sides equal but not all 4 sides equal",
        "4 equal sides, with angles that are not all right angles",
        "exactly one pair of parallel sides",
        "no parallel sides",
      ], rng),
    },
  };
}

function makeParallelogramsTrapezoids(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rng.pick(QUADRILATERAL_CASES);
  const correct = state.membership === "both"
    ? "It is both a parallelogram and a trapezoid."
    : state.membership === "trapezoid-only"
      ? "It is a trapezoid but not a parallelogram."
      : "It is neither a trapezoid nor a parallelogram.";
  return {
    id: `parallelograms-trapezoids-${mode}-${index + 1}`,
    questionText: `Using the lesson definition that a trapezoid has at least one pair of parallel sides, consider ${state.description}. Which statement is correct?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `geometry:parallel-hierarchy:case=${state.id}:ask=parallelogram-trapezoid-membership`,
    visualData: {
      choices: stringChoices(correct, [
        "It is a parallelogram but not a trapezoid.",
        "It is a trapezoid but not a parallelogram.",
        "It is both a parallelogram and a trapezoid.",
        "It is neither a trapezoid nor a parallelogram.",
        "It must be a square.",
      ], rng),
    },
  };
}

export function generateGeometryProblems(
  practiceType: GeometryPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  return buildUniqueProblems(count, (index) => {
    switch (practiceType) {
      case "sides_and_vertices":
        return makeSidesVertices(index, mode, rng);
      case "parallel_sides_quadrilaterals":
        return makeParallelSides(index, mode, rng);
      case "classify_squares_rectangles_rhombuses":
        return makeSquareRectangleRhombus(index, mode, rng);
      case "parallelograms_trapezoids":
        return makeParallelogramsTrapezoids(index, mode, rng);
      default:
        throw new Error(`Unsupported geometry practice type: ${practiceType}`);
    }
  });
}
