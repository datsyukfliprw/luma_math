// Shared types for lesson experience data

export type PracticeMode = "guided" | "independent" | "challenge";

export type LessonPracticeType =
  | "equal_groups"
  | "repeated_addition_to_multiplication"
  | "factor_product_identification"
  | "equal_groups_with_objects"
  | "mixed_evaluation";

export type SeeItRuleFocus =
  | "zero"
  | "identity"
  | "product"
  | "repeated-addition"
  | "groups-in-each"
  | "factor-product"
  | "equal-groups"
  | "review";

export type QuickCheckQuestion = {
  id: string;
  prompt: string;
  equationStart: string;
  productPrompt: string;
  choices: string[];
  correctAnswer: string;
  ruleType: string;
  tipTitle: string;
  tipText: string;
  hint: string;
  success: string;
  visualGroups: number;
  visualCount: number;
};

export type TryItProblem = {
  id: string;
  story: string;
  question: string;
  groups: string;
  inEach: string;
  total: string;
  groupLabel: string;
  inEachLabel: string;
  visualEmoji: string;
  visualEmpty?: boolean;
  equation: string;
  groupsChoices: string[];
  inEachChoices: string[];
  equationChoices: string[];
  successMessage: string;
  tip: string;
};

export type LessonExperience = {
  id: string;
  grade: 3;
  unitId: string;
  unitNumber: 1;
  unitTitle: string;
  week: number;
  lessonNumber: number;
  lessonType: "lesson" | "evaluation";
  title: string;
  shortTitle: string;
  label: string;
  objective: string;
  kidGoal: string;
  topic: "multiplication" | "review";
  practiceType: LessonPracticeType;
  flashcardDeckId?: string;

  lessonHero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    missionTitle: string;
    missionSteps: string[];
  };

  bigIdea: {
    title: string;
    subtitle: string;
    thumbnail: string;
    videoUrl?: string;
    videoCaption: string;
    intro: string;
    bigQuestion: string;
    starTip: {
      title: string;
      lines: string[];
    };
    examples: {
      label: string;
      expression: string;
      note: string;
    }[];
    explanationSteps: string[];
    ruleCards: {
      eyebrow: string;
      equation: string;
      badge: string;
      description: string;
    }[];
  };

  buildIt: {
    title: string;
    subtitle: string;
    activityType:
      | "zero_identity_groups"
      | "repeated_addition_builder"
      | "factor_product_sort"
      | "object_equal_groups"
      | "week_review_builder";
    rounds: {
      id: string;
      groups: number;
      inEach: number;
      instruction: string;
      summary: string;
      pattern: string;
      equation: string;
    }[];
  };

  seeIt: {
    title: string;
    subtitle: string;
    prompt: string;
    examples: {
      id: string;
      title: string;
      subtitle: string;
      groups: number;
      inEach: number;
      equation: string;
      sentence: string;
    }[];
    clues: {
      id: string;
      visualLabel: string;
      groups: number;
      inEach: number;
      choices: string[];
      sneakyEquation: string;
      feedback: string;
      tip: string;
      ruleFocus: SeeItRuleFocus;
    }[];
  };

  words: {
    title: string;
    subtitle: string;
    vocabulary: {
      word: string;
      definition: string;
      example: string;
      visual: string[];
      equation: string;
    }[];
  };

  quickCheck: {
    title: string;
    subtitle: string;
    passingScore: number;
    questions: QuickCheckQuestion[];
  };

  tryIt: {
    title: string;
    subtitle: string;
    requiredCount: number;
    problems: TryItProblem[];
  };

  practice: {
    type: LessonPracticeType;
    description: string;
    guidedCount: number;
    independentCount: number;
    challengeCount: number;
    reviewTypes?: LessonPracticeType[];
  };

  completion: {
    unlocksNextLessonAfter: PracticeMode;
    fullMasteryIncludes: string[];
    nextLessonId?: string;
  };
};
