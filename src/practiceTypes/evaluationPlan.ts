export type EvaluationPlanEntry = {
  reviewType: string;
  count: number;
};

export type EvaluationPlan = EvaluationPlanEntry[];

export function buildEvaluationPlan(
  reviewTypes: string[],
  questionCount: number,
  rotationOffset = 0,
): EvaluationPlan {
  if (reviewTypes.length === 0) {
    throw new Error("No review types configured for evaluation plan");
  }

  if (questionCount <= 0) {
    throw new Error("Evaluation question count must be positive");
  }

  const baseCount = Math.floor(questionCount / reviewTypes.length);
  const extraCount = questionCount % reviewTypes.length;
  const counts = reviewTypes.map(() => baseCount);

  for (let i = 0; i < extraCount; i += 1) {
    counts[(rotationOffset + i) % reviewTypes.length] += 1;
  }

  return reviewTypes.map((reviewType, index) => ({
    reviewType,
    count: counts[index],
  }));
}
