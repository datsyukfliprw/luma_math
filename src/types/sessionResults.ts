import type { PracticeMode } from "../practiceTypes/types";

export type PracticeSessionResult = {
  kind: "practice";
  lessonId: string;
  lessonTitle: string;
  mode: PracticeMode;
  correctCount: number;
  totalCount: number;
  firstAttemptCorrectCount: number;
  firstAttemptTotalCount: number;
  accuracy: number;
  recommendedMode?: PracticeMode | null;
  nextLessonPath: string;
  lessonPath: string;
};

export type EvaluationSessionResult = {
  kind: "evaluation";
  lessonId: string;
  lessonTitle: string;
  status: "passed" | "retry";
  firstAttemptCorrectCount: number;
  firstAttemptTotalCount: number;
  accuracy: number;
  requiredAccuracy: number;
  alreadyCompleted?: boolean;
  nextUnitPath: string;
  lessonPath: string;
  retryPath: string;
};

export type SessionResult = PracticeSessionResult | EvaluationSessionResult;
