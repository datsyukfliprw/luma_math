import curriculumData from "./grade_3/unit_01_multiplication_division_foundations.json";
import { validateCurriculum } from "./validateCurriculum";

// Validate the curriculum data on import
const validatedCurriculum = validateCurriculum(curriculumData);

export { validatedCurriculum as curriculum };
export type { Curriculum, Lesson, Week } from "./curriculumSchema";
