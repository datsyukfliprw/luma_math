import { takePracticeProblems } from "./practiceModeCounts";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { createMultiplicationFact, factorTermsProblemKey } from "../lib/multiplication/core";

function makeFactorProductProblem({
  id,
  factorA,
  factorB,
}: {
  id: string;
  factorA: number;
  factorB: number;
}): PracticeProblem {
  const fact = createMultiplicationFact(factorA, factorB);

  return {
    id,
    questionText: `In the equation ${fact.factorA} × ${fact.factorB} = ${fact.product}, what are the factors and what is the product?`,
    correctAnswer: `${fact.factorA},${fact.factorB},${fact.product}`,
    visualType: "factor_product",
    problemKey: factorTermsProblemKey(fact, "both"),
    visualData: {
      equation: `${fact.factorA} × ${fact.factorB} = ${fact.product}`,
      factors: [fact.factorA, fact.factorB],
      product: fact.product,
    },
    answerData: {
      factorA: String(fact.factorA),
      factorB: String(fact.factorB),
      product: String(fact.product),
    },
  };
}

const factorProductBank = [
  [3, 4],
  [5, 2],
  [1, 8],
  [6, 3],
  [3, 8],
  [2, 7],
  [4, 6],
  [2, 9],
  [5, 5],
  [7, 8],
  [7, 3],
  [4, 4],
] as const;

const factorProductChallengeBank = [
  [6, 4],
  [7, 3],
  [8, 2],
  [5, 6],
  [9, 3],
  [3, 5],
  [6, 6],
  [8, 5],
  [7, 4],
  [9, 2],
] as const;

export function generateFactorProductProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const source = options?.mode === "challenge" ? factorProductChallengeBank : factorProductBank;

  return takePracticeProblems(
    source.map(([factorA, factorB], index) =>
      makeFactorProductProblem({
        id: `factor-product-${options?.mode ?? "guided"}-${index + 1}`,
        factorA,
        factorB,
      }),
    ),
    options,
  );
}
