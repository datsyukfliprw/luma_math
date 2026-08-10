import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

const CATEGORIES = ["red", "blue", "green", "yellow", "orange", "purple"];

export const dataGraphsFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  function describeCounts(counts: number[]) {
    return CATEGORIES.map((cat, i) => `${cat}: ${counts[i]}`).join(", ");
  }

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const counts = CATEGORIES.map(() => ctx.rng.nextInt(1, 10));
    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    const maxCategory = CATEGORIES[counts.indexOf(maxCount)];
    const minCategory = CATEGORIES[counts.indexOf(minCount)];

    let prompt = "";
    let correct = "";
    let form = "";
    let choices: string[] | undefined;

    if (ctx.practiceType.startsWith("read_")) {
      const category = ctx.rng.pick(CATEGORIES);
      const count = counts[CATEGORIES.indexOf(category)];
      prompt = `The graph data is: ${describeCounts(counts)}. How many are in the ${category} category?`;
      correct = String(count);
      form = `read:${category}`;
      choices = buildNumberChoices(count, 0, 20, ctx.rng);
    } else if (ctx.practiceType.startsWith("create_")) {
      prompt = `The graph data is: ${describeCounts(counts)}. Which category has the most?`;
      correct = maxCategory;
      form = "most";
      const others = CATEGORIES.filter((c) => c !== maxCategory).slice(0, 2);
      choices = ctx.rng.shuffle([maxCategory, ...others]);
    } else if (ctx.practiceType === "line_plots") {
      const measurements: number[] = [];
      const measurementCount = ctx.rng.nextInt(5, 12);
      for (let i = 0; i < measurementCount; i += 1) {
        measurements.push(ctx.rng.nextInt(1, 20));
      }
      prompt = `A line plot shows these measurements: ${measurements.join(", ")}. What is the total number of data points?`;
      correct = String(measurementCount);
      form = "total";
      choices = buildNumberChoices(measurementCount, 0, 20, ctx.rng);
    } else {
      prompt = `The graph data is: ${describeCounts(counts)}. Which category has the least?`;
      correct = minCategory;
      form = "least";
      const others = CATEGORIES.filter((c) => c !== minCategory).slice(0, 2);
      choices = ctx.rng.shuffle([minCategory, ...others]);
    }

    const key = mathProblemKey(ctx.practiceType, maxCount, minCount, form, counts.join(":"));
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-data-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "📊",
        choices,
      }),
    );
  }

  return problems;
};
