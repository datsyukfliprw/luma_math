import type { Curriculum, Lesson, Week } from "../../data/curriculum";
import type { StudentState } from "../../contexts/StudentProgressContext";
import { getAllCurricula } from "../../lib/curriculumLoader";

export type Grade3CourseEntry = {
  lessonId: string;
  lessonType: Lesson["lesson_type"];
  unitNumber: number;
  weekNumber: number;
};

export type Grade3NextCourseStep =
  | {
      kind: "lesson";
      lessonId: string;
      lessonType: Lesson["lesson_type"];
      unitNumber: number;
      weekNumber: number;
      path: string;
    }
  | {
      kind: "course_complete";
      path: "/learning-path";
    };

export function getCanonicalGrade3LessonId(
  unit: Curriculum,
  week: Week,
  lesson: Lesson,
): string {
  if (lesson.lesson_id) return lesson.lesson_id;

  return lesson.lesson_type === "evaluation"
    ? `g3-u${unit.unit_number}-w${week.week_number}-eval`
    : `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
}

export function getGrade3CourseEntries(): Grade3CourseEntry[] {
  return getAllCurricula()
    .filter((curriculum) => curriculum.grade_level === 3)
    .sort((a, b) => a.unit_number - b.unit_number)
    .flatMap((unit) =>
      [...unit.weeks]
        .sort((a, b) => a.week_number - b.week_number)
        .flatMap((week) =>
          [...week.lessons].sort((a, b) => a.day_number - b.day_number).map((lesson) => ({
            lessonId: getCanonicalGrade3LessonId(unit, week, lesson),
            lessonType: lesson.lesson_type,
            unitNumber: unit.unit_number,
            weekNumber: week.week_number,
          })),
        ),
    );
}


function isRegularLessonComplete(studentState: StudentState, lessonId: string): boolean {
  const progress = studentState.lessonProgress[lessonId];
  const guidedComplete =
    progress?.practiceComplete === true ||
    studentState.practiceRewards[lessonId]?.guided?.completed === true;

  return (
    progress?.warmupComplete === true &&
    progress.learnComplete === true &&
    progress.tryItComplete === true &&
    guidedComplete
  );
}

function isRegularLessonStarted(studentState: StudentState, lessonId: string): boolean {
  const progress = studentState.lessonProgress[lessonId];
  const rewards = studentState.practiceRewards[lessonId];

  return Boolean(
    progress?.warmupComplete ||
      progress?.learnComplete ||
      progress?.tryItComplete ||
      progress?.practiceComplete ||
      (rewards && Object.keys(rewards).length > 0),
  );
}

export function isGrade3CourseEntryComplete(
  studentState: StudentState,
  entry: Grade3CourseEntry,
): boolean {
  if (entry.lessonType === "evaluation") {
    return studentState.evaluationCompletions[entry.lessonId] !== undefined;
  }

  return isRegularLessonComplete(studentState, entry.lessonId);
}

export function getCurrentGrade3CourseEntry(
  studentState: StudentState,
): Grade3CourseEntry | undefined {
  const entries = getGrade3CourseEntries();
  const startedIncomplete = entries.filter(
    (entry) =>
      entry.lessonType === "lesson" &&
      !isGrade3CourseEntryComplete(studentState, entry) &&
      isRegularLessonStarted(studentState, entry.lessonId),
  );

  if (startedIncomplete.length > 0) {
    return startedIncomplete.at(-1);
  }

  return entries.find((entry) => !isGrade3CourseEntryComplete(studentState, entry));
}

export function getNextGrade3CourseStep(lessonId: string): Grade3NextCourseStep {
  const entries = getGrade3CourseEntries();
  const currentIndex = entries.findIndex((entry) => entry.lessonId === lessonId);

  if (currentIndex < 0) {
    return { kind: "course_complete", path: "/learning-path" };
  }

  const nextEntry = entries[currentIndex + 1];
  if (!nextEntry) {
    return { kind: "course_complete", path: "/learning-path" };
  }

  return {
    kind: "lesson",
    ...nextEntry,
    path: `/lesson/${nextEntry.lessonId}`,
  };
}
