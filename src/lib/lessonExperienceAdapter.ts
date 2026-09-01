import type { CurriculumLessonExperience, LessonExperience } from "../data/lessonExperience/types";
import { findCurriculumLessonById } from "./curriculumLoader";
import { isInstructionalLessonAvailable } from "../data/curriculum";
import { generateQuickCheckForLesson, toLegacyQuickCheck } from "../lib/quickCheck";

// Map curriculum visual_type values to the authored BuildIt activityType union.
const BUILD_IT_ACTIVITY_MAP: Record<string, LessonExperience["buildIt"]["activityType"]> = {
  zero_identity: "zero_identity_groups",
  repeated_addition: "repeated_addition_builder",
  factor_product: "factor_product_sort",
  equal_groups: "object_equal_groups",
  week_review: "week_review_builder",
};

// `topic` is still a legacy two-state field used by the lesson experience UI.
// Keep multiplication classification independent from generator registration: all
// Grade 3 practice types are now registered, so registry membership no longer
// identifies multiplication lessons.
const MULTIPLICATION_TOPIC_PRACTICE_TYPES = new Set([
  "equal_groups",
  "repeated_addition_to_multiplication",
  "factor_product_identification",
  "equal_groups_with_objects",
  "count_equal_groups",
  "factors_and_products",
  "draw_multiplication",
  "build_arrays",
  "two_equations_for_array",
  "multiplication_number_line",
  "connect_models_equations_stories",
  "multiply_by_3",
  "multiply_by_4",
  "commutative_multiplication",
  "associative_multiplication",
  "multiply_by_6",
  "multiply_by_7",
  "multiply_by_8",
  "multiply_by_9",
  "mixed_multiplication_facts",
  "missing_factors",
  "choose_strategy",
  "multiples_of_ten_basic_facts",
  "one_digit_by_multiples_of_ten",
  "multiples_of_ten_word_problems",
  "place_value_patterns",
  "rows_columns_multiplication",
]);

function isMultiplicationTopicPracticeType(practiceType: string): boolean {
  return MULTIPLICATION_TOPIC_PRACTICE_TYPES.has(practiceType);
}

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

  const isMultiplication = isMultiplicationTopicPracticeType(lesson.practice_type);
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
