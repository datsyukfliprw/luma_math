import { getCurriculum } from "../../data/curriculum";
import { getConceptById, getSkillsForLesson } from "../../data/curriculum/curriculumGraph";
import type { StudentState } from "../../contexts/StudentProgressContext";
import type { EvaluationCompletionRecord } from "../../types/evaluationProgress";

// @SECTION UNIT_LOOKUP

function findUnitForLessonId(lessonId: string): number | undefined {
  const match = lessonId.match(/^g3-u(\d+)-/);
  return match ? Number(match[1]) : undefined;
}

export function getEvaluationForUnit(
  unitNumber: number,
): { lessonId: string; lessonIdFallback: string } | undefined {
  const unit = getCurriculum(3, unitNumber);
  if (!unit) return undefined;

  for (const week of unit.weeks) {
    const evalLesson = week.lessons.find((l) => l.lesson_type === "evaluation");
    if (evalLesson) {
      const lessonId = evalLesson.lesson_id ?? `g3-u${unitNumber}-w${week.week_number}-eval`;
      return { lessonId, lessonIdFallback: lessonId };
    }
  }

  return undefined;
}

export function getPreviousUnitEvaluationLessonId(unitNumber: number): string | undefined {
  if (unitNumber <= 1) return undefined;
  const targetUnit = getCurriculum(3, unitNumber);
  if (!targetUnit) return undefined;
  const previous = getEvaluationForUnit(unitNumber - 1);
  return previous?.lessonId;
}

export function getLessonIdsForUnit(unitNumber: number): string[] {
  const unit = getCurriculum(3, unitNumber);
  if (!unit) return [];

  const ids: string[] = [];
  for (const week of unit.weeks) {
    for (const lesson of week.lessons) {
      const id = lesson.lesson_id ?? `g3-u${unitNumber}-w${week.week_number}-l${lesson.day_number}`;
      ids.push(id);
    }
  }
  return ids;
}

function getSkillIdsForUnit(unitNumber: number): Set<string> {
  const lessonIds = getLessonIdsForUnit(unitNumber);
  const skillIds = new Set<string>();
  for (const lessonId of lessonIds) {
    for (const skill of getSkillsForLesson(lessonId)) {
      skillIds.add(skill.id);
    }
  }
  return skillIds;
}

// @SECTION EVALUATION_STATUS

export function isEvaluationCompleted(
  evaluationCompletions: Record<string, EvaluationCompletionRecord>,
  evaluationLessonId: string,
): boolean {
  return evaluationCompletions[evaluationLessonId] !== undefined;
}

// @SECTION HISTORICAL_COMPATIBILITY

export function isUnitGrandfathered(studentState: StudentState, unitNumber: number): boolean {
  if (unitNumber === 1) return false;

  const lessonIds = getLessonIdsForUnit(unitNumber);

  // Existing lesson progress or practice rewards in the target unit show the
  // student already entered the unit before evaluation gates were added.
  for (const lessonId of lessonIds) {
    if (studentState.lessonProgress[lessonId]) return true;

    const rewards = studentState.practiceRewards[lessonId];
    if (rewards && Object.keys(rewards).length > 0) return true;
  }

  // Any non-introduction skill progress attributable to the unit is also
  // treated as proof of prior work.
  const skillIds = getSkillIdsForUnit(unitNumber);
  for (const skillId of skillIds) {
    const progress = studentState.skillProgress[skillId];
    if (progress && progress.status !== "not_started") return true;
  }

  return false;
}

// @SECTION UNIT_UNLOCK

export function isFirstLessonOfUnitUnlocked(
  studentState: StudentState,
  unitNumber: number,
): boolean {
  if (unitNumber === 1) return true;

  // Historical compatibility: do not revoke access to a unit the student has
  // already entered or worked in.
  if (isUnitGrandfathered(studentState, unitNumber)) return true;

  const previousEvalId = getPreviousUnitEvaluationLessonId(unitNumber);
  if (!previousEvalId) return false;

  return isEvaluationCompleted(studentState.evaluationCompletions ?? {}, previousEvalId);
}

// @SECTION LESSON_PROGRESSION

export function getUnitNumberForFirstLessonOfConcept(conceptId: string): number | undefined {
  const found = findCurriculumLessonByIdFromConceptId(conceptId);
  if (!found) return undefined;
  return findUnitForLessonId(found);
}

export function findCurriculumLessonByIdFromConceptId(conceptId: string): string | undefined {
  const concept = getConceptById(conceptId);
  if (!concept) return undefined;

  // Use the first mission's lessonId as the canonical concept lesson.
  const lessonId = concept.missions[0]?.lessonId;
  return lessonId;
}
