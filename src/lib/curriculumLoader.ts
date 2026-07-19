import curriculumJson from "../data/curriculum/grade_3/unit_01_multiplication_division_foundations.json";
import type { LearnLesson } from "./learnContent";

// Extended LearnLesson type with curriculum-specific fields
export type CurriculumLearnLesson = LearnLesson & {
  week_number?: number;
  big_idea_title?: string;
  big_idea_subtitle?: string;
  big_idea_thumbnail?: string;
  big_idea_intro?: string;
  big_idea_question?: string;
  star_tip_title?: string;
  star_tip_lines?: string[];
  rule_cards?: Array<{
    eyebrow: string;
    equation: string;
    badge: string;
    description: string;
  }>;
  flashcard_deck_id?: string;
};

// Zod schemas for validation (for future use with Zod)
const RuleCardSchema = {
  eyebrow: "string",
  equation: "string",
  badge: "string",
  description: "string",
};

const StarTipSchema = {
  title: "string",
  lines: ["string"],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BigIdeaSchema = {
  title: "string",
  subtitle: "string",
  thumbnail: "string",
  videoUrl: "string",
  videoCaption: "string",
  intro: "string",
  bigQuestion: "string",
  starTip: StarTipSchema,
  ruleCards: [RuleCardSchema],
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FlashcardSchema = {
  enabled: "boolean",
  required: "boolean",
  title: "string",
  type: "string",
  card_count: "number",
  instructions: "string",
  deckId: "string",
};

// Type for the loaded curriculum
export type CurriculumLesson = {
  lesson_id?: string;
  day_number: number;
  day_name: string;
  lesson_title: string;
  lesson_type: "lesson" | "evaluation";
  practice_type: string;
  flashcards?: typeof FlashcardSchema;
  bigIdea?: typeof BigIdeaSchema;
};

export type CurriculumWeek = {
  week_number: number;
  week_title: string;
  lessons: CurriculumLesson[];
};

export type Curriculum = {
  unit_number: number;
  unit_title: string;
  weeks: CurriculumWeek[];
};

// Load and validate curriculum data
export const curriculum: Curriculum = curriculumJson as Curriculum;

// Helper to find a lesson by week and day (unit is hardcoded to 1 for now)
export function findCurriculumLesson(
  weekNumber: number,
  dayNumber: number
): CurriculumLesson | undefined {
  const week = curriculum.weeks.find((w) => w.week_number === weekNumber);
  if (!week) return undefined;
  return week.lessons.find((l) => l.day_number === dayNumber);
}

// Helper to get flashcard deck ID from curriculum
export function getFlashcardDeckIdFromCurriculum(
  weekNumber: number,
  dayNumber: number
): string | undefined {
  const lesson = findCurriculumLesson(weekNumber, dayNumber);
  return lesson?.flashcards?.deckId;
}

// Helper to get bigIdea content from curriculum
export function getBigIdeaFromCurriculum(
  weekNumber: number,
  dayNumber: number
): CurriculumLesson["bigIdea"] | undefined {
  const lesson = findCurriculumLesson(weekNumber, dayNumber);
  return lesson?.bigIdea;
}

// Convert curriculum lesson to LearnLesson format (for compatibility)
export function curriculumToLearnLesson(
  weekNumber: number,
  dayNumber: number
): CurriculumLearnLesson | undefined {
  const lesson = findCurriculumLesson(weekNumber, dayNumber);
  if (!lesson) return undefined;

  return {
    day_number: lesson.day_number,
    day_name: lesson.day_name,
    lesson_title: lesson.lesson_title,
    practice_type: lesson.practice_type,
    week_number: weekNumber,
    big_idea_title: lesson.bigIdea?.title,
    big_idea_subtitle: lesson.bigIdea?.subtitle,
    big_idea_thumbnail: lesson.bigIdea?.thumbnail,
    big_idea_intro: lesson.bigIdea?.intro,
    big_idea_question: lesson.bigIdea?.bigQuestion,
    star_tip_title: lesson.bigIdea?.starTip.title,
    star_tip_lines: lesson.bigIdea?.starTip.lines,
    rule_cards: lesson.bigIdea?.ruleCards,
    flashcard_deck_id: lesson.flashcards?.deckId,
  };
}
