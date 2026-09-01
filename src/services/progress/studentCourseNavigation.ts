import type { StudentState } from "../../contexts/StudentProgressContext";
import { findCurriculumLessonById } from "../../lib/curriculumLoader";
import { getCurrentGrade3CourseEntry } from "./grade3CourseProgression";

export type Grade3StudentCourseNavigation = {
  currentLessonId?: string;
  currentLessonType?: "lesson" | "evaluation";
  currentLessonTitle?: string;
  currentLessonObjective?: string;
  lessonPath: string;
  practicePath: string;
  courseComplete: boolean;
};

export function getGrade3StudentCourseNavigation(
  studentState: StudentState,
): Grade3StudentCourseNavigation {
  const currentEntry = getCurrentGrade3CourseEntry(studentState);
  const currentLessonId = currentEntry?.lessonId;

  if (!currentLessonId) {
    return {
      lessonPath: "/learning-path",
      practicePath: "/learning-path",
      courseComplete: true,
    };
  }

  const found = findCurriculumLessonById(currentLessonId);
  if (!found) {
    return {
      lessonPath: "/learning-path",
      practicePath: "/learning-path",
      courseComplete: false,
    };
  }

  const currentLessonType = found.lesson.lesson_type;

  return {
    currentLessonId,
    currentLessonType,
    currentLessonTitle: found.lesson.lesson_title,
    currentLessonObjective: found.lesson.objective,
    lessonPath: `/lesson/${currentLessonId}`,
    practicePath:
      currentLessonType === "evaluation"
        ? `/practice/${currentLessonId}`
        : `/practice/${currentLessonId}?mode=guided`,
    courseComplete: false,
  };
}
