import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem, mathProblemKey } from "../buildTryItProblem";

type ShapeDesc = {
  name: string;
  sides: number;
  equalSides: boolean;
  rightAngles: boolean;
  parallel: boolean;
};

const SHAPES: ShapeDesc[] = [
  { name: "square", sides: 4, equalSides: true, rightAngles: true, parallel: true },
  { name: "rectangle", sides: 4, equalSides: false, rightAngles: true, parallel: true },
  { name: "rhombus", sides: 4, equalSides: true, rightAngles: false, parallel: true },
  { name: "parallelogram", sides: 4, equalSides: false, rightAngles: false, parallel: true },
  { name: "trapezoid", sides: 4, equalSides: false, rightAngles: false, parallel: true },
];

export const geometryAttributesFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const sides = ctx.rng.nextInt(3, 5);
    const shape = ctx.rng.pick(SHAPES);

    let prompt = "";
    let correct = "";
    let choices: string[] = [];
    let form = "";

    if (ctx.practiceType === "sides_and_vertices") {
      prompt = `A shape has ${sides} sides. How many vertices does it have?`;
      correct = String(sides);
      form = "vertices";
      choices = ctx.rng.shuffle([correct, String(sides + 1), String(sides - 1)]);
    } else if (ctx.practiceType === "parallel_sides_quadrilaterals") {
      prompt = "Which quadrilateral always has both pairs of opposite sides parallel?";
      correct = "Parallelogram";
      form = "parallel";
      choices = ctx.rng.shuffle(["Parallelogram", "Trapezoid", "Rectangle"]);
    } else if (ctx.practiceType === "classify_squares_rectangles_rhombuses") {
      const target = ctx.rng.pick([
        { correct: "Square", equalSides: true, rightAngles: true },
        { correct: "Rectangle", equalSides: false, rightAngles: true },
        { correct: "Rhombus", equalSides: true, rightAngles: false },
      ]);
      prompt = `A quadrilateral ${target.equalSides ? "has 4 equal sides" : "does not have 4 equal sides"} and ${target.rightAngles ? "has 4 right angles" : "does not have 4 right angles"}. What is it?`;
      correct = target.correct;
      form = `classify:${target.correct}`;
      const distractors = ["Square", "Rectangle", "Rhombus"].filter((s) => s !== target.correct);
      choices = ctx.rng.shuffle([target.correct, ...distractors.slice(0, 2)]);
    } else if (ctx.practiceType === "parallelograms_trapezoids") {
      const target = ctx.rng.pick([
        { correct: "Trapezoid", parallelPairs: 1 },
        { correct: "Parallelogram", parallelPairs: 2 },
      ]);
      prompt = `A quadrilateral has ${target.parallelPairs} pair${target.parallelPairs === 1 ? "" : "s"} of parallel sides. What is it?`;
      correct = target.correct;
      form = `quad:${target.correct}`;
      const distractors = ["Trapezoid", "Parallelogram", "Rectangle"].filter(
        (s) => s !== target.correct,
      );
      choices = ctx.rng.shuffle([target.correct, ...distractors.slice(0, 2)]);
    } else {
      prompt = `A ${shape.name} has ${shape.sides} sides. How many sides does it have?`;
      correct = String(shape.sides);
      form = "sides";
      choices = ctx.rng.shuffle([correct, String(sides + 1), String(sides - 1)]);
    }

    const key = mathProblemKey(ctx.practiceType, sides, shape.sides, form);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-geometry-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${correct} is correct.`,
        visualEmoji: "🔺",
        choices,
      }),
    );
  }

  return problems;
};
