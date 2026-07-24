// @SECTION FILE_OVERVIEW
// prerequisiteGraph.ts
// Defines prerequisite edges between concepts and computes unlock state.
// This service is pure: it only reads the curriculum graph and the current
// skill progress map, so it can be called from UI, hooks, or mission planners.

import type { Concept, PrerequisiteEdge } from "../../data/curriculum/curriculumGraph";
import { getConceptById, getSkillById, masteryGraph } from "../../data/curriculum/curriculumGraph";
import type { MasteryStatus, PrerequisiteType, SkillProgress } from "../../types/mastery";
import { evaluateConceptMastery } from "../mastery/evaluateMastery";
import { MasteryStatusRank } from "../mastery/evaluateMastery";

// @SECTION PREREQUISITE_THRESHOLDS
export const PrerequisiteThreshold: Record<PrerequisiteType, MasteryStatus> = {
  hard: "developing",
  supporting: "introduced",
};

// @SECTION CONCEPT_PREREQUISITE_EDGES
// Edges are keyed by the *target* concept id. Each edge lists a skill the
// learner must have reached a threshold on before this concept unlocks.
// Skill ids are the global `g3-s-{slug}` ids produced by the curriculum graph.
// Self-loop edges mean "this skill must already be at the threshold level".

const ConceptPrerequisiteEdges: Record<string, PrerequisiteEdge[]> = {
  "g3-u1-c-zero-and-identity-rules": [],

  "g3-u1-c-repeated-addition-to-multiplication": [
    {
      fromSkillId: "g3-s-equal_groups",
      toSkillId: "g3-s-repeated_addition",
      type: "supporting",
    },
    {
      fromSkillId: "g3-s-multiplication_expressions",
      toSkillId: "g3-s-repeated_addition",
      type: "supporting",
    },
  ],

  "g3-u1-c-factors-and-products": [
    {
      fromSkillId: "g3-s-equal_groups",
      toSkillId: "g3-s-factors",
      type: "supporting",
    },
    {
      fromSkillId: "g3-s-multiplication_expressions",
      toSkillId: "g3-s-products",
      type: "supporting",
    },
    {
      fromSkillId: "g3-s-repeated_addition",
      toSkillId: "g3-s-products",
      type: "supporting",
    },
  ],

  "g3-u1-c-equal-groups-with-objects": [
    {
      fromSkillId: "g3-s-equal_groups",
      toSkillId: "g3-s-equal_groups",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-repeated_addition",
      toSkillId: "g3-s-hands_on_modeling",
      type: "supporting",
    },
    {
      fromSkillId: "g3-s-multiplication_expressions",
      toSkillId: "g3-s-multiplication_expressions",
      type: "supporting",
    },
  ],

  "g3-u1-c-mastery-check": [
    {
      fromSkillId: "g3-s-equal_groups",
      toSkillId: "g3-s-equal_groups",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-zero_property",
      toSkillId: "g3-s-zero_property",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-identity_property",
      toSkillId: "g3-s-identity_property",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-repeated_addition",
      toSkillId: "g3-s-repeated_addition",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-multiplication_expressions",
      toSkillId: "g3-s-multiplication_expressions",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-factors",
      toSkillId: "g3-s-factors",
      type: "hard",
    },
    {
      fromSkillId: "g3-s-products",
      toSkillId: "g3-s-products",
      type: "hard",
    },
  ],
};

// @SECTION PATHWAY_ORDER
function getPathwayConceptOrder(): Concept[] {
  return masteryGraph.chapters.flatMap((chapter) => chapter.concepts);
}

function getPreviousConcept(conceptId: string): Concept | undefined {
  const order = getPathwayConceptOrder();
  const index = order.findIndex((concept) => concept.id === conceptId);
  return index > 0 ? order[index - 1] : undefined;
}

// @SECTION EDGE_CHECKING
function isEdgeSatisfied(
  edge: PrerequisiteEdge,
  getSkillProgress: (skillId: string) => SkillProgress,
): boolean {
  const progress = getSkillProgress(edge.fromSkillId);
  const requiredRank = MasteryStatusRank[PrerequisiteThreshold[edge.type]];
  const currentRank = MasteryStatusRank[progress.status];
  return currentRank >= requiredRank;
}

// @SECTION UNLOCK_STATE
export type ConceptUnlockState = {
  conceptId: string;
  unlocked: boolean;
  previousConceptBlocking: boolean;
  previousConceptStatus: MasteryStatus | null;
  blockingEdges: PrerequisiteEdge[];
};

export function getConceptUnlockState(
  conceptId: string,
  getSkillProgress: (skillId: string) => SkillProgress,
): ConceptUnlockState {
  const concept = getConceptById(conceptId);
  if (!concept) {
    return {
      conceptId,
      unlocked: false,
      previousConceptBlocking: false,
      previousConceptStatus: null,
      blockingEdges: [],
    };
  }

  const previousConcept = getPreviousConcept(conceptId);
  const previousConceptStatus = previousConcept
    ? evaluateConceptMastery(previousConcept, getSkillProgress)
    : null;

  // Progression readiness: a student may continue once the previous concept
  // has been introduced (e.g., one successful Guided Practice session).
  // Hard skill-prerequisite edges below still enforce mastery thresholds.
  const previousConceptBlocking =
    previousConceptStatus !== null &&
    MasteryStatusRank[previousConceptStatus] < MasteryStatusRank["introduced"];

  const edges = ConceptPrerequisiteEdges[conceptId] ?? [];
  const blockingEdges = edges.filter(
    (edge) => edge.type === "hard" && !isEdgeSatisfied(edge, getSkillProgress),
  );

  const unlocked = !previousConceptBlocking && blockingEdges.length === 0;

  return {
    conceptId,
    unlocked,
    previousConceptBlocking,
    previousConceptStatus,
    blockingEdges,
  };
}

// @SECTION PATHWAY_UNLOCK_QUERIES
export function getUnlockedConceptIds(
  getSkillProgress: (skillId: string) => SkillProgress,
): string[] {
  return getPathwayConceptOrder()
    .filter((concept) => getConceptUnlockState(concept.id, getSkillProgress).unlocked)
    .map((concept) => concept.id);
}

export function getNextConceptId(
  getSkillProgress: (skillId: string) => SkillProgress,
): string | undefined {
  for (const concept of getPathwayConceptOrder()) {
    const state = getConceptUnlockState(concept.id, getSkillProgress);
    if (state.unlocked) {
      return concept.id;
    }
  }
  return undefined;
}

export function isSkillIdValid(skillId: string): boolean {
  return getSkillById(skillId) !== undefined;
}
