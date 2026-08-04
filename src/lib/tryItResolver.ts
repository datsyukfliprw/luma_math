import type { Lesson } from "../data/curriculum/curriculumSchema";
import { findCurriculumLessonById } from "./curriculumLoader";
import { getLessonById } from "./lessonLookup";
import { getLessonExperience } from "../data/lessonExperience";
import type { LessonExperience, TryItProblem } from "../data/lessonExperience/types";
import { generateProblemsForPracticeType } from "../practiceTypes/registry";
import { normalizeNumericAnswer } from "./answerValidation";

function isNumericString(value: string): boolean {
  const normalized = normalizeNumericAnswer(value);
  return normalized.length > 0 && !Number.isNaN(Number(normalized));
}

export type TryItAnswerPart = {
  key: string;
  label: string;
  correctAnswer: string;
  choices?: string[];
};

export type ResolvedTryItProblem = {
  id: string;
  prompt: string;
  tip: string;
  successMessage: string;
  visualEmoji?: string;
  visualEmpty?: boolean;
  visualData?: { groups: number; itemsPerGroup: number };
  parts: TryItAnswerPart[];
};

export type ResolvedTryItExperience = {
  title: string;
  subtitle: string;
  requiredCount: number;
  problems: ResolvedTryItProblem[];
};

function getVisualEmojiForTopic(topic?: string, practiceType?: string): string {
  if (practiceType?.includes("place_value")) return "🔢";
  if (practiceType?.includes("division")) return "🍎";
  if (practiceType?.includes("fraction")) return "🍕";
  if (practiceType?.includes("area")) return "⬜";
  if (topic === "multiplication" || topic === "review") return "⭐";
  return "✏️";
}

function buildAnswerChoices(
  correctAnswer: string,
  context?: { groups?: number; itemsPerGroup?: number },
): string[] | undefined {
  if (!isNumericString(correctAnswer)) return undefined;

  const correct = Number(correctAnswer);
  const fallback = context?.groups ?? 2;

  if (correct === 0) {
    return Array.from(new Set(["0", "1", String(fallback)])).slice(0, 3);
  }

  if (correct === 1) {
    return Array.from(new Set(["0", "1", "2"])).slice(0, 3);
  }

  return Array.from(new Set([String(correct), String(correct + 1), String(correct - 1)])).slice(
    0,
    3,
  );
}

function extractVisualData(lesson: Lesson): { groups: number; itemsPerGroup: number } | undefined {
  const tryItData = lesson.try_it?.visual_data;
  if (tryItData) {
    return { groups: tryItData.groups, itemsPerGroup: tryItData.items_per_group };
  }

  const example = lesson.learn?.example;
  if (example) {
    return { groups: example.groups, itemsPerGroup: example.items_per_group };
  }

  return undefined;
}

function normalizeAuthoredProblem(problem: TryItProblem): ResolvedTryItProblem {
  const groups = Number(problem.groups) || 0;
  const inEach = Number(problem.inEach) || 0;

  return {
    id: problem.id,
    prompt: problem.story ? `${problem.story} ${problem.question}` : problem.question,
    tip: problem.tip,
    successMessage: problem.successMessage,
    visualEmoji: problem.visualEmoji,
    visualEmpty: problem.visualEmpty,
    visualData: { groups, itemsPerGroup: inEach },
    parts: [
      {
        key: "groups",
        label: problem.groupLabel || "How many groups?",
        correctAnswer: problem.groups,
        choices: problem.groupsChoices,
      },
      {
        key: "inEach",
        label: problem.inEachLabel || "How many in each group?",
        correctAnswer: problem.inEach,
        choices: problem.inEachChoices,
      },
      {
        key: "equation",
        label: "Write the equation",
        correctAnswer: problem.equation,
        choices: problem.equationChoices,
      },
    ],
  };
}

function normalizeAuthoredTryIt(
  tryIt: NonNullable<LessonExperience["tryIt"]>,
): ResolvedTryItExperience {
  return {
    title: tryIt.title,
    subtitle: tryIt.subtitle,
    requiredCount: tryIt.requiredCount,
    problems: tryIt.problems.map((problem) => normalizeAuthoredProblem(problem)),
  };
}

function parseProductFromEquation(equation?: string): string | undefined {
  if (!equation) return undefined;
  const match = equation.match(/=\s*([0-9,]+)$/);
  return match ? match[1].replaceAll(",", "") : undefined;
}

function makeSinglePartProblem(options: {
  id: string;
  prompt: string;
  correctAnswer: string;
  tip: string;
  successMessage?: string;
  visualData?: { groups: number; itemsPerGroup: number };
  visualEmoji?: string;
  visualEmpty?: boolean;
  choices?: string[];
}): ResolvedTryItProblem {
  const { id, prompt, correctAnswer, tip, visualData, visualEmoji, visualEmpty } = options;

  return {
    id,
    prompt,
    tip,
    successMessage: options.successMessage ?? "That’s right!",
    visualEmoji,
    visualEmpty,
    visualData,
    parts: [
      {
        key: "answer",
        label: "Your answer",
        correctAnswer,
        choices: options.choices ?? buildAnswerChoices(correctAnswer, visualData),
      },
    ],
  };
}

function buildTryItProblemFromTryIt(
  lesson: Lesson,
  lessonId: string,
  index: number,
): ResolvedTryItProblem | undefined {
  if (!lesson.try_it) return undefined;

  return makeSinglePartProblem({
    id: `${lessonId}-tryit-${index + 1}`,
    prompt: lesson.try_it.prompt,
    correctAnswer: lesson.try_it.correct_answer,
    tip: lesson.try_it.hint || lesson.concept,
    successMessage: `Great! ${lesson.try_it.correct_answer} is correct.`,
    visualData: extractVisualData(lesson),
    visualEmoji: getVisualEmojiForTopic(undefined, lesson.practice_type),
  });
}

