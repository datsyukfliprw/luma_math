import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

function isInFactFamily(
  groups: number,
  quotient: number,
  total: number,
  equation: string,
): boolean {
  const a = groups;
  const b = quotient;
  const c = total;

  const mulMatch = equation.match(/^(\d+) × (\d+) = (\d+)$/);
  if (mulMatch) {
    const x = Number(mulMatch[1]);
    const y = Number(mulMatch[2]);
    const z = Number(mulMatch[3]);
    return x * y === z && z === c && ((x === a && y === b) || (x === b && y === a));
  }

  const divMatch = equation.match(/^(\d+) ÷ (\d+) = (\d+)$/);
  if (divMatch) {
    const x = Number(divMatch[1]);
    const y = Number(divMatch[2]);
    const z = Number(divMatch[3]);
    return y !== 0 && y * z === x && x === c && ((y === a && z === b) || (y === b && z === a));
  }

  return false;
}

function buildFactFamilyChoices(
  groups: number,
  quotient: number,
  total: number,
  rng: { shuffle<T>(items: readonly T[]): T[] },
): string[] {
  const correct = `${total} ÷ ${groups} = ${quotient}`;

  const distractorPool = [
    `${total} ÷ ${groups} = ${quotient + 1}`,
    `${total + 1} ÷ ${groups} = ${quotient}`,
    `${groups} × ${quotient} = ${total + 1}`,
    `${groups + 1} × ${quotient} = ${total}`,
    `${groups} × ${quotient + 1} = ${total}`,
  ];

  const wrongs = distractorPool.filter(
    (eq) => eq !== correct && !isInFactFamily(groups, quotient, total, eq),
  );

  const chosen = rng.shuffle(wrongs).slice(0, 2);
  return rng.shuffle([correct, ...chosen]);
}

function buildDivisionEquationChoices(
  total: number,
  divisor: number,
  quotient: number,
  rng: { shuffle<T>(items: readonly T[]): T[] },
): string[] {
  const correct = `${total} ÷ ${divisor} = ${quotient}`;
  const pool = [
    `${total} ÷ ${quotient} = ${divisor}`,
    `${divisor} × ${quotient} = ${total}`,
    `${total} ÷ ${divisor} = ${quotient + 1}`,
    `${total + 1} ÷ ${divisor} = ${quotient}`,
  ].filter((eq) => eq !== correct);

  const wrongs = rng.shuffle(pool).slice(0, 2);
  return rng.shuffle([correct, ...wrongs]);
}

function buildDivisionByZeroChoices(rng: { shuffle<T>(items: readonly T[]): T[] }): string[] {
  return rng.shuffle(["undefined", "0", "1"]);
}

export const divisionFoundationsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    let groups = ctx.rng.nextInt(2, 9);
    let quotient = ctx.rng.nextInt(2, 9);
    let total = groups * quotient;
    let divisor = groups;
    let form = "quotient";
    let caseType = "";

    let prompt = `${total} items are shared equally among ${groups} groups. How many items are in each group?`;
    let correct = String(quotient);

    if (ctx.practiceType === "division_with_1_and_0") {
      const cases = ["zero", "one_divisor", "same"];
      caseType = problems.length === 0 ? "div_by_zero" : ctx.rng.pick(cases);

      let dividend: number;
      if (caseType === "div_by_zero") {
        dividend = ctx.rng.nextInt(1, 9);
        groups = 0;
        divisor = 0;
        quotient = 0;
        correct = "undefined";
        form = "div_by_zero";
      } else if (caseType === "zero") {
        dividend = 0;
        groups = ctx.rng.nextInt(2, 9);
        divisor = groups;
        quotient = 0;
        correct = "0";
        form = "zero_dividend";
      } else if (caseType === "one_divisor") {
        dividend = ctx.rng.nextInt(2, 9);
        groups = 1;
        divisor = 1;
        quotient = dividend;
        correct = String(dividend);
        form = "one_divisor";
      } else {
        groups = ctx.rng.nextInt(2, 9);
        dividend = groups;
        divisor = groups;
        quotient = 1;
        correct = "1";
        form = "same_number";
      }
      total = dividend;
      prompt = `${dividend} ÷ ${groups} = ?`;
    } else if (ctx.practiceType === "write_division_equations") {
      const mode = ctx.rng.pick(["sharing", "grouping"]);
      if (mode === "sharing") {
        const numGroups = ctx.rng.nextInt(2, 9);
        const q = ctx.rng.nextInt(2, 9);
        total = numGroups * q;
        groups = numGroups;
        divisor = numGroups;
        quotient = q;
        prompt = `${total} items are shared equally among ${numGroups} groups. Write the division equation for this situation.`;
      } else {
        const size = ctx.rng.nextInt(2, 9);
        const q = ctx.rng.nextInt(2, 9);
        total = size * q;
        groups = q;
        divisor = size;
        quotient = q;
        prompt = `${total} items are put into groups of ${size}. Write the division equation for this situation.`;
      }
      correct = `${total} ÷ ${divisor} = ${quotient}`;
      form = `write_${mode}`;
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

    const key = mathProblemKey(ctx.practiceType, total, divisor, form);

    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    let choices: string[] | undefined;
    if (caseType === "div_by_zero") {
      choices = buildDivisionByZeroChoices(ctx.rng);
    } else if (ctx.practiceType === "write_division_equations") {
      choices = buildDivisionEquationChoices(total, divisor, quotient, ctx.rng);
    } else if (ctx.practiceType === "fact_families") {
      choices = buildFactFamilyChoices(groups, quotient, total, ctx.rng);
    } else if (!Number.isNaN(Number(correct))) {
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
