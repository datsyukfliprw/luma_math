import {
  createDivideByOneState,
  createDivideByZeroState,
  createZeroDividendState,
  divisionArrayProblemKey,
  divisionEquationProblemKey,
  divisionFactFamilyProblemKey,
  divisionModelProblemKey,
  divisionSpecialProblemKey,
  enumerateDivisionFacts,
  enumerateFixedDivisorFacts,
  getDivisionAnswer,
  getDivisionMissingRoleMisconceptionCandidates,
  getDivisionQuotientMisconceptionCandidates,
  getDivisionSpecialAnswer,
  type DivisionArrayKnownDimension,
  type DivisionFact,
  type DivisionSpecialState,
  type DivisionUnknownRole,
  type FixedDivisor,
} from "../lib/division/core";
import { getPracticeProblemCount } from "./practiceModeCounts";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

export const DIVISION_PRACTICE_TYPES = [
  "division_sharing",
  "division_counting_groups",
  "write_division_equations",
  "division_with_1_and_0",
  "division_arrays",
  "division_number_line",
  "fact_families",
  "multiplication_for_division",
  "divide_by_6",
  "divide_by_7",
  "divide_by_8",
  "divide_by_9",
  "missing_numbers_division",
] as const;

export type DivisionPracticeType = (typeof DIVISION_PRACTICE_TYPES)[number];
type Rng = ReturnType<typeof createSeededRng>;

type MissingDivisionCandidate = {
  fact: DivisionFact;
  role: DivisionUnknownRole;
};

type DivisionArrayCandidate = {
  fact: DivisionFact;
  knownDimension: DivisionArrayKnownDimension;
};

const SHARING_CONTEXTS = [
  { item: "stickers", group: "student", groups: "students" },
  { item: "crayons", group: "box", groups: "boxes" },
  { item: "apples", group: "basket", groups: "baskets" },
  { item: "shells", group: "jar", groups: "jars" },
] as const;

const COUNTING_CONTEXTS = ["counters", "stickers", "blocks", "crayons", "shells"] as const;
const ARRAY_CONTEXTS = ["tiles", "dots", "chairs", "books", "counters"] as const;

function getSeed(
  practiceType: DivisionPracticeType,
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

function validateCount(count: number, stateCount: number, label: string): void {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`Requested count (${count}) must be a non-negative integer`);
  }
  if (count > stateCount) {
    throw new RangeError(`Requested count exceeds ${label} state space`);
  }
}

function buildChoices(
  correct: string | number,
  distractors: readonly (string | number)[],
  rng: Rng,
): string[] {
  const correctText = String(correct);
  const uniqueDistractors = [...new Set(distractors.map(String))].filter(
    (candidate) => candidate !== correctText,
  );

  if (uniqueDistractors.length < 3) {
    throw new Error("Division generator did not provide enough unique distractors");
  }

  return rng.shuffle([correctText, ...uniqueDistractors.slice(0, 3)]);
}

function selectBalanced<T>(buckets: readonly T[][], count: number, rng: Rng): T[] {
  const shuffledBuckets = buckets.map((bucket) => rng.shuffle(bucket));
  const total = shuffledBuckets.reduce((sum, bucket) => sum + bucket.length, 0);
  validateCount(count, total, "balanced division");

  const selected: T[] = [];
  const offsets = shuffledBuckets.map(() => 0);
  const bucketOrder = rng.shuffle(shuffledBuckets.map((_, index) => index));

  while (selected.length < count) {
    let added = false;
    for (const bucketIndex of bucketOrder) {
      const offset = offsets[bucketIndex];
      const candidate = shuffledBuckets[bucketIndex][offset];
      if (candidate === undefined) continue;

      selected.push(candidate);
      offsets[bucketIndex] += 1;
      added = true;
      if (selected.length >= count) break;
    }

    if (!added) break;
  }

  return selected;
}

