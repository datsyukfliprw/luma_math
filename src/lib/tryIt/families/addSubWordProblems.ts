import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

export const addSubWordProblemsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;
  const nouns = ["apples", "books", "stickers", "crayons", "marbles", "cookies", "toys", "pencils"];

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const a = ctx.rng.nextInt(2, 50);
    const b = ctx.rng.nextInt(2, 50);
    const noun = ctx.rng.pick(nouns);
    let prompt = "";
    let correct = "";
    let form = "";

    if (ctx.practiceType === "choose_operation") {
      const isAdd = ctx.rng.nextInt(0, 1) === 1;
      const second = isAdd ? b : ctx.rng.nextInt(2, a);
      prompt = isAdd
        ? `Maya has ${a} ${noun} and finds ${second} more. Which operation finds the total?`
        : `Maya has ${a} ${noun} and gives away ${second}. Which operation finds how many are left?`;
      correct = isAdd ? "Addition" : "Subtraction";
      form = "operation";
    } else if (
      ctx.practiceType === "one_step_word_problems" ||
      ctx.practiceType === "estimate_then_solve"
    ) {
      const isAdd = ctx.rng.nextInt(0, 1) === 1;
      const second = isAdd ? b : ctx.rng.nextInt(2, a);
      const sum = a + second;
      const diff = a - second;
      prompt = isAdd
        ? `There are ${a} ${noun} on one table and ${second} on another. How many ${noun} are there in all?`
        : `There are ${a} ${noun}. ${second} are taken away. How many are left?`;
      correct = String(isAdd ? sum : diff);
      form = isAdd ? "add" : "subtract";
    } else if (
      ctx.practiceType === "two_step_unknowns" ||
      ctx.practiceType === "two_step_measurement_equations"
    ) {
      const c = ctx.rng.nextInt(2, 20);
      const sum = a + b + c;
      prompt = `There are three groups of ${noun}: ${a}, ${b}, and ${c}. How many ${noun} are there in all?`;
      correct = String(sum);
      form = "three_addends";
    } else {
      const sum = a + b;
      prompt = `There are ${a} ${noun} on one table and ${b} on another. How many ${noun} are there in all?`;
      correct = String(sum);
      form = "add";
    }

    const key = mathProblemKey(ctx.practiceType, a, b, form);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    const correctNum = Number(correct);
    const choices = Number.isNaN(correctNum)
      ? ctx.rng.shuffle([correct, "Multiplication", "Division"])
      : buildNumberChoices(correctNum, 0, a + b + 20, ctx.rng);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-addsub-word-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "✏️",
        choices,
      }),
    );
  }

  return problems;
};
