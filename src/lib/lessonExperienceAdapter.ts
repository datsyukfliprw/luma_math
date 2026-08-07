import type { CurriculumLessonExperience, LessonExperience } from "../data/lessonExperience/types";
import { findCurriculumLessonById } from "./curriculumLoader";
import { isInstructionalLessonAvailable } from "../data/curriculum";
import { isRegisteredPracticeType } from "../practiceTypes/registry";
import { generateQuickCheckForLesson, toLegacyQuickCheck } from "../lib/quickCheck";

// Map curriculum visual_type values to the authored BuildIt activityType union.
const BUILD_IT_ACTIVITY_MAP: Record<string, LessonExperience["buildIt"]["activityType"]> = {
  zero_identity: "zero_identity_groups",
  repeated_addition: "repeated_addition_builder",
  factor_product: "factor_product_sort",
  equal_groups: "object_equal_groups",
  week_review: "week_review_builder",
};

function buildBigIdea(
  lesson: NonNullable<ReturnType<typeof findCurriculumLessonById>>["lesson"],
): CurriculumLessonExperience["bigIdea"] {
  const { bigIdea, learn, concept } = lesson;

  if (!bigIdea) {
    throw new Error("Missing bigIdea");
  }

  const examples = learn?.example?.equation
    ? [
        {
          label: learn.title || "Example",
          expression: learn.example.equation,
          note: learn.example.prompt || concept || "",
        },
      ]
    : [];

  const teachingPoints = learn?.teaching_points;
  const explanationSteps =
    teachingPoints && teachingPoints.length > 0
      ? teachingPoints
      : ["Learn the big idea.", "Practice the skill."];

  return {
    title: bigIdea.title,
    subtitle: bigIdea.subtitle,
    thumbnail: bigIdea.thumbnail,
    videoUrl: bigIdea.videoUrl ?? lesson.lesson_video_url,
    videoCaption: bigIdea.videoCaption ?? lesson.lesson_title,
    intro: bigIdea.intro ?? concept ?? "",
    bigQuestion: bigIdea.bigQuestion ?? concept ?? "",
    starTip: bigIdea.starTip,
    examples,
    explanationSteps,
    ruleCards: bigIdea.ruleCards,
  };
}

function buildLessonHero(
  lesson: NonNullable<ReturnType<typeof findCurriculumLessonById>>["lesson"],
  gradeLevel: number,
): CurriculumLessonExperience["lessonHero"] {
  const teachingPoints = lesson.learn?.teaching_points;
  const missionSteps =
    teachingPoints && teachingPoints.length > 0
      ? teachingPoints
      : [lesson.objective || lesson.concept || "Explore the lesson idea."];

  return {
    eyebrow: `Grade ${gradeLevel}`,
    title: lesson.lesson_title,
    subtitle: lesson.day_name || "",
    missionTitle: "Today's Mission",
    missionSteps,
  };
}

function buildBuildIt(
  lesson: NonNullable<ReturnType<typeof findCurriculumLessonById>>["lesson"],
): CurriculumLessonExperience["buildIt"] | undefined {
  const example = lesson.learn?.example;
  if (!example) return undefined;

  const groups = typeof example.groups === "number" ? example.groups : undefined;
  const inEach = typeof example.items_per_group === "number" ? example.items_per_group : undefined;
  const activityType =
    example.visual_type && example.visual_type in BUILD_IT_ACTIVITY_MAP
      ? BUILD_IT_ACTIVITY_MAP[example.visual_type]
      : undefined;

  if (groups === undefined || inEach === undefined || !activityType) {
    return undefined;
  }

  return {
    title: "Build It",
    subtitle: "Make equal groups",
    activityType,
    rounds: [
      {
        id: "1",
        groups,
        inEach,
        instruction: example.prompt || "Build the groups.",
        summary: `${groups} groups of ${inEach}`,
        pattern: example.equation || "",
        equation: example.equation || `${groups} × ${inEach} = ${groups * inEach}`,
      },
    ],
  };
}

