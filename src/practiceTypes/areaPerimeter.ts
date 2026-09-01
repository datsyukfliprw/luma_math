import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const AREA_PERIMETER_PRACTICE_TYPES = [
  "area_introduction",
  "cover_with_unit_squares",
  "count_and_label_area",
  "hidden_squares_area",
  "tile_rectangles",
  "rows_columns_multiplication",
  "area_rectangles_squares",
  "area_word_problems",
  "create_rectangles_area",
  "different_arrangements_same_area",
  "missing_side_length",
  "distributive_property_area",
  "perimeter_introduction",
  "perimeter_on_grids",
  "perimeter_rectangles_quadrilaterals",
  "missing_side_perimeter",
  "same_perimeter_different_area",
  "same_area_different_perimeter",
  "find_area_perimeter_missing_side",
  "area_perimeter_word_problems",
] as const;

export type AreaPerimeterPracticeType = (typeof AREA_PERIMETER_PRACTICE_TYPES)[number];
type Rng = SeededRng;

function getSeed(
  practiceType: AreaPerimeterPracticeType,
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

function validateCount(count: number): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
}

function stringChoices(correct: string, distractors: readonly string[], rng: Rng): string[] {
  const unique = [...new Set(distractors)].filter((candidate) => candidate !== correct);
  if (unique.length < 3) throw new Error(`Need three unique distractors for ${correct}`);
  return rng.shuffle([correct, ...rng.shuffle(unique).slice(0, 3)]);
}

function numberChoices(correct: number, rng: Rng, extras: readonly number[] = []): string[] {
  const candidates = new Set<number>();
  const add = (value: number) => {
    if (Number.isInteger(value) && value >= 0 && value !== correct) candidates.add(value);
  };
  for (const value of extras) add(value);
  for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10, 12, -12]) {
    add(correct + offset);
  }
  let offset = 6;
  while (candidates.size < 3) {
    add(correct + offset);
    add(correct - offset);
    offset += 1;
  }
  return rng.shuffle([String(correct), ...rng.shuffle([...candidates]).slice(0, 3).map(String)]);
}

function buildUniqueProblems(
  count: number,
  build: (index: number) => PracticeProblem,
  maxAttempts = 600,
): PracticeProblem[] {
  validateCount(count);
  const result: PracticeProblem[] = [];
  const keys = new Set<string>();
  let attempts = 0;
  while (result.length < count && attempts < maxAttempts) {
    attempts += 1;
    const problem = build(result.length);
    if (keys.has(problem.problemKey)) continue;
    keys.add(problem.problemKey);
    result.push(problem);
  }
  if (result.length < count) {
    throw new RangeError(`Could not generate ${count} unique area/perimeter problems`);
  }
  return result;
}

function rectangle(rng: Rng, min = 2, max = 12): { length: number; width: number; area: number; perimeter: number } {
  const length = rng.nextInt(min, max);
  const width = rng.nextInt(min, max);
  return { length, width, area: length * width, perimeter: 2 * (length + width) };
}

function factorPairs(area: number): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let a = 1; a * a <= area; a += 1) {
    if (area % a === 0) pairs.push([a, area / a]);
  }
  return pairs;
}

function factorPairsText(area: number): string {
  return factorPairs(area).map(([a, b]) => `${a}×${b}`).join(", ");
}

function factorPairChoices(area: number, rng: Rng): string[] {
  const correct = factorPairsText(area);
  const areas = [area - 2, area - 1, area + 1, area + 2, area + 4, area + 6]
    .filter((value) => value >= 6 && value !== area);
  return stringChoices(correct, areas.map(factorPairsText), rng);
}

function makeAreaIntroduction(index: number, mode: string, rng: Rng): PracticeProblem {
  const a = rectangle(rng, 2, 9);
  let b = rectangle(rng, 2, 9);
  while (a.area === b.area) b = rectangle(rng, 2, 9);
  const correct = a.area > b.area ? "Rectangle A" : "Rectangle B";
  return {
    id: `area-introduction-${mode}-${index + 1}`,
    questionText: `Rectangle A covers ${a.length} rows of ${a.width} square units. Rectangle B covers ${b.length} rows of ${b.width} square units. Which rectangle has more area?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:compare-more:a=${a.length}x${a.width}:b=${b.length}x${b.width}`,
    visualData: {
      equation: `A=${a.area} square units; B=${b.area} square units`,
      choices: stringChoices(correct, ["Rectangle A", "Rectangle B", "They have the same area", "There is not enough information"], rng),
    },
  };
}

