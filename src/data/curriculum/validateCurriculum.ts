import { CurriculumSchema, type Curriculum } from "./curriculumSchema";

/**
 * Validates a curriculum object against the Zod schema.
 * @param data - The curriculum data to validate
 * @returns The validated curriculum data if valid
 * @throws Error if validation fails with details about the issues
 */
export function validateCurriculum(data: unknown): Curriculum {
  const result = CurriculumSchema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("\n");
    throw new Error(`Curriculum validation failed:\n${errorMessages}`);
  }

  return result.data;
}

/**
 * Loads and validates a curriculum JSON file.
 * @param filePath - Path to the curriculum JSON file
 * @returns The validated curriculum data
 */
export async function loadAndValidateCurriculum(filePath: string): Promise<Curriculum> {
  try {
    // Dynamic import to avoid bundling issues
    const data = await import(filePath);
    return validateCurriculum(data.default || data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load curriculum from ${filePath}: ${error.message}`, {
        cause: error,
      });
    }
    throw new Error(`Failed to load curriculum from ${filePath}`, { cause: error });
  }
}
