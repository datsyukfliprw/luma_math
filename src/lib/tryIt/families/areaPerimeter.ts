import type { TryItFamily } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

export const areaPerimeterFamily: TryItFamily = (ctx) => {
  const problems: import("../types").ResolvedTryItProblem[] = [];
  let attempts = 0;

  function pushProblem(key: string, prompt: string, correct: string, choices?: string[]) {
    ctx.usedKeys.add(key);
    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-area-perimeter-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! The answer is ${correct}.`,
        visualEmoji: "⬜",
        choices,
      }),
    );
  }

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const length = ctx.rng.nextInt(2, 12);
    const width = ctx.rng.nextInt(2, 12);
    const area = length * width;
    const perimeter = 2 * (length + width);

    if (
      ctx.practiceType.startsWith("area_") ||
      ctx.practiceType === "count_and_label_area" ||
      ctx.practiceType === "cover_with_unit_squares" ||
      ctx.practiceType === "create_rectangles_area" ||
      ctx.practiceType === "tile_rectangles" ||
      ctx.practiceType === "hidden_squares_area"
    ) {
      const prompt = `A rectangle has a length of ${length} units and a width of ${width} units. What is the area?`;
      const correct = String(area);
      const form = "area";
      const choices = buildNumberChoices(area, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (
      ctx.practiceType.startsWith("perimeter_") ||
      ctx.practiceType === "perimeter_on_grids"
    ) {
      const prompt = `A rectangle has a length of ${length} units and a width of ${width} units. What is the perimeter?`;
      const correct = String(perimeter);
      const form = "perimeter";
      const choices = buildNumberChoices(perimeter, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (ctx.practiceType === "missing_side_length") {
      const knownSide = ctx.rng.nextInt(0, 1) === 0 ? length : width;
      const unknownSide = knownSide === length ? width : length;
      const prompt = `A rectangle has an area of ${area} square units. One side is ${knownSide} units. What is the missing side length?`;
      const correct = String(unknownSide);
      const form = "missing_side";
      const choices = buildNumberChoices(unknownSide, 0, 12, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (
      ctx.practiceType === "missing_side_perimeter" ||
      ctx.practiceType === "find_area_perimeter_missing_side"
    ) {
      const knownSide = ctx.rng.nextInt(0, 1) === 0 ? length : width;
      const unknownSide = knownSide === length ? width : length;
      const prompt = `A rectangle has a perimeter of ${perimeter} units. One side is ${knownSide} units. What is the missing side length?`;
      const correct = String(unknownSide);
      const form = "missing_perimeter_side";
      const choices = buildNumberChoices(unknownSide, 0, 20, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (
      ctx.practiceType === "same_perimeter_different_area" ||
      ctx.practiceType === "same_area_different_perimeter" ||
      ctx.practiceType === "different_arrangements_same_area"
    ) {
      const askArea =
        ctx.practiceType.includes("same_area") ||
        ctx.practiceType === "different_arrangements_same_area";
      let alternate: { length: number; width: number } | undefined;

      if (askArea) {
        const pairs: { length: number; width: number }[] = [];
        for (let i = 2; i * i <= area; i += 1) {
          if (area % i === 0) {
            const j = area / i;
            if (!(i === length && j === width) && !(i === width && j === length)) {
              pairs.push({ length: i, width: j });
            }
          }
        }
        if (pairs.length === 0) continue;
        alternate = ctx.rng.pick(pairs);
      } else {
        const sum = length + width;
        const pairs: { length: number; width: number }[] = [];
        for (let i = 2; i <= sum / 2; i += 1) {
          const j = sum - i;
          if (j < 2) continue;
          if (!(i === length && j === width) && !(i === width && j === length)) {
            pairs.push({ length: i, width: j });
          }
        }
        if (pairs.length === 0) continue;
        alternate = ctx.rng.pick(pairs);
      }

      const prompt = askArea
        ? `A rectangle has length ${length} and width ${width}. Which other length and width give the same area?`
        : `A rectangle has length ${length} and width ${width}. Which other length and width give the same perimeter?`;
      const correct = `${alternate.length} × ${alternate.width}`;
      const form = askArea ? "same_area" : "same_perimeter";

      const wrong1 = `${ctx.rng.nextInt(2, 12)} × ${ctx.rng.nextInt(2, 12)}`;
      const wrong2 = `${ctx.rng.nextInt(2, 12)} × ${ctx.rng.nextInt(2, 12)}`;
      const uniqueChoices = new Set([correct, wrong1, wrong2]);
      while (uniqueChoices.size < 3) {
        uniqueChoices.add(`${ctx.rng.nextInt(2, 12)} × ${ctx.rng.nextInt(2, 12)}`);
      }
      const choices = ctx.rng.shuffle([...uniqueChoices].slice(0, 3));

      const key = mathProblemKey(ctx.practiceType, alternate.length, alternate.width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (ctx.practiceType === "distributive_property_area") {
      if (length < 4) continue;
      const split = ctx.rng.nextInt(2, length - 2);
      const prompt = `A rectangle has length ${length} and width ${width}. If you split the length into ${split} and ${length - split}, what is the total area?`;
      const correct = String(area);
      const form = "distributive";
      const choices = buildNumberChoices(area, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (ctx.practiceType === "rows_columns_multiplication") {
      const prompt = `A rectangle has ${length} rows and ${width} columns of unit squares. How many unit squares are there?`;
      const correct = String(area);
      const form = "rows_columns";
      const choices = buildNumberChoices(area, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else if (
      ctx.practiceType === "area_perimeter_word_problems" ||
      ctx.practiceType === "area_word_problems" ||
      ctx.practiceType === "area_models_and_stories"
    ) {
      const prompt = `A garden is ${length} units long and ${width} units wide. What is the area?`;
      const correct = String(area);
      const form = "area_word";
      const choices = buildNumberChoices(area, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    } else {
      const prompt = `A rectangle has a length of ${length} units and a width of ${width} units. What is the area?`;
      const correct = String(area);
      const form = "area";
      const choices = buildNumberChoices(area, 0, 200, ctx.rng);
      const key = mathProblemKey(ctx.practiceType, length, width, form);
      if (ctx.usedKeys.has(key)) continue;
      pushProblem(key, prompt, correct, choices);
    }
  }

  return problems;
};
