import { generateBankedProblems } from "./generateBankedProblems";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function makeFactorProductProblem({
  id,
  factorA,
  factorB,
}: {
  id: string;
  factorA: number;
  factorB: number;
}): PracticeProblem {
  const product = factorA * factorB;

  return {
    id,
    questionText: `In the equation ${factorA} × ${factorB} = ${product}, what are the factors and what is the product?`,
    correctAnswer: `${factorA},${factorB},${product}`,
    visualType: "factor_product",
    problemKey: `${factorA}x${factorB}-factor-product`,
    visualData: {
      equation: `${factorA} × ${factorB} = ${product}`,
      factors: [factorA, factorB],
      product,
    },
    answerData: {
      factorA: String(factorA),
      factorB: String(factorB),
      product: String(product),
    },
  };
}

const factorProductBank = [
  [3, 4],
  [5, 2],
  [1, 8],
  [6, 3],
  [4, 5],
  [2, 7],
  [8, 1],
  [3, 6],
  [5, 5],
  [9, 2],
  [7, 3],
  [4, 4],
] as const;

const factorProductChallengeBank = [
  [6, 4],
  [7, 3],
  [8, 2],
  [5, 6],
  [9, 3],
  [4, 7],
  [6, 6],
  [8, 5],
  [7, 4],
  [9, 2],
] as const;

export function generateFactorProductProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  return generateBankedProblems<readonly [number, number]>({
    slug: "factor-product",
    bank: factorProductBank,
    challengeBank: factorProductChallengeBank,
    options,
    build: ([factorA, factorB], { id }) => makeFactorProductProblem({ id, factorA, factorB }),
  });
}