function makeSimpleArea(
  practiceType: "cover_with_unit_squares" | "count_and_label_area" | "hidden_squares_area" | "rows_columns_multiplication",
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  const state = rectangle(rng, 2, 10);
  const labeled = practiceType === "count_and_label_area";
  const correct = labeled ? `${state.area} square units` : String(state.area);
  const prompt = practiceType === "cover_with_unit_squares"
    ? `A rectangle is completely covered by ${state.length} rows of ${state.width} unit squares with no gaps or overlaps. How many unit squares cover it?`
    : practiceType === "count_and_label_area"
      ? `A rectangle has ${state.length} rows and ${state.width} columns of unit squares. What is its area with the correct label?`
      : practiceType === "hidden_squares_area"
        ? `Some squares are hidden, but the rectangle has ${state.length} rows and ${state.width} columns. What is the total area?`
        : `A rectangle has ${state.length} rows and ${state.width} columns. What is its area?`;
  const choices = labeled
    ? stringChoices(correct, [
        `${state.area} units`,
        `${state.perimeter} square units`,
        `${state.length + state.width} square units`,
        `${state.area + 1} square units`,
      ], rng)
    : numberChoices(state.area, rng, [state.perimeter, state.length + state.width]);
  return {
    id: `${practiceType}-${mode}-${index + 1}`,
    questionText: prompt,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:${practiceType}:rows=${state.length}:columns=${state.width}:ask=area`,
    visualData: {
      rows: state.length,
      columns: state.width,
      product: state.area,
      equation: `${state.length} × ${state.width} = ${state.area}`,
      choices,
    },
  };
}

function makeTileRectangles(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 10);
  const correct = `${state.length} × ${state.width} = ${state.area} square units`;
  return {
    id: `tile-rectangles-${mode}-${index + 1}`,
    questionText: `A tiled rectangle has ${state.length} rows and ${state.width} unit squares in each row. Which multiplication equation gives its area?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:tile:rows=${state.length}:columns=${state.width}:ask=equation`,
    visualData: {
      rows: state.length,
      columns: state.width,
      product: state.area,
      equation: correct,
      choices: stringChoices(correct, [
        `${state.length} + ${state.width} = ${state.length + state.width} square units`,
        `${state.length} × ${state.width} = ${state.perimeter} square units`,
        `${state.length + state.width} × 2 = ${state.perimeter} square units`,
        `${state.length} × ${state.width + 1} = ${state.length * (state.width + 1)} square units`,
      ], rng),
    },
  };
}

function makeAreaRectanglesSquares(index: number, mode: string, rng: Rng): PracticeProblem {
  const square = rng.next() < 0.5;
  const length = rng.nextInt(2, 12);
  const width = square ? length : rng.nextInt(2, 12);
  const area = length * width;
  const correct = `${area} square units`;
  const shape = square ? `square with side length ${length}` : `rectangle ${length} units long and ${width} units wide`;
  return {
    id: `area-rectangles-squares-${mode}-${index + 1}`,
    questionText: `Find the area of a ${shape}.`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:rectangle-or-square:l=${length}:w=${width}:ask=area`,
    visualData: {
      rows: length,
      columns: width,
      product: area,
      equation: `${length} × ${width} = ${area}`,
      choices: stringChoices(correct, [
        `${2 * (length + width)} square units`,
        `${length + width} square units`,
        `${Math.abs(length - width)} square units`,
        `${area + length} square units`,
      ], rng),
    },
  };
}

