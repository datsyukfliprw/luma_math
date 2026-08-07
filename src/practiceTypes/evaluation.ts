import { findCurriculumLessonById } from "../lib/curriculumLoader";
import type { Lesson } from "../data/curriculum";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";
import { buildEvaluationPlan } from "./evaluationPlan";
import { resolveEvaluationReviewSource } from "./evaluationReviewResolver";
import { EvaluationGenerationError } from "./evaluationError";
import { generateProblemsForPracticeType } from "./registry";
import { derivePracticeSeed } from "./random";

export function generateEvaluationProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  const evaluationLesson = options?.lesson as Lesson | undefined;
  const evaluationLessonId = evaluationLesson?.lesson_id;

  if (!evaluationLessonId) {
    throw new EvaluationGenerationError({
      evaluationLessonId: "(unknown)",
      reason: "Evaluation lesson has no lesson_id",
    });
  }

  const found = findCurriculumLessonById(evaluationLessonId);
  if (!found) {
    throw new EvaluationGenerationError({
      evaluationLessonId,
      reason: "Evaluation lesson not found in curriculum",
    });
  }

  const { unit, week } = found;
  const reviewTypes = evaluationLesson.review_types;

  if (!reviewTypes || reviewTypes.length === 0) {
    throw new EvaluationGenerationError({
      evaluationLessonId,
      reason: "Evaluation lesson has no review_types",
    });
  }

  const questionCount =
    evaluationLesson.quiz_question_count ?? evaluationLesson.practice_block?.question_count ?? 9;

  const rotationOffset = (unit.unit_number + week.week_number - 2) % reviewTypes.length;
  const plan = buildEvaluationPlan(reviewTypes, questionCount, rotationOffset);

  const pools: { reviewType: string; problems: PracticeProblem[] }[] = [];
  const usedKeys = new Set<string>();

  const parentSeed = options?.seed;

  for (const entry of plan) {
    if (entry.count <= 0) {
      continue;
    }

    const resolved = resolveEvaluationReviewSource(evaluationLessonId, entry.reviewType);
    const reviewSeed =
      parentSeed !== undefined
        ? derivePracticeSeed(parentSeed, "evaluation", evaluationLessonId, entry.reviewType)
        : undefined;

    const pool = generateProblemsForPracticeType(resolved.generatorPracticeType, {
      mode: options?.mode,
      lesson: resolved.sourceLesson,
      seed: reviewSeed,
    });

    const selected: PracticeProblem[] = [];

    for (const problem of pool) {
      if (selected.length >= entry.count) {
        break;
      }

      const namespacedKey = `evaluation-${evaluationLessonId}-${entry.reviewType}-${problem.problemKey}`;

      if (usedKeys.has(namespacedKey)) {
        continue;
      }

      usedKeys.add(namespacedKey);

      selected.push({
        ...problem,
        id: `evaluation-${evaluationLessonId}-${entry.reviewType}-${problem.id}`,
        problemKey: namespacedKey,
      });
    }

    if (selected.length < entry.count) {
      throw new EvaluationGenerationError({
        evaluationLessonId,
        reviewType: entry.reviewType,
        requestedCount: entry.count,
        generatedCount: selected.length,
        resolutionPath: resolved.resolution,
        reason: `Could not generate enough problems for review type`,
      });
    }

    pools.push({ reviewType: entry.reviewType, problems: selected });
  }

  const result: PracticeProblem[] = [];
  let round = 0;

  while (result.length < questionCount) {
    let addedInRound = false;

    for (const pool of pools) {
      if (round < pool.problems.length) {
        result.push(pool.problems[round]);
        addedInRound = true;

        if (result.length >= questionCount) {
          break;
        }
      }
    }

    if (!addedInRound) {
      break;
    }

    round += 1;
  }

  if (result.length < questionCount) {
    throw new EvaluationGenerationError({
      evaluationLessonId,
      requestedCount: questionCount,
      generatedCount: result.length,
      reason: "Interleaving produced fewer problems than requested",
    });
  }

  return result;
}
