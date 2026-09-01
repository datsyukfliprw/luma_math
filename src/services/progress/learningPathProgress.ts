import { isInstructionalLessonAvailable, type Curriculum, type Lesson } from "../../data/curriculum";
import { getConceptByLessonId } from "../../data/curriculum/curriculumGraph";
import { getAllCurricula } from "../../lib/curriculumLoader";
import { createEmptySkillProgress } from "../mastery/createEmptySkillProgress";
import { getConceptUnlockState } from "../prerequisites/prerequisiteGraph";
import type { StudentState } from "../../contexts/StudentProgressContext";
import { isFirstLessonOfUnitUnlocked } from "./evaluationProgression";
import {
  getCanonicalGrade3LessonId,
  getCurrentGrade3CourseEntry,
  getGrade3CourseEntries,
} from "./grade3CourseProgression";

export type LearningPathLessonStatus = "complete" | "current" | "available" | "locked";
export type LearningPathWeekStatus = "complete" | "current" | "available" | "locked";

type RawLesson = {
  id: string;
  title: string;
  lessonType: Lesson["lesson_type"];
  unitNumber: number;
  weekNumber: number;
  percentComplete: number;
  available: boolean;
};

export type LearningPathLessonModel = {
  id: string;
  title: string;
  status: LearningPathLessonStatus;
  percentComplete: number;
};

export type LearningPathWeekModel = {
  weekNumber: number;
  title: string;
  status: LearningPathWeekStatus;
  lessons: LearningPathLessonModel[];
};

export type LearningPathUnitModel = {
  unit: Curriculum;
  weeks: LearningPathWeekModel[];
  progress: number;
  isAccessible: boolean;
};

export type Grade3LearningPathModel = {
  units: LearningPathUnitModel[];
  currentLessonId?: string;
  currentUnitNumber?: number;
};

function getRegularLessonCompletionPercent(studentState: StudentState, lessonId: string): number {
  const progress = studentState.lessonProgress[lessonId];
  const practiceRewards = studentState.practiceRewards[lessonId] ?? {};
  const guidedComplete = practiceRewards.guided?.completed === true || progress?.practiceComplete === true;

  const completedParts = [
    progress?.warmupComplete === true,
    progress?.learnComplete === true,
    progress?.tryItComplete === true,
    guidedComplete,
  ].filter(Boolean).length;

  return Math.round((completedParts / 4) * 100);
}

export function getGrade3LessonCompletionPercent(
  studentState: StudentState,
  lessonId: string,
  lessonType: Lesson["lesson_type"],
): number {
  if (lessonType === "evaluation") {
    return studentState.evaluationCompletions[lessonId] ? 100 : 0;
  }

  return getRegularLessonCompletionPercent(studentState, lessonId);
}

function getFirstInstructionalLessonId(unit: Curriculum): string | undefined {
  for (const week of unit.weeks) {
    for (const lesson of week.lessons) {
      if (lesson.lesson_type !== "lesson" || !isInstructionalLessonAvailable(lesson)) continue;
      return getCanonicalGrade3LessonId(unit, week, lesson);
    }
  }

  return undefined;
}

function isLessonAvailable(
  studentState: StudentState,
  unit: Curriculum,
  lessonId: string,
  firstInstructionalLessonId: string | undefined,
): boolean {
  if (lessonId === firstInstructionalLessonId) {
    return isFirstLessonOfUnitUnlocked(studentState, unit.unit_number);
  }

  const concept = getConceptByLessonId(lessonId);
  if (!concept) return true;

  return getConceptUnlockState(
    concept.id,
    (skillId) => studentState.skillProgress[skillId] ?? createEmptySkillProgress(skillId),
    (evaluationLessonId) => studentState.evaluationCompletions[evaluationLessonId],
  ).unlocked;
}

