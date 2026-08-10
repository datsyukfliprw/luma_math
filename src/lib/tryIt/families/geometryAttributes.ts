import type { TryItFamily } from "../types";
import { makeSinglePartTryItProblem } from "../buildTryItProblem";
import type { SeededRng } from "../../../practiceTypes/random";

export const SHAPE_CATEGORIES = [
  "Square",
  "Rectangle",
  "Rhombus",
  "Parallelogram",
  "Trapezoid",
] as const;
export type ShapeCategory = (typeof SHAPE_CATEGORIES)[number];

// Inclusive definitions for Unit 33 semantic checking.
export type AttributeRequirement = true | false | "any";

export interface ShapeDef {
  name: ShapeCategory;
  sides: number;
  minParallelPairs: number;
  equalSides: AttributeRequirement;
  rightAngles: AttributeRequirement;
}

export const SHAPE_DEFINITIONS: ShapeDef[] = [
  { name: "Square", sides: 4, minParallelPairs: 2, equalSides: true, rightAngles: true },
  { name: "Rectangle", sides: 4, minParallelPairs: 2, equalSides: "any", rightAngles: true },
  { name: "Rhombus", sides: 4, minParallelPairs: 2, equalSides: true, rightAngles: "any" },
  { name: "Parallelogram", sides: 4, minParallelPairs: 2, equalSides: "any", rightAngles: "any" },
  { name: "Trapezoid", sides: 4, minParallelPairs: 1, equalSides: "any", rightAngles: "any" },
];

export type GeometryConstraint = {
  sides?: number;
  parallelPairs?: 1 | 2 | "at-least-1";
  equalSides?: boolean;
  rightAngles?: boolean;
};

export function isASubset(a: ShapeDef, b: ShapeDef): boolean {
  if (a.sides !== b.sides) return false;
  if (a.minParallelPairs < b.minParallelPairs) return false;
  if (b.equalSides !== "any" && a.equalSides !== b.equalSides) return false;
  if (b.rightAngles !== "any" && a.rightAngles !== b.rightAngles) return false;
  return true;
}

