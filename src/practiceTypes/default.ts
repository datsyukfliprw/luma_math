import type { Lesson } from "../data/curriculum";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

function getPlaceName(numberString: string, targetIndex: number): string {
  const places = [
    "ones",
    "tens",
    "hundreds",
    "thousands",
    "ten thousands",
    "hundred thousands",
  ];
  const fromRight = numberString.length - 1 - targetIndex;
  return places[fromRight] ?? "bold";
}

type ProblemSource = {
  prompt: string;
  correctAnswer: string;
};

export function generateDefaultPracticeProblems(
  options?: PracticeGenerationOptions,
): PracticeProblem[] {
  const lesson = options?.lesson as Lesson | undefined;
  if (!lesson) return [];

  const block = lesson.practice_block;
  const count = block?.question_count ?? 5;

  const sources: ProblemSource[] = [];

  if (lesson.warmup?.questions) {
    for (const question of lesson.warmup.questions) {
      let prompt = question.prompt;
      if (
        question.question_type === "target_digit_value" &&
        question.number !== undefined &&
        question.target_digit_index !== undefined
      ) {
        const place = getPlaceName(question.number, question.target_digit_index);
        prompt = `In ${question.number}, what is the value of the ${place} digit?`;
      }
      sources.push({
        prompt,
        correctAnswer: question.correct_answer,
      });
    }
  }

  if (lesson.try_it) {
    sources.push({
      prompt: lesson.try_it.prompt,
      correctAnswer: lesson.try_it.correct_answer,
    });
  }

  if (sources.length === 0) return [];

  const problems: PracticeProblem[] = [];
  for (let i = 0; i < count; i += 1) {
    const source = sources[i % sources.length];
    problems.push({
      id: `default-${i + 1}`,
      problemKey: `default-${i + 1}-${source.prompt}`,
      questionText: source.prompt,
      correctAnswer: source.correctAnswer,
      visualType: "multiple_choice",
      visualData: { equation: source.prompt },
    });
  }

  return problems;
}
