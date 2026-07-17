// @SECTION FILE_OVERVIEW
// lessonExperience.ts
// Rich student-facing lesson experience data for LumaMath.
// Curriculum JSON stays teacher-facing; this file drives Learn, Quick Check,
// Try It, lesson cards, practice metadata, and flashcard links.

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

const unitMeta = {
  grade: 3 as const,
  unitId: "g3-u1-foundations",
  unitNumber: 1 as const,
  unitTitle: "Multiplication & Division Foundations",
  week: 1,
};

const missionSteps = ["Warm-Up", "Learn", "Try It", "Practice", "Flashcards"];

// @SECTION LESSON_EXPERIENCE_DATA
export const grade3Unit1Week1Experience: LessonExperience[] = [
  {
    ...unitMeta,
    id: "unit-1-week-1-day-1",
    lessonNumber: 1,
    lessonType: "lesson",
    title: "Zero and Identity Rules",
    shortTitle: "0 and 1 Rules",
    label: "Lesson 1",
    objective: "Understand and use the 0 and 1 multiplication rules.",
    kidGoal: "I can use the 0 and 1 multiplication rules.",
    topic: "multiplication",
    practiceType: "equal_groups",
    flashcardDeckId: "lesson-g3-u1-w1-d1-zero-identity",

    lessonHero: {
      eyebrow: "Grade 3 • Unit 1 • Lesson 1",
      title: "Zero and Identity Rules",
      subtitle: "Use equal groups to see why ×0 makes 0 and ×1 keeps the number the same.",
      missionTitle: "Today’s Mission",
      missionSteps,
    },

    bigIdea: {
      title: "Zero and one have special multiplication rules.",
      subtitle: "Multiplying by 0 always makes 0. Multiplying by 1 keeps the number the same.",
      thumbnail: "/images/learn/thumbnails/zero-one-rules.webp",
      videoCaption: "Watch how 0 and 1 work in multiplication.",
      intro: "Today you’ll use equal groups to see why the 0 rule and 1 rule work.",
      bigQuestion: "What changes when each group has 1 or 0 items?",
      starTip: {
        title: "Rule shortcut",
        lines: ["×1 keeps it", "×0 makes 0"],
      },
      examples: [
        {
          label: "Identity Rule",
          expression: "7 × 1 = 7",
          note: "Multiplying by 1 keeps the number the same.",
        },
        {
          label: "Zero Rule",
          expression: "7 × 0 = 0",
          note: "Multiplying by 0 makes the product 0.",
        },
      ],
      explanationSteps: [
        "Look at how many groups there are.",
        "Look at how many are in each group.",
        "Use the 0 or 1 rule to find the product.",
      ],
      ruleCards: [
        {
          eyebrow: "Multiplying by 1",
          equation: "7 × 1 = 7",
          badge: "Same number",
          description: "One in each group keeps the total the same as the number of groups.",
        },
        {
          eyebrow: "Multiplying by 0",
          equation: "7 × 0 = 0",
          badge: "Zero total",
          description: "Zero in each group means there are no items to count.",
        },
      ],
    },

    buildIt: {
      title: "Build the 0 and 1 rules",
      subtitle: "Move stars into groups and watch the total change.",
      activityType: "zero_identity_groups",
      rounds: [
        {
          id: "g3-u1-w1-d1-build-1",
          groups: 4,
          inEach: 1,
          instruction: "Put 1 star in each group.",
          summary: "4 groups of 1 = 4 total",
          pattern: "When each group has 1, the total stays the same as the number of groups.",
          equation: "4 × 1 = 4",
        },
        {
          id: "g3-u1-w1-d1-build-2",
          groups: 4,
          inEach: 0,
          instruction: "Make 4 groups with 0 stars in each group.",
          summary: "4 groups of 0 = 0 total",
          pattern: "When each group has 0, there are no stars to count.",
          equation: "4 × 0 = 0",
        },
        {
          id: "g3-u1-w1-d1-build-3",
          groups: 6,
          inEach: 1,
          instruction: "Put 1 star in each group.",
          summary: "6 groups of 1 = 6 total",
          pattern: "Multiplying by 1 keeps the number the same.",
          equation: "6 × 1 = 6",
        },
      ],
    },

    seeIt: {
      title: "Spot the rule",
      subtitle: "Find the equation that does not match the picture.",
      prompt: "Check the groups first. Then check what is in each group.",
      examples: [
        {
          id: "g3-u1-w1-d1-see-example-1",
          title: "Groups of 1",
          subtitle: "Each group has 1 star.",
          groups: 4,
          inEach: 1,
          equation: "4 × 1 = 4",
          sentence: "4 groups of 1 makes 4 total.",
        },
        {
          id: "g3-u1-w1-d1-see-example-2",
          title: "Groups of 0",
          subtitle: "Each group has 0 stars.",
          groups: 4,
          inEach: 0,
          equation: "4 × 0 = 0",
          sentence: "4 groups of 0 makes 0 total.",
        },
      ],
      clues: [
        {
          id: "g3-u1-w1-d1-see-1",
          visualLabel: "The picture shows 4 groups of 1",
          groups: 4,
          inEach: 1,
          choices: ["4 × 1 = 4", "4 × 0 = 4", "1 + 1 + 1 + 1 = 4"],
          sneakyEquation: "4 × 0 = 4",
          feedback: "Nice spotting! The picture shows 1 in each group, not 0.",
          tip: "Check the groups first. Then check what is in each group.",
          ruleFocus: "identity",
        },
        {
          id: "g3-u1-w1-d1-see-2",
          visualLabel: "The picture shows 4 groups of 0",
          groups: 4,
          inEach: 0,
          choices: ["4 × 0 = 0", "4 × 1 = 0", "0 + 0 + 0 + 0 = 0"],
          sneakyEquation: "4 × 1 = 0",
          feedback: "Good eye! The groups are empty, so the equation should use 0 in each group.",
          tip: "Empty groups mean there are no items to count.",
          ruleFocus: "zero",
        },
      ],
    },

    words: {
      title: "Today’s Words",
      subtitle: "Learn the words that help explain the rules.",
      vocabulary: [
        {
          word: "zero rule",
          definition: "When a number is multiplied by 0, the product is 0.",
          example: "4 × 0 = 0",
          visual: ["0", "0", "0", "0"],
          equation: "any number × 0 = 0",
        },
        {
          word: "identity rule",
          definition: "When a number is multiplied by 1, the product stays the same.",
          example: "4 × 1 = 4",
          visual: ["4", "×", "1"],
          equation: "any number × 1 = same number",
        },
        {
          word: "factor",
          definition: "A number being multiplied.",
          example: "4 and 1 are factors",
          visual: ["4", "×", "1"],
          equation: "factor × factor",
        },
        {
          word: "product",
          definition: "The answer to a multiplication problem.",
          example: "4 is the product",
          visual: ["4", "×", "1", "=", "4"],
          equation: "product = answer",
        },
      ],
    },

    quickCheck: {
      title: "Quick Check",
      subtitle: "Show that you can use the 0 and 1 rules.",
      passingScore: 3,
      questions: [
        {
          id: "g3-u1-w1-d1-qc-1",
          prompt: "8 groups of 1",
          equationStart: "8 × 1 =",
          productPrompt: "Product:",
          choices: ["0", "1", "8"],
          correctAnswer: "8",
          ruleType: "Identity Rule",
          tipTitle: "Use the Identity Rule",
          tipText: "Any number × 1 stays the same.",
          hint: "Multiplying by 1 keeps the number the same.",
          success: "Nice! 8 × 1 = 8.",
          visualGroups: 8,
          visualCount: 1,
        },
        {
          id: "g3-u1-w1-d1-qc-2",
          prompt: "6 groups of 0",
          equationStart: "6 × 0 =",
          productPrompt: "Product:",
          choices: ["0", "1", "6"],
          correctAnswer: "0",
          ruleType: "Zero Rule",
          tipTitle: "Use the Zero Rule",
          tipText: "Any number × 0 equals 0.",
          hint: "Multiplying by 0 always makes 0.",
          success: "Correct! 6 × 0 = 0.",
          visualGroups: 6,
          visualCount: 0,
        },
        {
          id: "g3-u1-w1-d1-qc-3",
          prompt: "In 9 × 1 = 9, what is the product?",
          equationStart: "9 × 1 =",
          productPrompt: "Product:",
          choices: ["1", "9", "×"],
          correctAnswer: "9",
          ruleType: "Product",
          tipTitle: "Find the product",
          tipText: "The product is the answer to a multiplication problem.",
          hint: "The product is the answer.",
          success: "Nice! The product is 9.",
          visualGroups: 9,
          visualCount: 1,
        },
      ],
    },

    tryIt: {
      title: "Try one together",
      subtitle: "Use the 0 and 1 rules to solve each mini problem.",
      requiredCount: 5,
      problems: [
        {
          id: "g3-u1-w1-d1-try-1",
          story: "There are 5 flower pots.",
          question: "Each pot has 1 sprout. How many sprouts are there in all?",
          groups: "5",
          inEach: "1",
          total: "5",
          groupLabel: "flower pots",
          inEachLabel: "1 sprout",
          visualEmoji: "🌱",
          equation: "5 × 1 = 5",
          groupsChoices: ["3", "4", "5"],
          inEachChoices: ["0", "1", "2"],
          equationChoices: ["5 × 1 = 5", "5 × 0 = 5", "5 × 1 = 1"],
          successMessage: "Nice! 5 groups of 1 makes 5 total.",
          tip: "Use the clues in the story to solve it step by step!",
        },
        {
          id: "g3-u1-w1-d1-try-2",
          story: "There are 4 baskets on a table.",
          question: "Each basket has 0 apples. How many apples are there in all?",
          groups: "4",
          inEach: "0",
          total: "0",
          groupLabel: "baskets",
          inEachLabel: "0 apples",
          visualEmoji: "🍎",
          visualEmpty: true,
          equation: "4 × 0 = 0",
          groupsChoices: ["0", "4", "5"],
          inEachChoices: ["0", "1", "4"],
          equationChoices: ["4 × 1 = 4", "4 × 0 = 0", "0 × 1 = 4"],
          successMessage: "Correct! 4 empty groups makes 0 total.",
          tip: "Empty groups still count as groups. There are just 0 in each.",
        },
        {
          id: "g3-u1-w1-d1-try-3",
          story: "Milo has 6 sticker spots.",
          question: "Each spot has 1 star sticker. How many stickers are there?",
          groups: "6",
          inEach: "1",
          total: "6",
          groupLabel: "sticker spots",
          inEachLabel: "1 sticker",
          visualEmoji: "⭐",
          equation: "6 × 1 = 6",
          groupsChoices: ["1", "5", "6"],
          inEachChoices: ["0", "1", "6"],
          equationChoices: ["6 × 1 = 6", "6 × 0 = 6", "6 × 1 = 1"],
          successMessage: "Great! 6 groups of 1 makes 6 total.",
          tip: "When each group has 1, the total matches the number of groups.",
        },
        {
          id: "g3-u1-w1-d1-try-4",
          story: "Ava sets out 3 empty snack plates.",
          question: "Each plate has 0 crackers. How many crackers are there?",
          groups: "3",
          inEach: "0",
          total: "0",
          groupLabel: "plates",
          inEachLabel: "0 crackers",
          visualEmoji: "🥨",
          visualEmpty: true,
          equation: "3 × 0 = 0",
          groupsChoices: ["0", "3", "5"],
          inEachChoices: ["0", "1", "3"],
          equationChoices: ["3 × 1 = 3", "3 × 0 = 0", "0 × 3 = 3"],
          successMessage: "You got it! 3 groups of 0 makes 0 total.",
          tip: "The plates are the groups. The crackers in each plate are 0.",
        },
        {
          id: "g3-u1-w1-d1-try-5",
          story: "There are 7 tiny lanterns.",
          question: "Each lantern has 1 glowing star. How many stars glow?",
          groups: "7",
          inEach: "1",
          total: "7",
          groupLabel: "lanterns",
          inEachLabel: "1 star",
          visualEmoji: "⭐",
          equation: "7 × 1 = 7",
          groupsChoices: ["1", "6", "7"],
          inEachChoices: ["0", "1", "7"],
          equationChoices: ["7 × 0 = 7", "7 × 1 = 7", "1 × 1 = 7"],
          successMessage: "Nice work! 7 groups of 1 makes 7 total.",
          tip: "For ×1, the product stays the same as the number of groups.",
        },
      ],
    },

    practice: {
      type: "equal_groups",
      description: "Practice using equal groups with 0 and 1 multiplication rules.",
      guidedCount: 8,
      independentCount: 10,
      challengeCount: 6,
    },

    completion: {
      unlocksNextLessonAfter: "guided",
      fullMasteryIncludes: ["learn", "tryIt", "guided", "independent", "challenge", "flashcards"],
      nextLessonId: "unit-1-week-1-day-2",
    },
  },

  {
    ...unitMeta,
    id: "unit-1-week-1-day-2",
    lessonNumber: 2,
    lessonType: "lesson",
    title: "Repeated Addition to Multiplication",
    shortTitle: "Repeated Addition",
    label: "Lesson 2",
    objective: "Use repeated addition to write a multiplication equation.",
    kidGoal: "I can turn repeated addition into multiplication.",
    topic: "multiplication",
    practiceType: "repeated_addition_to_multiplication",
    flashcardDeckId: "lesson-g3-u1-w1-d2-repeated-addition",

    lessonHero: {
      eyebrow: "Grade 3 • Unit 1 • Lesson 2",
      title: "Repeated Addition to Multiplication",
      subtitle: "Turn adding the same number again and again into a multiplication shortcut.",
      missionTitle: "Today’s Mission",
      missionSteps,
    },

    bigIdea: {
      title: "Repeated addition can become multiplication.",
      subtitle: "When the same number is added again and again, multiplication is a shortcut.",
      thumbnail: "/images/learn/thumbnails/repeated-addition.webp",
      videoCaption: "Watch repeated addition turn into multiplication.",
      intro:
        "Today you’ll turn repeated addition into multiplication using groups × in each = product.",
      bigQuestion: "How can repeated addition become a multiplication equation?",
      starTip: {
        title: "Math shortcut",
        lines: ["Groups × in each", "= product"],
      },
      examples: [
        {
          label: "Long way",
          expression: "5 + 5 + 5 + 5 = 20",
          note: "The number 5 is added 4 times.",
        },
        {
          label: "Shortcut",
          expression: "4 × 5 = 20",
          note: "4 groups of 5 makes 20.",
        },
      ],
      explanationSteps: [
        "Count how many equal groups there are.",
        "Count how many are in each group.",
        "Write groups × in each = product.",
      ],
      ruleCards: [
        {
          eyebrow: "Repeated addition",
          equation: "5 + 5 + 5 + 5 = 20",
          badge: "Long way",
          description: "Add the same number again and again.",
        },
        {
          eyebrow: "Multiplication",
          equation: "4 × 5 = 20",
          badge: "Shortcut",
          description: "4 groups of 5 gives the same product.",
        },
      ],
    },

    buildIt: {
      title: "Build repeated addition",
      subtitle: "Use equal groups to see the long way and the shortcut.",
      activityType: "repeated_addition_builder",
      rounds: [
        {
          id: "g3-u1-w1-d2-build-1",
          groups: 4,
          inEach: 5,
          instruction: "Build 4 groups with 5 in each group.",
          summary: "5 + 5 + 5 + 5 = 20",
          pattern: "Four equal groups of 5 can be written as 4 × 5.",
          equation: "4 × 5 = 20",
        },
        {
          id: "g3-u1-w1-d2-build-2",
          groups: 3,
          inEach: 4,
          instruction: "Build 3 groups with 4 in each group.",
          summary: "4 + 4 + 4 = 12",
          pattern: "Three equal groups of 4 can be written as 3 × 4.",
          equation: "3 × 4 = 12",
        },
        {
          id: "g3-u1-w1-d2-build-3",
          groups: 5,
          inEach: 2,
          instruction: "Build 5 groups with 2 in each group.",
          summary: "2 + 2 + 2 + 2 + 2 = 10",
          pattern: "Five equal groups of 2 can be written as 5 × 2.",
          equation: "5 × 2 = 10",
        },
      ],
    },

    seeIt: {
      title: "Spot the shortcut",
      subtitle: "Match the repeated addition to the multiplication equation.",
      prompt: "Count how many addends there are, then count what number repeats.",
      examples: [
        {
          id: "g3-u1-w1-d2-see-example-1",
          title: "Four 5s",
          subtitle: "5 is added 4 times.",
          groups: 4,
          inEach: 5,
          equation: "4 × 5 = 20",
          sentence: "5 + 5 + 5 + 5 matches 4 × 5.",
        },
        {
          id: "g3-u1-w1-d2-see-example-2",
          title: "Three 4s",
          subtitle: "4 is added 3 times.",
          groups: 3,
          inEach: 4,
          equation: "3 × 4 = 12",
          sentence: "4 + 4 + 4 matches 3 × 4.",
        },
      ],
      clues: [
        {
          id: "g3-u1-w1-d2-see-1",
          visualLabel: "The repeated addition is 3 + 3 + 3 + 3",
          groups: 4,
          inEach: 3,
          choices: ["4 × 3 = 12", "3 × 4 = 12", "3 × 3 = 12"],
          sneakyEquation: "3 × 3 = 12",
          feedback: "Good eye! There are four 3s, so the shortcut is 4 × 3.",
          tip: "The number of repeated addends tells the number of groups.",
          ruleFocus: "repeated-addition",
        },
        {
          id: "g3-u1-w1-d2-see-2",
          visualLabel: "The repeated addition is 5 + 5",
          groups: 2,
          inEach: 5,
          choices: ["2 × 5 = 10", "5 × 2 = 10", "5 × 5 = 10"],
          sneakyEquation: "5 × 5 = 10",
          feedback: "You found it! There are two 5s, not five 5s.",
          tip: "Use groups × in each.",
          ruleFocus: "groups-in-each",
        },
      ],
    },

    words: {
      title: "Today’s Words",
      subtitle: "These words help turn repeated addition into multiplication.",
      vocabulary: [
        {
          word: "repeated addition",
          definition: "Adding the same number again and again.",
          example: "5 + 5 + 5 + 5",
          visual: ["5", "+", "5", "+", "5"],
          equation: "5 + 5 + 5 + 5 = 20",
        },
        {
          word: "equal groups",
          definition: "Groups with the same amount in each group.",
          example: "4 groups of 5",
          visual: ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐"],
          equation: "4 groups of 5",
        },
        {
          word: "factor",
          definition: "A number being multiplied.",
          example: "4 and 5 are factors",
          visual: ["4", "×", "5"],
          equation: "factor × factor",
        },
        {
          word: "product",
          definition: "The answer to a multiplication problem.",
          example: "20 is the product",
          visual: ["4", "×", "5", "=", "20"],
          equation: "product = answer",
        },
      ],
    },

    quickCheck: {
      title: "Quick Check",
      subtitle: "Turn repeated addition into multiplication.",
      passingScore: 3,
      questions: [
        {
          id: "g3-u1-w1-d2-qc-1",
          prompt: "Which multiplication equation matches 3 + 3 + 3 + 3?",
          equationStart: "3 + 3 + 3 + 3 →",
          productPrompt: "Shortcut:",
          choices: ["3 × 4", "4 × 3", "3 × 3"],
          correctAnswer: "4 × 3",
          ruleType: "Repeated Addition",
          tipTitle: "Count the groups",
          tipText: "There are 4 groups of 3.",
          hint: "There are 4 groups of 3.",
          success: "Yes! 3 + 3 + 3 + 3 is 4 × 3.",
          visualGroups: 4,
          visualCount: 3,
        },
        {
          id: "g3-u1-w1-d2-qc-2",
          prompt: "5 + 5 = ?",
          equationStart: "5 + 5 →",
          productPrompt: "Shortcut:",
          choices: ["2 × 5", "5 × 5", "1 × 5"],
          correctAnswer: "2 × 5",
          ruleType: "Groups × in each",
          tipTitle: "Use the shortcut",
          tipText: "There are 2 groups of 5.",
          hint: "There are 2 groups of 5.",
          success: "Correct! 5 + 5 is 2 × 5.",
          visualGroups: 2,
          visualCount: 5,
        },
        {
          id: "g3-u1-w1-d2-qc-3",
          prompt: "What is the product of 4 × 5?",
          equationStart: "4 × 5 =",
          productPrompt: "Product:",
          choices: ["9", "20", "45"],
          correctAnswer: "20",
          ruleType: "Product",
          tipTitle: "Find the product",
          tipText: "4 groups of 5 means 5 + 5 + 5 + 5.",
          hint: "4 groups of 5 means 5 + 5 + 5 + 5.",
          success: "Nice! 4 × 5 = 20.",
          visualGroups: 4,
          visualCount: 5,
        },
      ],
    },

    tryIt: {
      title: "Try one together",
      subtitle: "Read the repeated addition and write the multiplication shortcut.",
      requiredCount: 5,
      problems: [
        {
          id: "g3-u1-w1-d2-try-1",
          story: "Ava sees 4 bags with 5 stars in each bag.",
          question: "What multiplication equation matches 5 + 5 + 5 + 5?",
          groups: "4",
          inEach: "5",
          total: "20",
          groupLabel: "bags",
          inEachLabel: "5 stars",
          visualEmoji: "⭐",
          equation: "4 × 5 = 20",
          groupsChoices: ["3", "4", "5"],
          inEachChoices: ["4", "5", "20"],
          equationChoices: ["5 × 4 = 20", "4 × 5 = 20", "4 × 4 = 16"],
          successMessage: "Yes! 5 + 5 + 5 + 5 is 4 groups of 5.",
          tip: "Count how many times the same number repeats. That is the number of groups.",
        },
        {
          id: "g3-u1-w1-d2-try-2",
          story: "There are 3 shelves with 4 books on each shelf.",
          question: "What multiplication equation matches 4 + 4 + 4?",
          groups: "3",
          inEach: "4",
          total: "12",
          groupLabel: "shelves",
          inEachLabel: "4 books",
          visualEmoji: "📘",
          equation: "3 × 4 = 12",
          groupsChoices: ["3", "4", "12"],
          inEachChoices: ["3", "4", "7"],
          equationChoices: ["3 × 4 = 12", "4 × 3 = 12", "3 × 3 = 9"],
          successMessage: "Correct! 4 + 4 + 4 is 3 groups of 4.",
          tip: "Use groups × in each = product.",
        },
        {
          id: "g3-u1-w1-d2-try-3",
          story: "Noah lines up 5 toy cars with 2 wheels showing on each car.",
          question: "What multiplication equation matches 2 + 2 + 2 + 2 + 2?",
          groups: "5",
          inEach: "2",
          total: "10",
          groupLabel: "toy cars",
          inEachLabel: "2 wheels",
          visualEmoji: "🚗",
          equation: "5 × 2 = 10",
          groupsChoices: ["2", "5", "10"],
          inEachChoices: ["2", "5", "7"],
          equationChoices: ["5 × 2 = 10", "2 × 5 = 10", "5 × 5 = 25"],
          successMessage: "Great! The number 2 repeats 5 times, so it is 5 × 2.",
          tip: "The repeated addend tells how many are in each group.",
        },
        {
          id: "g3-u1-w1-d2-try-4",
          story: "There are 6 plates with 3 berries on each plate.",
          question: "What multiplication equation matches 3 + 3 + 3 + 3 + 3 + 3?",
          groups: "6",
          inEach: "3",
          total: "18",
          groupLabel: "plates",
          inEachLabel: "3 berries",
          visualEmoji: "🫐",
          equation: "6 × 3 = 18",
          groupsChoices: ["3", "6", "18"],
          inEachChoices: ["3", "6", "9"],
          equationChoices: ["6 × 3 = 18", "3 × 6 = 18", "6 × 6 = 36"],
          successMessage: "Nice! 3 is added 6 times, so the shortcut is 6 × 3.",
          tip: "Groups first, in each second.",
        },
        {
          id: "g3-u1-w1-d2-try-5",
          story: "Liam stacks 4 boxes with 6 blocks in each box.",
          question: "What multiplication equation matches 6 + 6 + 6 + 6?",
          groups: "4",
          inEach: "6",
          total: "24",
          groupLabel: "boxes",
          inEachLabel: "6 blocks",
          visualEmoji: "🧱",
          equation: "4 × 6 = 24",
          groupsChoices: ["4", "6", "24"],
          inEachChoices: ["4", "6", "10"],
          equationChoices: ["4 × 6 = 24", "6 × 4 = 24", "4 × 4 = 16"],
          successMessage: "You got it! 6 + 6 + 6 + 6 is 4 groups of 6.",
          tip: "Multiplication is the shortcut for repeated addition.",
        },
      ],
    },

    practice: {
      type: "repeated_addition_to_multiplication",
      description: "Practice turning repeated addition into multiplication equations.",
      guidedCount: 8,
      independentCount: 10,
      challengeCount: 6,
    },

    completion: {
      unlocksNextLessonAfter: "guided",
      fullMasteryIncludes: ["learn", "tryIt", "guided", "independent", "challenge", "flashcards"],
      nextLessonId: "unit-1-week-1-day-3",
    },
  },

  {
    ...unitMeta,
    id: "unit-1-week-1-day-3",
    lessonNumber: 3,
    lessonType: "lesson",
    title: "Factors and Products",
    shortTitle: "Factors & Products",
    label: "Lesson 3",
    objective: "Identify factors and products in multiplication equations.",
    kidGoal: "I can name the factors and product in a multiplication equation.",
    topic: "multiplication",
    practiceType: "factor_product_identification",
    flashcardDeckId: "lesson-g3-u1-w1-d3-factors-products",

    lessonHero: {
      eyebrow: "Grade 3 • Unit 1 • Lesson 3",
      title: "Factors and Products",
      subtitle: "Learn the names for the numbers in a multiplication equation.",
      missionTitle: "Today’s Mission",
      missionSteps,
    },

    bigIdea: {
      title: "Factors make a product.",
      subtitle: "Factors are the numbers being multiplied. The product is the answer.",
      thumbnail: "/images/learn/thumbnails/factors-products.webp",
      videoCaption: "Watch how factors and products work.",
      intro: "Today you’ll learn the names of the parts in a multiplication equation.",
      bigQuestion: "Which numbers are the factors, and which number is the product?",
      starTip: {
        title: "Equation parts",
        lines: ["factor × factor", "= product"],
      },
      examples: [
        {
          label: "Factors",
          expression: "4 × 5",
          note: "4 and 5 are factors.",
        },
        {
          label: "Product",
          expression: "4 × 5 = 20",
          note: "20 is the product.",
        },
      ],
      explanationSteps: [
        "Find the multiplication sign.",
        "The numbers beside it are the factors.",
        "The answer after the equals sign is the product.",
      ],
      ruleCards: [
        {
          eyebrow: "Factors",
          equation: "4 × 5",
          badge: "Numbers multiplied",
          description: "4 and 5 are the factors because they are being multiplied.",
        },
        {
          eyebrow: "Product",
          equation: "4 × 5 = 20",
          badge: "Answer",
          description: "20 is the product because it is the answer.",
        },
      ],
    },

    buildIt: {
      title: "Build the equation parts",
      subtitle: "Sort each number into factor or product.",
      activityType: "factor_product_sort",
      rounds: [
        {
          id: "g3-u1-w1-d3-build-1",
          groups: 4,
          inEach: 5,
          instruction: "Look at 4 × 5 = 20. Find the factors and product.",
          summary: "4 and 5 are factors. 20 is the product.",
          pattern: "Factors are multiplied. The product is the answer.",
          equation: "4 × 5 = 20",
        },
        {
          id: "g3-u1-w1-d3-build-2",
          groups: 3,
          inEach: 6,
          instruction: "Look at 3 × 6 = 18. Find the factors and product.",
          summary: "3 and 6 are factors. 18 is the product.",
          pattern: "The product comes after the equals sign.",
          equation: "3 × 6 = 18",
        },
        {
          id: "g3-u1-w1-d3-build-3",
          groups: 2,
          inEach: 7,
          instruction: "Look at 2 × 7 = 14. Find the factors and product.",
          summary: "2 and 7 are factors. 14 is the product.",
          pattern: "The two numbers being multiplied are factors.",
          equation: "2 × 7 = 14",
        },
      ],
    },

    seeIt: {
      title: "Spot the equation parts",
      subtitle: "Choose the statement that does not match the equation.",
      prompt: "Factors are beside the multiplication sign. The product is the answer.",
      examples: [
        {
          id: "g3-u1-w1-d3-see-example-1",
          title: "Factors",
          subtitle: "Numbers being multiplied.",
          groups: 4,
          inEach: 5,
          equation: "4 × 5 = 20",
          sentence: "4 and 5 are factors.",
        },
        {
          id: "g3-u1-w1-d3-see-example-2",
          title: "Product",
          subtitle: "Answer to multiplication.",
          groups: 4,
          inEach: 5,
          equation: "4 × 5 = 20",
          sentence: "20 is the product.",
        },
      ],
      clues: [
        {
          id: "g3-u1-w1-d3-see-1",
          visualLabel: "The equation is 3 × 4 = 12",
          groups: 3,
          inEach: 4,
          choices: ["3 and 4 are factors", "12 is the product", "4 and 12 are factors"],
          sneakyEquation: "4 and 12 are factors",
          feedback: "Nice spotting! 12 is the product, not a factor in this equation.",
          tip: "The product is the answer after the equals sign.",
          ruleFocus: "factor-product",
        },
        {
          id: "g3-u1-w1-d3-see-2",
          visualLabel: "The equation is 5 × 2 = 10",
          groups: 5,
          inEach: 2,
          choices: ["5 is a factor", "10 is a product", "2 is the product"],
          sneakyEquation: "2 is the product",
          feedback: "You found it! 2 is a factor. 10 is the product.",
          tip: "The factors are multiplied together.",
          ruleFocus: "factor-product",
        },
      ],
    },

    words: {
      title: "Today’s Words",
      subtitle: "These are the main multiplication vocabulary words.",
      vocabulary: [
        {
          word: "factor",
          definition: "A number being multiplied.",
          example: "4 and 5 are factors",
          visual: ["4", "×", "5"],
          equation: "factor × factor",
        },
        {
          word: "product",
          definition: "The answer to a multiplication problem.",
          example: "20 is the product",
          visual: ["4", "×", "5", "=", "20"],
          equation: "product = answer",
        },
        {
          word: "equation",
          definition: "A math sentence with an equals sign.",
          example: "4 × 5 = 20",
          visual: ["4 × 5", "=", "20"],
          equation: "equation = math sentence",
        },
        {
          word: "multiply",
          definition: "To combine equal groups.",
          example: "4 groups of 5",
          visual: ["4", "groups", "of", "5"],
          equation: "groups × in each",
        },
      ],
    },

    quickCheck: {
      title: "Quick Check",
      subtitle: "Name the factors and product.",
      passingScore: 3,
      questions: [
        {
          id: "g3-u1-w1-d3-qc-1",
          prompt: "In 4 × 5 = 20, what are the factors?",
          equationStart: "4 × 5 = 20",
          productPrompt: "Factors:",
          choices: ["4 and 5", "20", "5 and 20"],
          correctAnswer: "4 and 5",
          ruleType: "Factors",
          tipTitle: "Find the factors",
          tipText: "Factors are the numbers being multiplied.",
          hint: "Factors are the numbers being multiplied.",
          success: "Yes! 4 and 5 are the factors.",
          visualGroups: 4,
          visualCount: 5,
        },
        {
          id: "g3-u1-w1-d3-qc-2",
          prompt: "In 3 × 6 = 18, what is the product?",
          equationStart: "3 × 6 =",
          productPrompt: "Product:",
          choices: ["3", "6", "18"],
          correctAnswer: "18",
          ruleType: "Product",
          tipTitle: "Find the product",
          tipText: "The product is the answer.",
          hint: "The product is the answer.",
          success: "Correct! 18 is the product.",
          visualGroups: 3,
          visualCount: 6,
        },
        {
          id: "g3-u1-w1-d3-qc-3",
          prompt: "Which word means the answer to a multiplication problem?",
          equationStart: "factor × factor =",
          productPrompt: "Word:",
          choices: ["factor", "product", "group"],
          correctAnswer: "product",
          ruleType: "Math Word",
          tipTitle: "Remember the word",
          tipText: "The product is what you get after multiplying.",
          hint: "The product is what you get after multiplying.",
          success: "Nice! Product means the multiplication answer.",
          visualGroups: 2,
          visualCount: 3,
        },
      ],
    },

    tryIt: {
      title: "Try one together",
      subtitle: "Read each equation and name its parts.",
      requiredCount: 5,
      problems: [
        {
          id: "g3-u1-w1-d3-try-1",
          story: "Look at the equation 4 × 5 = 20.",
          question: "What is the product?",
          groups: "4",
          inEach: "5",
          total: "20",
          groupLabel: "factors",
          inEachLabel: "numbers being multiplied",
          visualEmoji: "✖️",
          equation: "4 × 5 = 20",
          groupsChoices: ["4", "5", "20"],
          inEachChoices: ["factor", "product", "sum"],
          equationChoices: ["Product: 20", "Product: 4", "Product: 5"],
          successMessage: "Yes! 20 is the product.",
          tip: "The product is the answer after the equals sign.",
        },
        {
          id: "g3-u1-w1-d3-try-2",
          story: "Look at the equation 3 × 6 = 18.",
          question: "What are the factors?",
          groups: "3",
          inEach: "6",
          total: "18",
          groupLabel: "factor 1",
          inEachLabel: "factor 2",
          visualEmoji: "🔢",
          equation: "3 and 6",
          groupsChoices: ["3", "6", "18"],
          inEachChoices: ["3", "6", "18"],
          equationChoices: ["3 and 6", "3 and 18", "6 and 18"],
          successMessage: "Correct! 3 and 6 are the factors.",
          tip: "Factors are the numbers being multiplied.",
        },
        {
          id: "g3-u1-w1-d3-try-3",
          story: "Look at the equation 2 × 7 = 14.",
          question: "What is the product?",
          groups: "2",
          inEach: "7",
          total: "14",
          groupLabel: "factor 1",
          inEachLabel: "factor 2",
          visualEmoji: "⭐",
          equation: "Product: 14",
          groupsChoices: ["2", "7", "14"],
          inEachChoices: ["factor", "product", "group"],
          equationChoices: ["Product: 14", "Product: 7", "Factors: 14"],
          successMessage: "Nice! 14 is the product.",
          tip: "The product is the multiplication answer.",
        },
        {
          id: "g3-u1-w1-d3-try-4",
          story: "Look at the equation 5 × 3 = 15.",
          question: "Which numbers are factors?",
          groups: "5",
          inEach: "3",
          total: "15",
          groupLabel: "factor 1",
          inEachLabel: "factor 2",
          visualEmoji: "🔷",
          equation: "5 and 3",
          groupsChoices: ["5", "3", "15"],
          inEachChoices: ["3", "5", "15"],
          equationChoices: ["5 and 3", "5 and 15", "3 and 15"],
          successMessage: "Great! 5 and 3 are the factors.",
          tip: "Look on each side of the multiplication sign to find the factors.",
        },
        {
          id: "g3-u1-w1-d3-try-5",
          story: "Look at the equation 8 × 1 = 8.",
          question: "Which word names the answer?",
          groups: "8",
          inEach: "1",
          total: "8",
          groupLabel: "factor 1",
          inEachLabel: "factor 2",
          visualEmoji: "💡",
          equation: "product",
          groupsChoices: ["8", "1", "×"],
          inEachChoices: ["factor", "product", "equation"],
          equationChoices: ["product", "factor", "group"],
          successMessage: "You got it! The answer is called the product.",
          tip: "Factor × factor = product.",
        },
      ],
    },

    practice: {
      type: "factor_product_identification",
      description: "Practice finding factors and products in multiplication equations.",
      guidedCount: 8,
      independentCount: 10,
      challengeCount: 6,
    },

    completion: {
      unlocksNextLessonAfter: "guided",
      fullMasteryIncludes: ["learn", "tryIt", "guided", "independent", "challenge", "flashcards"],
      nextLessonId: "unit-1-week-1-day-4",
    },
  },

  {
    ...unitMeta,
    id: "unit-1-week-1-day-4",
    lessonNumber: 4,
    lessonType: "lesson",
    title: "Equal Groups With Objects",
    shortTitle: "Equal Groups",
    label: "Lesson 4",
    objective: "Use objects to build equal groups and connect models to equations.",
    kidGoal: "I can use equal groups to write multiplication equations.",
    topic: "multiplication",
    practiceType: "equal_groups_with_objects",
    flashcardDeckId: "lesson-g3-u1-w1-d4-object-groups",

    lessonHero: {
      eyebrow: "Grade 3 • Unit 1 • Lesson 4",
      title: "Equal Groups With Objects",
      subtitle: "Build equal groups with objects and connect the model to multiplication.",
      missionTitle: "Today’s Mission",
      missionSteps,
    },

    bigIdea: {
      title: "Equal groups can be shown with multiplication.",
      subtitle:
        "Equal groups have the same number in each group. Multiplication helps find the total.",
      thumbnail: "/images/learn/thumbnails/equal-groups.webp",
      videoCaption: "Watch equal groups become multiplication equations.",
      intro: "Today you’ll use objects and pictures to build equal groups and write equations.",
      bigQuestion: "How do equal groups help us write a multiplication equation?",
      starTip: {
        title: "Equal groups",
        lines: ["groups × in each", "= product"],
      },
      examples: [
        {
          label: "Model",
          expression: "3 groups of 4",
          note: "There are 3 equal groups with 4 in each group.",
        },
        {
          label: "Equation",
          expression: "3 × 4 = 12",
          note: "3 groups of 4 makes 12.",
        },
      ],
      explanationSteps: [
        "Count the number of equal groups.",
        "Count how many objects are in each group.",
        "Multiply to find the total product.",
      ],
      ruleCards: [
        {
          eyebrow: "Equal groups",
          equation: "3 groups of 4",
          badge: "Same in each",
          description: "Each group must have the same number of objects.",
        },
        {
          eyebrow: "Multiplication equation",
          equation: "3 × 4 = 12",
          badge: "Total product",
          description: "Use groups × in each to find the product.",
        },
      ],
    },

    buildIt: {
      title: "Build equal groups",
      subtitle: "Arrange objects into equal piles and write the equation.",
      activityType: "object_equal_groups",
      rounds: [
        {
          id: "g3-u1-w1-d4-build-1",
          groups: 3,
          inEach: 4,
          instruction: "Build 3 equal groups with 4 objects in each group.",
          summary: "3 groups of 4 = 12 total",
          pattern: "3 groups of 4 can be written as 3 × 4.",
          equation: "3 × 4 = 12",
        },
        {
          id: "g3-u1-w1-d4-build-2",
          groups: 2,
          inEach: 6,
          instruction: "Build 2 equal groups with 6 objects in each group.",
          summary: "2 groups of 6 = 12 total",
          pattern: "2 groups of 6 can be written as 2 × 6.",
          equation: "2 × 6 = 12",
        },
        {
          id: "g3-u1-w1-d4-build-3",
          groups: 5,
          inEach: 3,
          instruction: "Build 5 equal groups with 3 objects in each group.",
          summary: "5 groups of 3 = 15 total",
          pattern: "5 groups of 3 can be written as 5 × 3.",
          equation: "5 × 3 = 15",
        },
      ],
    },

    seeIt: {
      title: "Spot the equal groups",
      subtitle: "Decide which equation matches the object groups.",
      prompt: "Use groups × in each. Equal groups must have the same amount in each group.",
      examples: [
        {
          id: "g3-u1-w1-d4-see-example-1",
          title: "Three groups",
          subtitle: "4 in each group.",
          groups: 3,
          inEach: 4,
          equation: "3 × 4 = 12",
          sentence: "3 groups of 4 makes 12 total.",
        },
        {
          id: "g3-u1-w1-d4-see-example-2",
          title: "Five groups",
          subtitle: "3 in each group.",
          groups: 5,
          inEach: 3,
          equation: "5 × 3 = 15",
          sentence: "5 groups of 3 makes 15 total.",
        },
      ],
      clues: [
        {
          id: "g3-u1-w1-d4-see-1",
          visualLabel: "The picture shows 3 groups of 4",
          groups: 3,
          inEach: 4,
          choices: ["3 × 4 = 12", "4 × 3 = 12", "3 + 4 = 12"],
          sneakyEquation: "3 + 4 = 12",
          feedback: "Nice spotting! 3 + 4 does not show 3 equal groups of 4.",
          tip: "Use groups × in each.",
          ruleFocus: "equal-groups",
        },
        {
          id: "g3-u1-w1-d4-see-2",
          visualLabel: "The picture shows 5 groups of 3",
          groups: 5,
          inEach: 3,
          choices: ["5 × 3 = 15", "3 + 3 + 3 + 3 + 3 = 15", "5 × 5 = 15"],
          sneakyEquation: "5 × 5 = 15",
          feedback: "Good catch! There are 5 groups, but only 3 in each group.",
          tip: "Check how many are in each group before choosing.",
          ruleFocus: "groups-in-each",
        },
      ],
    },

    words: {
      title: "Today’s Words",
      subtitle: "These words help describe object groups.",
      vocabulary: [
        {
          word: "equal groups",
          definition: "Groups with the same number in each group.",
          example: "3 groups of 4",
          visual: ["⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐"],
          equation: "3 groups of 4",
        },
        {
          word: "in each",
          definition: "How many are inside every group.",
          example: "4 in each group",
          visual: ["4", "in", "each"],
          equation: "groups × in each",
        },
        {
          word: "factor",
          definition: "A number being multiplied.",
          example: "3 and 4 are factors",
          visual: ["3", "×", "4"],
          equation: "factor × factor",
        },
        {
          word: "product",
          definition: "The answer to a multiplication problem.",
          example: "12 is the product",
          visual: ["3", "×", "4", "=", "12"],
          equation: "product = answer",
        },
      ],
    },

    quickCheck: {
      title: "Quick Check",
      subtitle: "Use object groups to choose the equation.",
      passingScore: 3,
      questions: [
        {
          id: "g3-u1-w1-d4-qc-1",
          prompt: "Which equation matches 3 groups of 4?",
          equationStart: "3 groups of 4 →",
          productPrompt: "Equation:",
          choices: ["3 × 4", "4 × 3", "3 + 4"],
          correctAnswer: "3 × 4",
          ruleType: "Equal Groups",
          tipTitle: "Use groups × in each",
          tipText: "3 groups of 4 is 3 × 4.",
          hint: "Use groups × in each.",
          success: "Yes! 3 groups of 4 is 3 × 4.",
          visualGroups: 3,
          visualCount: 4,
        },
        {
          id: "g3-u1-w1-d4-qc-2",
          prompt: "What is the product of 3 × 4?",
          equationStart: "3 × 4 =",
          productPrompt: "Product:",
          choices: ["7", "12", "34"],
          correctAnswer: "12",
          ruleType: "Product",
          tipTitle: "Count the total",
          tipText: "3 groups of 4 means 4 + 4 + 4.",
          hint: "Count 4, three times: 4, 8, 12.",
          success: "Correct! 3 × 4 = 12.",
          visualGroups: 3,
          visualCount: 4,
        },
        {
          id: "g3-u1-w1-d4-qc-3",
          prompt: "Equal groups must have...",
          equationStart: "Equal groups have",
          productPrompt: "Rule:",
          choices: [
            "a different number in each group",
            "the same number in each group",
            "no objects",
          ],
          correctAnswer: "the same number in each group",
          ruleType: "Equal Groups",
          tipTitle: "Remember equal",
          tipText: "Equal means the groups match.",
          hint: "Equal means the groups match.",
          success: "Nice! Equal groups have the same number in each group.",
          visualGroups: 3,
          visualCount: 4,
        },
      ],
    },

    tryIt: {
      title: "Try one together",
      subtitle: "Use the object groups to write the multiplication equation.",
      requiredCount: 5,
      problems: [
        {
          id: "g3-u1-w1-d4-try-1",
          story: "There are 3 bowls with 4 berries in each bowl.",
          question: "What multiplication equation matches the bowls?",
          groups: "3",
          inEach: "4",
          total: "12",
          groupLabel: "bowls",
          inEachLabel: "4 berries",
          visualEmoji: "🫐",
          equation: "3 × 4 = 12",
          groupsChoices: ["3", "4", "12"],
          inEachChoices: ["3", "4", "7"],
          equationChoices: ["3 × 4 = 12", "4 × 3 = 12", "3 × 3 = 9"],
          successMessage: "Yes! 3 groups of 4 is 3 × 4.",
          tip: "Each bowl is one group.",
        },
        {
          id: "g3-u1-w1-d4-try-2",
          story: "There are 5 boxes with 3 blocks in each box.",
          question: "How many blocks are there total?",
          groups: "5",
          inEach: "3",
          total: "15",
          groupLabel: "boxes",
          inEachLabel: "3 blocks",
          visualEmoji: "🧱",
          equation: "5 × 3 = 15",
          groupsChoices: ["3", "5", "15"],
          inEachChoices: ["3", "5", "8"],
          equationChoices: ["5 × 3 = 15", "3 × 5 = 15", "5 × 5 = 25"],
          successMessage: "Correct! 5 × 3 = 15 blocks.",
          tip: "Equal groups have the same amount in each group.",
        },
        {
          id: "g3-u1-w1-d4-try-3",
          story: "There are 4 cups with 2 pencils in each cup.",
          question: "What equation shows the pencils?",
          groups: "4",
          inEach: "2",
          total: "8",
          groupLabel: "cups",
          inEachLabel: "2 pencils",
          visualEmoji: "✏️",
          equation: "4 × 2 = 8",
          groupsChoices: ["2", "4", "8"],
          inEachChoices: ["2", "4", "6"],
          equationChoices: ["4 × 2 = 8", "2 × 4 = 8", "4 × 4 = 16"],
          successMessage: "Nice! 4 groups of 2 makes 8.",
          tip: "Use groups × in each = product.",
        },
        {
          id: "g3-u1-w1-d4-try-4",
          story: "There are 6 bags with 2 marbles in each bag.",
          question: "How many marbles are there total?",
          groups: "6",
          inEach: "2",
          total: "12",
          groupLabel: "bags",
          inEachLabel: "2 marbles",
          visualEmoji: "🔵",
          equation: "6 × 2 = 12",
          groupsChoices: ["2", "6", "12"],
          inEachChoices: ["2", "6", "8"],
          equationChoices: ["6 × 2 = 12", "2 × 6 = 12", "6 × 6 = 36"],
          successMessage: "Great! 6 equal groups of 2 makes 12.",
          tip: "The groups must be equal to use multiplication.",
        },
        {
          id: "g3-u1-w1-d4-try-5",
          story: "There are 2 trays with 6 cookies on each tray.",
          question: "What multiplication equation matches the trays?",
          groups: "2",
          inEach: "6",
          total: "12",
          groupLabel: "trays",
          inEachLabel: "6 cookies",
          visualEmoji: "🍪",
          equation: "2 × 6 = 12",
          groupsChoices: ["2", "6", "12"],
          inEachChoices: ["2", "6", "8"],
          equationChoices: ["2 × 6 = 12", "6 × 2 = 12", "2 × 2 = 4"],
          successMessage: "You got it! 2 groups of 6 is 12.",
          tip: "First count the groups, then count what is in each group.",
        },
      ],
    },

    practice: {
      type: "equal_groups_with_objects",
      description: "Practice using objects to build equal groups and write equations.",
      guidedCount: 8,
      independentCount: 10,
      challengeCount: 6,
    },

    completion: {
      unlocksNextLessonAfter: "guided",
      fullMasteryIncludes: ["learn", "tryIt", "guided", "independent", "challenge", "flashcards"],
      nextLessonId: "unit-1-week-1-day-5",
    },
  },

  {
    ...unitMeta,
    id: "unit-1-week-1-day-5",
    lessonNumber: 5,
    lessonType: "evaluation",
    title: "Week 1 Evaluation",
    shortTitle: "Week 1 Review",
    label: "Lesson 5",
    objective:
      "Show what you know about zero and identity rules, repeated addition, factors, products, and equal groups.",
    kidGoal: "I can show what I learned this week.",
    topic: "review",
    practiceType: "mixed_evaluation",
    flashcardDeckId: "lesson-g3-u1-w1-d5-week-review",

    lessonHero: {
      eyebrow: "Grade 3 • Unit 1 • Lesson 5",
      title: "Week 1 Evaluation",
      subtitle: "Review your first multiplication skills and show what you know.",
      missionTitle: "Review Mission",
      missionSteps: ["Warm-Up", "Review", "Evaluation", "Flashcards"],
    },

    bigIdea: {
      title: "Show what you know from Week 1.",
      subtitle: "Review 0 and 1 rules, repeated addition, factors, products, and equal groups.",
      thumbnail: "/images/learn/thumbnails/zero-one-rules.webp",
      videoCaption: "Review the big ideas from Week 1.",
      intro: "Today is a review mission. Use each strategy you learned this week.",
      bigQuestion: "Which strategy helps solve each review problem?",
      starTip: {
        title: "Review plan",
        lines: ["read carefully", "choose a strategy"],
      },
      examples: [
        {
          label: "Repeated addition",
          expression: "4 + 4 + 4 = 12",
          note: "This matches 3 × 4 = 12.",
        },
        {
          label: "Factors and product",
          expression: "3 × 4 = 12",
          note: "3 and 4 are factors. 12 is the product.",
        },
      ],
      explanationSteps: [
        "Read the question carefully.",
        "Decide which Week 1 skill it uses.",
        "Solve and check your answer.",
      ],
      ruleCards: [
        {
          eyebrow: "0 and 1 rules",
          equation: "9 × 0 = 0 • 9 × 1 = 9",
          badge: "Rules",
          description: "Use the zero rule and identity rule when you see 0 or 1.",
        },
        {
          eyebrow: "Groups and products",
          equation: "3 × 4 = 12",
          badge: "Review",
          description: "3 and 4 are factors. 12 is the product.",
        },
      ],
    },

    buildIt: {
      title: "Review builder",
      subtitle: "Warm up with a few Week 1 models before the evaluation.",
      activityType: "week_review_builder",
      rounds: [
        {
          id: "g3-u1-w1-d5-build-1",
          groups: 3,
          inEach: 4,
          instruction: "Build 3 groups with 4 in each group.",
          summary: "3 groups of 4 = 12 total",
          pattern: "Equal groups can be written as multiplication.",
          equation: "3 × 4 = 12",
        },
        {
          id: "g3-u1-w1-d5-build-2",
          groups: 4,
          inEach: 5,
          instruction: "Connect 5 + 5 + 5 + 5 to multiplication.",
          summary: "5 + 5 + 5 + 5 = 20",
          pattern: "Four 5s can be written as 4 × 5.",
          equation: "4 × 5 = 20",
        },
        {
          id: "g3-u1-w1-d5-build-3",
          groups: 6,
          inEach: 0,
          instruction: "Use the zero rule.",
          summary: "6 groups of 0 = 0 total",
          pattern: "Any number multiplied by 0 equals 0.",
          equation: "6 × 0 = 0",
        },
      ],
    },

    seeIt: {
      title: "Spot the review skill",
      subtitle: "Use your Week 1 skills to catch the sneaky answer.",
      prompt: "Ask: is this about rules, repeated addition, factors/products, or equal groups?",
      examples: [
        {
          id: "g3-u1-w1-d5-see-example-1",
          title: "Repeated addition",
          subtitle: "Four 5s.",
          groups: 4,
          inEach: 5,
          equation: "4 × 5 = 20",
          sentence: "5 + 5 + 5 + 5 matches 4 × 5.",
        },
        {
          id: "g3-u1-w1-d5-see-example-2",
          title: "Factors and product",
          subtitle: "Equation parts.",
          groups: 3,
          inEach: 4,
          equation: "3 × 4 = 12",
          sentence: "3 and 4 are factors. 12 is the product.",
        },
      ],
      clues: [
        {
          id: "g3-u1-w1-d5-see-1",
          visualLabel: "The repeated addition is 5 + 5 + 5",
          groups: 3,
          inEach: 5,
          choices: ["3 × 5 = 15", "5 × 5 = 15", "5 + 3 = 15"],
          sneakyEquation: "5 × 5 = 15",
          feedback: "Nice! There are 3 groups of 5, not 5 groups of 5.",
          tip: "Count how many times the number repeats.",
          ruleFocus: "review",
        },
        {
          id: "g3-u1-w1-d5-see-2",
          visualLabel: "The equation is 2 × 6 = 12",
          groups: 2,
          inEach: 6,
          choices: ["2 and 6 are factors", "12 is the product", "6 is the product"],
          sneakyEquation: "6 is the product",
          feedback: "Good catch! 6 is a factor. 12 is the product.",
          tip: "The product is the answer.",
          ruleFocus: "review",
        },
      ],
    },

    words: {
      title: "Review Words",
      subtitle: "These words appeared all week.",
      vocabulary: [
        {
          word: "equal groups",
          definition: "Groups with the same number in each group.",
          example: "3 groups of 4",
          visual: ["⭐⭐⭐⭐", "⭐⭐⭐⭐", "⭐⭐⭐⭐"],
          equation: "groups × in each",
        },
        {
          word: "repeated addition",
          definition: "Adding the same number again and again.",
          example: "4 + 4 + 4",
          visual: ["4", "+", "4", "+", "4"],
          equation: "4 + 4 + 4 = 12",
        },
        {
          word: "factor",
          definition: "A number being multiplied.",
          example: "3 and 4 are factors",
          visual: ["3", "×", "4"],
          equation: "factor × factor",
        },
        {
          word: "product",
          definition: "The answer to a multiplication problem.",
          example: "12 is the product",
          visual: ["3", "×", "4", "=", "12"],
          equation: "product = answer",
        },
      ],
    },

    quickCheck: {
      title: "Quick Review",
      subtitle: "Warm up before the Week 1 evaluation.",
      passingScore: 3,
      questions: [
        {
          id: "g3-u1-w1-d5-qc-1",
          prompt: "Which equation matches 5 + 5 + 5?",
          equationStart: "5 + 5 + 5 →",
          productPrompt: "Shortcut:",
          choices: ["3 × 5", "5 × 5", "3 + 5"],
          correctAnswer: "3 × 5",
          ruleType: "Repeated Addition",
          tipTitle: "Count the groups",
          tipText: "There are 3 groups of 5.",
          hint: "There are 3 groups of 5.",
          success: "Yes! 5 + 5 + 5 is 3 × 5.",
          visualGroups: 3,
          visualCount: 5,
        },
        {
          id: "g3-u1-w1-d5-qc-2",
          prompt: "In 2 × 6 = 12, what is the product?",
          equationStart: "2 × 6 =",
          productPrompt: "Product:",
          choices: ["2", "6", "12"],
          correctAnswer: "12",
          ruleType: "Product",
          tipTitle: "Find the product",
          tipText: "The product is the answer.",
          hint: "The product is the answer.",
          success: "Correct! 12 is the product.",
          visualGroups: 2,
          visualCount: 6,
        },
        {
          id: "g3-u1-w1-d5-qc-3",
          prompt: "What is 9 × 0?",
          equationStart: "9 × 0 =",
          productPrompt: "Product:",
          choices: ["0", "1", "9"],
          correctAnswer: "0",
          ruleType: "Zero Rule",
          tipTitle: "Use the Zero Rule",
          tipText: "Anything multiplied by 0 equals 0.",
          hint: "Anything multiplied by 0 equals 0.",
          success: "Nice! 9 × 0 = 0.",
          visualGroups: 9,
          visualCount: 0,
        },
      ],
    },

    tryIt: {
      title: "Review together",
      subtitle: "Try a few mixed review prompts before the evaluation.",
      requiredCount: 5,
      problems: [
        {
          id: "g3-u1-w1-d5-try-1",
          story: "There are 4 groups with 3 stars in each group.",
          question: "What equation matches the model?",
          groups: "4",
          inEach: "3",
          total: "12",
          groupLabel: "groups",
          inEachLabel: "3 stars",
          visualEmoji: "⭐",
          equation: "4 × 3 = 12",
          groupsChoices: ["3", "4", "12"],
          inEachChoices: ["3", "4", "7"],
          equationChoices: ["4 × 3 = 12", "3 × 4 = 12", "4 + 3 = 7"],
          successMessage: "Yes! 4 groups of 3 is 4 × 3.",
          tip: "Use groups × in each = product.",
        },
        {
          id: "g3-u1-w1-d5-try-2",
          story: "Look at 5 × 2 = 10.",
          question: "What is the product?",
          groups: "5",
          inEach: "2",
          total: "10",
          groupLabel: "factors",
          inEachLabel: "numbers being multiplied",
          visualEmoji: "🔢",
          equation: "Product: 10",
          groupsChoices: ["5", "2", "10"],
          inEachChoices: ["factor", "product", "group"],
          equationChoices: ["Product: 10", "Product: 5", "Factors: 10"],
          successMessage: "Correct! 10 is the product.",
          tip: "The product is the answer.",
        },
        {
          id: "g3-u1-w1-d5-try-3",
          story: "What multiplication equation matches 6 + 6 + 6?",
          question: "Turn the repeated addition into multiplication.",
          groups: "3",
          inEach: "6",
          total: "18",
          groupLabel: "repeated groups",
          inEachLabel: "6 each time",
          visualEmoji: "✨",
          equation: "3 × 6 = 18",
          groupsChoices: ["3", "6", "18"],
          inEachChoices: ["3", "6", "9"],
          equationChoices: ["3 × 6 = 18", "6 × 3 = 18", "3 × 3 = 9"],
          successMessage: "Nice! 6 repeats 3 times, so it is 3 × 6.",
          tip: "Repeated addition can become multiplication.",
        },
        {
          id: "g3-u1-w1-d5-try-4",
          story: "There are 8 groups with 0 gems in each group.",
          question: "How many gems are there total?",
          groups: "8",
          inEach: "0",
          total: "0",
          groupLabel: "groups",
          inEachLabel: "0 gems",
          visualEmoji: "💎",
          visualEmpty: true,
          equation: "8 × 0 = 0",
          groupsChoices: ["0", "8", "9"],
          inEachChoices: ["0", "1", "8"],
          equationChoices: ["8 × 0 = 0", "8 × 1 = 8", "0 × 1 = 8"],
          successMessage: "Great! Any number times 0 has a product of 0.",
          tip: "The zero rule says multiplying by 0 makes 0.",
        },
        {
          id: "g3-u1-w1-d5-try-5",
          story: "There are 7 jars with 1 firefly in each jar.",
          question: "How many fireflies are there total?",
          groups: "7",
          inEach: "1",
          total: "7",
          groupLabel: "jars",
          inEachLabel: "1 firefly",
          visualEmoji: "✨",
          equation: "7 × 1 = 7",
          groupsChoices: ["1", "7", "8"],
          inEachChoices: ["0", "1", "7"],
          equationChoices: ["7 × 1 = 7", "7 × 0 = 7", "1 × 1 = 7"],
          successMessage: "You got it! Multiplying by 1 keeps the number the same.",
          tip: "This is the identity rule.",
        },
      ],
    },

    practice: {
      type: "mixed_evaluation",
      description: "Review the Week 1 skills and show what you know.",
      guidedCount: 9,
      independentCount: 9,
      challengeCount: 9,
      reviewTypes: [
        "equal_groups",
        "repeated_addition_to_multiplication",
        "factor_product_identification",
        "equal_groups_with_objects",
      ],
    },

    completion: {
      unlocksNextLessonAfter: "guided",
      fullMasteryIncludes: ["evaluation", "flashcards"],
    },
  },
];

// @SECTION LESSON_EXPERIENCE_LOOKUPS
export function getLessonExperience(lessonId?: string) {
  if (!lessonId) {
    return grade3Unit1Week1Experience[0];
  }

  return grade3Unit1Week1Experience.find((lesson) => lesson.id === lessonId);
}

export function requireLessonExperience(lessonId?: string) {
  const lesson = getLessonExperience(lessonId);

  if (!lesson) {
    throw new Error(`No lesson experience found for lessonId: ${lessonId}`);
  }

  return lesson;
}

export function getWeekOneLessonExperience() {
  return grade3Unit1Week1Experience;
}