function findShapeByName(name: string): ShapeDef | undefined {
  return SHAPE_DEFINITIONS.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

function resolveParallelPairs(
  constraint: GeometryConstraint,
): GeometryConstraint["parallelPairs"] | undefined {
  if (constraint.parallelPairs !== undefined) return constraint.parallelPairs;
  // A quadrilateral with four right angles (rectangle) or four equal sides (rhombus)
  // necessarily has two pairs of parallel sides.
  if (constraint.rightAngles === true || constraint.equalSides === true) return 2;
  return undefined;
}

function isGuaranteedBy(shape: ShapeDef, constraint: GeometryConstraint): boolean {
  if (constraint.sides !== undefined && shape.sides !== constraint.sides) return false;

  const parallel = resolveParallelPairs(constraint);
  if (parallel !== undefined) {
    if (parallel === "at-least-1") {
      if (shape.minParallelPairs > 1) return false;
    } else if (shape.minParallelPairs > parallel) {
      return false;
    }
  } else if (shape.minParallelPairs > 0) {
    return false;
  }

  if (constraint.rightAngles !== undefined) {
    if (shape.rightAngles !== "any" && shape.rightAngles !== constraint.rightAngles) return false;
  } else if (shape.rightAngles !== "any") {
    return false;
  }

  if (constraint.equalSides !== undefined) {
    if (shape.equalSides !== "any" && shape.equalSides !== constraint.equalSides) return false;
  } else if (shape.equalSides !== "any") {
    return false;
  }

  return true;
}

export function mostSpecificGuaranteed(constraint: GeometryConstraint): ShapeCategory | undefined {
  const parallel = resolveParallelPairs(constraint);
  const effective: GeometryConstraint = { ...constraint, parallelPairs: parallel };
  const candidates = SHAPE_DEFINITIONS.filter((s) => isGuaranteedBy(s, effective));
  if (candidates.length === 0) return undefined;

  const minimal = candidates.filter(
    (a) => !candidates.some((b) => b.name !== a.name && isASubset(b, a)),
  );
  if (minimal.length !== 1) return undefined;
  return minimal[0].name;
}

// ---- Question builders ----

type GeometryKeyParams = {
  sides?: number;
  target?: string;
  parallelPairs?: 1 | 2 | "at-least-1";
  equalSides?: boolean;
  rightAngles?: boolean;
  form?: string;
};

type BuiltQuestion = {
  prompt: string;
  correct: string;
  choices: string[];
  keyParams: GeometryKeyParams;
};

function geometryProblemKey(practiceType: string, params: GeometryKeyParams): string {
  const parts: string[] = [practiceType];
  if (params.sides !== undefined) parts.push(`sides=${params.sides}`);
  if (params.target !== undefined) parts.push(`target=${params.target}`);
  if (params.parallelPairs !== undefined) parts.push(`parallelPairs=${params.parallelPairs}`);
  if (params.equalSides !== undefined) parts.push(`equalSides=${params.equalSides}`);
  if (params.rightAngles !== undefined) parts.push(`rightAngles=${params.rightAngles}`);
  if (params.form !== undefined) parts.push(`form=${params.form}`);
  return parts.join("|");
}

function guaranteedKeyAttrs(
  name: ShapeCategory,
): Pick<GeometryKeyParams, "parallelPairs" | "equalSides" | "rightAngles"> {
  const def = SHAPE_DEFINITIONS.find((s) => s.name === name)!;
  const result: Pick<GeometryKeyParams, "parallelPairs" | "equalSides" | "rightAngles"> = {
    parallelPairs: def.minParallelPairs === 2 ? 2 : "at-least-1",
  };
  if (def.equalSides !== "any") result.equalSides = def.equalSides;
  if (def.rightAngles !== "any") result.rightAngles = def.rightAngles;
  return result;
}

function buildAllNamesQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Among square, rectangle, and rhombus, which names can describe a square?";
  const correct = "A square, a rectangle, and a rhombus";
  const distractors = ["A square only", "A rectangle and a rhombus only"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...rng.shuffle(distractors)]),
    keyParams: {
      target: "Square",
      ...guaranteedKeyAttrs("Square"),
      form: "all-names",
    },
  };
}

function buildWhyRectangleQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Why is every square also a rectangle?";
  const correct = "Because it has four right angles.";
  const distractors = [
    "Because it has four equal sides.",
    "Because it has two pairs of parallel sides.",
  ];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...rng.shuffle(distractors)]),
    keyParams: {
      target: "Square",
      ...guaranteedKeyAttrs("Square"),
      form: "why-rectangle",
    },
  };
}

function buildWhyRhombusQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Why is every square also a rhombus?";
  const correct = "Because it has four equal sides.";
  const distractors = [
    "Because it has four right angles.",
    "Because it has two pairs of parallel sides.",
  ];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...rng.shuffle(distractors)]),
    keyParams: {
      target: "Square",
      ...guaranteedKeyAttrs("Square"),
      form: "why-rhombus",
    },
  };
}

function buildTrueStatementSquareRectangleQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Which statement about these shapes is true?";
  const choices = [
    "Every square is a rectangle.",
    "Every rectangle is a square.",
    "Every rhombus is a square.",
  ];
  const correct = choices[0];
  return {
    prompt,
    correct,
    choices: rng.shuffle(choices),
    keyParams: {
      target: "Square",
      form: "true-square-rect",
    },
  };
}

function buildTrueStatementRhombusParallelogramQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Which statement about these shapes is true?";
  const choices = [
    "Every rhombus is a parallelogram.",
    "Every parallelogram is a rhombus.",
    "Every rectangle is a rhombus.",
  ];
  const correct = choices[0];
  return {
    prompt,
    correct,
    choices: rng.shuffle(choices),
    keyParams: {
      target: "Rhombus",
      form: "true-rhombus-para",
    },
  };
}

function buildTrueStatementRectangleParallelogramQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "Which statement about these shapes is true?";
  const choices = [
    "Every rectangle is a parallelogram.",
    "Every parallelogram is a rectangle.",
    "Every rhombus is a rectangle.",
  ];
  const correct = choices[0];
  return {
    prompt,
    correct,
    choices: rng.shuffle(choices),
    keyParams: {
      target: "Rectangle",
      form: "true-rect-para",
    },
  };
}

function buildMostSpecificRectangleQuestion(rng: SeededRng): BuiltQuestion {
  const prompt =
    "What is the most specific name for a quadrilateral with two pairs of parallel sides, four right angles, but not four equal sides?";
  const correct = "Rectangle";
  const distractors = ["Square", "Rhombus"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Rectangle",
      parallelPairs: 2,
      rightAngles: true,
      equalSides: false,
      form: "most-specific",
    },
  };
}

function buildMostSpecificRhombusQuestion(rng: SeededRng): BuiltQuestion {
  const prompt =
    "What is the most specific name for a quadrilateral with two pairs of parallel sides, four equal sides, but not four right angles?";
  const correct = "Rhombus";
  const distractors = ["Square", "Rectangle"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Rhombus",
      parallelPairs: 2,
      equalSides: true,
      rightAngles: false,
      form: "most-specific",
    },
  };
}

function buildClassifyQuestion(rng: SeededRng): BuiltQuestion {
  const builders = [
    buildAllNamesQuestion,
    buildWhyRectangleQuestion,
    buildWhyRhombusQuestion,
    buildTrueStatementSquareRectangleQuestion,
    buildTrueStatementRhombusParallelogramQuestion,
    buildTrueStatementRectangleParallelogramQuestion,
    buildMostSpecificRectangleQuestion,
    buildMostSpecificRhombusQuestion,
  ];
  return builders[rng.nextInt(0, builders.length - 1)](rng);
}

function buildCountShapeQuestion(rng: SeededRng): BuiltQuestion {
  const twoPairNames = SHAPE_CATEGORIES.filter((c) => c !== "Trapezoid");
  const shape = rng.pick(twoPairNames);
  const prompt = `How many pairs of parallel sides does a ${shape.toLowerCase()} have?`;
  const correct = "2";
  const distractors = ["0", "1"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: shape,
      ...guaranteedKeyAttrs(shape),
      form: "count",
    },
  };
}

function buildMostSpecificTwoPairsQuestion(rng: SeededRng): BuiltQuestion {
  const prompt =
    "What is the most specific name for a quadrilateral with two pairs of parallel sides?";
  const correct = "Parallelogram";
  const distractors = rng.shuffle(SHAPE_CATEGORIES.filter((c) => c !== correct)).slice(0, 2);
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Parallelogram",
      ...guaranteedKeyAttrs("Parallelogram"),
      form: "most-specific",
    },
  };
}

function buildMostSpecificOnePairQuestion(rng: SeededRng): BuiltQuestion {
  const prompt =
    "What is the most specific name for a quadrilateral with exactly one pair of parallel sides?";
  const correct = "Trapezoid";
  const distractors = rng.shuffle(SHAPE_CATEGORIES.filter((c) => c !== correct)).slice(0, 2);
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Trapezoid",
      parallelPairs: 1,
      form: "most-specific",
    },
  };
}

function buildParallelQuestion(rng: SeededRng): BuiltQuestion {
  const builders = [
    buildCountShapeQuestion,
    buildMostSpecificTwoPairsQuestion,
    buildMostSpecificOnePairQuestion,
  ];
  return builders[rng.nextInt(0, builders.length - 1)](rng);
}

function buildCountParallelogramQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "How many pairs of parallel sides does a parallelogram have?";
  const correct = "2";
  const distractors = ["1", "3"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Parallelogram",
      ...guaranteedKeyAttrs("Parallelogram"),
      form: "count",
    },
  };
}

