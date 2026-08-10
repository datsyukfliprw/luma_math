import type { TryItFamily, TryItAnswerPart } from "../types";
import {
  buildNumberChoices,
  makeSinglePartTryItProblem,
  makeTryItProblem,
  mathProblemKey,
} from "../buildTryItProblem";

const SHAPES = ["circle", "rectangle", "square", "pizza", "chocolate bar"];
const PARTITION_SHAPES = ["rectangle", "rectangular strip", "square"];
const PART_COUNTS = [2, 3, 4, 5, 6, 8];

const FRACTION_BAR_SHADED = "█";
const FRACTION_BAR_UNSHADED = "░";

const DENOMINATOR_NAMES: Record<number, string> = {
  2: "halves",
  3: "thirds",
  4: "fourths",
  5: "fifths",
  6: "sixths",
  8: "eighths",
};

const UNIT_TARGET_DENOMINATORS: Record<string, number[]> = {
  halves_thirds_fourths: [2, 3, 4],
  sixths_eighths: [6, 8],
  name_unit_fractions: [2, 3, 4, 5, 6, 8],
};

const UNIT_DISTRACTOR_DENOMINATORS: Record<string, number[]> = {
  halves_thirds_fourths: [2, 3, 4],
  sixths_eighths: [4, 6, 8],
  name_unit_fractions: [2, 3, 4, 5, 6, 8],
};

const STORY_CONTEXTS = [
  {
    whole: "tray of brownies",
    partSingular: "piece",
    partPlural: "pieces",
    verbSingular: "has",
    verbPlural: "have",
    feature: "icing",
    emoji: "🍫",
  },
  {
    whole: "pizza",
    partSingular: "slice",
    partPlural: "slices",
    verbSingular: "has",
    verbPlural: "have",
    feature: "pepperoni",
    emoji: "🍕",
  },
  {
    whole: "garden",
    partSingular: "section",
    partPlural: "sections",
    verbSingular: "has",
    verbPlural: "have",
    feature: "flowers",
    emoji: "🌻",
  },
  {
    whole: "poster",
    partSingular: "section",
    partPlural: "sections",
    verbSingular: "is",
    verbPlural: "are",
    feature: "painted blue",
    emoji: "🎨",
  },
  {
    whole: "loaf of bread",
    partSingular: "slice",
    partPlural: "slices",
    verbSingular: "is",
    verbPlural: "are",
    feature: "toasted",
    emoji: "🍞",
  },
  {
    whole: "cake",
    partSingular: "piece",
    partPlural: "pieces",
    verbSingular: "has",
    verbPlural: "have",
    feature: "frosting",
    emoji: "🎂",
  },
];

function allowedDenominator(
  practiceType: string,
  rng: { pick<T>(items: readonly T[]): T },
): number {
  const targetSet = UNIT_TARGET_DENOMINATORS[practiceType];
  if (targetSet) {
    return rng.pick(targetSet);
  }
  return rng.pick(PART_COUNTS);
}

function unitFractionChoices(
  denominator: number,
  pool: number[],
  rng: { pick<T>(items: readonly T[]): T; shuffle<T>(items: readonly T[]): T[] },
): string[] {
  const correct = `1/${denominator}`;
  const others = pool.filter((d) => d !== denominator).map((d) => `1/${d}`);
  const distractors = rng.shuffle(others).slice(0, 2);
  return rng.shuffle([...new Set([correct, ...distractors])]);
}

function fractionValue(fraction: string): number {
  const [n, d] = fraction.split("/").map(Number);
  return n / d;
}

function isEquivalentFraction(a: string, b: string): boolean {
  return fractionValue(a) === fractionValue(b);
}

function fractionChoices(
  numerator: number,
  denominator: number,
  rng: {
    nextInt(min: number, max: number): number;
    pick<T>(items: readonly T[]): T;
    shuffle<T>(items: readonly T[]): T[];
  },
): string[] {
  const correct = `${numerator}/${denominator}`;
  const pool = new Set<string>();

  const candidates = [
    ...(numerator > 1 ? [`1/${denominator}`] : []),
    ...(numerator + 1 < denominator ? [`${numerator + 1}/${denominator}`] : []),
    ...(numerator - 1 > 0 ? [`${numerator - 1}/${denominator}`] : []),
  ];

  const otherDenominators = [2, 3, 4, 5, 6, 8].filter((d) => d !== denominator);
  for (const d of otherDenominators) {
    for (let n = 1; n < d; n += 1) {
      candidates.push(`${n}/${d}`);
    }
  }

  for (const candidate of candidates) {
    if (candidate !== correct && !isEquivalentFraction(candidate, correct)) {
      pool.add(candidate);
    }
  }

  let guard = 0;
  while (pool.size < 2 && guard < 100) {
    guard += 1;
    const d = rng.nextInt(2, 8);
    const n = rng.nextInt(1, d - 1);
    const candidate = `${n}/${d}`;
    if (candidate !== correct && !isEquivalentFraction(candidate, correct)) {
      pool.add(candidate);
    }
  }

  const distractors = rng.shuffle([...pool]).slice(0, 2);
  return rng.shuffle([...new Set([correct, ...distractors])]);
}

