import { getCurriculum, getAllCurricula } from "../data/curriculum";
import type { Curriculum, Lesson, Week } from "../data/curriculum";
import type { LearnLesson } from "./learnContent";

// Extended LearnLesson type with curriculum-specific fields
export type CurriculumLearnLesson = LearnLesson & {
  unit_number?: number;
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

// Re-export validated curriculum types with curriculum-specific names
export type CurriculumLesson = Lesson;
export type CurriculumWeek = Week;
export { type Curriculum };

// Re-export curriculum accessors from the registry
export { getCurriculum, getAllCurricula };

// Default to Grade 3 for now; the app only supports one grade at a time
const DEFAULT_GRADE = 3;

// Helper to find a lesson by unit, week, and day
export function findCurriculumLesson(
  unitNumber: number,
  weekNumber: number,
  dayNumber: number,
): CurriculumLesson | undefined {
  const unit = getCurriculum(DEFAULT_GRADE, unitNumber);
  if (!unit) return undefined;
  const week = unit.weeks.find((w) => w.week_number === weekNumber);
  if (!week) return undefined;
  return week.lessons.find((l) => l.day_number === dayNumber);
}

// Helper to get flashcard deck ID from curriculum
export function getFlashcardDeckIdFromCurriculum(
  unitNumber: number,
  weekNumber: number,
  dayNumber: number,
): string | undefined {
  const lesson = findCurriculumLesson(unitNumber, weekNumber, dayNumber);
  return lesson?.flashcards?.deckId;
}

// Helper to get bigIdea content from curriculum
export function getBigIdeaFromCurriculum(
  unitNumber: number,
  weekNumber: number,
  dayNumber: number,
): CurriculumLesson["bigIdea"] | undefined {
  const lesson = findCurriculumLesson(unitNumber, weekNumber, dayNumber);
  return lesson?.bigIdea;
}

// Convert curriculum lesson to LearnLesson format (for compatibility)
export type FoundCurriculumLesson = {
  unit: Curriculum;
  week: CurriculumWeek;
  lesson: CurriculumLesson;
  weekDayNumber: number;
};

export function findCurriculumLessonById(lessonId: string): FoundCurriculumLesson | undefined {
  const match = lessonId.match(/^g3-u(\d+)-w(\d+)-(?:l(\d+)|eval)$/);
  if (!match) return undefined;

  const unitNumber = Number(match[1]);
  const weekNumber = Number(match[2]);
  const dayNumber = match[3] ? Number(match[3]) : undefined;

  const unit = getCurriculum(DEFAULT_GRADE, unitNumber);
  if (!unit) return undefined;

  const week = unit.weeks.find((w) => w.week_number === weekNumber);
  if (!week) return undefined;

  if (dayNumber !== undefined) {
    const lesson = week.lessons.find(
      (l) => l.lesson_type === "lesson" && l.day_number === dayNumber,
    );
    if (!lesson) return undefined;
    return { unit, week, lesson, weekDayNumber: dayNumber };
  }

  const evalIndex = week.lessons.findIndex((l) => l.lesson_type === "evaluation");
  if (evalIndex < 0) return undefined;
  const lesson = week.lessons[evalIndex];
  if (!lesson) return undefined;
  return { unit, week, lesson, weekDayNumber: evalIndex + 1 };
}

export function curriculumToLearnLesson(
  unitNumber: number,
  weekNumber: number,
  dayNumber: number,
): CurriculumLearnLesson | undefined {
  const lesson = findCurriculumLesson(unitNumber, weekNumber, dayNumber);
  if (!lesson) return undefined;

  return {
    day_number: lesson.day_number,
    day_name: lesson.day_name,
    lesson_title: lesson.lesson_title,
    practice_type: lesson.practice_type,
    unit_number: unitNumber,
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