function buildCountTrapezoidAtLeastQuestion(rng: SeededRng): BuiltQuestion {
  const prompt = "A trapezoid has at least how many pairs of parallel sides?";
  const correct = "1";
  const distractors = ["0", "2"];
  return {
    prompt,
    correct,
    choices: rng.shuffle([correct, ...distractors]),
    keyParams: {
      target: "Trapezoid",
      ...guaranteedKeyAttrs("Trapezoid"),
      form: "count-at-least",
    },
  };
}

function buildParallelogramTrapezoidQuestion(rng: SeededRng): BuiltQuestion {
  const builders = [
    buildCountParallelogramQuestion,
    buildCountTrapezoidAtLeastQuestion,
    buildMostSpecificTwoPairsQuestion,
    buildMostSpecificOnePairQuestion,
  ];
  return builders[rng.nextInt(0, builders.length - 1)](rng);
}

// ---- Semantic matcher used by tests ----

export function matchesGeometryPrompt(choice: string, prompt: string): boolean {
  const normalized = prompt.toLowerCase().replace(/\s+/g, " ").trim();
  const choiceNorm = choice.toLowerCase().replace(/\s+/g, " ").trim();

  // Count form.
  let match = normalized.match(/how many pairs of parallel sides does (?:a|an) ([\w\s]+?) have\?/);
  if (match) {
    const expected = exactParallelPairCount(match[1].trim());
    if (expected !== undefined) return Number(choiceNorm) === expected;
  }

  match = normalized.match(/(?:a|an) ([\w\s]+?) has at least how many pairs of parallel sides\?/);
  if (match) {
    const expected = minParallelPairCount(match[1].trim());
    if (expected !== undefined) return Number(choiceNorm) === expected;
  }

  match = normalized.match(
    /a quadrilateral with (exactly one pair|two pairs) of parallel sides.*?how many pairs of parallel sides does it have\?/,
  );
  if (match) {
    const expected = match[1].includes("two") ? 2 : 1;
    return Number(choiceNorm) === expected;
  }

  // Names form (scoped or unscoped).
  match = normalized.match(/^among ([\w\s,]+?) which names can describe (?:a|an) ([\w]+)\?/);
  if (match) {
    const allowed = match[1]
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => SHAPE_CATEGORIES.some((c) => c.toLowerCase() === s));
    return matchesNamesForShape(choiceNorm, match[2].trim(), allowed);
  }

  match = normalized.match(/which names can describe (?:a|an) ([\w]+)\?/);
  if (match) {
    return matchesNamesForShape(choiceNorm, match[1].trim());
  }

  // Why form.
  match = normalized.match(/why is every ([\w]+) also (?:a|an) ([\w]+)\?/);
  if (match) {
    return matchesWhyReason(choiceNorm, match[2].trim());
  }

  // True statement form.
  if (normalized.includes("which statement about these shapes is true")) {
    return isTrueStatement(choiceNorm);
  }

  // Most specific / classification form.
  const classification = parseClassificationPrompt(normalized);
  if (classification) {
    const expected = mostSpecificGuaranteed(classification);
    if (expected) return choiceNorm === expected.toLowerCase();
  }

  return false;
}

function exactParallelPairCount(subject: string): number | undefined {
  const def = findShapeByName(subject);
  if (!def) return undefined;
  // A trapezoid can have one or two pairs, so the count is not fixed.
  if (def.name === "Trapezoid") return undefined;
  return def.minParallelPairs;
}

function minParallelPairCount(subject: string): number | undefined {
  const def = findShapeByName(subject);
  return def?.minParallelPairs;
}