function makeQuotientChoices(fact: DivisionFact, rng: Rng): string[] {
  return buildChoices(
    fact.quotient,
    getDivisionQuotientMisconceptionCandidates(fact),
    rng,
  );
}

export function generateDivisionSharingProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "division_sharing";
  const facts = enumerateDivisionFacts();
  const count = getTargetCount(options);
  validateCount(count, facts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(facts).slice(0, count).map((fact, index) => {
    const context = rng.pick(SHARING_CONTEXTS);
    return {
      id: `division-sharing-${mode}-${index + 1}`,
      questionText: `Share ${fact.dividend} ${context.item} equally among ${fact.divisor} ${context.groups}. How many ${context.item} does each ${context.group} get?`,
      correctAnswer: String(fact.quotient),
      visualType: "fair_sharing",
      problemKey: divisionModelProblemKey(fact, "sharing", "quotient"),
      visualData: {
        items: fact.dividend,
        groupsToShare: fact.divisor,
        groups: fact.divisor,
        itemsPerGroup: fact.quotient,
        equation: `${fact.dividend} ÷ ${fact.divisor} = ${fact.quotient}`,
      },
      answerData: {
        quotient: String(fact.quotient),
      },
    };
  });
}

export function generateDivisionCountingGroupsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "division_counting_groups";
  const facts = enumerateDivisionFacts();
  const count = getTargetCount(options);
  validateCount(count, facts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(facts).slice(0, count).map((fact, index) => {
    const item = rng.pick(COUNTING_CONTEXTS);
    return {
      id: `division-counting-groups-${mode}-${index + 1}`,
      questionText: `You have ${fact.dividend} ${item}. Put ${fact.divisor} in each equal group. How many groups can you make?`,
      correctAnswer: String(fact.quotient),
      visualType: "multiple_choice",
      problemKey: divisionModelProblemKey(fact, "counting-groups", "quotient"),
      visualData: {
        groups: fact.quotient,
        itemsPerGroup: fact.divisor,
        product: fact.dividend,
        equation: `${fact.dividend} ÷ ${fact.divisor} = ?`,
        choices: makeQuotientChoices(fact, rng),
      },
      answerData: {
        quotient: String(fact.quotient),
      },
    };
  });
}

function formatDivisionEquation(fact: DivisionFact): string {
  return `${fact.dividend} ÷ ${fact.divisor} = ${fact.quotient}`;
}

function getDivisionEquationDistractors(fact: DivisionFact): string[] {
  const wrongQuotients = getDivisionQuotientMisconceptionCandidates(fact).slice(0, 2);
  return [
    ...wrongQuotients.map((wrong) => `${fact.dividend} ÷ ${fact.divisor} = ${wrong}`),
    `${fact.dividend} ÷ ${fact.quotient} = ${fact.divisor}`,
    `${fact.dividend} - ${fact.divisor} = ${fact.quotient}`,
    `${fact.divisor} × ${fact.quotient} = ${fact.dividend}`,
  ];
}

export function generateWriteDivisionEquationsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "write_division_equations";
  const candidates = enumerateDivisionFacts().flatMap((fact) => [
    { fact, meaning: "sharing" as const },
    { fact, meaning: "counting-groups" as const },
  ]);
  const count = getTargetCount(options);
  validateCount(count, candidates.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(candidates).slice(0, count).map(({ fact, meaning }, index) => {
    const equation = formatDivisionEquation(fact);
    const situation = meaning === "sharing"
      ? `${fact.dividend} items are shared equally among ${fact.divisor} groups.`
      : `${fact.dividend} items are put into equal groups of ${fact.divisor}.`;

    return {
      id: `write-division-equations-${mode}-${index + 1}`,
      questionText: `Which division equation matches this situation? ${situation}`,
      correctAnswer: equation,
      visualType: "multiple_choice",
      problemKey: divisionModelProblemKey(fact, meaning, "equation"),
      visualData: {
        groups: meaning === "sharing" ? fact.divisor : fact.quotient,
        itemsPerGroup: meaning === "sharing" ? fact.quotient : fact.divisor,
        product: fact.dividend,
        equation,
        choices: buildChoices(equation, getDivisionEquationDistractors(fact), rng),
      },
      answerData: {
        quotient: String(fact.quotient),
      },
    };
  });
}

