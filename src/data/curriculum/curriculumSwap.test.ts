import { describe, it, expect } from "vitest";
import { getAllCurricula, getCurriculum } from "./curriculumRegistry";
import {
  getAllSkills,
  getConceptById,
  getConceptByLessonId,
  getSkillById,
  getSkillsForLesson,
} from "./curriculumGraph";
import { getLessonById } from "../../lib/lessonLookup";
import { getConceptUnlockState } from "../../services/prerequisites/prerequisiteGraph";
import type { SkillProgress } from "../../types/mastery";

function emptySkill(skillId: string): SkillProgress {
  return {
    skillId,
    status: "not_started",
    evidenceCounts: { conceptual: 0, procedural: 0, transfer: 0, retention: 0 },
    totalCorrect: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0,
    masteryCheckAttempts: 0,
    masteryCheckPassed: false,
    successfulRetentionCount: 0,
  };
}

function introducedSkill(skillId: string): SkillProgress {
  return {
    ...emptySkill(skillId),
    status: "introduced",
    evidenceCounts: { conceptual: 0, procedural: 1, transfer: 0, retention: 0 },
    totalCorrect: 1,
    totalAttempts: 1,
    currentStreak: 1,
    bestStreak: 1,
  };
}

function developingSkill(skillId: string): SkillProgress {
  return {
    ...emptySkill(skillId),
    status: "developing",
    evidenceCounts: { conceptual: 1, procedural: 1, transfer: 0, retention: 0 },
    totalCorrect: 2,
    totalAttempts: 2,
    currentStreak: 2,
    bestStreak: 2,
  };
}

