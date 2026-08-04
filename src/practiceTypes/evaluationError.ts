export type EvaluationFailureDetails = {
  evaluationLessonId: string;
  reviewType?: string;
  requestedCount?: number;
  generatedCount?: number;
  resolutionPath?: string;
  reason: string;
};

export class EvaluationGenerationError extends Error {
  details: EvaluationFailureDetails;

  constructor(details: EvaluationFailureDetails) {
    super(`Evaluation generation failed for ${details.evaluationLessonId}: ${details.reason}`);
    this.name = "EvaluationGenerationError";
    this.details = details;
  }
}