function getSpecialDistractors(state: DivisionSpecialState): Array<string | number> {
  if (state.rule === "divide-by-zero") {
    return [0, state.dividend, 1, state.dividend + 1];
  }
  if (state.rule === "zero-dividend") {
    return [state.divisor, 1, state.divisor - 1, state.divisor + 1];
  }
  return [1, 0, state.dividend - 1, state.dividend + 1];
}

function specialEquation(state: DivisionSpecialState): string {
  return `${state.dividend} ÷ ${state.divisor} = ?`;
}

export function generateDivisionWithOneAndZeroProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "division_with_1_and_0";
  const values = Array.from({ length: 8 }, (_, index) => index + 2);
  const buckets: DivisionSpecialState[][] = [
    values.map(createDivideByOneState),
    values.map(createZeroDividendState),
    values.map(createDivideByZeroState),
  ];
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const states = selectBalanced(buckets, count, rng);

  return states.map((state, index) => {
    const correct = getDivisionSpecialAnswer(state);
    return {
      id: `division-one-zero-${mode}-${index + 1}`,
      questionText: `Solve ${specialEquation(state)}${state.rule === "divide-by-zero" ? " Choose undefined if the operation is not defined." : ""}`,
      correctAnswer: String(correct),
      visualType: "multiple_choice",
      problemKey: divisionSpecialProblemKey(state),
      visualData: {
        equation: specialEquation(state),
        choices: buildChoices(correct, getSpecialDistractors(state), rng),
      },
      answerData: {
        quotient: String(correct),
      },
    };
  });
}

function enumerateArrayCandidates(): DivisionArrayCandidate[] {
  return enumerateDivisionFacts().flatMap((fact) => [
    { fact, knownDimension: "rows" as const },
    { fact, knownDimension: "columns" as const },
  ]);
}

export function generateDivisionArraysProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "division_arrays";
  const candidates = enumerateArrayCandidates();
  const count = getTargetCount(options);
  validateCount(count, candidates.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(candidates).slice(0, count).map(({ fact, knownDimension }, index) => {
    const knownLabel = knownDimension;
    const missingLabel = knownDimension === "rows" ? "columns" : "rows";
    const item = rng.pick(ARRAY_CONTEXTS);
    const rows = knownDimension === "rows" ? fact.divisor : fact.quotient;
    const columns = knownDimension === "columns" ? fact.divisor : fact.quotient;

    return {
      id: `division-arrays-${mode}-${index + 1}`,
      questionText: `An array has ${fact.dividend} ${item} arranged in ${fact.divisor} ${knownLabel}. How many ${missingLabel} does it have?`,
      correctAnswer: String(fact.quotient),
      visualType: "multiple_choice",
      problemKey: divisionArrayProblemKey(fact, knownDimension),
      visualData: {
        rows,
        columns,
        product: fact.dividend,
        equation: `${fact.dividend} ÷ ${fact.divisor} = ?`,
        choices: makeQuotientChoices(fact, rng),
      },
      answerData: {
        quotient: String(fact.quotient),
      },
    };
  });
}

export function generateDivisionNumberLineProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "division_number_line";
  const facts = enumerateDivisionFacts();
  const count = getTargetCount(options);
  validateCount(count, facts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(facts).slice(0, count).map((fact, index) => ({
    id: `division-number-line-${mode}-${index + 1}`,
    questionText: `Start at 0 and make equal jumps of ${fact.divisor} until you reach ${fact.dividend}. How many jumps do you make?`,
    correctAnswer: String(fact.quotient),
    visualType: "multiple_choice",
    problemKey: divisionModelProblemKey(fact, "number-line", "quotient"),
    visualData: {
      jumpCount: fact.quotient,
      jumpSize: fact.divisor,
      start: 0,
      endpoint: fact.dividend,
      equation: `${fact.dividend} ÷ ${fact.divisor} = ?`,
      choices: makeQuotientChoices(fact, rng),
    },
    answerData: {
      quotient: String(fact.quotient),
    },
  }));
}

