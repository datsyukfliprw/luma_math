/**
 * Normalize a text answer for comparison.
 * Trims, lowercases, removes spaces, and normalizes multiplication symbols
 * (× and *) to 'x', and division symbols (/) to '÷', so equivalent equations
 * use the same representation.
 * Keep commas and hyphens intact for number-word answers.
 */
export function normalizeTextAnswer(answer: string): string {
  return answer
    .trim()
    .toLowerCase()
    .replaceAll(" ", "")
    .replaceAll("×", "x")
    .replaceAll("*", "x")
    .replaceAll("/", "÷");
}

/**
 * Normalize a numeric answer for comparison.
 * Removes commas and whitespace so forms like 3,000, 3000, and " 3000 "
 * are treated as the same value.
 */
export function normalizeNumericAnswer(answer: string): string {
  return answer.replace(/[,\s]/g, "");
}
