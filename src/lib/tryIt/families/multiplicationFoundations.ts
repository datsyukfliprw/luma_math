import type { TryItTemplate } from "../../../data/lessonExperience/types";
import type {
  TryItFamily,
  TryItFamilyContext,
  ResolvedTryItProblem,
  TryItAnswerPart,
} from "../types";
import {
  buildNumberChoices,
  buildMultiplicationEquationChoices,
  buildZeroOneEquationChoices,
  mathProblemKey,
  parseLabeledNoun,
} from "../buildTryItProblem";

type MultiplicationTemplate = {
  id: string;
  groupNoun: string;
  itemNoun: string;
  visualEmoji: string;
  visualEmpty?: boolean;
  questionForm?:
    "product" | "factors" | "word" | "repeated" | "objects" | "zero_identity" | "equation";
  tip: string;
  successMessage: string;
};

function toMultiplicationTemplate(template: TryItTemplate): MultiplicationTemplate {
  return {
    id: template.id,
    groupNoun: template.groupNoun ?? "groups",
    itemNoun: template.itemNoun ?? "1 item",
    visualEmoji: template.visualEmoji ?? "⭐",
    visualEmpty: template.visualEmpty,
    questionForm: template.questionForm,
    tip: template.tip ?? "Look for equal groups.",
    successMessage: template.successMessage ?? "Nice work!",
  };
}

function inferQuestionForm(
  practiceType: string,
  form?: MultiplicationTemplate["questionForm"],
): NonNullable<MultiplicationTemplate["questionForm"]> {
  if (form) return form;
  switch (practiceType) {
    case "equal_groups":
      return "zero_identity";
    case "repeated_addition_to_multiplication":
      return "repeated";
    case "factor_product_identification":
      return "product";
    case "equal_groups_with_objects":
      return "objects";
    default:
      return "product";
  }
}

function buildMultiplicationProblem(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
  form: string,
  build: () => {
    prompt: string;
    parts: TryItAnswerPart[];
    visualData?: { groups: number; itemsPerGroup: number };
    visualEmpty?: boolean;
    groups: number;
    inEach: number;
    successMessage?: string;
  },
): ResolvedTryItProblem {
  let candidate = build();
  const key = mathProblemKey(ctx.practiceType, candidate.groups, candidate.inEach, form);

  for (let attempt = 0; attempt < 30 && ctx.usedKeys.has(key); attempt += 1) {
    candidate = build();
  }

  const finalKey = mathProblemKey(ctx.practiceType, candidate.groups, candidate.inEach, form);
  ctx.usedKeys.add(finalKey);

  return {
    id: `${ctx.lessonId}-${template.id}-${candidate.groups}x${candidate.inEach}`,
    problemKey: finalKey,
    prompt: candidate.prompt,
    tip: template.tip,
    successMessage: candidate.successMessage ?? template.successMessage,
    visualEmoji: template.visualEmoji,
    visualEmpty: candidate.visualEmpty,
    visualData: candidate.visualData,
    parts: candidate.parts,
  };
}

function generateZeroIdentity(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  const inEachFromTemplate = Math.max(
    0,
    Math.min(1, Number(template.itemNoun.match(/^-?\d+/)?.[0]) || 0),
  ) as 0 | 1;

  return buildMultiplicationProblem(ctx, template, "zero_identity", () => {
    const inEach = inEachFromTemplate ?? (ctx.rng.nextInt(0, 1) as 0 | 1);
    const groups = ctx.rng.nextInt(2, 9);
    const groupNouns = parseLabeledNoun(template.groupNoun);
    const itemNouns = parseLabeledNoun(template.itemNoun);
    const total = groups * inEach;

    const itemPhrase = inEach === 1 ? `1 ${itemNouns.singular}` : `${inEach} ${itemNouns.plural}`;
    const prompt = `There are ${groups} ${groupNouns.plural}. Each ${groupNouns.singular} has ${itemPhrase}. How many ${itemNouns.plural} are there in all?`;

    const parts: TryItAnswerPart[] = [
      {
        key: "groups",
        label: "How many groups?",
        correctAnswer: String(groups),
        choices: buildNumberChoices(groups, 2, 9, ctx.rng),
      },
      {
        key: "inEach",
        label: "How many in each group?",
        correctAnswer: String(inEach),
        choices: buildNumberChoices(inEach, 0, 2, ctx.rng),
      },
      {
        key: "equation",
        label: "Write the equation",
        correctAnswer: `${groups} × ${inEach} = ${total}`,
        choices: buildZeroOneEquationChoices(groups, inEach, ctx.rng),
      },
    ];

    const successMessage = `Yes! ${groups} ${groupNouns.plural} with ${inEach} in each makes ${total} total.`;

    return {
      prompt,
      parts,
      visualData: { groups, itemsPerGroup: inEach },
      visualEmpty: inEach === 0,
      groups,
      inEach,
      successMessage,
    };
  });
}