function formatFactFamily(fact: DivisionFact): string {
  const a = Math.min(fact.divisor, fact.quotient);
  const b = Math.max(fact.divisor, fact.quotient);
  return `${a} × ${b} = ${fact.dividend}; ${b} × ${a} = ${fact.dividend}; ${fact.dividend} ÷ ${a} = ${b}; ${fact.dividend} ÷ ${b} = ${a}`;
}

function getFactFamilyDistractors(fact: DivisionFact): string[] {
  const a = Math.min(fact.divisor, fact.quotient);
  const b = Math.max(fact.divisor, fact.quotient);
  const product = fact.dividend;
  return [
    `${a} × ${b} = ${product}; ${b} × ${a} = ${product}; ${product} ÷ ${a} = ${a}; ${product} ÷ ${b} = ${b}`,
    `${a} + ${b} = ${product}; ${b} + ${a} = ${product}; ${product} - ${a} = ${b}; ${product} - ${b} = ${a}`,
    `${a} × ${b} = ${product + a}; ${b} × ${a} = ${product + a}; ${product + a} ÷ ${a} = ${b}; ${product + a} ÷ ${b} = ${a}`,
  ];
}

export function generateFactFamiliesProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "fact_families";
  const uniqueFacts = [
    ...new Map(
      enumerateDivisionFacts()
        .filter((fact) => fact.divisor !== fact.quotient)
        .map((fact) => [divisionFactFamilyProblemKey(fact), fact]),
    ).values(),
  ];
  const count = getTargetCount(options);
  validateCount(count, uniqueFacts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(uniqueFacts).slice(0, count).map((fact, index) => {
    const a = Math.min(fact.divisor, fact.quotient);
    const b = Math.max(fact.divisor, fact.quotient);
    const correct = formatFactFamily(fact);
    return {
      id: `fact-families-${mode}-${index + 1}`,
      questionText: `Which choice is the complete multiplication and division fact family for ${a}, ${b}, and ${fact.dividend}?`,
      correctAnswer: correct,
      visualType: "multiple_choice",
      problemKey: divisionFactFamilyProblemKey(fact),
      visualData: {
        factors: [a, b],
        product: fact.dividend,
        equations: correct.split("; "),
        choices: buildChoices(correct, getFactFamilyDistractors(fact), rng),
      },
      answerData: {
        factorA: String(a),
        factorB: String(b),
        product: String(fact.dividend),
      },
    };
  });
}

function getRelatedMultiplicationDistractors(fact: DivisionFact): string[] {
  const wrongQuotients = getDivisionQuotientMisconceptionCandidates(fact).slice(0, 2);
  return [
    ...wrongQuotients.map((wrong) => `${fact.divisor} × ${wrong} = ${fact.dividend}`),
    `${fact.divisor} × ${fact.quotient} = ${fact.dividend + fact.divisor}`,
    `${fact.divisor} + ${fact.quotient} = ${fact.dividend}`,
  ];
}

export function generateMultiplicationForDivisionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "multiplication_for_division";
  const facts = enumerateDivisionFacts();
  const count = getTargetCount(options);
  validateCount(count, facts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(facts).slice(0, count).map((fact, index) => {
    const related = `${fact.divisor} × ${fact.quotient} = ${fact.dividend}`;
    return {
      id: `multiplication-for-division-${mode}-${index + 1}`,
      questionText: `Which multiplication fact helps you solve ${fact.dividend} ÷ ${fact.divisor} = ?`,
      correctAnswer: related,
      visualType: "multiple_choice",
      problemKey: divisionModelProblemKey(fact, "related-multiplication", "equation"),
      visualData: {
        equation: `${fact.dividend} ÷ ${fact.divisor} = ?`,
        factors: [fact.divisor, fact.quotient],
        product: fact.dividend,
        choices: buildChoices(related, getRelatedMultiplicationDistractors(fact), rng),
      },
      answerData: {
        quotient: String(fact.quotient),
      },
    };
  });
}