function matchesNamesForShape(choice: string, target: string, allowed?: string[]): boolean {
  if (/\bonly\b|\bnot\b|\bjust\b/.test(choice)) return false;
  const targetNorm = target.toLowerCase();
  const allowedSet = new Set(
    (allowed && allowed.length > 0 ? allowed : SHAPE_CATEGORIES.map((c) => c.toLowerCase())).filter(
      (n) => SHAPE_CATEGORIES.some((c) => c.toLowerCase() === n),
    ),
  );
  const expected = new Set([...allowedSet].filter((name) => isASubsetByName(targetNorm, name)));

  const mentioned = new Set<string>();
  const re = /\b(square|rectangle|rhombus|parallelogram|trapezoid)\b/g;
  let m;
  while ((m = re.exec(choice)) !== null) {
    mentioned.add(m[1].toLowerCase());
  }

  if (mentioned.size !== expected.size) return false;
  for (const name of mentioned) {
    if (!expected.has(name)) return false;
  }
  return true;
}

function matchesWhyReason(choice: string, b: string): boolean {
  const hasRight = /\bright angles\b/.test(choice);
  const hasEqual = /\bequal sides\b/.test(choice);
  const hasTwoPairs =
    /\btwo pairs\b/.test(choice) || /\btwo pairs of parallel sides\b/.test(choice);
  const hasAtLeastOnePair =
    /\bat least one pair\b/.test(choice) || /\bat least one pair of parallel sides\b/.test(choice);

  switch (b) {
    case "rectangle":
      return hasRight && !hasEqual && !hasTwoPairs && !hasAtLeastOnePair;
    case "rhombus":
      return hasEqual && !hasRight && !hasTwoPairs && !hasAtLeastOnePair;
    case "parallelogram":
      return hasTwoPairs && !hasRight && !hasEqual && !hasAtLeastOnePair;
    case "trapezoid":
      return hasAtLeastOnePair && !hasRight && !hasEqual && !hasTwoPairs;
    case "square":
      return hasRight && hasEqual && !hasTwoPairs && !hasAtLeastOnePair;
    default:
      return false;
  }
}

function isTrueStatement(choice: string): boolean {
  const s = choice.toLowerCase().replace(/\./g, " ").trim();

  // "Every X is a Y." / "Every X is also a Y."
  let m = s.match(/\bevery\s+(\w+)\s+(?:is|is also)\s+(?:a\s+)?(\w+)\b/);
  if (m) return isASubsetByName(m[1], m[2]);

  // "All Xs are Ys."
  m = s.match(/\ball\s+(\w+)s?\s+are\s+(\w+)s?\b/);
  if (m) return isASubsetByName(m[1], m[2]);

  // "A X is a Y." / "An X is a Y."
  m = s.match(/\b(a|an)\s+(\w+)\s+is\s+(?:a\s+)?(\w+)\b/);
  if (m) return isASubsetByName(m[2], m[3]);

  return false;
}

function isASubsetByName(a: string, b: string): boolean {
  const defA = findShapeByName(a);
  const defB = findShapeByName(b);
  if (!defA || !defB) return false;
  return isASubset(defA, defB);
}

function parseClassificationPrompt(prompt: string): GeometryConstraint | undefined {
  // "What is the most specific name for a quadrilateral with ...?"
  let m = prompt.match(/what is the most specific name for a quadrilateral with (.+)\?/);
  if (m) return parseAttributeClause(m[1]);

  // "What is (the most specific name|it) for a quadrilateral with ...?"
  m = prompt.match(/what is (?:the most specific name|it) for a quadrilateral with (.+)\?/);
  if (m) return parseAttributeClause(m[1]);

  // "A quadrilateral with ... . What is (the most specific name|it)?"
  m = prompt.match(
    /a quadrilateral with (.+?)\.\s*(?:what is(?: the most specific name| it)|what is it)\?/,
  );
  if (m) return parseAttributeClause(m[1]);

  // "A [shape] with ... . What is (the most specific name|it)?"
  m = prompt.match(
    /a (\w+) with (.+?)\.\s*(?:what is(?: the most specific name| it)|what is it)\?/,
  );
  if (m) {
    const [, subject, clause] = m;
    const def = findShapeByName(subject);
    if (def) {
      const parsed = parseAttributeClause(clause);
      return {
        sides: 4,
        parallelPairs: parsed.parallelPairs ?? (def.minParallelPairs as 1 | 2),
        equalSides: parsed.equalSides,
        rightAngles: parsed.rightAngles,
      };
    }
    return parseAttributeClause(clause);
  }

  // "A [shape] has ... . What is (the most specific name|it)?"
  m = prompt.match(/a (\w+) has (.+?)\.\s*(?:what is(?: the most specific name| it)|what is it)\?/);
  if (m) {
    const [, subject, clause] = m;
    const def = findShapeByName(subject);
    if (def) {
      const parsed = parseAttributeClause(clause);
      return {
        sides: 4,
        parallelPairs: parsed.parallelPairs ?? (def.minParallelPairs as 1 | 2),
        equalSides: parsed.equalSides,
        rightAngles: parsed.rightAngles,
      };
    }
    return parseAttributeClause(clause);
  }

  return undefined;
}