function generateRepeatedAddition(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  return buildMultiplicationProblem(ctx, template, "repeated", () => {
    const groups = ctx.rng.nextInt(2, 7);
    const addend = ctx.rng.nextInt(2, 6);
    const groupNouns = parseLabeledNoun(template.groupNoun);
    const itemNouns = parseLabeledNoun(template.itemNoun);
    const total = groups * addend;

    const repeatedAddition = Array.from({ length: groups }, () => String(addend)).join(" + ");
    const prompt = `There are ${groups} ${groupNouns.plural} with ${addend} ${itemNouns.plural} in each ${groupNouns.singular}. What multiplication equation matches ${repeatedAddition}?`;

    const parts: TryItAnswerPart[] = [
      {
        key: "groups",
        label: "How many groups?",
        correctAnswer: String(groups),
        choices: buildNumberChoices(groups, 2, 7, ctx.rng),
      },
      {
        key: "inEach",
        label: "How many in each group?",
        correctAnswer: String(addend),
        choices: buildNumberChoices(addend, 2, 6, ctx.rng),
      },
      {
        key: "equation",
        label: "Write the equation",
        correctAnswer: `${groups} × ${addend} = ${total}`,
        choices: buildMultiplicationEquationChoices(groups, addend, ctx.rng),
      },
    ];

    const successMessage = `Yes! ${repeatedAddition} is ${groups} groups of ${addend}, so it is ${groups} × ${addend} = ${total}.`;

    return {
      prompt,
      parts,
      visualData: { groups, itemsPerGroup: addend },
      visualEmpty: false,
      groups,
      inEach: addend,
      successMessage,
    };
  });
}

function generateEqualGroupsWithObjects(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  return buildMultiplicationProblem(ctx, template, "objects", () => {
    const groups = ctx.rng.nextInt(2, 8);
    const itemsPerGroup = ctx.rng.nextInt(2, 6);
    const groupNouns = parseLabeledNoun(template.groupNoun);
    const itemNouns = parseLabeledNoun(template.itemNoun);
    const total = groups * itemsPerGroup;

    const prompt = `There are ${groups} ${groupNouns.plural} with ${itemsPerGroup} ${itemNouns.plural} in each ${groupNouns.singular}. What is the total?`;

    const parts: TryItAnswerPart[] = [
      {
        key: "groups",
        label: "How many groups?",
        correctAnswer: String(groups),
        choices: buildNumberChoices(groups, 2, 8, ctx.rng),
      },
      {
        key: "inEach",
        label: "How many in each group?",
        correctAnswer: String(itemsPerGroup),
        choices: buildNumberChoices(itemsPerGroup, 2, 6, ctx.rng),
      },
      {
        key: "equation",
        label: "Write the equation",
        correctAnswer: `${groups} × ${itemsPerGroup} = ${total}`,
        choices: buildMultiplicationEquationChoices(groups, itemsPerGroup, ctx.rng),
      },
    ];

    const successMessage = `Yes! ${groups} × ${itemsPerGroup} = ${total}.`;

    return {
      prompt,
      parts,
      visualData: { groups, itemsPerGroup },
      visualEmpty: false,
      groups,
      inEach: itemsPerGroup,
      successMessage,
    };
  });
}