function fixedDivisorPracticeType(divisor: FixedDivisor): DivisionPracticeType {
  return `divide_by_${divisor}` as DivisionPracticeType;
}

function generateFixedDivisorProblems(
  divisor: FixedDivisor,
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType = fixedDivisorPracticeType(divisor);
  const facts = enumerateFixedDivisorFacts(divisor);
  const count = getTargetCount(options);
  validateCount(count, facts.length, practiceType);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";

  return rng.shuffle(facts).slice(0, count).map((fact, index) => ({
    id: `${practiceType}-${mode}-${index + 1}`,
    questionText: `Use the related ×${divisor} fact. What is ${fact.dividend} ÷ ${divisor}?`,
    correctAnswer: String(fact.quotient),
    visualType: "multiple_choice",
    problemKey: divisionEquationProblemKey(fact, "quotient"),
    visualData: {
      equation: `${fact.dividend} ÷ ${divisor} = ?`,
      factors: [divisor, fact.quotient],
      product: fact.dividend,
      choices: makeQuotientChoices(fact, rng),
    },
    answerData: {
      quotient: String(fact.quotient),
    },
  }));
}

export function generateDivideBy6Problems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generateFixedDivisorProblems(6, options);
}

export function generateDivideBy7Problems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generateFixedDivisorProblems(7, options);
}

export function generateDivideBy8Problems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generateFixedDivisorProblems(8, options);
}

export function generateDivideBy9Problems(options?: PracticeGenerationOptions): PracticeProblem[] {
  return generateFixedDivisorProblems(9, options);
}

function enumerateMissingDivisionCandidates(): MissingDivisionCandidate[] {
  return enumerateDivisionFacts().flatMap((fact) => [
    { fact, role: "dividend" as const },
    { fact, role: "divisor" as const },
    { fact, role: "quotient" as const },
  ]);
}

function formatMissingDivisionEquation(fact: DivisionFact, role: DivisionUnknownRole): string {
  const dividend = role === "dividend" ? "?" : String(fact.dividend);
  const divisor = role === "divisor" ? "?" : String(fact.divisor);
  const quotient = role === "quotient" ? "?" : String(fact.quotient);
  return `${dividend} ÷ ${divisor} = ${quotient}`;
}

export function generateMissingNumbersDivisionProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const practiceType: DivisionPracticeType = "missing_numbers_division";
  const all = enumerateMissingDivisionCandidates();
  const buckets = (["dividend", "divisor", "quotient"] as const).map((role) =>
    all.filter((candidate) => candidate.role === role),
  );
  const count = getTargetCount(options);
  const rng = createSeededRng(getSeed(practiceType, options));
  const mode = options?.mode ?? "guided";
  const candidates = selectBalanced(buckets, count, rng);

  return candidates.map(({ fact, role }, index) => {
    const correct = getDivisionAnswer(fact, role);
    const equation = formatMissingDivisionEquation(fact, role);
    return {
      id: `missing-numbers-division-${mode}-${index + 1}`,
      questionText: `Find the missing ${role}: ${equation}`,
      correctAnswer: String(correct),
      visualType: "multiple_choice",
      problemKey: divisionEquationProblemKey(fact, role),
      visualData: {
        equation,
        choices: buildChoices(
          correct,
          getDivisionMissingRoleMisconceptionCandidates(fact, role),
          rng,
        ),
      },
      answerData: {
        quotient: role === "quotient" ? String(fact.quotient) : undefined,
      },
    };
  });
}