function buildTryItProblemFromPractice(
  lesson: Lesson,
  lessonId: string,
  index: number,
): ResolvedTryItProblem | undefined {
  const problems = generateProblemsForPracticeType(lesson.practice_type, { lesson });
  const problem = problems[index];
  if (!problem) return undefined;

  const choices = problem.visualData?.choices;
  const correctAnswer = problem.correctAnswer;

  return makeSinglePartProblem({
    id: `${lessonId}-practice-${index + 1}`,
    prompt: problem.questionText,
    correctAnswer,
    tip: lesson.concept,
    successMessage: "Nice work!",
    visualData:
      problem.visualData?.groups !== undefined && problem.visualData?.itemsPerGroup !== undefined
        ? { groups: problem.visualData.groups, itemsPerGroup: problem.visualData.itemsPerGroup }
        : undefined,
    visualEmoji: getVisualEmojiForTopic(undefined, lesson.practice_type),
    choices,
  });
}

function buildTryItProblemFromWarmupQuestion(
  question: NonNullable<Lesson["warmup"]>["questions"][number],
  lesson: Lesson,
  lessonId: string,
  index: number,
): ResolvedTryItProblem {
  let prompt = question.prompt;
  if (
    question.question_type === "target_digit_value" &&
    question.number !== undefined &&
    question.target_digit_index !== undefined
  ) {
    const places = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"];
    const fromRight = question.number.length - 1 - question.target_digit_index;
    prompt = `In ${question.number}, what is the value of the ${places[fromRight] ?? "bold"} digit?`;
  }

  return makeSinglePartProblem({
    id: `${lessonId}-warmup-${index + 1}`,
    prompt,
    correctAnswer: question.correct_answer,
    tip: question.hint,
    successMessage: "Correct!",
    visualEmoji: getVisualEmojiForTopic(undefined, lesson.practice_type),
  });
}

function buildTryItProblemFromExample(
  lesson: Lesson,
  lessonId: string,
): ResolvedTryItProblem | undefined {
  const example = lesson.learn?.example;
  if (!example) return undefined;

  const product =
    parseProductFromEquation(example.equation) ?? String(example.groups * example.items_per_group);
  const prompt = example.prompt || `Look at the example: ${example.equation}. What is the product?`;

  return makeSinglePartProblem({
    id: `${lessonId}-example-1`,
    prompt,
    correctAnswer: product,
    tip: lesson.concept,
    successMessage: `Yes! The product is ${product}.`,
    visualData: { groups: example.groups, itemsPerGroup: example.items_per_group },
    visualEmoji: getVisualEmojiForTopic(undefined, lesson.practice_type),
  });
}

function buildGenericTryItProblem(lesson: Lesson, lessonId: string): ResolvedTryItProblem {
  return makeSinglePartProblem({
    id: `${lessonId}-generic-1`,
    prompt: `Read the lesson idea: "${lesson.concept}". Type "ready" when you've thought about it.`,
    correctAnswer: "ready",
    tip: lesson.objective,
    successMessage: "Great! You’re ready to try more problems.",
    visualEmoji: "✏️",
    choices: ["ready", "go", "ok"],
  });
}

function buildFallbackTryIt(lesson: Lesson, lessonId: string): ResolvedTryItExperience {
  const problems: ResolvedTryItProblem[] = [];

  const fromTryIt = buildTryItProblemFromTryIt(lesson, lessonId, 0);
  if (fromTryIt) {
    problems.push(fromTryIt);
  }

  if (problems.length === 0) {
    const fromPractice = buildTryItProblemFromPractice(lesson, lessonId, 0);
    if (fromPractice) problems.push(fromPractice);
    const fromPractice2 = buildTryItProblemFromPractice(lesson, lessonId, 1);
    if (fromPractice2) problems.push(fromPractice2);
  }

  if (problems.length === 0 && lesson.warmup?.questions) {
    for (let i = 0; i < Math.min(lesson.warmup.questions.length, 2); i += 1) {
      problems.push(
        buildTryItProblemFromWarmupQuestion(lesson.warmup.questions[i], lesson, lessonId, i),
      );
    }
  }

  if (problems.length === 0) {
    const fromExample = buildTryItProblemFromExample(lesson, lessonId);
    if (fromExample) problems.push(fromExample);
  }

  if (problems.length === 0) {
    problems.push(buildGenericTryItProblem(lesson, lessonId));
  }

  return {
    title: lesson.try_it?.title ?? "Try It",
    subtitle: lesson.try_it?.prompt ?? "Try one problem before practice.",
    requiredCount: problems.length,
    problems,
  };
}

export function getResolvedTryItExperience(lessonId?: string): ResolvedTryItExperience | undefined {
  if (!lessonId) return undefined;

  // Validate the lesson ID against the canonical curriculum before falling
  // back to any default unit. Unknown IDs should render the not-found screen.
  const found = findCurriculumLessonById(lessonId);
  if (!found) return undefined;

  const { lesson } = getLessonById(lessonId);
  const experience = getLessonExperience(lessonId);

  if (experience?.tryIt && experience.tryIt.problems.length > 0) {
    return normalizeAuthoredTryIt(experience.tryIt);
  }

  return buildFallbackTryIt(lesson, lessonId);
}
