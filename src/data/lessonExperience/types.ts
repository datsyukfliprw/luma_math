// Shared types for lesson experience data

export type PracticeMode = "guided" | "independent" | "challenge";

// Allow any practice_type value from the curriculum. Validity is checked at
// runtime against the practice generator registry instead of a static union.
export type LessonPracticeType = string;

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

// Source discriminant for the runtime adapter.
// Authored experiences come from hand-written lesson experience files.
// Curriculum experiences are derived from the curriculum JSON at runtime.
export type LessonExperienceSource = "authored" | "curriculum";

// Authored experience with its source tag. This is a strict subtype of the
// existing LessonExperience shape, so authored lesson files do not need changes.
export type AuthoredLessonExperience = LessonExperience & {
  source: "authored";
};

// Curriculum-derived experience. Interaction blocks are optional because the
// curriculum schema does not guarantee multiplication-specific fields.
export type CurriculumLessonExperience = {
  source: "curriculum";
  id: string;
  grade: 3;
  unitId: string;
  unitNumber: number;
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
  practiceType: string;
  flashcardDeckId?: string;
  lessonHero: LessonExperience["lessonHero"];
  bigIdea: LessonExperience["bigIdea"];
  buildIt?: LessonExperience["buildIt"];
  seeIt?: LessonExperience["seeIt"];
  words?: LessonExperience["words"];
  quickCheck?: LessonExperience["quickCheck"];
  tryIt?: LessonExperience["tryIt"];
  practice: LessonExperience["practice"];
  completion: LessonExperience["completion"];
};

// The type returned by the runtime getLessonExperience resolver.
export type ResolvedLessonExperience = AuthoredLessonExperience | CurriculumLessonExperience;
