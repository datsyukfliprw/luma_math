import { generateArrayRowsColumnsProblems } from "./arrayRowsColumns";
import { generateCommutativePropertyProblems } from "./commutativeProperty";
import { generateDrawArraysProblems } from "./drawArrays";
import { generateValidInvalidArraysProblems } from "./validInvalidArrays";
import type { PracticeProblem } from "./types";

export function generateWeek2EvaluationProblems(): PracticeProblem[] {
  const arrayRowsColumns = generateArrayRowsColumnsProblems();
  const commutativeProperty = generateCommutativePropertyProblems();
  const drawArrays = generateDrawArraysProblems();
  const validInvalidArrays = generateValidInvalidArraysProblems();

  return [
    arrayRowsColumns[0],
    commutativeProperty[0],
    drawArrays[0],
    validInvalidArrays[0],
    arrayRowsColumns[1],
    commutativeProperty[1],
    drawArrays[1],
    validInvalidArrays[1],
    arrayRowsColumns[2],
    commutativeProperty[2],
    drawArrays[2],
    validInvalidArrays[2],
  ];
}
