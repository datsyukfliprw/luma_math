import type { PracticeProblem } from './types'

export function generateFactorProductProblems(): PracticeProblem[] {
  return [
    {
      id: 'factor-product-1',
      questionText:
        'In the equation 3 × 4 = 12, what are the factors and what is the product?',
      correctAnswer: '3,4,12',
      visualType: 'factor_product',
      problemKey: '3x4-factor-product',
      visualData: {
        equation: '3 × 4 = 12',
        factors: [3, 4],
        product: 12,
      },
      answerData: {
        factorA: '3',
        factorB: '4',
        product: '12',
      },
    },
    {
      id: 'factor-product-2',
      questionText:
        'In the equation 5 × 2 = 10, what are the factors and what is the product?',
      correctAnswer: '5,2,10',
      visualType: 'factor_product',
      problemKey: '5x2-factor-product',
      visualData: {
        equation: '5 × 2 = 10',
        factors: [5, 2],
        product: 10,
      },
      answerData: {
        factorA: '5',
        factorB: '2',
        product: '10',
      },
    },
    {
      id: 'factor-product-3',
      questionText:
        'In the equation 1 × 8 = 8, what are the factors and what is the product?',
      correctAnswer: '1,8,8',
      visualType: 'factor_product',
      problemKey: '1x8-factor-product',
      visualData: {
        equation: '1 × 8 = 8',
        factors: [1, 8],
        product: 8,
      },
      answerData: {
        factorA: '1',
        factorB: '8',
        product: '8',
      },
    },
  ]
}
