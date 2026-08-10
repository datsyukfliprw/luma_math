import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem } from "../buildTryItProblem";
import { generateAdditionProblems } from "../../../practiceTypes/addition";

export const additionFamily: TryItFamily = (ctx) => {
  const problems = generateAdditionProblems({
    lesson: { ...ctx.lesson, practice_type: ctx.practiceType },
    seed: ctx.attemptKey,
    count: ctx.count,
    mode: "guided",
  });

  return problems.slice(0, ctx.count).map((problem, index) =>
    makeSinglePartTryItProblem({
      id: `${ctx.lessonId}-addition-${index + 1}`,
      problemKey: problem.problemKey,
      prompt: problem.questionText,
      correctAnswer: problem.correctAnswer,
      tip: ctx.lesson.objective,
      successMessage: "Nice addition work!",
      visualEmoji: "➕",
      choices: problem.visualData?.choices,
    }),
  );
};
