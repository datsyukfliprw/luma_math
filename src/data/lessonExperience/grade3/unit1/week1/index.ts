import type { LessonExperience } from "../../../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";
import { lesson4 } from "./lesson4";
import { evaluation } from "./evaluation";

// Temporarily disable validation to debug loading issue
// import { validateLessonExperienceArray } from "../../../validateExperience";
// const lessons: LessonExperience[] = [lesson1, lesson2, lesson3, lesson4, evaluation];
// const validatedLessons = validateLessonExperienceArray(lessons);

export const grade3Unit1Week1Experience: LessonExperience[] = [
  lesson1,
  lesson2,
  lesson3,
  lesson4,
  evaluation,
];
