import {
  createExpandedFormProblem,
  EXPANDED_FORM_RANGES,
  formatExpandedForm,
  generateExpandedFormProblem,
  type ExpandedFormPracticeType,
  type ExpandedFormProblem,
  type ExpandedFormTerm,
} from "../lib/placeValue/numberForms";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createPracticeSessionSeed, createSeededRng, type SeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";

const CHOICE_COUNT = 4;
const MAX_PROBLEM_GENERATION_ATTEMPTS = 200;

function getPracticeType(options?: PracticeGenerationOptions): ExpandedFormPracticeType {
  return options?.lesson?.practice_type === "expanded_form_large"
    ? "expanded_form_large"
    : "expanded_form";
}

function buildSeed(
  options: PracticeGenerationOptions | undefined,
  practiceType: ExpandedFormPracticeType,
  mode: string,
): string {
  if (options?.seed !== undefined) return String(options.seed);
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return createPracticeSessionSeed(lessonId, practiceType, mode);
}

function formatCandidateTerms(terms: ExpandedFormTerm[]): string {
  return formatExpandedForm([...terms].sort((left, right) => right.value - left.value));
}

function getMisconceptionTermSets(problem: ExpandedFormProblem): ExpandedFormTerm[][] {
  const candidates: ExpandedFormTerm[][] = [];
  for (let index = 0; index < problem.terms.length; index += 1) {
    const omitted = problem.terms.filter((_, termIndex) => termIndex !== index);
    if (omitted.length > 0) candidates.push(omitted);

    const term = problem.terms[index];
    const adjacentPlace = term.placeValue === 1 ? 10 : term.placeValue / 10;
    candidates.push(problem.terms.map((current, termIndex) =>
      termIndex === index
        ? { ...current, placeValue: adjacentPlace, value: current.digit * adjacentPlace }
        : current,
    ));

    for (const digitChange of [-1, 1]) {
      const digit = term.digit + digitChange;
      if (digit > 0 && digit <= 9) {
        candidates.push(problem.terms.map((current, termIndex) =>
          termIndex === index
            ? { ...current, digit, value: digit * current.placeValue }
            : current,
        ));
      }
    }
  }
  return candidates;
}

function getDistractorNumbers(problem: ExpandedFormProblem): number[] {
  const range = EXPANDED_FORM_RANGES[problem.practiceType];
  const candidates = new Set<number>();
  for (const terms of getMisconceptionTermSets(problem)) {
    const number = terms.reduce((sum, term) => sum + term.value, 0);
    if (Number.isInteger(number) && number >= 0 && number <= range.max && number !== problem.sourceNumber) {
      candidates.add(number);
    }
  }

  for (let offset = 1; candidates.size < CHOICE_COUNT - 1; offset += 1) {
    for (const number of [problem.sourceNumber - offset, problem.sourceNumber + offset]) {
      if (number >= range.min && number <= range.max && number !== problem.sourceNumber) {
        candidates.add(number);
      }
    }
  }
  return [...candidates];
}

function getDistractorExpandedForms(problem: ExpandedFormProblem): string[] {
  const candidates = new Set<string>();
  for (const terms of getMisconceptionTermSets(problem)) {
    const number = terms.reduce((sum, term) => sum + term.value, 0);
    const answer = formatCandidateTerms(terms);
    if (answer && number !== problem.sourceNumber) candidates.add(answer);
  }

  for (let offset = 1; candidates.size < CHOICE_COUNT - 1; offset += 1) {
    for (const number of [problem.sourceNumber - offset, problem.sourceNumber + offset]) {
      if (number >= EXPANDED_FORM_RANGES[problem.practiceType].min
        && number <= EXPANDED_FORM_RANGES[problem.practiceType].max) {
        candidates.add(createExpandedFormProblem(
          problem.practiceType,
          number,
          "standard_to_expanded",
        ).expandedForm);
      }
    }
  }
  return [...candidates];
}

function buildChoices(problem: ExpandedFormProblem, rng: SeededRng): string[] {
  const distractors = problem.direction === "standard_to_expanded"
    ? getDistractorExpandedForms(problem)
    : getDistractorNumbers(problem).map(String);
  const choices = rng.shuffle([
    problem.correctAnswer,
    ...rng.shuffle(distractors).slice(0, CHOICE_COUNT - 1),
  ]);
  if (new Set(choices).size !== CHOICE_COUNT) {
    throw new Error("Could not build four unique expanded-form choices");
  }
  return choices;
}

function buildPracticeProblem(
  problem: ExpandedFormProblem,
  mode: string,
  index: number,
  rng: SeededRng,
): PracticeProblem {
  const questionText = problem.direction === "standard_to_expanded"
    ? `Write ${problem.sourceNumber.toLocaleString("en-US")} in expanded form.`
    : `What number is ${problem.expandedForm}?`;
  return {
    id: `expanded-form-${problem.practiceType}-${mode}-${index + 1}`,
    questionText,
    correctAnswer: problem.correctAnswer,
    visualType: "multiple_choice",
    problemKey: problem.problemKey,
    visualData: { choices: buildChoices(problem, rng) },
  };
}

export function generateExpandedFormProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const mode = options?.mode ?? "guided";
  const practiceType = getPracticeType(options);
  const count = getPracticeProblemCount(options);
  const baseSeed = buildSeed(options, practiceType, mode);
  const usedKeys = new Set<string>();
  const problems: PracticeProblem[] = [];

  for (let index = 0; index < count; index += 1) {
    let generated: PracticeProblem | undefined;
    for (let attempt = 0; attempt < MAX_PROBLEM_GENERATION_ATTEMPTS; attempt += 1) {
      const rng = createSeededRng(`${baseSeed}:${index}:${attempt}`);
      const canonical = generateExpandedFormProblem(practiceType, rng);
      if (usedKeys.has(canonical.problemKey)) continue;
      usedKeys.add(canonical.problemKey);
      generated = buildPracticeProblem(canonical, mode, index, rng);
      break;
    }
    if (!generated) {
      throw new Error(
        `Could not generate a unique ${practiceType} problem within ${MAX_PROBLEM_GENERATION_ATTEMPTS} attempts`,
      );
    }
    problems.push(generated);
  }
  return problems;
}