function makeAreaWordProblem(index: number, mode: string, rng: Rng): PracticeProblem {
  const findSide = rng.next() < 0.4;
  const state = rectangle(rng, 2, 10);
  if (findSide) {
    const correct = String(state.length);
    return {
      id: `area-word-problems-${mode}-${index + 1}`,
      questionText: `A rectangular garden has area ${state.area} square feet and width ${state.width} feet. What is its length?`,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: `area:word:area=${state.area}:known-width=${state.width}:ask=length`,
      visualData: {
        equation: `${state.area} ÷ ${state.width} = ?`,
        choices: numberChoices(state.length, rng, [state.width, state.area, state.perimeter]),
      },
    };
  }
  const correct = String(state.area);
  return {
    id: `area-word-problems-${mode}-${index + 1}`,
    questionText: `A rectangular rug is ${state.length} feet long and ${state.width} feet wide. How many square feet does it cover?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:word:l=${state.length}:w=${state.width}:ask=area`,
    visualData: {
      equation: `${state.length} × ${state.width} = ?`,
      choices: numberChoices(state.area, rng, [state.perimeter, state.length + state.width]),
    },
  };
}

function makeFactorPairs(
  practiceType: "create_rectangles_area" | "different_arrangements_same_area",
  index: number,
  mode: string,
  rng: Rng,
): PracticeProblem {
  const areas = [12, 18, 20, 24, 28, 30, 32, 36, 40, 42, 48, 54, 56, 60, 63, 64, 72];
  const area = rng.pick(areas);
  const correct = factorPairsText(area);
  const prompt = practiceType === "create_rectangles_area"
    ? `Which list gives all whole-number length-by-width rectangles with area ${area} square units?`
    : `Which list gives all different whole-number rectangular arrangements with the same area of ${area} square units?`;
  return {
    id: `${practiceType}-${mode}-${index + 1}`,
    questionText: prompt,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:factor-pairs:area=${area}:ask=all-pairs`,
    visualData: {
      product: area,
      choices: factorPairChoices(area, rng),
    },
  };
}

function makeMissingSideLength(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 12);
  const knownLength = rng.next() < 0.5;
  const known = knownLength ? state.length : state.width;
  const missing = knownLength ? state.width : state.length;
  const label = knownLength ? "length" : "width";
  const ask = knownLength ? "width" : "length";
  return {
    id: `missing-side-length-${mode}-${index + 1}`,
    questionText: `A rectangle has area ${state.area} square units and ${label} ${known} units. What is its ${ask}?`,
    correctAnswer: String(missing),
    visualType: "multiple_choice",
    problemKey: `area:missing-side:area=${state.area}:known-${label}=${known}:ask=${ask}`,
    visualData: {
      equation: `${state.area} ÷ ${known} = ?`,
      choices: numberChoices(missing, rng, [known, state.area, state.perimeter]),
    },
  };
}

function makeDistributiveArea(index: number, mode: string, rng: Rng): PracticeProblem {
  const rows = rng.nextInt(2, 9);
  const columns = rng.nextInt(4, 12);
  const split = rng.nextInt(1, columns - 1);
  const rest = columns - split;
  const area = rows * columns;
  const correct = `(${rows}×${split}) + (${rows}×${rest}) = ${area}`;
  return {
    id: `distributive-property-area-${mode}-${index + 1}`,
    questionText: `A ${rows} by ${columns} rectangle is split so ${columns} = ${split} + ${rest}. Which equation correctly uses the distributive property to find its area?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area:distribute:rows=${rows}:columns=${columns}:split=${split}+${rest}`,
    visualData: {
      rows,
      columns,
      product: area,
      equation: `${rows} × ${columns} = ${area}`,
      choices: stringChoices(correct, [
        `(${rows}+${split}) × (${rows}+${rest}) = ${(rows + split) * (rows + rest)}`,
        `(${rows}×${split}) + (${columns}×${rest}) = ${rows * split + columns * rest}`,
        `(${rows}×${split}) + (${rows}+${rest}) = ${rows * split + rows + rest}`,
        `(${rows}×${split}) - (${rows}×${rest}) = ${rows * split - rows * rest}`,
      ], rng),
    },
  };
}

function makePerimeterIntroduction(index: number, mode: string, rng: Rng): PracticeProblem {
  const square = rng.next() < 0.35;
  const length = rng.nextInt(2, 14);
  const width = square ? length : rng.nextInt(2, 14);
  const perimeter = 2 * (length + width);
  const shape = square ? `square with side ${length}` : `rectangle with side lengths ${length}, ${width}, ${length}, and ${width}`;
  return {
    id: `perimeter-introduction-${mode}-${index + 1}`,
    questionText: `Find the distance around a ${shape}.`,
    correctAnswer: String(perimeter),
    visualType: "multiple_choice",
    problemKey: `perimeter:introduction:l=${length}:w=${width}:ask=perimeter`,
    visualData: {
      equation: `${length} + ${width} + ${length} + ${width} = ?`,
      choices: numberChoices(perimeter, rng, [length * width, length + width]),
    },
  };
}

function makePerimeterGrid(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 12);
  return {
    id: `perimeter-on-grids-${mode}-${index + 1}`,
    questionText: `On a unit grid, a rectangle is ${state.length} units long and ${state.width} units wide. How many unit segments are around its outside edge?`,
    correctAnswer: String(state.perimeter),
    visualType: "multiple_choice",
    problemKey: `perimeter:grid:l=${state.length}:w=${state.width}:ask=perimeter`,
    visualData: {
      equation: `${state.length} + ${state.width} + ${state.length} + ${state.width} = ?`,
      choices: numberChoices(state.perimeter, rng, [state.area, state.length + state.width]),
    },
  };
}

function makePerimeterRectanglesQuadrilaterals(index: number, mode: string, rng: Rng): PracticeProblem {
  const rectangleMode = rng.next() < 0.5;
  if (rectangleMode) {
    const state = rectangle(rng, 2, 14);
    return {
      id: `perimeter-rectangles-quadrilaterals-${mode}-${index + 1}`,
      questionText: `A rectangle has length ${state.length} and width ${state.width}. What is its perimeter?`,
      correctAnswer: String(state.perimeter),
      visualType: "multiple_choice",
      problemKey: `perimeter:quadrilateral:rectangle:l=${state.length}:w=${state.width}`,
      visualData: { equation: `2×${state.length} + 2×${state.width} = ?`, choices: numberChoices(state.perimeter, rng, [state.area]) },
    };
  }
  const sides = [rng.nextInt(2, 12), rng.nextInt(2, 12), rng.nextInt(2, 12), rng.nextInt(2, 12)];
  const perimeter = sides.reduce((sum, side) => sum + side, 0);
  return {
    id: `perimeter-rectangles-quadrilaterals-${mode}-${index + 1}`,
    questionText: `A quadrilateral has side lengths ${sides.join(", ")}. What is its perimeter?`,
    correctAnswer: String(perimeter),
    visualType: "multiple_choice",
    problemKey: `perimeter:quadrilateral:sides=${sides.join("-")}:ask=perimeter`,
    visualData: { equation: `${sides.join(" + ")} = ?`, choices: numberChoices(perimeter, rng, sides) },
  };
}

function makeMissingSidePerimeter(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 14);
  const knownLength = rng.next() < 0.5;
  const known = knownLength ? state.length : state.width;
  const missing = knownLength ? state.width : state.length;
  const knownName = knownLength ? "length" : "width";
  const askName = knownLength ? "width" : "length";
  return {
    id: `missing-side-perimeter-${mode}-${index + 1}`,
    questionText: `A rectangle has perimeter ${state.perimeter} units and ${knownName} ${known} units. What is its ${askName}?`,
    correctAnswer: String(missing),
    visualType: "multiple_choice",
    problemKey: `perimeter:missing-side:p=${state.perimeter}:known-${knownName}=${known}:ask=${askName}`,
    visualData: {
      equation: `(${state.perimeter} - 2×${known}) ÷ 2 = ?`,
      choices: numberChoices(missing, rng, [known, state.perimeter / 2]),
    },
  };
}

function samePerimeterPair(rng: Rng) {
  const halfPerimeter = rng.nextInt(7, 18);
  const aLength = rng.nextInt(1, Math.max(1, Math.floor(halfPerimeter / 2) - 1));
  const aWidth = halfPerimeter - aLength;
  let bLength = rng.nextInt(1, Math.max(1, Math.floor(halfPerimeter / 2)));
  while (bLength === aLength) bLength = rng.nextInt(1, Math.max(1, Math.floor(halfPerimeter / 2)));
  const bWidth = halfPerimeter - bLength;
  return {
    perimeter: halfPerimeter * 2,
    a: { length: aLength, width: aWidth, area: aLength * aWidth },
    b: { length: bLength, width: bWidth, area: bLength * bWidth },
  };
}

function makeSamePerimeterDifferentArea(index: number, mode: string, rng: Rng): PracticeProblem {
  let pair = samePerimeterPair(rng);
  while (pair.a.area === pair.b.area) pair = samePerimeterPair(rng);
  const greater = pair.a.area > pair.b.area ? "A" : "B";
  const correct = `Both perimeters are ${pair.perimeter}; Rectangle ${greater} has greater area.`;
  return {
    id: `same-perimeter-different-area-${mode}-${index + 1}`,
    questionText: `Rectangle A is ${pair.a.length} by ${pair.a.width}. Rectangle B is ${pair.b.length} by ${pair.b.width}. Which statement is correct?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area-perimeter:same-p:a=${pair.a.length}x${pair.a.width}:b=${pair.b.length}x${pair.b.width}:ask=compare-area`,
    visualData: {
      choices: stringChoices(correct, [
        `Both areas are the same; Rectangle A has greater perimeter.`,
        `Both perimeters are ${pair.perimeter}; Rectangle ${greater === "A" ? "B" : "A"} has greater area.`,
        `Rectangle A and Rectangle B have both the same area and perimeter.`,
        `The rectangles cannot have the same perimeter because their side lengths differ.`,
      ], rng),
    },
  };
}

function sameAreaPair(rng: Rng) {
  const areas = [12, 18, 20, 24, 30, 32, 36, 40, 42, 48, 54, 56, 60, 63, 72];
  const area = rng.pick(areas);
  const pairs = factorPairs(area);
  const [a, b] = rng.shuffle(pairs).slice(0, 2);
  return {
    area,
    a: { length: a[0], width: a[1], perimeter: 2 * (a[0] + a[1]) },
    b: { length: b[0], width: b[1], perimeter: 2 * (b[0] + b[1]) },
  };
}

function makeSameAreaDifferentPerimeter(index: number, mode: string, rng: Rng): PracticeProblem {
  let pair = sameAreaPair(rng);
  while (pair.a.perimeter === pair.b.perimeter) pair = sameAreaPair(rng);
  const greater = pair.a.perimeter > pair.b.perimeter ? "A" : "B";
  const correct = `Both areas are ${pair.area}; Rectangle ${greater} has greater perimeter.`;
  return {
    id: `same-area-different-perimeter-${mode}-${index + 1}`,
    questionText: `Rectangle A is ${pair.a.length} by ${pair.a.width}. Rectangle B is ${pair.b.length} by ${pair.b.width}. Which statement is correct?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area-perimeter:same-area=${pair.area}:a=${pair.a.length}x${pair.a.width}:b=${pair.b.length}x${pair.b.width}:ask=compare-perimeter`,
    visualData: {
      choices: stringChoices(correct, [
        `Both perimeters are the same; Rectangle A has greater area.`,
        `Both areas are ${pair.area}; Rectangle ${greater === "A" ? "B" : "A"} has greater perimeter.`,
        `Rectangle A and Rectangle B have both the same area and perimeter.`,
        `The rectangles cannot have the same area because their side lengths differ.`,
      ], rng),
    },
  };
}

function makeFindAreaPerimeterMissingSide(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 12);
  const knownLength = rng.next() < 0.5;
  const known = knownLength ? state.length : state.width;
  const missing = knownLength ? state.width : state.length;
  const knownName = knownLength ? "length" : "width";
  const askName = knownLength ? "width" : "length";
  const correct = `${askName} ${missing}; area ${state.area} square units`;
  return {
    id: `find-area-perimeter-missing-side-${mode}-${index + 1}`,
    questionText: `A rectangle has perimeter ${state.perimeter} units and ${knownName} ${known} units. Find the ${askName} and the area.`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area-perimeter:missing-side:p=${state.perimeter}:known-${knownName}=${known}:ask=${askName}-and-area`,
    visualData: {
      equation: `${askName}=(${state.perimeter}-2×${known})÷2; area=${state.length}×${state.width}`,
      choices: stringChoices(correct, [
        `${askName} ${missing}; area ${state.perimeter} square units`,
        `${askName} ${Math.max(1, missing - 1)}; area ${known * Math.max(1, missing - 1)} square units`,
        `${askName} ${missing + 1}; area ${known * (missing + 1)} square units`,
        `${askName} ${missing + 2}; area ${known * (missing + 2)} square units`,
        `${askName} ${Math.max(1, missing - 2)}; area ${known * Math.max(1, missing - 2)} square units`,
      ], rng),
    },
  };
}

