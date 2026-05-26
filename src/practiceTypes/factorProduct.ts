import type { PracticeProblem } from './types'

export function generateFactorProductProblems(): PracticeProblem[] {
  return [
    {
      id: 'factor-product-1',
      questionText:
        'In the equation 3 × 4 = 12, what are the factors and what is the product?',
      correctAnswer: 'factors: 3 and 4, product: 12',
      visualType: 'factor_product',
      problemKey: '3x4-factor-product',
    },
    {
      id: 'factor-product-2',
      questionText:
        'In the equation 5 × 2 = 10, what are the factors and what is the product?',
      correctAnswer: 'factors: 5 and 2, product: 10',
      visualType: 'factor_product',
      problemKey: '5x2-factor-product',
    },
    {
      id: 'factor-product-3',
      questionText:
        'In the equation 1 × 8 = 8, what are the factors and what is the product?',
      correctAnswer: 'factors: 1 and 8, product: 8',
      visualType: 'factor_product',
      problemKey: '1x8-factor-product',
    },
  ]
}
