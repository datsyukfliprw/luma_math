import type { Lesson } from "../data/curriculum";

export type PracticeMode = "guided" | "independent" | "challenge";

export type PracticeGenerationOptions = {
  mode?: PracticeMode;
  seed?: string | number;
  count?: number;
  lesson?: Partial<Lesson>;
};

export type PracticeProblem = {
  id: string;
  questionText: string;
  correctAnswer: string;
  visualType:
    | "equal_groups"
    | "repeated_addition"
    | "factor_product"
    | "array_rows_columns"
    | "multiple_choice"
    | "text_entry"
    | "fair_sharing"
    | "mistake_check";
  problemKey: string;
  visualData?: {
    groups?: number;
    itemsPerGroup?: number;
    repeatedAddition?: string;
    equation?: string;
    correctEquation?: string;
    equations?: string[];
    factors?: number[];
    product?: number;
    rows?: number;
    columns?: number;
    jumpCount?: number;
    jumpSize?: number;
    start?: number;
    endpoint?: number;
    factorA?: number;
    factorB?: number;
    sourceRepresentation?: string;
    targetRepresentation?: string;
    sourceDescription?: string;
    sourceEquation?: string;
    orderedRoles?: { first: string; second: string };
    correctAnswer?: string;
    choices?: string[];
    items?: number;
    groupsToShare?: number;
  };
  answerData?: {
    factorA?: string;
    factorB?: string;
    product?: string;
    rows?: string;
    columns?: string;
    quotient?: string;
  };
  challengeData?: {
    equationToCheck: string;
    judgmentChoices: Array<"yes" | "no">;
    correctJudgment: "yes" | "no";
    reasonChoices: string[];
    correctReason: string;
    feedback: string;
  };
};