function generateSectionWidths(
  parts: number,
  equal: boolean,
  rng: { nextInt(min: number, max: number): number },
): number[] {
  if (equal) {
    const base = rng.nextInt(2, 5);
    return Array.from({ length: parts }, () => base);
  }
  for (let guard = 0; guard < 100; guard += 1) {
    const widths = Array.from({ length: parts }, () => rng.nextInt(1, 4));
    if (new Set(widths).size > 1) return widths;
  }
  return Array.from({ length: parts }, (_, i) => (i === 0 ? 1 : 2));
}

function fractionBarVisual(numerator: number, denominator: number, start: number): string {
  const symbols = Array.from({ length: denominator }, (_, i) =>
    i >= start && i < start + numerator ? FRACTION_BAR_SHADED : FRACTION_BAR_UNSHADED,
  );
  return `[${symbols.join(" ")}]`;
}

export const fractionsFoundationsFamily: TryItFamily = (ctx) => {
  const problems: ReturnType<TryItFamily> = [];
  let attempts = 0;
  let equalGenerated = false;
  let unequalGenerated = false;

  while (problems.length < ctx.count && attempts < 200) {
    attempts += 1;

    const denominator = allowedDenominator(ctx.practiceType, ctx.rng);
    const numerator = ctx.rng.nextInt(1, denominator - 1);
    const shape = ctx.rng.pick(SHAPES);

    let prompt: string;
    let correct = "";
    let choices: string[] | undefined;
    let form: string;
    let keyExtra: string;
    let key = "";
    let visualEmoji = "🍕";
    let problemParts: TryItAnswerPart[] | undefined;

    if (ctx.practiceType === "equal_unequal_parts") {
      const parts = denominator;
      let isEqual: boolean;
      if (!equalGenerated && !unequalGenerated) {
        isEqual = ctx.rng.pick([true, false]);
      } else if (!equalGenerated) {
        isEqual = true;
      } else if (!unequalGenerated) {
        isEqual = false;
      } else {
        isEqual = ctx.rng.pick([true, false]);
      }

      const widths = generateSectionWidths(parts, isEqual, ctx.rng);
      const total = widths.reduce((sum, w) => sum + w, 0);
      prompt = `A rectangular strip is ${total} units long and is divided into ${parts} sections. The section widths are: ${widths.join(", ")} units. Which word describes the sections?`;
      correct = isEqual ? "Equal" : "Unequal";
      form = isEqual ? "equal" : "unequal";
      keyExtra = `w:${widths.join(",")}`;
      choices = ctx.rng.shuffle(["Equal", "Unequal"]);
      visualEmoji = "✂️";
      key = mathProblemKey(ctx.practiceType, parts, 1, form, keyExtra);

      if (isEqual) {
        equalGenerated = true;
      } else {
        unequalGenerated = true;
      }
    } else if (
      ctx.practiceType === "halves_thirds_fourths" ||
      ctx.practiceType === "sixths_eighths"
    ) {
      const unitDenominator = denominator;
      const name = DENOMINATOR_NAMES[unitDenominator] ?? `${unitDenominator} equal parts`;
      const partitionShape = ctx.rng.pick(PARTITION_SHAPES);
      const distractorPool = UNIT_DISTRACTOR_DENOMINATORS[ctx.practiceType] ?? PART_COUNTS;

      prompt = `You want to partition a ${partitionShape} into ${name}.`;
      form = "partition";
      keyExtra = partitionShape;
      visualEmoji = "✂️";
      key = mathProblemKey(ctx.practiceType, unitDenominator, 1, form, keyExtra);

      const countChoices = buildNumberChoices(unitDenominator, 2, 8, ctx.rng, 3);
      const fractionChoicesArr = unitFractionChoices(unitDenominator, distractorPool, ctx.rng);

      problemParts = [
        {
          key: "count",
          label: "How many equal parts should you make?",
          correctAnswer: String(unitDenominator),
          choices: countChoices,
        },
        {
          key: "fraction",
          label: "What fraction is one part?",
          correctAnswer: `1/${unitDenominator}`,
          choices: fractionChoicesArr,
        },
      ];
    } else if (ctx.practiceType === "name_unit_fractions") {
      const unitDenominator = denominator;
      prompt = `A ${shape} is divided into ${unitDenominator} equal parts. What is the unit fraction for one part?`;
      correct = `1/${unitDenominator}`;
      form = "unit";
      keyExtra = shape;
      choices = unitFractionChoices(
        unitDenominator,
        UNIT_DISTRACTOR_DENOMINATORS[ctx.practiceType] ?? PART_COUNTS,
        ctx.rng,
      );
      key = mathProblemKey(ctx.practiceType, 1, unitDenominator, form, keyExtra);
    } else if (ctx.practiceType === "numerator_meaning") {
      prompt = `A ${shape} is divided into ${denominator} equal parts. ${numerator} ${numerator === 1 ? "part is" : "parts are"} shaded. What is the numerator?`;
      correct = String(numerator);
      form = "numerator";
      keyExtra = shape;
      choices = buildNumberChoices(numerator, 1, Math.max(2, denominator), ctx.rng, 3);
    } else if (ctx.practiceType === "denominator_meaning") {
      prompt = `A ${shape} is divided into ${denominator} equal parts. ${numerator} ${numerator === 1 ? "part is" : "parts are"} shaded. What is the denominator?`;
      correct = String(denominator);
      form = "denominator";
      keyExtra = shape;
      choices = buildNumberChoices(denominator, 2, 8, ctx.rng, 3);
    } else if (ctx.practiceType === "fraction_bars") {
      const start = ctx.rng.nextInt(0, denominator - numerator);
      const visual = fractionBarVisual(numerator, denominator, start);
      prompt = `A fraction bar is divided into ${denominator} equal sections. ${numerator} ${numerator === 1 ? "section is" : "sections are"} shaded. ${visual} What fraction of the bar is shaded?`;
      correct = `${numerator}/${denominator}`;
      form = "bar";
      keyExtra = String(start);
      visualEmoji = "📊";
      choices = fractionChoices(numerator, denominator, ctx.rng);
      key = mathProblemKey(ctx.practiceType, numerator, denominator, form, keyExtra);
    } else if (ctx.practiceType === "area_models_and_stories") {
      const useStory = ctx.rng.nextInt(0, 1) === 1;

      if (useStory) {
        const story = ctx.rng.pick(STORY_CONTEXTS);
        const partWord = numerator === 1 ? story.partSingular : story.partPlural;
        const verb = numerator === 1 ? story.verbSingular : story.verbPlural;

        prompt = `A ${story.whole} is divided into ${denominator} equal ${story.partPlural}. ${numerator} ${partWord} ${verb} ${story.feature}. What fraction of the ${story.whole} ${story.verbSingular} ${story.feature}?`;
        correct = `${numerator}/${denominator}`;
        form = "story";
        keyExtra = story.whole;
        visualEmoji = story.emoji;
      } else {
        prompt = `A ${shape} is divided into ${denominator} equal parts. ${numerator} ${numerator === 1 ? "part is" : "parts are"} shaded. What fraction is shaded?`;
        correct = `${numerator}/${denominator}`;
        form = "area";
        keyExtra = shape;
        visualEmoji = "🔲";
      }

      choices = fractionChoices(numerator, denominator, ctx.rng);
    } else {
      prompt = `A ${shape} is divided into ${denominator} equal parts. ${numerator} ${numerator === 1 ? "part is" : "parts are"} shaded. What fraction is shaded?`;
      correct = `${numerator}/${denominator}`;
      form = "name";
      keyExtra = shape;
      choices = fractionChoices(numerator, denominator, ctx.rng);
    }

    const problemKey =
      key || mathProblemKey(ctx.practiceType, numerator, denominator, form, keyExtra);
    if (ctx.usedKeys.has(problemKey)) continue;
    ctx.usedKeys.add(problemKey);

    const successMessage =
      form === "partition"
        ? `Yes! You make ${problemParts![0].correctAnswer} equal parts, and one part is 1/${denominator}.`
        : form === "numerator"
          ? `Yes! The numerator is ${correct}.`
          : form === "denominator"
            ? `Yes! The denominator is ${correct}.`
            : form === "equal" || form === "unequal"
              ? `Yes! The parts are ${correct}.`
              : `Yes! The fraction is ${correct}.`;

    const id = `${ctx.lessonId}-fractions-${problems.length + 1}`;

    if (problemParts) {
      problems.push(
        makeTryItProblem({
          id,
          problemKey,
          prompt,
          tip: ctx.lesson.objective,
          successMessage,
          visualEmoji,
          parts: problemParts,
        }),
      );
    } else {
      problems.push(
        makeSinglePartTryItProblem({
          id,
          problemKey,
          prompt,
          correctAnswer: correct,
          tip: ctx.lesson.objective,
          successMessage,
          visualEmoji,
          choices,
        }),
      );
    }
  }

  return problems;
};
