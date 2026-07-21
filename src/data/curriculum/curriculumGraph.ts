// @SECTION FILE_OVERVIEW
// curriculumGraph.ts
// Mastery-based curriculum graph derived from the existing week-organized JSON.
// This layer keeps legacy lesson IDs stable while exposing a hierarchy of
// pathways, chapters, concepts, missions, and skills.

import { curriculum } from "./index";
import type { Lesson } from "./curriculumSchema";
import type { MasteryStatus, EvidenceType, PrerequisiteType } from "../../types/mastery";

export type { MasteryStatus, EvidenceType, PrerequisiteType };

// @SECTION PREREQUISITE_EDGES
export type PrerequisiteEdge = {
  fromSkillId: string;
  toSkillId: string;
  type: PrerequisiteType;
};

// @SECTION SKILL
export type Skill = {
  id: string;
  slug: string;
  title: string;
  description?: string;
};

// @SECTION MISSION
export type MissionType = "introduce" | "practice" | "mastery_check" | "review" | "bridge";

export type Mission = {
  id: string;
  title: string;
  type: MissionType;
  lessonId: string;
  conceptId: string;
  skillIds: string[];
  practiceType?: string;
  deckId?: string;
  evaluationScope?: string;
  reviewTypes?: string[];
  questionCount?: number;
  timedTest?: {
    title: string;
    durationMinutes: number;
    facts: string[];
  };
};

// @SECTION CONCEPT
export type Concept = {
  id: string;
  title: string;
  subtitle?: string;
  chapterId: string;
  skillIds: string[];
  skills: Skill[];
  missions: Mission[];
  prerequisiteEdges: PrerequisiteEdge[];
};

// @SECTION CHAPTER
export type Chapter = {
  id: string;
  title: string;
  subtitle?: string;
  pathwayId: string;
  conceptIds: string[];
  concepts: Concept[];
};

// @SECTION PATHWAY
export type Pathway = {
  id: string;
  gradeLevel: number;
  unitNumber: number;
  title: string;
  subtitle?: string;
  chapterIds: string[];
  chapters: Chapter[];
};