function parseAttributeClause(clause: string): GeometryConstraint {
  const lower = clause.toLowerCase();

  const rightAngles =
    lower.includes("not four right angles") || lower.includes("no right angles")
      ? false
      : lower.includes("four right angles")
        ? true
        : undefined;

  const equalSides =
    lower.includes("not four equal sides") || lower.includes("no equal sides")
      ? false
      : lower.includes("four equal sides")
        ? true
        : undefined;

  let parallelPairs: GeometryConstraint["parallelPairs"];
  if (lower.includes("exactly one pair") || lower.includes("one pair of parallel sides")) {
    parallelPairs = 1;
  } else if (lower.includes("two pairs of parallel sides")) {
    parallelPairs = 2;
  } else if (lower.includes("at least one pair")) {
    parallelPairs = "at-least-1";
  } else {
    parallelPairs = undefined;
  }

  return { sides: 4, parallelPairs, equalSides, rightAngles };
}

export const geometryAttributesFamily: TryItFamily = (ctx) => {
  const problems = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const sides = ctx.rng.nextInt(3, 5);
    const shape = ctx.rng.pick(SHAPE_DEFINITIONS);

    let prompt: string;
    let correct: string;
    let choices: string[];
    let keyParams: GeometryKeyParams;

    if (ctx.practiceType === "sides_and_vertices") {
      prompt = `A shape has ${sides} sides. How many vertices does it have?`;
      correct = String(sides);
      choices = ctx.rng.shuffle([correct, String(sides + 1), String(sides - 1)]);
      keyParams = { sides };
    } else if (ctx.practiceType === "parallel_sides_quadrilaterals") {
      const built = buildParallelQuestion(ctx.rng);
      prompt = built.prompt;
      correct = built.correct;
      choices = built.choices;
      keyParams = built.keyParams;
    } else if (ctx.practiceType === "classify_squares_rectangles_rhombuses") {
      const built = buildClassifyQuestion(ctx.rng);
      prompt = built.prompt;
      correct = built.correct;
      choices = built.choices;
      keyParams = built.keyParams;
    } else if (ctx.practiceType === "parallelograms_trapezoids") {
      const built = buildParallelogramTrapezoidQuestion(ctx.rng);
      prompt = built.prompt;
      correct = built.correct;
      choices = built.choices;
      keyParams = built.keyParams;
    } else {
      prompt = `A ${shape.name} has ${shape.sides} sides. How many sides does it have?`;
      correct = String(shape.sides);
      choices = ctx.rng.shuffle([correct, String(shape.sides + 1), String(shape.sides - 1)]);
      keyParams = {
        target: shape.name,
        sides: shape.sides,
        form: "sides-count",
      };
    }

    const key = geometryProblemKey(ctx.practiceType, keyParams);
    if (ctx.usedKeys.has(key)) continue;
    ctx.usedKeys.add(key);

    problems.push(
      makeSinglePartTryItProblem({
        id: `${ctx.lessonId}-geometry-${problems.length + 1}`,
        problemKey: key,
        prompt,
        correctAnswer: correct,
        tip: ctx.lesson.objective,
        successMessage: `Yes! ${correct} is correct.`,
        visualEmoji: "🔺",
        choices,
      }),
    );
  }

  return problems;
};
