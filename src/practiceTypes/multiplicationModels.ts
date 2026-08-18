import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import {
  BUILD_ARRAYS_RANGE,
  CONNECT_MODELS_RANGE,
  CONNECT_REPRESENTATION_PAIRS,
  DRAW_MULTIPLICATION_RANGE,
  NUMBER_LINE_RANGE,
  TWO_EQUATIONS_FOR_ARRAY_RANGE,
  arrayProblemKey,
  connectModelsProblemKey,
  createArrayState,
  createConnectModelsState,
  createDrawMultiplicationState,
  createNumberLineState,
  createTwoEquationsForArrayState,
  drawMultiplicationProblemKey,
  getArrayMisconceptionCandidates,
  getConnectMisconceptionCandidates,
  getDrawMultiplicationMisconceptionCandidates,
  getNumberLineMisconceptionCandidates,
  getTwoEquationsForArrayDistractorCandidates,
  numberLineProblemKey,
  twoEquationsForArrayProblemKey,
  type ArrayState,
  type ConnectModelsState,
  type DrawMultiplicationState,
  type NumberLineState,
  type TwoEquationsForArrayState,
} from "../lib/multiplication/models";

function getSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: string,
): string | number {
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function formatArrayAnswer(rows: number, columns: number, product: number): string {
  return `${rows},${columns},${product}`;
}

function buildChoices(
  correct: string,
  distractors: readonly string[],
  rng: ReturnType<typeof createSeededRng>,
): string[] {
  const chosen = rng.shuffle(distractors).slice(0, 3);
  if (chosen.length < 3) {
    throw new Error("Not enough unique distractors for multiple-choice choices");
  }
  const all = [correct, ...chosen];
  const unique = [...new Set(all)];
  if (unique.length !== 4) {
    throw new Error("Multiple-choice choices contain duplicates after distractor selection");
  }
  return rng.shuffle(unique);
}

// -------------------------------------------------------------------------
// draw_multiplication
// -------------------------------------------------------------------------

function makeDrawMultiplicationProblem(
  state: DrawMultiplicationState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const choices = buildChoices(
    state.equation,
    getDrawMultiplicationMisconceptionCandidates(state),
    rng,
  );

  return {
    id: `draw_multiplication-${mode}-${index + 1}`,
    questionText: `Which equation matches this situation? There are ${state.groups} groups with ${state.itemsPerGroup} items in each group.`,
    correctAnswer: state.equation,
    visualType: "multiple_choice",
    problemKey: drawMultiplicationProblemKey(state),
    visualData: {
      groups: state.groups,
      itemsPerGroup: state.itemsPerGroup,
      product: state.product,
      equation: state.equation,
      correctEquation: state.equation,
      choices,
    },
    answerData: {
      factorA: String(state.groups),
      factorB: String(state.itemsPerGroup),
      product: String(state.product),
    },
  };
}

export function generateDrawMultiplicationProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "draw_multiplication"));
  const count = getPracticeProblemCount(options);
  const candidates: DrawMultiplicationState[] = [];

  for (
    let groups = DRAW_MULTIPLICATION_RANGE.groups.min;
    groups <= DRAW_MULTIPLICATION_RANGE.groups.max;
    groups += 1
  ) {
    for (
      let itemsPerGroup = DRAW_MULTIPLICATION_RANGE.itemsPerGroup.min;
      itemsPerGroup <= DRAW_MULTIPLICATION_RANGE.itemsPerGroup.max;
      itemsPerGroup += 1
    ) {
      candidates.push(createDrawMultiplicationState(groups, itemsPerGroup));
    }
  }

  const uniqueCandidates = [
    ...new Map(candidates.map((state) => [drawMultiplicationProblemKey(state), state])).values(),
  ];

  if (count > uniqueCandidates.length) {
    throw new RangeError("Requested count exceeds draw multiplication state space");
  }

  return rng
    .shuffle(uniqueCandidates)
    .slice(0, count)
    .map((state, index) => makeDrawMultiplicationProblem(state, index, options?.mode ?? "guided", rng));
}

// -------------------------------------------------------------------------
// build_arrays
// -------------------------------------------------------------------------

function makeBuildArraysProblem(
  state: ArrayState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const correct = formatArrayAnswer(state.rows, state.columns, state.product);
  const distractors = getArrayMisconceptionCandidates(state).map((candidate) =>
    formatArrayAnswer(candidate.rows, candidate.columns, candidate.product),
  );
  const choices = buildChoices(correct, distractors, rng);

  return {
    id: `build_arrays-${mode}-${index + 1}`,
    questionText: `Build an array for ${state.rows} × ${state.columns}. How many rows, columns, and total items should it have?`,
    correctAnswer: correct,
    visualType: "array_rows_columns",
    problemKey: arrayProblemKey(state),
    visualData: {
      rows: state.rows,
      columns: state.columns,
      product: state.product,
      equation: state.equation,
      choices,
    },
    answerData: {
      rows: String(state.rows),
      columns: String(state.columns),
      product: String(state.product),
    },
  };
}