function generateFactorProduct(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  const questionType = template.questionForm ?? "product";

  return buildMultiplicationProblem(ctx, template, `factor_${questionType}`, () => {
    const factorA = ctx.rng.nextInt(2, 9);
    let factorB = ctx.rng.nextInt(2, 9);

    if (questionType !== "word" && factorB === factorA) {
      let guard = 0;
      while (factorB === factorA && guard < 20) {
        factorB = ctx.rng.nextInt(2, 9);
        guard += 1;
      }
    }

    const product = factorA * factorB;

    let equationAnswer: string;
    let equationChoices: string[];

    if (questionType === "product") {
      equationAnswer = `Product: ${product}`;
      equationChoices = ctx.rng.shuffle([
        `Product: ${product}`,
        `Product: ${factorA}`,
        `Product: ${factorB}`,
      ]);
    } else if (questionType === "factors") {
      equationAnswer = `${factorA} and ${factorB}`;
      equationChoices = ctx.rng.shuffle([
        `${factorA} and ${factorB}`,
        `${factorA} and ${product}`,
        `${factorB} and ${product}`,
      ]);
    } else {
      equationAnswer = "product";
      equationChoices = ctx.rng.shuffle(["product", "factor", "group"]);
    }

    let prompt: string;
    let questionLabel: string;
    let successMessage: string;

    if (questionType === "product") {
      prompt = `Look at the equation ${factorA} × ${factorB} = ${product}. What is the product?`;
      questionLabel = "What is the product?";
      successMessage = `Yes! The product is ${product}.`;
    } else if (questionType === "factors") {
      prompt = `Look at the equation ${factorA} × ${factorB} = ${product}. What are the factors?`;
      questionLabel = "What are the factors?";
      successMessage = `Yes! ${factorA} and ${factorB} are the factors.`;
    } else {
      prompt = `Look at the equation ${factorA} × ${factorB} = ${product}. What is the answer called?`;
      questionLabel = "What is the answer called?";
      successMessage = "Yes! The answer to a multiplication equation is called the product.";
    }

    const uniqueNumeric = new Set([String(factorA), String(factorB), String(product)]);
    while (uniqueNumeric.size < 3) {
      uniqueNumeric.add(String(ctx.rng.nextInt(2, 81)));
    }
    const numericChoices = ctx.rng.shuffle([...uniqueNumeric].slice(0, 3));

    const parts: TryItAnswerPart[] = [
      {
        key: "groups",
        label: "First factor",
        correctAnswer: String(factorA),
        choices: numericChoices,
      },
      {
        key: "inEach",
        label: "Second factor",
        correctAnswer: String(factorB),
        choices: numericChoices,
      },
      {
        key: "equation",
        label: questionLabel,
        correctAnswer: equationAnswer,
        choices: equationChoices,
      },
    ];

    return {
      prompt,
      parts,
      visualData: { groups: factorA, itemsPerGroup: factorB },
      visualEmpty: false,
      groups: factorA,
      inEach: factorB,
      successMessage,
    };
  });
}

function generateGenericMultiplication(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  return buildMultiplicationProblem(ctx, template, "product", () => {
    const groups = ctx.rng.nextInt(2, 9);
    const inEach = ctx.rng.nextInt(2, 9);
    const total = groups * inEach;
    const groupNouns = parseLabeledNoun(template.groupNoun);
    const itemNouns = parseLabeledNoun(template.itemNoun);

    const prompt = `There are ${groups} ${groupNouns.plural} with ${inEach} ${itemNouns.plural} in each ${groupNouns.singular}. What is the total?`;

    const parts: TryItAnswerPart[] = [
      {
        key: "answer",
        label: "Total",
        correctAnswer: String(total),
        choices: buildNumberChoices(total, 0, 81, ctx.rng),
      },
    ];

    const successMessage = `Yes! ${groups} × ${inEach} = ${total}.`;

    return {
      prompt,
      parts,
      visualData: { groups, itemsPerGroup: inEach },
      visualEmpty: false,
      groups,
      inEach,
      successMessage,
    };
  });
}

function generateProblemForTemplate(
  ctx: TryItFamilyContext,
  template: MultiplicationTemplate,
): ResolvedTryItProblem {
  const form = inferQuestionForm(ctx.practiceType, template.questionForm);
  switch (form) {
    case "zero_identity":
      return generateZeroIdentity(ctx, template);
    case "repeated":
      return generateRepeatedAddition(ctx, template);
    case "objects":
      return generateEqualGroupsWithObjects(ctx, template);
    case "product":
    case "factors":
    case "word":
      return generateFactorProduct(ctx, template);
    default:
      return generateGenericMultiplication(ctx, template);
  }
}

const defaultTemplates: MultiplicationTemplate[] = [
  {
    id: "default-1",
    groupNoun: "groups",
    itemNoun: "1 item",
    visualEmoji: "⭐",
    tip: "Count the groups and the items in each group.",
    successMessage: "Nice work!",
  },
];

export const multiplicationFoundationsFamily: TryItFamily = (ctx: TryItFamilyContext) => {
  const templates = (ctx.templates ?? defaultTemplates).map(toMultiplicationTemplate);
  const problems: ResolvedTryItProblem[] = [];
  let attempts = 0;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;
    const template = templates[ctx.rng.nextInt(0, templates.length - 1)];
    const problem = generateProblemForTemplate(ctx, template);

    if (problem.problemKey && problems.some((p) => p.problemKey === problem.problemKey)) {
      continue;
    }

    problems.push(problem);
  }

  return problems;
};