describe("Unit 1 / Unit 11 swap", () => {
  const unit1 = getCurriculum(3, 1);
  const unit11 = getCurriculum(3, 11);

  it("Unit 1 is Multiplication Foundations", () => {
    expect(unit1).toBeDefined();
    expect(unit1?.unit_title).toBe("Multiplication Foundations");
    expect(unit1?.unit_slug).toBe("multiplication_foundations");
    expect(unit1?.unit_number).toBe(1);
  });

  it("Unit 1 Week 1 has the expected lesson titles and practice types", () => {
    const lessons = unit1?.weeks[0].lessons;
    expect(lessons).toHaveLength(5);

    const expected = [
      { lessonId: "g3-u1-w1-l1", title: "Zero and Identity Rules", practice_type: "equal_groups" },
      { lessonId: "g3-u1-w1-l2", title: "Repeated Addition to Multiplication", practice_type: "repeated_addition_to_multiplication" },
      { lessonId: "g3-u1-w1-l3", title: "Factors and Products", practice_type: "factor_product_identification" },
      { lessonId: "g3-u1-w1-l4", title: "Equal Groups With Objects", practice_type: "equal_groups_with_objects" },
      { lessonId: "g3-u1-w1-eval", title: "Week 1 Evaluation", practice_type: "mixed_evaluation" },
    ];

    for (const exp of expected) {
      const lesson = lessons?.find((l) => l.lesson_id === exp.lessonId);
      expect(lesson).toBeDefined();
      expect(lesson?.lesson_title).toBe(exp.title);
      expect(lesson?.practice_type).toBe(exp.practice_type);
    }
  });

  it("Unit 1 skills are multiplication-focused, not place-value", () => {
    const multiplicationSkills = new Set([
      "multiplication",
      "zero_property",
      "identity_property",
      "equal_groups",
      "repeated_addition",
      "multiplication_expressions",
      "factors",
      "products",
      "hands_on_modeling",
    ]);

    for (const lesson of unit1?.weeks[0].lessons ?? []) {
      const skills = getSkillsForLesson(lesson.lesson_id ?? "").map((s) => s.slug);
      for (const skill of skills) {
        expect(multiplicationSkills.has(skill)).toBe(true);
      }
      expect(skills.some((s) => s === "place_value" || s === "digit_value" || s === "base_ten")).toBe(false);
    }
  });

  it("Unit 1 evaluation reviews the four Week 1 multiplication practice types", () => {
    const evalLesson = getLessonById("g3-u1-w1-eval");
    expect(evalLesson.lesson.lesson_type).toBe("evaluation");
    expect(evalLesson.lesson.review_types).toEqual([
      "equal_groups",
      "repeated_addition_to_multiplication",
      "factor_product_identification",
      "equal_groups_with_objects",
    ]);
  });

  it("Unit 11 is Place Value Foundations", () => {
    expect(unit11).toBeDefined();
    expect(unit11?.unit_title).toBe("Place Value Foundations");
    expect(unit11?.unit_slug).toBe("place_value_foundations");
    expect(unit11?.unit_number).toBe(11);
  });

  it("Unit 11 Week 1 has the former place-value lesson sequence", () => {
    const lessons = unit11?.weeks[0].lessons;
    expect(lessons).toHaveLength(5);

    const expected = [
      { lessonId: "g3-u11-w1-l1", title: "What a Digit's Place Tells Us" },
      { lessonId: "g3-u11-w1-l2", title: "Build Numbers With Base-Ten Models" },
      { lessonId: "g3-u11-w1-l3", title: "Write Numbers in Standard and Expanded Form" },
      { lessonId: "g3-u11-w1-l4", title: "Read and Write Numbers in Words" },
      { lessonId: "g3-u11-w1-eval", title: "Unit Evaluation: Place Value Foundations" },
    ];

    for (const exp of expected) {
      const lesson = lessons?.find((l) => l.lesson_id === exp.lessonId);
      expect(lesson).toBeDefined();
      expect(lesson?.lesson_title).toBe(exp.title);
    }
  });

  it("Unit 11 skills are place-value-focused", () => {
    const placeValueSkills = new Set([
      "place_value",
      "digit_value",
      "base_ten",
      "number_sense",
      "base_ten_models",
      "standard_form",
      "expanded_form",
      "number_words",
      "place_value_digits",
    ]);

    for (const lesson of unit11?.weeks[0].lessons ?? []) {
      const skills = getSkillsForLesson(lesson.lesson_id ?? "").map((s) => s.slug);
      for (const skill of skills) {
        expect(placeValueSkills.has(skill)).toBe(true);
      }
    }
  });

  it("Unit 1 and Unit 11 IDs do not overlap", () => {
    const u1Ids = new Set(unit1?.weeks[0].lessons.map((l) => l.lesson_id));
    const u11Ids = new Set(unit11?.weeks[0].lessons.map((l) => l.lesson_id));

    for (const id of u1Ids) {
      expect(u11Ids.has(id)).toBe(false);
    }
  });

  it("no duplicate unit, lesson, or skill IDs", () => {
    const allCurricula = getAllCurricula();
    const unitNumbers = new Set<number>();
    const lessonIds = new Set<string>();
    const duplicateLessons: string[] = [];

    for (const curriculum of allCurricula) {
      expect(unitNumbers.has(curriculum.unit_number)).toBe(false);
      unitNumbers.add(curriculum.unit_number);

      for (const week of curriculum.weeks) {
        for (const lesson of week.lessons) {
          if (lesson.lesson_id) {
            if (lessonIds.has(lesson.lesson_id)) {
              duplicateLessons.push(lesson.lesson_id);
            } else {
              lessonIds.add(lesson.lesson_id);
            }
          }
        }
      }
    }

    expect(duplicateLessons).toEqual([]);

    const allSkills = getAllSkills();
    const skillIds = new Set<string>();
    const duplicateSkills: string[] = [];

    for (const skill of allSkills) {
      if (skillIds.has(skill.id)) {
        duplicateSkills.push(skill.id);
      } else {
        skillIds.add(skill.id);
      }
    }

    expect(duplicateSkills).toEqual([]);
  });

  it("all Unit 1 prerequisite concept IDs resolve", () => {
    const conceptIds = [
      "g3-u1-c-zero-and-identity-rules",
      "g3-u1-c-repeated-addition-to-multiplication",
      "g3-u1-c-factors-and-products",
      "g3-u1-c-equal-groups-with-objects",
      "g3-u1-c-mastery-check",
    ];

    for (const conceptId of conceptIds) {
      const concept = getConceptById(conceptId);
      expect(concept).toBeDefined();
      expect(concept?.id).toBe(conceptId);
    }
  });

  it("Unit 1 skills used by prerequisite edges exist", () => {
    const skillIds = [
      "g3-s-equal_groups",
      "g3-s-repeated_addition",
      "g3-s-multiplication_expressions",
      "g3-s-factors",
      "g3-s-products",
      "g3-s-hands_on_modeling",
      "g3-s-zero_property",
      "g3-s-identity_property",
    ];

    for (const skillId of skillIds) {
      expect(getSkillById(skillId)).toBeDefined();
    }
  });

  it("Unit 1 unlocks sequentially", () => {
    const day1 = getConceptByLessonId("g3-u1-w1-l1");
    const day2 = getConceptByLessonId("g3-u1-w1-l2");
    const day5 = getConceptByLessonId("g3-u1-w1-eval");

    expect(day1).toBeDefined();
    expect(day2).toBeDefined();
    expect(day5).toBeDefined();

    const emptyProgress = (skillId: string) => emptySkill(skillId);
    expect(getConceptUnlockState(day1!.id, emptyProgress).unlocked).toBe(true);
    expect(getConceptUnlockState(day2!.id, emptyProgress).unlocked).toBe(false);

    const day1SkillIds = new Set(getSkillsForLesson("g3-u1-w1-l1").map((s) => s.id));
    const day1Introduced = (skillId: string) =>
      day1SkillIds.has(skillId) ? introducedSkill(skillId) : emptySkill(skillId);
    expect(getConceptUnlockState(day2!.id, day1Introduced).unlocked).toBe(true);

    const day5SkillIds = new Set(getSkillsForLesson("g3-u1-w1-eval").map((s) => s.id));
    const allDeveloping = (skillId: string) =>
      day5SkillIds.has(skillId) ? developingSkill(skillId) : emptySkill(skillId);
    expect(getConceptUnlockState(day5!.id, allDeveloping).unlocked).toBe(true);
  });
});
