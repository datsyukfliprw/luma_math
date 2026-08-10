import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

export const genericFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 100) {
    attempts += 1;
    const a = ctx.rng.nextInt(2, 20);
    const b = ctx.rng.nextInt(2, 10);
    const total = a * b;
    const key = mathProblemKey("generic", a, b, "product");

    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-generic-${problems.length + 1}`,
        problemKey: key,
        prompt: `What is ${a} × ${b}?`,
        correctAnswer: String(total),
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${a} × ${b} = ${total}.`,
        choices: buildNumberChoices(total, 0, 200, ctx.rng),
      }),
    );
  }

  return problems;
};
