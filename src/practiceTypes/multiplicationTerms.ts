import {
  FACTOR_RANGE,
  factorTermsProblemKey,
  getFactorProductMisconceptionCandidates,
  createMultiplicationFact,
  type FactorProductTerms,
  type MultiplicationFact,
} from "../lib/multiplication/core";
import { createPracticeSessionSeed, createSeededRng } from "./random";
import { getPracticeProblemCount } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function getSeed(options: PracticeGenerationOptions | undefined): string | number {
  const practiceType = "factors_and_products";
  const mode = options?.mode ?? "guided";
  const lessonId = options?.lesson?.lesson_id ?? practiceType;
  return options?.seed ?? createPracticeSessionSeed(lessonId, practiceType, mode);
}

function serializeTerms(terms: FactorProductTerms): string {
  return `${terms.factorA},${terms.factorB},${terms.product}`;
}

function buildChoices(fact: MultiplicationFact, rng: ReturnType<typeof createSeededRng>): string[] {
  const correct = serializeTerms(fact);
  const distractors = getFactorProductMisconceptionCandidates(fact).slice(0, 3);
  if (distractors.length < 3) throw new Error("Terms core did not provide enough distractors");
  return rng.shuffle([correct, ...distractors.map(serializeTerms)]);
}

function makeProblem(
  fact: MultiplicationFact,
  index: number,
  mode: string,
  rng: ReturnType<typeof createSeededRng>,
): PracticeProblem {
  return {
    id: `factors-and-products-${mode}-${index + 1}`,
    questionText: `In the equation ${fact.factorA} × ${fact.factorB} = ${fact.product}, what are the factors and what is the product?`,
    correctAnswer: serializeTerms(fact),
    visualType: "factor_product",
    problemKey: factorTermsProblemKey(fact, "both"),
    visualData: {
      equation: `${fact.factorA} × ${fact.factorB} = ${fact.product}`,
      factors: [fact.factorA, fact.factorB],
      product: fact.product,
      choices: buildChoices(fact, rng),
    },
    answerData: {
      factorA: String(fact.factorA),
      factorB: String(fact.factorB),
      product: String(fact.product),
    },
  };
}

export function generateFactorsAndProductsProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const rng = createSeededRng(getSeed(options));
  const count = getPracticeProblemCount(options);
  const candidates: MultiplicationFact[] = [];

  for (let factorA = FACTOR_RANGE.min; factorA <= FACTOR_RANGE.max; factorA += 1) {
    for (let factorB = FACTOR_RANGE.min; factorB <= FACTOR_RANGE.max; factorB += 1) {
      candidates.push(createMultiplicationFact(factorA, factorB));
    }
  }

  const uniqueCandidates = [...new Map(candidates.map((fact) => [factorTermsProblemKey(fact, "both"), fact])).values()];

  if (count > uniqueCandidates.length) throw new RangeError("Requested count exceeds factor state space");
  return rng.shuffle(uniqueCandidates).slice(0, count).map((fact, index) =>
    makeProblem(fact, index, options?.mode ?? "guided", rng),
  );
}

export const generateMultiplicationTermsProblems = generateFactorsAndProductsProblems;