// @SECTION STRING_HELPERS
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanizeSkillSlug(slug: string): string {
  return slug
    .split("_")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getConceptSlugFromTitle(title: string): string {
  const evalMatch = title.match(/^week\s+(\d+)\s+evaluation$/i);
  if (evalMatch) {
    return evalMatch[1] === "1" ? "mastery-check" : `mastery-check-${evalMatch[1]}`;
  }
  return toSlug(title);
}

function getConceptId(lesson: Lesson): string {
  const slug = getConceptSlugFromTitle(lesson.lesson_title);
  return `g3-u1-c-${slug}`;
}

function getMissionId(lesson: Lesson, conceptSlug: string): string {
  return lesson.lesson_id ?? `g3-u1-m-${conceptSlug}`;
}

function getChapterId(weekTitle: string): string {
  return `g3-u1-ch-${toSlug(weekTitle)}`;
}

// @SECTION GRAPH_BUILDER
function buildSkillRegistry(lessons: Lesson[]): Map<string, Skill> {
  const registry = new Map<string, Skill>();

  for (const lesson of lessons) {
    for (const skillSlug of lesson.skills) {
      if (registry.has(skillSlug)) {
        continue;
      }

      registry.set(skillSlug, {
        id: `g3-s-${skillSlug}`,
        slug: skillSlug,
        title: humanizeSkillSlug(skillSlug),
      });
    }
  }

  return registry;
}

function buildMissionForLesson(lesson: Lesson, concept: Concept): Mission {
  const conceptSlug = concept.id.replace(/^g3-u1-c-/, "");
  const type: MissionType = lesson.lesson_type === "evaluation" ? "mastery_check" : "introduce";

  return {
    id: getMissionId(lesson, conceptSlug),
    title: lesson.lesson_title,
    type,
    lessonId: lesson.lesson_id ?? getMissionId(lesson, conceptSlug),
    conceptId: concept.id,
    skillIds: lesson.skills.map((slug) => `g3-s-${slug}`),
    practiceType: lesson.practice_type,
    deckId: lesson.flashcards?.deckId,
    evaluationScope: lesson.evaluation_scope,
    reviewTypes: lesson.review_types,
    questionCount: lesson.quiz_question_count,
    timedTest: lesson.timed_test
      ? {
          title: lesson.timed_test.title,
          durationMinutes: lesson.timed_test.duration_minutes,
          facts: lesson.timed_test.facts,
        }
      : undefined,
  };
}

function buildConceptForLesson(
  lesson: Lesson,
  chapterId: string,
  skillRegistry: Map<string, Skill>,
): Concept {
  const concept: Concept = {
    id: getConceptId(lesson),
    title: lesson.lesson_title,
    subtitle: lesson.objective,
    chapterId,
    skillIds: lesson.skills.map((slug) => `g3-s-${slug}`),
    skills: lesson.skills
      .map((slug) => skillRegistry.get(slug))
      .filter((skill): skill is Skill => skill !== undefined),
    missions: [],
    prerequisiteEdges: [],
  };

  concept.missions.push(buildMissionForLesson(lesson, concept));

  return concept;
}

function buildMasteryGraph(): Pathway {
  const allLessons = curriculum.weeks.flatMap((week) => week.lessons);
  const skillRegistry = buildSkillRegistry(allLessons);

  const chapters: Chapter[] = curriculum.weeks.map((week) => {
    const chapterId = getChapterId(week.week_title);

    return {
      id: chapterId,
      title: week.week_title,
      subtitle: week.weekly_focus,
      pathwayId: "g3-u1-pw-multiplication-foundations",
      conceptIds: [],
      concepts: week.lessons.map((lesson) => buildConceptForLesson(lesson, chapterId, skillRegistry)),
    };
  });

  for (const chapter of chapters) {
    chapter.conceptIds = chapter.concepts.map((concept) => concept.id);
  }

  return {
    id: "g3-u1-pw-multiplication-foundations",
    gradeLevel: curriculum.grade_level,
    unitNumber: curriculum.unit_number,
    title: curriculum.unit_title,
    subtitle: `Grade ${curriculum.grade_level} • Unit ${curriculum.unit_number} Pathway`,
    chapterIds: chapters.map((chapter) => chapter.id),
    chapters,
  };
}

// @SECTION GRAPH_SINGLETON
export const masteryGraph = buildMasteryGraph();

// @SECTION LOOKUP_HELPERS
export function getPathway(): Pathway {
  return masteryGraph;
}

export function getChapterById(chapterId: string): Chapter | undefined {
  return masteryGraph.chapters.find((chapter) => chapter.id === chapterId);
}

export function getConceptById(conceptId: string): Concept | undefined {
  for (const chapter of masteryGraph.chapters) {
    const concept = chapter.concepts.find((c) => c.id === conceptId);
    if (concept) {
      return concept;
    }
  }
  return undefined;
}

export function getMissionById(missionId: string): Mission | undefined {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      const mission = concept.missions.find((m) => m.id === missionId);
      if (mission) {
        return mission;
      }
    }
  }
  return undefined;
}

export function getSkillById(skillId: string): Skill | undefined {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      const skill = concept.skills.find((s) => s.id === skillId);
      if (skill) {
        return skill;
      }
    }
  }
  return undefined;
}

export function getConceptByLessonId(lessonId: string): Concept | undefined {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      if (concept.missions.some((mission) => mission.lessonId === lessonId)) {
        return concept;
      }
    }
  }
  return undefined;
}

export function getMissionByLessonId(lessonId: string): Mission | undefined {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      const mission = concept.missions.find((m) => m.lessonId === lessonId);
      if (mission) {
        return mission;
      }
    }
  }
  return undefined;
}

export function getSkillsForLesson(lessonId: string): Skill[] {
  const concept = getConceptByLessonId(lessonId);
  return concept?.skills ?? [];
}

export function getChapterForConcept(conceptId: string): Chapter | undefined {
  for (const chapter of masteryGraph.chapters) {
    if (chapter.concepts.some((concept) => concept.id === conceptId)) {
      return chapter;
    }
  }
  return undefined;
}

export function getChapterForSkill(skillId: string): Chapter | undefined {
  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      if (concept.skills.some((skill) => skill.id === skillId)) {
        return chapter;
      }
    }
  }
  return undefined;
}

export function getAllSkills(): Skill[] {
  const seen = new Set<string>();
  const skills: Skill[] = [];

  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      for (const skill of concept.skills) {
        if (!seen.has(skill.id)) {
          seen.add(skill.id);
          skills.push(skill);
        }
      }
    }
  }

  return skills;
}

export function getAllMissions(): Mission[] {
  const missions: Mission[] = [];

  for (const chapter of masteryGraph.chapters) {
    for (const concept of chapter.concepts) {
      missions.push(...concept.missions);
    }
  }

  return missions;
}
