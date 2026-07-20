// @SECTION FILE_OVERVIEW
// learnContent.ts
// Adapter/view-model helpers for turning rich lesson experience data into
// reusable Learn page content.
//
// Raw student-facing lesson data lives in src/data/lessonExperience.ts.
// This file keeps screen-facing helper names stable while the app migrates
// away from hardcoded Lesson 1 content.

import { getLessonExperience, type LessonExperience } from "../data/lessonExperience";
import type { CurriculumLearnLesson } from "./curriculumLoader";

// @SECTION LEARN_CONTENT_TYPES
export type LearnExample = {
  prompt?: string;
  visual_type?: string;
  groups?: number;
  items_per_group?: number;
  equation?: string;
};

export type LearnLesson = {
  day_number?: number;
  day_name?: string;
  lesson_title?: string;
  lesson_type?: "lesson" | "evaluation";
  objective?: string;
  concept?: string;
  practice?: string;
  practice_type?: string;
  lesson_video_url?: string;
  learn?: {
    title?: string;
    teaching_points?: string[];
    example?: LearnExample;
    vocabulary?: string[];
  };
};

export type BuildRound = {
  groups: number;
  targetCount: number;
  instruction: string;
  summary: string;
  pattern: string;
};

export type SeeItClue = {
  visualLabel: string;
  groups: number;
  inEach: number;
  choices: string[];
  sneakyEquation: string;
  feedback: string;
  tip: string;
  ruleFocus: "product" | "zero" | "identity";
};

export type VocabularyWord = {
  word: string;
  definition: string;
  example: string;
  visual: string[];
  equation: string;
  color: string;
  border: string;
  labelColor: string;
};

export type MatchingCard = {
  id: string;
  correctWord: string;
  title: string;
  color: string;
  border: string;
  visual: string[];
  equation: string;
};

