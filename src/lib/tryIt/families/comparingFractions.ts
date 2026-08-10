import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem, mathProblemKey } from "../buildTryItProblem";

function compareSymbol(a: number, b: number): string {
  if (a < b) return "<";
  if (a > b) return ">";
  return "=";
}

function compareWord(a: number, b: number): string {
  if (a < b) return "less than";
  if (a > b) return "greater than";
  return "equal to";
}

export const comparingFractionsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  const likeDenominator =
    ctx.practiceType.includes("like_denominators") ||
    ctx.practiceType === "use_comparison_symbols" ||
    ctx.lesson.skills.includes("like_denominators");
  const likeNumerator =
    ctx.practiceType.includes("like_numerators") || ctx.lesson.skills.includes("like_numerators");

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    let aNum: number;
    let aDen: number;
    let bNum: number;
    let bDen: number;

    if (likeDenominator) {
      aDen = ctx.rng.nextInt(2, 9);
      aNum = ctx.rng.nextInt(1, aDen - 1);
      bNum = ctx.rng.nextInt(1, aDen - 1);
      if (aNum === bNum) continue;
      bDen = aDen;
    } else if (likeNumerator) {
      aNum = ctx.rng.nextInt(1, 5);
      aDen = ctx.rng.nextInt(aNum + 1, 9);
      bDen = ctx.rng.nextInt(aNum + 1, 9);
      if (aDen === bDen) continue;
      bNum = aNum;
    } else {
      aNum = ctx.rng.nextInt(1, 5);
      aDen = ctx.rng.nextInt(2, 8);
      bNum = ctx.rng.nextInt(1, 5);
      bDen = ctx.rng.nextInt(2, 8);
      if (aNum === bNum && aDen === bDen) continue;
    }

    if (aNum / aDen === bNum / bDen) continue;

    const aFrac = `${aNum}/${aDen}`;
    const bFrac = `${bNum}/${bDen}`;
    const aVal = aNum / aDen;
    const bVal = bNum / bDen;

    let prompt = "";
    let correct = "";
    let choices: string[] = [];
    let form = "";

    if (
      ctx.practiceType.startsWith("compare_like_") ||
      ctx.practiceType === "use_comparison_symbols"
    ) {
      prompt = `Compare: ${aFrac} ___ ${bFrac}`;
      correct = compareSymbol(aVal, bVal);
      form = "symbol";
      choices = ctx.rng.shuffle(["<", ">", "="]);
    } else if (ctx.practiceType.startsWith("comparison_word_problems")) {
      prompt = `Maya ate ${aFrac} of a pizza. Ava ate ${bFrac} of the same-size pizza. Who ate more?`;
      correct = aVal > bVal ? "Maya" : "Ava";
      form = "word_problem";
      choices = ctx.rng.shuffle(["Maya", "Ava", "They ate the same"]);
    } else if (ctx.practiceType === "same_whole_fractions") {
      prompt = `To compare ${aFrac} and ${bFrac}, the wholes must be what?`;
      correct = "The same size";
      form = "same_whole";
      choices = ctx.rng.shuffle(["The same size", "Different sizes", "It does not matter"]);
    } else if (ctx.practiceType === "compare_explain_fractions") {
      prompt = `Is ${aFrac} ${compareWord(aVal, bVal)} ${bFrac}? Explain in words.`;
      correct = compareWord(aVal, bVal);
      form = "explain";
      choices = ctx.rng.shuffle(["less than", "greater than", "equal to"]);
    } else {
      prompt = `Compare: ${aFrac} ___ ${bFrac}`;
      correct = compareSymbol(aVal, bVal);
      form = "symbol";
      choices = ctx.rng.shuffle(["<", ">", "="]);
    }

    const key = mathProblemKey(
      ctx.practiceType,
      aNum,
      aDen,
      `${aNum}:${aDen}:${bNum}:${bDen}:${form}`,
    );
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-compare-fracs-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${aFrac} ${form === "symbol" ? correct : compareWord(aVal, bVal)} ${bFrac}.`,
        visualEmoji: "🍕",
        choices,
      }),
    );
  }

  return problems;
};