export function generateBuildArraysProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "build_arrays"));
  const count = getPracticeProblemCount(options);
  const candidates: ArrayState[] = [];

  for (let rows = BUILD_ARRAYS_RANGE.rows.min; rows <= BUILD_ARRAYS_RANGE.rows.max; rows += 1) {
    for (
      let columns = BUILD_ARRAYS_RANGE.columns.min;
      columns <= BUILD_ARRAYS_RANGE.columns.max;
      columns += 1
    ) {
      candidates.push(createArrayState(rows, columns));
    }
  }

  const uniqueCandidates = [
    ...new Map(candidates.map((state) => [arrayProblemKey(state), state])).values(),
  ];

  if (count > uniqueCandidates.length) {
    throw new RangeError("Requested count exceeds build arrays state space");
  }

  return rng
    .shuffle(uniqueCandidates)
    .slice(0, count)
    .map((state, index) => makeBuildArraysProblem(state, index, options?.mode ?? "guided", rng));
}

// -------------------------------------------------------------------------
// two_equations_for_array
// -------------------------------------------------------------------------

function makeTwoEquationsForArrayProblem(
  state: TwoEquationsForArrayState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const choices = buildChoices(
    state.correctEquation,
    getTwoEquationsForArrayDistractorCandidates(state),
    rng,
  );

  return {
    id: `two_equations_for_array-${mode}-${index + 1}`,
    questionText: `An array has ${state.rows} rows and ${state.columns} columns. Which pair of equations describes it?`,
    correctAnswer: state.correctEquation,
    visualType: "multiple_choice",
    problemKey: twoEquationsForArrayProblemKey(state),
    visualData: {
      rows: state.rows,
      columns: state.columns,
      product: state.product,
      equations: state.equations,
      correctEquation: state.correctEquation,
      choices,
    },
    answerData: {
      rows: String(state.rows),
      columns: String(state.columns),
      product: String(state.product),
    },
  };
}

export function generateTwoEquationsForArrayProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "two_equations_for_array"));
  const count = getPracticeProblemCount(options);
  const candidates: TwoEquationsForArrayState[] = [];

  for (
    let rows = TWO_EQUATIONS_FOR_ARRAY_RANGE.rows.min;
    rows <= TWO_EQUATIONS_FOR_ARRAY_RANGE.rows.max;
    rows += 1
  ) {
    for (
      let columns = TWO_EQUATIONS_FOR_ARRAY_RANGE.columns.min;
      columns <= TWO_EQUATIONS_FOR_ARRAY_RANGE.columns.max;
      columns += 1
    ) {
      candidates.push(createTwoEquationsForArrayState(rows, columns));
    }
  }

  const uniqueCandidates = [
    ...new Map(
      candidates.map((state) => [twoEquationsForArrayProblemKey(state), state]),
    ).values(),
  ];

  if (count > uniqueCandidates.length) {
    throw new RangeError("Requested count exceeds two equations for array state space");
  }

  return rng
    .shuffle(uniqueCandidates)
    .slice(0, count)
    .map((state, index) =>
      makeTwoEquationsForArrayProblem(state, index, options?.mode ?? "guided", rng),
    );
}

// -------------------------------------------------------------------------
// multiplication_number_line
// -------------------------------------------------------------------------

function makeMultiplicationNumberLineProblem(
  state: NumberLineState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const choices = buildChoices(
    state.equation,
    getNumberLineMisconceptionCandidates(state),
    rng,
  );

  return {
    id: `multiplication_number_line-${mode}-${index + 1}`,
    questionText: `${state.jumpCount} equal jumps of ${state.jumpSize} are shown on a number line starting at 0. Which multiplication equation matches the jumps?`,
    correctAnswer: state.equation,
    visualType: "multiple_choice",
    problemKey: numberLineProblemKey(state),
    visualData: {
      jumpCount: state.jumpCount,
      jumpSize: state.jumpSize,
      start: state.start,
      endpoint: state.endpoint,
      product: state.product,
      equation: state.equation,
      choices,
    },
    answerData: {
      factorA: String(state.jumpCount),
      factorB: String(state.jumpSize),
      product: String(state.product),
    },
  };
}

export function generateMultiplicationNumberLineProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "multiplication_number_line"));
  const count = getPracticeProblemCount(options);
  const candidates: NumberLineState[] = [];

  for (
    let jumpCount = NUMBER_LINE_RANGE.jumpCount.min;
    jumpCount <= NUMBER_LINE_RANGE.jumpCount.max;
    jumpCount += 1
  ) {
    for (
      let jumpSize = NUMBER_LINE_RANGE.jumpSize.min;
      jumpSize <= NUMBER_LINE_RANGE.jumpSize.max;
      jumpSize += 1
    ) {
      candidates.push(createNumberLineState(jumpCount, jumpSize));
    }
  }

  const uniqueCandidates = [
    ...new Map(candidates.map((state) => [numberLineProblemKey(state), state])).values(),
  ];

  if (count > uniqueCandidates.length) {
    throw new RangeError("Requested count exceeds multiplication number line state space");
  }

  return rng
    .shuffle(uniqueCandidates)
    .slice(0, count)
    .map((state, index) =>
      makeMultiplicationNumberLineProblem(state, index, options?.mode ?? "guided", rng),
    );
}

// -------------------------------------------------------------------------
// connect_models_equations_stories
// -------------------------------------------------------------------------

function sourcePhrase(state: ConnectModelsState): string {
  switch (state.sourceRepresentation) {
    case "equation":
      return `equation ${state.sourceEquation}`;
    case "story":
      return `story: ${state.sourceDescription}`;
    case "number_line":
      return `number line showing ${state.factorA} equal jumps of ${state.factorB}`;
    case "array":
      return `array with ${state.factorA} rows and ${state.factorB} columns`;
    default:
      throw new Error(`Unknown source representation: ${state.sourceRepresentation}`);
  }
}

function makeConnectModelsEquationsStoriesProblem(
  state: ConnectModelsState,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  const choices = buildChoices(
    state.correctTarget,
    getConnectMisconceptionCandidates(state),
    rng,
  );

  const targetWord = state.targetRepresentation === "story" ? "story" : "equation";

  return {
    id: `connect_models_equations_stories-${mode}-${index + 1}`,
    questionText: `Which ${targetWord} matches the ${sourcePhrase(state)}?`,
    correctAnswer: state.correctTarget,
    visualType: "multiple_choice",
    problemKey: connectModelsProblemKey(state),
    visualData: {
      factorA: state.factorA,
      factorB: state.factorB,
      product: state.product,
      sourceEquation: state.sourceEquation,
      sourceRepresentation: state.sourceRepresentation,
      targetRepresentation: state.targetRepresentation,
      sourceDescription: state.sourceDescription,
      orderedRoles: state.orderedRoles,
      correctAnswer: state.correctTarget,
      choices,
    },
    answerData: {
      factorA: String(state.factorA),
      factorB: String(state.factorB),
      product: String(state.product),
    },
  };
}

export function generateConnectModelsEquationsStoriesProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options, "connect_models_equations_stories"));
  const count = getPracticeProblemCount(options);
  const candidates: ConnectModelsState[] = [];

  for (
    let factorA = CONNECT_MODELS_RANGE.factorA.min;
    factorA <= CONNECT_MODELS_RANGE.factorA.max;
    factorA += 1
  ) {
    for (
      let factorB = CONNECT_MODELS_RANGE.factorB.min;
      factorB <= CONNECT_MODELS_RANGE.factorB.max;
      factorB += 1
    ) {
      for (const pair of CONNECT_REPRESENTATION_PAIRS) {
        candidates.push(
          createConnectModelsState(factorA, factorB, pair.source, pair.target, {
            first: pair.firstRole,
            second: pair.secondRole,
          }),
        );
      }
    }
  }

  const uniqueCandidates = [
    ...new Map(
      candidates.map((state) => [connectModelsProblemKey(state), state]),
    ).values(),
  ];

  if (count > uniqueCandidates.length) {
    throw new RangeError("Requested count exceeds connect models state space");
  }

  return rng
    .shuffle(uniqueCandidates)
    .slice(0, count)
    .map((state, index) =>
      makeConnectModelsEquationsStoriesProblem(state, index, options?.mode ?? "guided", rng),
    );
}

// -------------------------------------------------------------------------
// Main dispatcher
// -------------------------------------------------------------------------

export function generateMultiplicationModelsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = options?.lesson?.practice_type;

  switch (practiceType) {
    case "draw_multiplication":
      return generateDrawMultiplicationProblems(options);
    case "build_arrays":
      return generateBuildArraysProblems(options);
    case "two_equations_for_array":
      return generateTwoEquationsForArrayProblems(options);
    case "multiplication_number_line":
      return generateMultiplicationNumberLineProblems(options);
    case "connect_models_equations_stories":
      return generateConnectModelsEquationsStoriesProblems(options);
    default:
      throw new Error(
        `Unknown or missing multiplication model practice type: ${String(practiceType)}`,
      );
  }
}