function buildRawLessons(studentState: StudentState, units: Curriculum[]): RawLesson[] {
  return units.flatMap((unit) => {
    const firstInstructionalLessonId = getFirstInstructionalLessonId(unit);

    return unit.weeks.flatMap((week) =>
      week.lessons.filter(isInstructionalLessonAvailable).map((lesson) => {
        const id = getCanonicalGrade3LessonId(unit, week, lesson);
        return {
          id,
          title: lesson.lesson_title,
          lessonType: lesson.lesson_type,
          unitNumber: unit.unit_number,
          weekNumber: week.week_number,
          percentComplete: getGrade3LessonCompletionPercent(studentState, id, lesson.lesson_type),
          available: isLessonAvailable(studentState, unit, id, firstInstructionalLessonId),
        };
      }),
    );
  });
}

function toLessonStatus(
  raw: RawLesson,
  currentLessonId: string | undefined,
  courseIndexByLessonId: Map<string, number>,
): LearningPathLessonStatus {
  if (raw.percentComplete >= 100) return "complete";
  if (raw.id === currentLessonId) return "current";

  // Preserve access to work the student already started before the sequential
  // Learning Path rules were introduced. Untouched future work stays locked,
  // even if concept-level prerequisites happen to make it independently available.
  if (raw.percentComplete > 0) return "available";

  if (!currentLessonId) return "locked";

  const currentIndex = courseIndexByLessonId.get(currentLessonId);
  const lessonIndex = courseIndexByLessonId.get(raw.id);
  if (
    currentIndex !== undefined &&
    lessonIndex !== undefined &&
    lessonIndex < currentIndex &&
    raw.available
  ) {
    return "available";
  }

  return "locked";
}

function getWeekStatus(lessons: LearningPathLessonModel[]): LearningPathWeekStatus {
  if (lessons.length > 0 && lessons.every((lesson) => lesson.status === "complete")) {
    return "complete";
  }
  if (lessons.some((lesson) => lesson.status === "current")) return "current";
  if (lessons.some((lesson) => lesson.status === "available" || lesson.status === "complete")) {
    return "available";
  }
  return "locked";
}

export function buildGrade3LearningPathModel(studentState: StudentState): Grade3LearningPathModel {
  const units = getAllCurricula()
    .filter((unit) => unit.grade_level === 3)
    .sort((a, b) => a.unit_number - b.unit_number);
  const rawLessons = buildRawLessons(studentState, units);
  const currentLessonId = getCurrentGrade3CourseEntry(studentState)?.lessonId;
  const courseIndexByLessonId = new Map(
    getGrade3CourseEntries().map((entry, index) => [entry.lessonId, index]),
  );

  const models = units.map((unit) => {
    const unitRawLessons = rawLessons.filter((lesson) => lesson.unitNumber === unit.unit_number);
    const completedCount = unitRawLessons.filter((lesson) => lesson.percentComplete >= 100).length;
    const progress =
      unitRawLessons.length > 0 ? Math.round((completedCount / unitRawLessons.length) * 100) : 0;

    const weeks = unit.weeks.map((week) => {
      const lessons = unitRawLessons
        .filter((lesson) => lesson.weekNumber === week.week_number)
        .map((lesson) => {
          const progressLabel =
            lesson.percentComplete > 0 && lesson.percentComplete < 100
              ? ` • ${lesson.percentComplete}%`
              : "";
          const evaluation = studentState.evaluationCompletions[lesson.id];
          const evaluationLabel = evaluation
            ? ` • Passed ${Math.round(evaluation.accuracy * 100)}%`
            : "";

          return {
            id: lesson.id,
            title: `${lesson.title}${progressLabel}${evaluationLabel}`,
            status: toLessonStatus(lesson, currentLessonId, courseIndexByLessonId),
            percentComplete: lesson.percentComplete,
          };
        });

      return {
        weekNumber: week.week_number,
        title: week.week_title,
        status: getWeekStatus(lessons),
        lessons,
      };
    });

    return {
      unit,
      weeks,
      progress,
      isAccessible: weeks.some((week) => week.status !== "locked"),
    };
  });

  const currentUnitNumber = currentLessonId
    ? rawLessons.find((lesson) => lesson.id === currentLessonId)?.unitNumber
    : [...models].reverse().find((model) => model.isAccessible)?.unit.unit_number;

  return {
    units: models,
    currentLessonId,
    currentUnitNumber,
  };
}
