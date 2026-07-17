import { generateEqualGroupsProblems } from "./equalGroups";
import { generateEqualGroupsWithObjectsProblems } from "./equalGroupsWithObjects";
import { generateFactorProductProblems } from "./factorProduct";
import { generateRepeatedAdditionProblems } from "./repeatedAddition";
import type { PracticeGenerationOptions, PracticeProblem } from "./types";

type ReviewType =
  | "equal_groups"
  | "equal_groups_with_objects"
  | "repeated_addition_to_multiplication"
  | "factor_product_identification";

const reviewGenerators: Record<
  ReviewType,
  (options?: PracticeGenerationOptions) => PracticeProblem[]
> = {
  equal_groups: generateEqualGroupsProblems,
  equal_groups_with_objects: generateEqualGroupsWithObjectsProblems,
  repeated_addition_to_multiplication: generateRepeatedAdditionProblems,
  factor_product_identification: generateFactorProductProblems,
};

const defaultReviewTypes: ReviewType[] = [
  "equal_groups",
  "equal_groups_with_objects",
  "repeated_addition_to_multiplication",
  "factor_product_identification",
];

function getReviewTypes(options?: PracticeGenerationOptions): ReviewType[] {
  const lessonReviewTypes = options?.lesson?.review_types;

  if (!lessonReviewTypes?.length) {
    return defaultReviewTypes;
  }

  return lessonReviewTypes.filter((type): type is ReviewType => type in reviewGenerators);
}

export function generateEvaluationProblems(options?: PracticeGenerationOptions): PracticeProblem[] {
  const reviewTypes = getReviewTypes(options);
  const questionCount =
    options?.lesson?.quiz_question_count ?? options?.lesson?.practice_block?.question_count ?? 9;

  const pools = reviewTypes.map((reviewType) => ({
    reviewType,
    problems: reviewGenerators[reviewType](options),
    index: 0,
  }));

  const mixedProblems: PracticeProblem[] = [];

  while (mixedProblems.length < questionCount && pools.length > 0) {
    for (const pool of pools) {
      const problem = pool.problems[pool.index];

      if (!problem) {
        continue;
      }

      mixedProblems.push({
        ...problem,
        id: `evaluation-${pool.reviewType}-${problem.id}`,
        problemKey: `evaluation-${pool.reviewType}-${problem.problemKey}`,
      });

      pool.index += 1;

      if (mixedProblems.length >= questionCount) {
        break;
      }
    }

    const hasMoreProblems = pools.some((pool) => pool.index < pool.problems.length);

    if (!hasMoreProblems) {
      break;
    }
  }

  return mixedProblems;
}
