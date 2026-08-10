import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

export const divisionFoundationsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 100) {
    attempts += 1;
    let groups = ctx.rng.nextInt(2, 9);
    const quotient = ctx.rng.nextInt(2, 9);
    let total = groups * quotient;
    let form = "quotient";

    let prompt = `${total} items are shared equally among ${groups} groups. How many items are in each group?`;
    let correct = String(quotient);

    if (ctx.practiceType === "division_with_1_and_0") {
      const caseType = ctx.rng.pick(["zero", "one_divisor", "same"]);
      let dividend: number;
      if (caseType === "zero") {
        dividend = 0;
        groups = ctx.rng.nextInt(2, 9);
        correct = "0";
        form = "zero_dividend";
      } else if (caseType === "one_divisor") {
        dividend = ctx.rng.nextInt(2, 9);
        groups = 1;
        correct = String(dividend);
        form = "one_divisor";
      } else {
        groups = ctx.rng.nextInt(2, 9);
        dividend = groups;
        correct = "1";
        form = "same_number";
      }
      total = dividend;
      prompt = `${dividend} ÷ ${groups} = ?`;
    } else if (ctx.practiceType === "fact_families") {
      prompt = `Which fact is in the same family as ${groups} × ${quotient} = ${total}?`;
      correct = `${total} ÷ ${groups} = ${quotient}`;
      form = "fact_family";
    } else if (ctx.practiceType === "missing_numbers_division") {
      const missing = ctx.rng.pick(["dividend", "divisor", "quotient"]);
      if (missing === "dividend") {
        prompt = `? ÷ ${groups} = ${quotient}`;
        correct = String(total);
      } else if (missing === "divisor") {
        prompt = `${total} ÷ ? = ${quotient}`;
        correct = String(groups);
      } else {
        prompt = `${total} ÷ ${groups} = ?`;
        correct = String(quotient);
      }
      form = `missing_${missing}`;
    } else if (ctx.practiceType === "multiplication_for_division") {
      prompt = `To find ${total} ÷ ${groups}, think of the multiplication fact ${groups} × ? = ${total}. What is the answer?`;
      correct = String(quotient);
      form = "multiplication_for_division";
    } else if (ctx.practiceType === "division_number_line") {
      prompt = `Jump backward in groups of ${groups} from ${total}. How many jumps?`;
      correct = String(quotient);
      form = "number_line";
    } else if (ctx.practiceType === "division_arrays") {
      prompt = `${total} dots are arranged in ${groups} equal rows. How many dots in each row?`;
      correct = String(quotient);
      form = "array";
    } else if (ctx.practiceType === "division_counting_groups") {
      prompt = `How many groups of ${groups} can you make from ${total}?`;
      correct = String(quotient);
      form = "counting_groups";
    }

    const key = mathProblemKey(ctx.practiceType, total, groups, form);

    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    let choices: string[] | undefined;
    if (!Number.isNaN(Number(correct))) {
      const numericMax = ctx.practiceType === "division_with_1_and_0" ? Math.max(9, total) : total;
      choices = buildNumberChoices(Number(correct), 0, numericMax, ctx.rng);
    } else {
      const set = new Set([
        correct,
        `${groups} × ${quotient} = ${total}`,
        `${total} ÷ ${quotient} = ${groups}`,
      ]);
      while (set.size < 3) {
        const extraA = ctx.rng.nextInt(2, 9);
        const extraB = ctx.rng.nextInt(2, 9);
        set.add(`${extraA} × ${extraB} = ${extraA * extraB}`);
      }
      choices = ctx.rng.shuffle([...set].slice(0, 3));
    }

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-division-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${correct} is correct.`,
        visualEmoji: "🍎",
        choices,
      }),
    );
  }

  return problems;
};
