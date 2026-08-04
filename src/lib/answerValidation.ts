/**
 * Normalize a text answer for comparison.
 * Trims, lowercases, removes spaces, and normalizes multiplication symbols
 * (× and *) to 'x' so equations like "5 × 1 = 5" and "5x1 = 5" match.
 * Keep commas and hyphens intact for number-word answers.
 */
export function normalizeTextAnswer(answer: string): string {
  return answer.trim().toLowerCase().replaceAll(" ", "").replaceAll("×", "x").replaceAll("*", "x");
}

/**
 * Normalize a numeric answer for comparison.
 * Removes commas and whitespace so forms like 3,000, 3000, and " 3000 "
 * are treated as the same value.
 */
export function normalizeNumericAnswer(answer: string): string {
  return answer.replace(/[,\s]/g, "");
}