function makeAreaPerimeterWordProblem(index: number, mode: string, rng: Rng): PracticeProblem {
  const state = rectangle(rng, 2, 12);
  const correct = `Perimeter ${state.perimeter} feet; area ${state.area} square feet`;
  return {
    id: `area-perimeter-word-problems-${mode}-${index + 1}`,
    questionText: `A rectangular garden is ${state.length} feet by ${state.width} feet. How much fencing is needed around it, and how many square feet of soil cover its inside?`,
    correctAnswer: correct,
    visualType: "multiple_choice",
    problemKey: `area-perimeter:word:l=${state.length}:w=${state.width}:ask=perimeter-and-area`,
    visualData: {
      equation: `P=2(${state.length}+${state.width}); A=${state.length}×${state.width}`,
      choices: stringChoices(correct, [
        `Perimeter ${state.area} feet; area ${state.perimeter} square feet`,
        `Perimeter ${state.length + state.width} feet; area ${state.area} square feet`,
        `Perimeter ${state.perimeter} feet; area ${state.length + state.width} square feet`,
        `Perimeter ${state.perimeter + 2} feet; area ${state.area} square feet`,
        `Perimeter ${state.perimeter} feet; area ${state.area + 2} square feet`,
      ], rng),
    },
  };
}

export function generateAreaPerimeterProblems(
  practiceType: AreaPerimeterPracticeType,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return buildUniqueProblems(count, (index) => {
    switch (practiceType) {
      case "area_introduction":
        return makeAreaIntroduction(index, mode, rng);
      case "cover_with_unit_squares":
      case "count_and_label_area":
      case "hidden_squares_area":
      case "rows_columns_multiplication":
        return makeSimpleArea(practiceType, index, mode, rng);
      case "tile_rectangles":
        return makeTileRectangles(index, mode, rng);
      case "area_rectangles_squares":
        return makeAreaRectanglesSquares(index, mode, rng);
      case "area_word_problems":
        return makeAreaWordProblem(index, mode, rng);
      case "create_rectangles_area":
      case "different_arrangements_same_area":
        return makeFactorPairs(practiceType, index, mode, rng);
      case "missing_side_length":
        return makeMissingSideLength(index, mode, rng);
      case "distributive_property_area":
        return makeDistributiveArea(index, mode, rng);
      case "perimeter_introduction":
        return makePerimeterIntroduction(index, mode, rng);
      case "perimeter_on_grids":
        return makePerimeterGrid(index, mode, rng);
      case "perimeter_rectangles_quadrilaterals":
        return makePerimeterRectanglesQuadrilaterals(index, mode, rng);
      case "missing_side_perimeter":
        return makeMissingSidePerimeter(index, mode, rng);
      case "same_perimeter_different_area":
        return makeSamePerimeterDifferentArea(index, mode, rng);
      case "same_area_different_perimeter":
        return makeSameAreaDifferentPerimeter(index, mode, rng);
      case "find_area_perimeter_missing_side":
        return makeFindAreaPerimeterMissingSide(index, mode, rng);
      case "area_perimeter_word_problems":
        return makeAreaPerimeterWordProblem(index, mode, rng);
      default:
        throw new Error(`Unsupported area/perimeter practice type: ${practiceType}`);
    }
  });
}
