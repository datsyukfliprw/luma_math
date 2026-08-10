import type { LessonExperience } from "../../../types";

const unitMeta = {
  grade: 3 as const,
  unitId: "g3-u1-foundations",
  unitNumber: 1 as const,
  unitTitle: "Multiplication & Division Foundations",
  week: 1,
};

const missionSteps = ["Warm-Up", "Learn", "Try It", "Practice", "Flashcards"];

export const lesson4: LessonExperience = {
  ...unitMeta,
  id: "g3-u1-w1-l4",
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
    missionTitle: "Today's Mission",
    missionSteps,
  },

  bigIdea: {
    title: "Equal groups can be shown with multiplication.",
    subtitle:
      "Equal groups have the same number in each group. Multiplication helps find the total.",
    thumbnail: "/images/learn/thumbnails/equal-groups.webp",
    videoCaption: "Watch equal groups become multiplication equations.",
    intro: "Today you'll use objects and pictures to build equal groups and write equations.",
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
    title: "Today's Words",
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
        prompt:
          "A student made groups of 4, 4, and 3 and called them equal groups. Is that correct?",
        equationStart: "4, 4, and 3",
        productPrompt: "Is that correct?",
        choices: ["yes", "no", "maybe"],
        correctAnswer: "no",
        ruleType: "Reasoning",
        tipTitle: "Remember equal",
        tipText: "Equal means the groups match.",
        hint: "Are all the groups the same size?",
        success:
          "Correct! Equal groups must have the same number in each group, and 4, 4, 3 does not.",
        visualGroups: 0,
        visualCount: 0,
      },
    ],
  },

  tryIt: {
    title: "Try one together",
    subtitle: "Use the object groups to write the multiplication equation.",
    requiredCount: 5,
    generator: {
      family: "multiplication_foundations",
      practiceType: "equal_groups_with_objects",
      templates: [
        {
          id: "g3-u1-w1-d4-try-1",
          groupNoun: "bowls",
          itemNoun: "4 berries",
          visualEmoji: "🫐",
          questionForm: "objects",
          tip: "Each bowl is one group.",
        },
        {
          id: "g3-u1-w1-d4-try-2",
          groupNoun: "boxes",
          itemNoun: "3 blocks",
          visualEmoji: "🧱",
          questionForm: "objects",
          tip: "Equal groups have the same amount in each group.",
        },
        {
          id: "g3-u1-w1-d4-try-3",
          groupNoun: "cups",
          itemNoun: "2 pencils",
          visualEmoji: "✏️",
          questionForm: "objects",
          tip: "Use groups × in each = product.",
        },
        {
          id: "g3-u1-w1-d4-try-4",
          groupNoun: "bags",
          itemNoun: "2 marbles",
          visualEmoji: "🔵",
          questionForm: "objects",
          tip: "The groups must be equal to use multiplication.",
        },
        {
          id: "g3-u1-w1-d4-try-5",
          groupNoun: "trays",
          itemNoun: "6 cookies",
          visualEmoji: "🍪",
          questionForm: "objects",
          tip: "First count the groups, then count what is in each group.",
        },
      ],
    },
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
    nextLessonId: "g3-u1-w1-eval",
  },
};
