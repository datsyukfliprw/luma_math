import type { Curriculum } from "./curriculumSchema";

// Curriculum registry key format: "grade-{grade}-unit-{unit}"
type CurriculumKey = string;

// Central registry for all curriculum data
const curriculumRegistry: Map<CurriculumKey, Curriculum> = new Map();

/**
 * Get curriculum by grade and unit number.
 * @param grade - Grade level (e.g., 3)
 * @param unit - Unit number (e.g., 1)
 * @returns Curriculum data or undefined if not found
 */
export function getCurriculum(grade: number, unit: number): Curriculum | undefined {
  const key = `grade-${grade}-unit-${unit}`;
  return curriculumRegistry.get(key);
}

/**
 * Get curriculum by key.
 * @param key - Curriculum key in format "grade-{grade}-unit-{unit}"
 * @returns Curriculum data or undefined if not found
 */
export function getCurriculumByKey(key: CurriculumKey): Curriculum | undefined {
  return curriculumRegistry.get(key);
}

/**
 * Get all registered curriculum keys.
 * @returns Array of curriculum keys
 */
export function getCurriculumKeys(): CurriculumKey[] {
  return Array.from(curriculumRegistry.keys());
}

/**
 * Get all registered curricula.
 * @returns Array of all curriculum data
 */
export function getAllCurricula(): Curriculum[] {
  return Array.from(curriculumRegistry.values());
}

/**
 * Register a curriculum in the registry.
 * @param grade - Grade level
 * @param unit - Unit number
 * @param curriculum - Curriculum data
 */
export function registerCurriculum(grade: number, unit: number, curriculum: Curriculum): void {
  const key = `grade-${grade}-unit-${unit}`;
  curriculumRegistry.set(key, curriculum);
}

/**
 * Check if a curriculum is registered for a given grade and unit.
 * @param grade - Grade level
 * @param unit - Unit number
 * @returns True if curriculum exists, false otherwise
 */
export function hasCurriculum(grade: number, unit: number): boolean {
  const key = `grade-${grade}-unit-${unit}`;
  return curriculumRegistry.has(key);
}
