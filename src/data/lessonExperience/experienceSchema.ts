import { z } from "zod";

// Practice mode schema
export const PracticeModeSchema = z.enum(["guided", "independent", "challenge"]);

// Lesson practice type schema
export const LessonPracticeTypeSchema = z.enum([
  "equal_groups",
  "repeated_addition_to_multiplication",
  "factor_product_identification",
  "equal_groups_with_objects",
  "mixed_evaluation",
]);

// See it rule focus schema
export const SeeItRuleFocusSchema = z.enum([
  "zero",
  "identity",
  "product",
  "repeated-addition",
  "groups-in-each",
  "factor-product",
  "equal-groups",
  "review",
]);

// Quick check question schema
export const QuickCheckQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  equationStart: z.string(),
  productPrompt: z.string(),
  choices: z.array(z.string()),
  correctAnswer: z.string(),
  ruleType: z.string(),
  tipTitle: z.string(),
  tipText: z.string(),
  hint: z.string(),
  success: z.string(),
  visualGroups: z.number(),
  visualCount: z.number(),
});

// Try it problem schema
export const TryItProblemSchema = z.object({
  id: z.string(),
  story: z.string(),
  question: z.string(),
  groups: z.string(),
  inEach: z.string(),
  total: z.string(),
  groupLabel: z.string(),
  inEachLabel: z.string(),
  visualEmoji: z.string(),
  visualEmpty: z.boolean().optional(),
  equation: z.string(),
  groupsChoices: z.array(z.string()),
  inEachChoices: z.array(z.string()),
  equationChoices: z.array(z.string()),
  successMessage: z.string(),
  tip: z.string(),
});

// Lesson hero schema
const LessonHeroSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string(),
  missionTitle: z.string(),
  missionSteps: z.array(z.string()),
});

// Big idea schema
const StarTipSchema = z.object({
  title: z.string(),
  lines: z.array(z.string()),
});

const RuleCardSchema = z.object({
  eyebrow: z.string(),
  equation: z.string(),
  badge: z.string(),
  description: z.string(),
});

const BigIdeaSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  thumbnail: z.string(),
  videoUrl: z.string().optional(),
  videoCaption: z.string(),
  intro: z.string(),
  bigQuestion: z.string(),
  starTip: StarTipSchema,
  examples: z.array(
    z.object({
      label: z.string(),
      expression: z.string(),
      note: z.string(),
    })
  ),
  explanationSteps: z.array(z.string()),
  ruleCards: z.array(RuleCardSchema),
});

// Build it schema
const BuildItRoundSchema = z.object({
  id: z.string(),
  groups: z.number(),
  inEach: z.number(),
  instruction: z.string(),
  summary: z.string(),
  pattern: z.string(),
  equation: z.string(),
});

const BuildItSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  activityType: z.enum([
    "zero_identity_groups",
    "repeated_addition_builder",
    "factor_product_sort",
    "object_equal_groups",
    "week_review_builder",
  ]),
  rounds: z.array(BuildItRoundSchema),
});

// See it schema
const SeeItExampleSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  groups: z.number(),
  inEach: z.number(),
  equation: z.string(),
  sentence: z.string(),
});

const SeeItClueSchema = z.object({
  id: z.string(),
  visualLabel: z.string(),
  groups: z.number(),
  inEach: z.number(),
  choices: z.array(z.string()),
  sneakyEquation: z.string(),
  feedback: z.string(),
  tip: z.string(),
  ruleFocus: SeeItRuleFocusSchema,
});

const SeeItSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  prompt: z.string(),
  examples: z.array(SeeItExampleSchema),
  clues: z.array(SeeItClueSchema),
});

// Words schema
const VocabularyWordSchema = z.object({
  word: z.string(),
  definition: z.string(),
  example: z.string(),
  visual: z.array(z.string()),
  equation: z.string(),
});

const WordsSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  vocabulary: z.array(VocabularyWordSchema),
});

// Quick check schema
const QuickCheckSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  passingScore: z.number(),
  questions: z.array(QuickCheckQuestionSchema),
});

// Try it schema
const TryItSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  requiredCount: z.number(),
  problems: z.array(TryItProblemSchema),
});

// Practice schema
const PracticeSchema = z.object({
  type: LessonPracticeTypeSchema,
  description: z.string(),
  guidedCount: z.number(),
  independentCount: z.number(),
  challengeCount: z.number(),
  reviewTypes: z.array(LessonPracticeTypeSchema).optional(),
});

// Completion schema
const CompletionSchema = z.object({
  unlocksNextLessonAfter: PracticeModeSchema,
  fullMasteryIncludes: z.array(z.string()),
  nextLessonId: z.string().optional(),
});

// Main lesson experience schema
export const LessonExperienceSchema = z.object({
  id: z.string(),
  grade: z.literal(3),
  unitId: z.string(),
  unitNumber: z.literal(1),
  unitTitle: z.string(),
  week: z.number(),
  lessonNumber: z.number(),
  lessonType: z.enum(["lesson", "evaluation"]),
  title: z.string(),
  shortTitle: z.string(),
  label: z.string(),
  objective: z.string(),
  kidGoal: z.string(),
  topic: z.enum(["multiplication", "review"]),
  practiceType: LessonPracticeTypeSchema,
  flashcardDeckId: z.string().optional(),
  lessonHero: LessonHeroSchema,
  bigIdea: BigIdeaSchema,
  buildIt: BuildItSchema,
  seeIt: SeeItSchema,
  words: WordsSchema,
  quickCheck: QuickCheckSchema,
  tryIt: TryItSchema,
  practice: PracticeSchema,
  completion: CompletionSchema,
});

export type LessonExperience = z.infer<typeof LessonExperienceSchema>;