export type QuickCheckQuestion = {
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

const VOCABULARY_STYLES = [
  {
    color: "bg-[#E9F7F8]",
    border: "border-[#00AFB9]/25",
    labelColor: "text-[#0081A7]",
  },
  {
    color: "bg-[#FFF3D9]",
    border: "border-[#F7B733]/30",
    labelColor: "text-[#C78300]",
  },
  {
    color: "bg-[#FCE9E5]",
    border: "border-[#F07167]/25",
    labelColor: "text-[#F07167]",
  },
  {
    color: "bg-[#F8FBFB]",
    border: "border-[#073B5A]/10",
    labelColor: "text-[#073B5A]",
  },
];

// @SECTION EXPERIENCE_LOOKUP_ADAPTERS
function getLessonIdFromLesson(lesson: LearnLesson) {
  if (!lesson.day_number) {
    return undefined;
  }

  // Week-aware lesson ID mapping
  // Format: g{grade}-u{unit}-w{week}-l{lessonNumber}
  const weekNumber = (lesson as CurriculumLearnLesson).week_number ?? 1; // Default to week 1 if not specified
  const lessonNumber = lesson.day_number; // Day number maps to lesson number

  // Evaluation lessons use a different ID format
  if (lesson.lesson_type === "evaluation") {
    return `g3-u1-w${weekNumber}-eval`;
  }

  return `g3-u1-w${weekNumber}-l${lessonNumber}`;
}

export function getLessonExperienceForLearnLesson(lesson: LearnLesson) {
  return getLessonExperience(getLessonIdFromLesson(lesson));
}

function requireExperience(lesson: LearnLesson): LessonExperience {
  const experience = getLessonExperienceForLearnLesson(lesson);

  if (experience) {
    return experience;
  }

  const fallbackExperience = getLessonExperience();

  if (!fallbackExperience) {
    throw new Error("No fallback lesson experience found.");
  }

  return fallbackExperience;
}

// @SECTION LEARN_CONTENT_CORE_HELPERS
export function getLearnTitle(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.title;
}

export function getBigIdeaDescription(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.subtitle;
}

export function getLessonVideoUrl(lesson: LearnLesson) {
  return (
    requireExperience(lesson).bigIdea.videoUrl ??
    lesson.lesson_video_url ??
    "https://www.youtube.com/embed/gLcD7otUHxw"
  );
}

export function getVideoCaption(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.videoCaption;
}

export function getEqualGroupsExample(lesson: LearnLesson) {
  const experience = requireExperience(lesson);
  const firstRound = experience.buildIt.rounds[0];
  const firstExample = experience.bigIdea.examples[0];
  const groups = firstRound?.groups ?? 4;
  const itemsPerGroup = firstRound?.inEach ?? 1;
  const total = groups * itemsPerGroup;

  return {
    prompt: firstExample?.note ?? `There are ${groups} groups with ${itemsPerGroup} in each group.`,
    groups,
    itemsPerGroup,
    total,
    equation: firstRound?.equation ?? `${groups} × ${itemsPerGroup} = ${total}`,
  };
}

export function getMissionSteps(lesson: LearnLesson) {
  return requireExperience(lesson).lessonHero.missionSteps;
}

export function getBigQuestion(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.bigQuestion;
}

export function getRuleCards(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.ruleCards.map((card, index) => {
    const isWarm = index % 2 === 1;

    return {
      ...card,
      cardClass: isWarm ? "border-[#F07167]/20 bg-[#FCE9E5]" : "border-[#00AFB9]/20 bg-[#E9F7F8]",
      eyebrowClass: isWarm ? "text-[#F07167]" : "text-[#0081A7]",
      badgeClass: isWarm ? "text-[#F07167]" : "text-[#0081A7]",
    };
  });
}

export function getTopicTip(lesson: LearnLesson) {
  return requireExperience(lesson).bigIdea.starTip;
}

// @SECTION LEARN_CONTENT_PAGE_DATA
export function getBuildRounds(lesson: LearnLesson): BuildRound[] {
  return requireExperience(lesson).buildIt.rounds.map((round) => ({
    groups: round.groups,
    targetCount: round.inEach,
    instruction: round.instruction,
    summary: round.summary,
    pattern: round.pattern,
  }));
}

export function getSeeItClues(lesson: LearnLesson): SeeItClue[] {
  return requireExperience(lesson).seeIt.clues.map((clue) => ({
    visualLabel: clue.visualLabel,
    groups: clue.groups,
    inEach: clue.inEach,
    choices: clue.choices,
    sneakyEquation: clue.sneakyEquation,
    feedback: clue.feedback,
    tip: clue.tip,
    ruleFocus: clue.ruleFocus as SeeItClue["ruleFocus"],
  }));
}

export function getSeeItExamples(lesson: LearnLesson) {
  return requireExperience(lesson).seeIt.examples.map((example, index) => {
    const style = VOCABULARY_STYLES[index % VOCABULARY_STYLES.length];

    return {
      title: example.title,
      subtitle: example.subtitle,
      groups: example.groups,
      inEach: example.inEach,
      equation: example.equation,
      sentence: example.sentence,
      color: style.color,
      border: style.border,
      labelColor: style.labelColor,
    };
  });
}

export function getVocabularyWords(lesson: LearnLesson): VocabularyWord[] {
  return requireExperience(lesson)
    .words.vocabulary.slice(0, 4)
    .map((item, index) => {
      const style = VOCABULARY_STYLES[index % VOCABULARY_STYLES.length];

      return {
        word: item.word,
        definition: item.definition,
        example: item.example,
        visual: item.visual,
        equation: item.equation,
        ...style,
      };
    });
}

export function getMatchingCards(lesson: LearnLesson): MatchingCard[] {
  return getVocabularyWords(lesson).map((item) => ({
    id: `${item.word.toLowerCase().replace(/\s+/g, "-")}-visual`,
    correctWord: item.word,
    title: item.definition,
    color: item.color,
    border: item.border,
    visual: item.visual,
    equation: item.equation,
  }));
}

export function getQuickCheckQuestions(lesson: LearnLesson): QuickCheckQuestion[] {
  return requireExperience(lesson).quickCheck.questions.map((question) => ({
    prompt: question.prompt,
    equationStart: question.equationStart,
    productPrompt: question.productPrompt,
    choices: question.choices,
    correctAnswer: question.correctAnswer,
    ruleType: question.ruleType,
    tipTitle: question.tipTitle,
    tipText: question.tipText,
    hint: question.hint,
    success: question.success,
    visualGroups: question.visualGroups,
    visualCount: question.visualCount,
  }));
}
