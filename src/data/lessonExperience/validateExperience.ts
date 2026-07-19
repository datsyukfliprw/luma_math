import { z } from "zod";
import { LessonExperienceSchema, type LessonExperience } from "./experienceSchema";

/**
 * Validates a lesson experience object against the Zod schema.
 * @param data - The lesson experience data to validate
 * @returns The validated lesson experience data if valid
 * @throws Error if validation fails with details about the issues
 */
export function validateLessonExperience(data: unknown): LessonExperience {
  const result = LessonExperienceSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Lesson experience validation failed:\n${errorMessages}`);
  }

  return result.data;
}

/**
 * Validates an array of lesson experiences.
 * @param data - The array of lesson experience data to validate
 * @returns The validated lesson experience array if valid
 * @throws Error if validation fails with details about the issues
 */
export function validateLessonExperienceArray(
  data: unknown
): LessonExperience[] {
  const result = z.array(LessonExperienceSchema).safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Lesson experience array validation failed:\n${errorMessages}`);
  }

  return result.data;
}
