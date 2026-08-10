import type { Lesson } from "../../data/curriculum/curriculumSchema";
import type { TryItTemplate } from "../../data/lessonExperience/types";
import type { SeededRng } from "../../practiceTypes/random";

export type TryItAnswerPart = {
  key: string;
  label: string;
  correctAnswer: string;
  choices?: string[];
};

export type ResolvedTryItProblem = {
  id: string;
  problemKey?: string;
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
  family: string;
  problems: ResolvedTryItProblem[];
};

export type ResolvedTryItOptions = {
  attemptKey?: string | number;
};

export type TryItFamilyContext = {
  lessonId: string;
  lesson: Lesson;
  family: string;
  practiceType: string;
  attemptKey: string | number;
  rng: SeededRng;
  usedKeys: Set<string>;
  count: number;
  templates?: TryItTemplate[];
};

export type TryItFamily = (ctx: TryItFamilyContext) => ResolvedTryItProblem[];