function buildPractice(
  lesson: NonNullable<ReturnType<typeof findCurriculumLessonById>>["lesson"],
): CurriculumLessonExperience["practice"] {
  const count =
    typeof lesson.practice_block?.question_count === "number"
      ? lesson.practice_block.question_count
      : 5;

  return {
    type: lesson.practice_type,
    description:
      lesson.practice_block?.instructions ||
      "Practice this skill in guided, independent, or challenge mode.",
    guidedCount: count,
    independentCount: count,
    challengeCount: count,
    reviewTypes: lesson.review_types || [],
  };
}

function buildCompletion(
  found: NonNullable<ReturnType<typeof findCurriculumLessonById>>,
): CurriculumLessonExperience["completion"] {
  const { unit, week, lesson, weekDayNumber } = found;
  const normalLessons = week.lessons.filter(
    (l) => l.lesson_type === "lesson" && isInstructionalLessonAvailable(l),
  );
  const maxDay = normalLessons.length;
  const gradeLevel = unit.grade_level;
  const nextLessonId =
    lesson.lesson_type === "lesson" && weekDayNumber < maxDay
      ? `g${gradeLevel}-u${unit.unit_number}-w${week.week_number}-l${weekDayNumber + 1}`
      : undefined;

  return {
    unlocksNextLessonAfter: "guided",
    fullMasteryIncludes: ["learn"],
    nextLessonId,
  };
}

function buildQuickCheck(
  lesson: NonNullable<ReturnType<typeof findCurriculumLessonById>>["lesson"],
): {
  quickCheck: CurriculumLessonExperience["quickCheck"];
  canonicalQuickCheck: CurriculumLessonExperience["canonicalQuickCheck"];
} {
  if (lesson.lesson_type !== "lesson") {
    return { quickCheck: undefined, canonicalQuickCheck: undefined };
  }

  const canonicalQuickCheck = generateQuickCheckForLesson(lesson);
  if (!canonicalQuickCheck) {
    return { quickCheck: undefined, canonicalQuickCheck: undefined };
  }

  return {
    quickCheck: toLegacyQuickCheck(canonicalQuickCheck),
    canonicalQuickCheck,
  };
}

// Adapt a curriculum lesson into a generic CurriculumLessonExperience.
// Returns undefined when the lesson cannot be found or its required fields
// (bigIdea, etc.) are missing.
export function getAdaptedLessonExperience(
  lessonId: string,
): CurriculumLessonExperience | undefined {
  const found = findCurriculumLessonById(lessonId);
  if (!found) return undefined;

  const { unit, week, lesson, weekDayNumber } = found;

  // Required curriculum fields.
  if (!lesson.bigIdea) return undefined;
  if (!lesson.learn) return undefined;

  const isMultiplication = isRegisteredPracticeType(lesson.practice_type);
  const topic: CurriculumLessonExperience["topic"] = isMultiplication ? "multiplication" : "review";

  const label = lesson.lesson_type === "evaluation" ? "Evaluation" : `Lesson ${lesson.day_number}`;

  const base: CurriculumLessonExperience = {
    source: "curriculum",
    id: lessonId,
    grade: unit.grade_level,
    unitId: `g${unit.grade_level}-u${unit.unit_number}`,
    unitNumber: unit.unit_number,
    unitTitle: unit.unit_title,
    week: week.week_number,
    lessonNumber: weekDayNumber,
    lessonType: lesson.lesson_type,
    title: lesson.lesson_title,
    shortTitle: lesson.day_name || lesson.lesson_title,
    label,
    objective: lesson.objective,
    kidGoal: lesson.concept,
    topic,
    practiceType: lesson.practice_type,
    flashcardDeckId: lesson.flashcards?.deckId,
    lessonHero: buildLessonHero(lesson, unit.grade_level),
    bigIdea: buildBigIdea(lesson),
    practice: buildPractice(lesson),
    completion: buildCompletion(found),
  };

  const buildIt = buildBuildIt(lesson);
  const { quickCheck, canonicalQuickCheck } = buildQuickCheck(lesson);

  return {
    ...base,
    buildIt,
    quickCheck,
    canonicalQuickCheck,
  };
}
