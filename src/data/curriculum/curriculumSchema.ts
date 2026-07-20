import { z } from "zod";

// Warmup question schema
const WarmupQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  correct_answer: z.string(),
  hint: z.string(),
  skill: z.string(),
});

const WarmupSchema = z.object({
  title: z.string(),
  type: z.string(),
  question_count: z.number(),
  instructions: z.string(),
  questions: z.array(WarmupQuestionSchema),
});

// Learn section schema
const LearnExampleSchema = z.object({
  prompt: z.string(),
  visual_type: z.string(),
  groups: z.number(),
  items_per_group: z.number(),
  equation: z.string(),
});

const LearnSchema = z.object({
  title: z.string(),
  teaching_points: z.array(z.string()),
  example: LearnExampleSchema,
  vocabulary: z.array(z.string()),
});

// Try It section schema
const TryItVisualDataSchema = z.object({
  groups: z.number(),
  items_per_group: z.number(),
});

const TryItSchema = z.object({
  title: z.string(),
  type: z.string(),
  prompt: z.string(),
  correct_answer: z.string(),
  hint: z.string(),
  visual_data: TryItVisualDataSchema,
});

// Practice block schema
const PracticeBlockSchema = z.object({
  title: z.string(),
  type: z.string(),
  question_count: z.number(),
  instructions: z.string(),
});

// Flashcards schema
const FlashcardsSchema = z.object({
  enabled: z.boolean(),
  required: z.boolean(),
  title: z.string(),
  type: z.string(),
  card_count: z.number(),
  instructions: z.string(),
  deckId: z.string(),
});

// Big Idea section schema
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
  ruleCards: z.array(RuleCardSchema),
});

// Timed test schema
const TimedTestSchema = z.object({
  title: z.string(),
  duration_minutes: z.number(),
  facts: z.array(z.string()),
});

// Lesson schema
const LessonSchema = z.object({
  lesson_id: z.string().optional(),
  day_number: z.number(),
  day_name: z.string(),
  lesson_title: z.string(),
  lesson_type: z.enum(["lesson", "evaluation"]),
  fact_drill: z.string(),
  concept: z.string(),
  practice: z.string(),
  objective: z.string(),
  practice_type: z.string(),
  skills: z.array(z.string()),
  lesson_video_url: z.string(),
  worksheet_url: z.string(),
  quiz_question_count: z.number(),
  // Optional sections
  warmup: WarmupSchema.optional(),
  learn: LearnSchema.optional(),
  try_it: TryItSchema.optional(),
  practice_block: PracticeBlockSchema.optional(),
  flashcards: FlashcardsSchema.optional(),
  bigIdea: BigIdeaSchema.optional(),
  timed_test: TimedTestSchema.optional(),
  evaluation_scope: z.string().optional(),
  review_types: z.array(z.string()).optional(),
});

// Week schema
const WeekSchema = z.object({
  week_number: z.number(),
  week_title: z.string(),
  weekly_focus: z.string(),
  lessons: z.array(LessonSchema),
});

// Main curriculum schema
export const CurriculumSchema = z.object({
  grade_level: z.number(),
  unit_number: z.number(),
  unit_title: z.string(),
  unit_slug: z.string(),
  unit_description: z.string(),
  unit_goals: z.array(z.string()),
  fact_focus: z.array(z.string()),
  weeks: z.array(WeekSchema),
});

export type Curriculum = z.infer<typeof CurriculumSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type Week = z.infer<typeof WeekSchema>;
