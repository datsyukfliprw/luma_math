import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem } from "../buildTryItProblem";
import { generateSubtractionProblems } from "../../../practiceTypes/subtraction";

export const subtractionFamily: TryItFamily = (ctx) => {
  const problems = generateSubtractionProblems({
    lesson: { ...ctx.lesson, practice_type: ctx.practiceType },
    seed: ctx.attemptKey,
    count: ctx.count,
    mode: "guided",
  });

  return problems.slice(0, ctx.count).map((problem, index) =>
    makeSinglePartTryItProblem({
      id: `${ctx.lessonId}-subtraction-${index + 1}`,
      problemKey: problem.problemKey,
      prompt: problem.questionText,
      correctAnswer: problem.correctAnswer,
      tip: ctx.lesson.objective,
      successMessage: "Nice subtraction work!",
      visualEmoji: "➖",
      choices: problem.visualData?.choices,
    }),
  );
};
