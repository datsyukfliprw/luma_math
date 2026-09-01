import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

function factorFromPracticeType(practiceType: string): number | undefined {
  const match = practiceType.match(/multiply_by_(\d+)/);
  if (match) return Number(match[1]);
  const divMatch = practiceType.match(/divide_by_(\d+)/);
  if (divMatch) return Number(divMatch[1]);
  return undefined;
}

export const multiplicationFactsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;
  const fixedFactor = factorFromPracticeType(ctx.practiceType);

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const a = fixedFactor ?? ctx.rng.nextInt(2, 9);
    const b = ctx.rng.nextInt(2, 9);
    const product = a * b;
    let prompt: string;
    let correct: string;
    let choices: string[] | undefined;
    let form = "product";
    let extra = "";

    if (
      ctx.practiceType.startsWith("multiply_by_") ||
      ctx.practiceType === "mixed_multiplication_facts"
    ) {
      prompt = `What is ${a} × ${b}?`;
      correct = String(product);
      form = "product";
      choices = buildNumberChoices(product, 0, 81, ctx.rng);
    } else if (ctx.practiceType.startsWith("divide_by_")) {
      prompt = `What is ${product} ÷ ${a}?`;
      correct = String(b);
      form = "quotient";
      choices = buildNumberChoices(b, 0, 9, ctx.rng);
    } else if (ctx.practiceType === "missing_factors") {
      const missingFirst = ctx.rng.nextInt(0, 1) === 0;
      prompt = missingFirst
        ? `? × ${b} = ${product}. What is the missing factor?`
        : `${a} × ? = ${product}. What is the missing factor?`;
      correct = missingFirst ? String(a) : String(b);
      form = missingFirst ? "missing_first" : "missing_second";
      choices = buildNumberChoices(Number(correct), 0, 9, ctx.rng);
      extra = `pos:${missingFirst ? "first" : "second"}`;
    } else if (
      ctx.practiceType === "one_digit_by_multiples_of_ten" ||
      ctx.practiceType === "multiples_of_ten_basic_facts" ||
      ctx.practiceType.startsWith("multiples_of_ten")
    ) {
      const multiple = ctx.rng.nextInt(1, 9) * 10;
      const factor = fixedFactor ?? ctx.rng.nextInt(2, 9);
      prompt = `What is ${factor} × ${multiple}?`;
      correct = String(factor * multiple);
      form = "multiple_of_ten";
      choices = buildNumberChoices(Number(correct), 0, 1000, ctx.rng);
      extra = `multiple:${multiple}`;
    } else if (ctx.practiceType === "place_value_patterns") {
      const n = ctx.rng.nextInt(2, 9);
      const zeros = ctx.rng.nextInt(1, 2) * 10;
      prompt = `What is ${n} × ${zeros}?`;
      correct = String(n * zeros);
      form = "place_value_pattern";
      choices = buildNumberChoices(Number(correct), 0, 1000, ctx.rng);
      extra = `zeros:${zeros}`;
    } else if (ctx.practiceType === "commutative_multiplication") {
      prompt = `${a} × ${b} = ?`;
      correct = String(product);
      form = "commutative";
      choices = buildNumberChoices(product, 0, 81, ctx.rng);
    } else if (ctx.practiceType === "associative_multiplication") {
      const c = ctx.rng.nextInt(2, 5);
      prompt = `(${a} × ${b}) × ${c} = ?`;
      correct = String(a * b * c);
      form = "associative";
      choices = buildNumberChoices(Number(correct), 0, 200, ctx.rng);
      extra = `c:${c}`;
    } else if (ctx.practiceType === "choose_strategy") {
      prompt = `What is the easiest way to find ${a} × ${b}?`;
      correct = "Use a fact you know";
      form = "strategy";
      choices = ctx.rng.shuffle(["Use a fact you know", "Count by ones", "Guess"]);
    } else {
      prompt = `What is ${a} × ${b}?`;
      correct = String(product);
      choices = buildNumberChoices(product, 0, 81, ctx.rng);
    }

    const key = mathProblemKey(ctx.practiceType, a, b, form, extra);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-mult-facts-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "⭐",
        choices,
      }),
    );
  }

  return problems;
};
