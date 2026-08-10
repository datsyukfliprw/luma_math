import { describe, it, expect } from "vitest";
import { getResolvedTryItExperience } from "../tryItResolver";
import { getAllCurricula } from "../../data/curriculum";
import { getFamilyForPracticeType } from "./families";
import {
  matchesGeometryPrompt,
  SHAPE_DEFINITIONS,
  isASubset,
  mostSpecificGuaranteed,
} from "./families/geometryAttributes";

function findLessonId(practiceType: string): string | undefined {
  for (const unit of getAllCurricula()) {
    for (const week of unit.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.practice_type === practiceType && lesson.lesson_type === "lesson") {
          return `g3-u${unit.unit_number}-w${week.week_number}-l${lesson.day_number}`;
        }
      }
    }
  }
  return undefined;
}

function resolve(practiceType: string) {
  const lessonId = findLessonId(practiceType);
  if (!lessonId) throw new Error(`No lesson for practice type ${practiceType}`);
  return {
    lessonId,
    experience: getResolvedTryItExperience(lessonId, { attemptKey: "semantic" })!,
  };
}

function parsePair(pair: string): { a: number; b: number } | undefined {
  const match = pair.match(/(\d+)\s*×\s*(\d+)/);
  if (!match) return undefined;
  return { a: Number(match[1]), b: Number(match[2]) };
}

function isFactFamilyEquation(a: number, b: number, product: number, equation: string): boolean {
  const mulMatch = equation.match(/^(\d+) × (\d+) = (\d+)$/);
  if (mulMatch) {
    const x = Number(mulMatch[1]);
    const y = Number(mulMatch[2]);
    const z = Number(mulMatch[3]);
    return x * y === z && z === product && ((x === a && y === b) || (x === b && y === a));
  }

  const divMatch = equation.match(/^(\d+) ÷ (\d+) = (\d+)$/);
  if (divMatch) {
    const x = Number(divMatch[1]);
    const y = Number(divMatch[2]);
    const z = Number(divMatch[3]);
    return (
      y !== 0 && y * z === x && x === product && ((y === a && z === b) || (y === b && z === a))
    );
  }

  return false;
}

describe("Try It semantic correctness", () => {
  it("routes every non-evaluation practice type to a non-generic family", () => {
    const seen = new Set<string>();
    const failures: string[] = [];
    for (const unit of getAllCurricula()) {
      for (const week of unit.weeks) {
        for (const lesson of week.lessons) {
          if (lesson.lesson_type !== "lesson") continue;
          if (seen.has(lesson.practice_type)) continue;
          seen.add(lesson.practice_type);
          const family = getFamilyForPracticeType(lesson.practice_type);
          if (family === "generic") {
            failures.push(
              `${lesson.practice_type} (${unit.unit_number}-${week.week_number}-${lesson.day_number})`,
            );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it("produces repeated-addition problems for Unit 1 Lesson 2", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l2", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      expect(problem.prompt).toMatch(/\d+ \+ /);
      expect(problem.parts.length).toBeGreaterThanOrEqual(3);
      const equationPart = problem.parts.find((p) => p.key === "equation");
      expect(equationPart).toBeDefined();
    }
  });

  it("produces equal-groups-with-objects problems for Unit 1 Lesson 4", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l4", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      expect(problem.prompt).toMatch(/There are \d+ .* with \d+ .* in each/);
      expect(problem.parts.find((p) => p.key === "groups")).toBeDefined();
      expect(problem.parts.find((p) => p.key === "inEach")).toBeDefined();
    }
  });

  it("matches factor/product question wording to the correct answer type", () => {
    const exp = getResolvedTryItExperience("g3-u1-w1-l3", { attemptKey: "semantic" });
    expect(exp).toBeDefined();
    for (const problem of exp!.problems) {
      if (problem.prompt.includes("product")) {
        expect(problem.parts.at(-1)!.correctAnswer).toMatch(/^Product: \d+$/);
      } else if (problem.prompt.includes("factors")) {
        expect(problem.parts.at(-1)!.correctAnswer).toMatch(/^\d+ and \d+$/);
      } else if (problem.prompt.includes("answer called")) {
        expect(problem.parts.at(-1)!.correctAnswer).toBe("product");
      }
    }
  });

  it("generates mathematically valid division with 1 and 0", () => {
    const { experience } = resolve("division_with_1_and_0");
    for (const problem of experience.problems) {
      const match = problem.prompt.match(/^(\d+) ÷ (\d+) = \?$/);
      expect(match).toBeTruthy();
      const dividend = Number(match![1]);
      const divisor = Number(match![2]);
      const correct = problem.parts[0].correctAnswer;

      if (divisor === 0) {
        expect(correct).toBe("undefined");
      } else if (divisor === 1) {
        expect(correct).toBe(String(dividend));
      } else if (dividend === 0) {
        expect(correct).toBe("0");
      } else if (dividend === divisor) {
        expect(correct).toBe("1");
      }
    }
  });

  it("never asks to take away more than the starting quantity", () => {
    const { experience } = resolve("one_step_word_problems");
    for (const problem of experience.problems) {
      if (problem.prompt.includes("taken away")) {
        const startMatch = problem.prompt.match(/There are (\d+)/);
        const awayMatch = problem.prompt.match(/(\d+) are taken away/);
        expect(startMatch).toBeTruthy();
        expect(awayMatch).toBeTruthy();
        expect(Number(awayMatch![1])).toBeLessThanOrEqual(Number(startMatch![1]));
      }
    }
  });

  it("honors same-area and same-perimeter alternate-rectangle constraints", () => {
    const areaLesson =
      findLessonId("same_area_different_perimeter") ??
      findLessonId("different_arrangements_same_area");
    if (areaLesson) {
      const exp = getResolvedTryItExperience(areaLesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const original = problem.prompt.match(/length (\d+) and width (\d+)/);
        expect(original).toBeTruthy();
        const oLen = Number(original![1]);
        const oWid = Number(original![2]);
        const correct = problem.parts[0].correctAnswer;
        const alt = parsePair(correct);
        expect(alt).toBeDefined();
        expect(alt!.a * alt!.b).toBe(oLen * oWid);
      }
    }

    const perimeterLesson = findLessonId("same_perimeter_different_area");
    if (perimeterLesson) {
      const exp = getResolvedTryItExperience(perimeterLesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const original = problem.prompt.match(/length (\d+) and width (\d+)/);
        expect(original).toBeTruthy();
        const oLen = Number(original![1]);
        const oWid = Number(original![2]);
        const correct = problem.parts[0].correctAnswer;
        const alt = parsePair(correct);
        expect(alt).toBeDefined();
        expect(alt!.a + alt!.b).toBe(oLen + oWid);
      }
    }
  });

  it("enforces like-denominator and like-numerator constraints", () => {
    const likeDenom =
      findLessonId("compare_like_denominators_models") ??
      findLessonId("compare_like_denominators_number_line");
    if (likeDenom) {
      const exp = getResolvedTryItExperience(likeDenom, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const fracs = problem.prompt.match(/\d+\/\d+/g) ?? [];
        expect(fracs.length).toBeGreaterThanOrEqual(2);
        const dens = fracs.map((f) => Number(f.split("/")[1]));
        expect(new Set(dens).size).toBe(1);
      }
    }

    const likeNum =
      findLessonId("compare_like_numerators_models") ??
      findLessonId("compare_like_numerators_number_line");
    if (likeNum) {
      const exp = getResolvedTryItExperience(likeNum, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        const fracs = problem.prompt.match(/\d+\/\d+/g) ?? [];
        expect(fracs.length).toBeGreaterThanOrEqual(2);
        const nums = fracs.map((f) => Number(f.split("/")[0]));
        expect(new Set(nums).size).toBe(1);
      }
    }
  });

  it("keeps number-line and interval fractions between 0 and 1", () => {
    const types = [
      "zero_to_one_interval",
      "partition_number_lines",
      "locate_unit_fractions_number_line",
    ];
    for (const type of types) {
      const lesson = findLessonId(type);
      if (!lesson) continue;
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        for (const frac of problem.prompt.match(/\d+\/\d+/g) ?? []) {
          const [n, d] = frac.split("/").map(Number);
          expect(n).toBeLessThan(d);
        }
        for (const choice of problem.parts[0].choices ?? []) {
          const match = choice.match(/\d+\/\d+/);
          if (match) {
            const [n, d] = match[0].split("/").map(Number);
            expect(n).toBeLessThanOrEqual(d);
          }
        }
      }
    }
  });

  it("includes graph data in the prompt", () => {
    const lesson = findLessonId("read_picture_graphs") ?? findLessonId("read_bar_graphs");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        expect(problem.prompt).toMatch(/red: \d+/);
      }
    }
  });

  it("describes clock hand positions in the prompt", () => {
    const lesson = findLessonId("read_analog_clocks");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      for (const problem of exp!.problems) {
        expect(problem.prompt).toMatch(/hour hand.*pointing/);
        expect(problem.prompt).toMatch(/minute hand.*pointing/);
      }
    }
  });

  it("uses a logically appropriate unit for weight/mass/volume measurement", () => {
    const lesson = findLessonId("choose_weight_mass_volume_units");
    if (lesson) {
      const exp = getResolvedTryItExperience(lesson, { attemptKey: "semantic" });
      expect(exp).toBeDefined();
      const VOLUME_UNITS = ["cups", "pints", "quarts", "gallons", "liters", "milliliters"];
      const WEIGHT_OR_MASS_UNITS = ["ounces", "pounds", "grams", "kilograms"];
      for (const problem of exp!.problems) {
        const correct = problem.parts[0].correctAnswer;
        const match = problem.prompt.match(/measure the (weight|mass|liquid volume) of/i);
        expect(match).toBeTruthy();
        const quantity = match![1].toLowerCase();
        if (quantity === "liquid volume") {
          expect(VOLUME_UNITS).toContain(correct);
        } else {
          expect(WEIGHT_OR_MASS_UNITS).toContain(correct);
        }
      }
    }
  });

  it("problemKey changes when canonical math changes", () => {
    const { experience: a } = resolve("equations_with_unknowns");
    const { experience: b } = resolve("equations_with_unknowns");
    // Two attempts should produce different problems with different canonical keys.
    const keysA = new Set(a.problems.map((p) => p.problemKey));
    const keysB = new Set(b.problems.map((p) => p.problemKey));
    // We specifically use different attemptKey to get variation; for the same lesson
    // we run twice with the same attemptKey in the helper, so the keys should be equal.
    expect(keysA).toEqual(keysB);

    const different = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "pk-a" });
    const different2 = getResolvedTryItExperience("g3-u1-w1-l1", { attemptKey: "pk-b" });
    const shared = different!.problems[0].problemKey;
    const shared2 = different2!.problems[0].problemKey;
    expect(shared).not.toBe(shared2);
  });

  it("produces the intended question form for each multiplication-foundation practice type", () => {
    const cases: {
      practiceType: string;
      check: (problem: ReturnType<typeof resolve>["experience"]["problems"][number]) => void;
    }[] = [
      {
        practiceType: "count_equal_groups",
        check: (problem) => {
          expect(problem.prompt).toMatch(/Skip count/);
          expect(problem.prompt).toMatch(/\d+ \+ /);
          const totalPart = problem.parts.find((p) => p.key === "answer");
          expect(totalPart).toBeDefined();
          expect(Number(totalPart!.correctAnswer)).toBe(
            problem.visualData!.groups * problem.visualData!.itemsPerGroup,
          );
        },
      },
      {
        practiceType: "factors_and_products",
        check: (problem) => {
          expect(problem.prompt).toMatch(/factors.*product/);
          expect(problem.parts.some((p) => p.label === "First factor")).toBe(true);
          expect(problem.parts.some((p) => p.label === "Second factor")).toBe(true);
          expect(problem.parts.some((p) => p.label === "Product")).toBe(true);
        },
      },
      {
        practiceType: "draw_multiplication",
        check: (problem) => {
          expect(problem.prompt).toMatch(/Which equation matches/);
          const answer = problem.parts[0].correctAnswer;
          expect(answer).toMatch(/^\d+ × \d+ = \d+$/);
        },
      },
      {
        practiceType: "build_arrays",
        check: (problem) => {
          expect(problem.prompt).toMatch(/Build an array/);
          expect(problem.prompt).toMatch(/rows, columns, and items/);
          expect(problem.parts.some((p) => p.label === "Rows")).toBe(true);
          expect(problem.parts.some((p) => p.label === "Columns")).toBe(true);
        },
      },
      {
        practiceType: "two_equations_for_array",
        check: (problem) => {
          expect(problem.prompt).toMatch(/Which pair of equations/);
          expect(problem.parts[0].correctAnswer).toMatch(/ and /);
          const equations = problem.parts[0].correctAnswer.match(/\d+ × \d+ = \d+/g) ?? [];
          expect(equations.length).toBe(2);
        },
      },
      {
        practiceType: "multiplication_number_line",
        check: (problem) => {
          expect(problem.prompt).toMatch(/number line/);
          expect(problem.prompt).toMatch(/jumps/);
          const equation = problem.parts.find((p) => p.key === "equation");
          expect(equation).toBeDefined();
          expect(equation!.correctAnswer).toMatch(/^\d+ × \d+ = \d+$/);
        },
      },
      {
        practiceType: "connect_models_equations_stories",
        check: (problem) => {
          expect(problem.prompt).toMatch(/Which story matches the equation/);
          const correct = problem.parts[0].correctAnswer;
          const groups = problem.visualData!.groups;
          const inEach = problem.visualData!.itemsPerGroup;
          expect(correct).toContain(String(groups));
          expect(correct).toContain(String(inEach));
        },
      },
    ];

    for (const { practiceType, check } of cases) {
      const { experience } = resolve(practiceType);
      expect(experience.problems.length).toBeGreaterThan(0);
      for (const problem of experience.problems) {
        check(problem);
      }
    }
  });

  it("keeps canonical values synchronized across multiplication-foundation prompts, choices, and model data", () => {
    const types = [
      "count_equal_groups",
      "factors_and_products",
      "draw_multiplication",
      "build_arrays",
      "two_equations_for_array",
      "multiplication_number_line",
      "connect_models_equations_stories",
    ];

    for (const practiceType of types) {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const { groups, itemsPerGroup } = problem.visualData!;
        const product = groups * itemsPerGroup;

        const groupsPart = problem.parts.find((p) => p.key === "groups");
        const inEachPart = problem.parts.find((p) => p.key === "inEach");
        if (groupsPart) expect(Number(groupsPart.correctAnswer)).toBe(groups);
        if (inEachPart) expect(Number(inEachPart.correctAnswer)).toBe(itemsPerGroup);

        const equationPart = problem.parts.find((p) => p.correctAnswer.match(/^\d+ × \d+ = \d+$/));
        if (equationPart) {
          const eqMatch = equationPart.correctAnswer.match(/^(\d+) × (\d+) = (\d+)$/);
          expect(eqMatch).toBeTruthy();
          expect(Number(eqMatch![1]) * Number(eqMatch![2])).toBe(Number(eqMatch![3]));
          expect(Number(eqMatch![3])).toBe(product);
        }
      }
    }
  });

  it("covers division by zero in division_with_1_and_0", () => {
    const { experience } = resolve("division_with_1_and_0");
    const hasDivideByZero = experience.problems.some((p) => {
      const match = p.prompt.match(/^\d+ ÷ (\d+) = \?$/);
      return match && Number(match[1]) === 0 && p.parts[0].correctAnswer === "undefined";
    });
    expect(hasDivideByZero).toBe(true);
  });

  it("produces actual division-equation tasks for write_division_equations", () => {
    const { experience } = resolve("write_division_equations");
    expect(experience.problems.length).toBeGreaterThan(0);
    for (const problem of experience.problems) {
      expect(problem.prompt).toMatch(/Write the division equation/);
      const correct = problem.parts[0].correctAnswer;
      const eqMatch = correct.match(/^(\d+) ÷ (\d+) = (\d+)$/);
      expect(eqMatch).toBeTruthy();
      const total = Number(eqMatch![1]);
      const divisor = Number(eqMatch![2]);
      const quotient = Number(eqMatch![3]);
      expect(divisor).toBeGreaterThan(0);
      expect(total).toBe(divisor * quotient);
    }
  });

  it("never generates a mathematically invalid division equation", () => {
    const { experience } = resolve("write_division_equations");
    for (const problem of experience.problems) {
      const correct = problem.parts[0].correctAnswer;
      const eqMatch = correct.match(/^(\d+) ÷ (\d+) = (\d+)$/);
      expect(eqMatch).toBeTruthy();
      const total = Number(eqMatch![1]);
      const divisor = Number(eqMatch![2]);
      const quotient = Number(eqMatch![3]);
      expect(divisor).toBeGreaterThan(0);
      expect(total).toBe(divisor * quotient);
    }
  });

  it("fact_families multiple-choice has exactly one equation from the same fact family", () => {
    const { experience } = resolve("fact_families");
    expect(experience.problems.length).toBeGreaterThan(0);
    for (const problem of experience.problems) {
      const reference = problem.prompt.match(/(\d+) × (\d+) = (\d+)/);
      expect(reference).toBeTruthy();
      const a = Number(reference![1]);
      const b = Number(reference![2]);
      const product = Number(reference![3]);
      const choices = problem.parts[0].choices ?? [];
      const familyCount = choices.filter((choice) =>
        isFactFamilyEquation(a, b, product, choice),
      ).length;
      expect(familyCount).toBe(1);
      expect(isFactFamilyEquation(a, b, product, problem.parts[0].correctAnswer)).toBe(true);
    }
  });

  it("geometry multiple-choice questions have exactly one intended semantic answer", () => {
    const types = [
      "parallel_sides_quadrilaterals",
      "parallelograms_trapezoids",
      "classify_squares_rectangles_rhombuses",
    ];
    for (const practiceType of types) {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const correctCount = problem.parts[0].choices!.filter((choice) =>
          matchesGeometryPrompt(choice, problem.prompt),
        ).length;
        expect(correctCount).toBe(1);
        expect(matchesGeometryPrompt(problem.parts[0].correctAnswer, problem.prompt)).toBe(true);
      }
    }
  });

  it("understands Unit 33 inclusive quadrilateral hierarchy", () => {
    const square = SHAPE_DEFINITIONS.find((s) => s.name === "Square")!;
    const rectangle = SHAPE_DEFINITIONS.find((s) => s.name === "Rectangle")!;
    const rhombus = SHAPE_DEFINITIONS.find((s) => s.name === "Rhombus")!;
    const parallelogram = SHAPE_DEFINITIONS.find((s) => s.name === "Parallelogram")!;
    const trapezoid = SHAPE_DEFINITIONS.find((s) => s.name === "Trapezoid")!;

    // Square is a special rectangle and rhombus.
    expect(isASubset(square, rectangle)).toBe(true);
    expect(isASubset(square, rhombus)).toBe(true);
    expect(isASubset(square, parallelogram)).toBe(true);
    expect(isASubset(square, trapezoid)).toBe(true);

    // Rectangle and rhombus are parallelograms.
    expect(isASubset(rectangle, parallelogram)).toBe(true);
    expect(isASubset(rhombus, parallelogram)).toBe(true);

    // The curriculum uses the inclusive trapezoid definition: at least one pair.
    // So every parallelogram is also a trapezoid.
    expect(isASubset(parallelogram, trapezoid)).toBe(true);

    // mostSpecificGuaranteed returns the most specific name the constraints force.
    expect(
      mostSpecificGuaranteed({ sides: 4, parallelPairs: 2, equalSides: true, rightAngles: true }),
    ).toBe("Square");
    expect(
      mostSpecificGuaranteed({ sides: 4, parallelPairs: 2, rightAngles: true, equalSides: false }),
    ).toBe("Rectangle");
    expect(
      mostSpecificGuaranteed({ sides: 4, parallelPairs: 2, equalSides: true, rightAngles: false }),
    ).toBe("Rhombus");
    expect(
      mostSpecificGuaranteed({ sides: 4, parallelPairs: 2, equalSides: false, rightAngles: false }),
    ).toBe("Parallelogram");
    expect(mostSpecificGuaranteed({ sides: 4, parallelPairs: 2 })).toBe("Parallelogram");
    expect(mostSpecificGuaranteed({ sides: 4, parallelPairs: 1 })).toBe("Trapezoid");
  });

  it("geometry problemKey depends only on canonical attributes, not prompt or choice order", () => {
    const types = [
      "sides_and_vertices",
      "parallel_sides_quadrilaterals",
      "classify_squares_rectangles_rhombuses",
      "parallelograms_trapezoids",
    ];

    for (const practiceType of types) {
      const { experience } = resolve(practiceType);
      for (const problem of experience.problems) {
        const key = problem.problemKey ?? "";
        const promptLower = problem.prompt.toLowerCase();
        expect(key).toMatch(new RegExp(`^${practiceType}\\|`));
        expect(key).not.toContain(problem.prompt);
        for (const choice of problem.parts[0].choices ?? []) {
          if (choice !== problem.parts[0].correctAnswer) {
            expect(key).not.toContain(choice);
          }
        }
        if (practiceType === "sides_and_vertices") {
          expect(key).toMatch(/sides=\d+/);
        } else {
          expect(key).toMatch(/target=/);
          expect(key).toMatch(/form=/);
        }
        // False/exclusive attributes must be explicitly stated in the prompt.
        if (key.includes("equalSides=false")) {
          expect(promptLower).toMatch(/not four equal sides|no equal sides/);
        }
        if (key.includes("rightAngles=false")) {
          expect(promptLower).toMatch(/not four right angles|no right angles/);
        }
        if (key.includes("parallelPairs=1")) {
          expect(promptLower).toMatch(/exactly one pair|one pair of parallel sides/);
        }
        // True attributes must be implied by the prompt's named category or explicit wording.
        if (key.includes("equalSides=true")) {
          expect(promptLower).toMatch(/four equal sides|rhombus|square/);
        }
        if (key.includes("rightAngles=true")) {
          expect(promptLower).toMatch(/four right angles|rectangle|square/);
        }
        if (key.includes("parallelPairs=at-least-1")) {
          expect(promptLower).toMatch(/at least one pair|at least how many/);
        }
      }
    }
  });

  it("geometry problemKeys are deterministic for the same canonical attributes and attemptKey", () => {
    const types = [
      "sides_and_vertices",
      "parallel_sides_quadrilaterals",
      "classify_squares_rectangles_rhombuses",
      "parallelograms_trapezoids",
    ];

    for (const practiceType of types) {
      const { experience: a } = resolve(practiceType);
      const { experience: b } = resolve(practiceType);
      const keyA = a.problems.map((p) => p.problemKey).join("\n");
      const keyB = b.problems.map((p) => p.problemKey).join("\n");
      expect(keyA).toBe(keyB);
    }
  });

  it("keeps the same attemptKey deterministic for the affected semantic types", () => {
    const types = [
      "count_equal_groups",
      "factors_and_products",
      "draw_multiplication",
      "build_arrays",
      "two_equations_for_array",
      "multiplication_number_line",
      "connect_models_equations_stories",
      "division_with_1_and_0",
      "write_division_equations",
      "parallel_sides_quadrilaterals",
      "parallelograms_trapezoids",
    ];

    for (const practiceType of types) {
      const lessonId = findLessonId(practiceType);
      if (!lessonId) continue;
      const a = getResolvedTryItExperience(lessonId, { attemptKey: "det-a" });
      const b = getResolvedTryItExperience(lessonId, { attemptKey: "det-a" });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("matchesGeometryPrompt respects the Unit 33 scoped square-name question", () => {
    const prompt = "Among square, rectangle, and rhombus, which names can describe a square?";
    expect(matchesGeometryPrompt("A square, a rectangle, and a rhombus", prompt)).toBe(true);
    expect(matchesGeometryPrompt("A square only", prompt)).toBe(false);
    expect(matchesGeometryPrompt("A rectangle and a rhombus only", prompt)).toBe(false);
    expect(
      matchesGeometryPrompt("A square, a rectangle, a rhombus, and a parallelogram", prompt),
    ).toBe(false);
    expect(matchesGeometryPrompt("A square, a rectangle, a rhombus, and a trapezoid", prompt)).toBe(
      false,
    );
  });

  it("emits the Unit 33 scoped square-name prompt for classify_squares_rectangles_rhombuses", () => {
    const lessonId = findLessonId("classify_squares_rectangles_rhombuses");
    expect(lessonId).toBeDefined();
    let found = false;
    for (let i = 0; i < 30 && !found; i++) {
      const experience = getResolvedTryItExperience(lessonId!, { attemptKey: `scope-${i}` });
      expect(experience).toBeDefined();
      for (const problem of experience!.problems) {
        if (problem.prompt.toLowerCase().startsWith("among square, rectangle, and rhombus")) {
          found = true;
          expect(problem.parts[0].correctAnswer).toBe("A square, a rectangle, and a rhombus");
          const correctCount = problem.parts[0].choices!.filter((c) =>
            matchesGeometryPrompt(c, problem.prompt),
          ).length;
          expect(correctCount).toBe(1);
          expect(matchesGeometryPrompt(problem.parts[0].correctAnswer, problem.prompt)).toBe(true);
          break;
        }
      }
    }
    expect(found).toBe(true);
  });

  it("has no duplicate geometry problemKeys within a single attempt", () => {
    const types = [
      "sides_and_vertices",
      "parallel_sides_quadrilaterals",
      "classify_squares_rectangles_rhombuses",
      "parallelograms_trapezoids",
    ];

    for (const practiceType of types) {
      const { experience } = resolve(practiceType);
      const keys = experience.problems.map((p) => p.problemKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});

describe("Unit 8 word-problem family", () => {
  const unit8Types = [
    "choose_operation",
    "estimate_then_solve",
    "one_step_word_problems",
    "two_step_unknowns",
  ];

  function roundToTen(n: number): number {
    return Math.round(n / 10) * 10;
  }

  function allAttemptsFor(practiceType: string, count = 6) {
    const lessonId = findLessonId(practiceType);
    if (!lessonId) throw new Error(`No lesson for ${practiceType}`);
    const experiences = [];
    for (let i = 0; i < count; i += 1) {
      const experience = getResolvedTryItExperience(lessonId, { attemptKey: `u8-${i}` });
      expect(experience).toBeDefined();
      experiences.push(experience!);
    }
    return { lessonId, experiences };
  }

  it("choose_operation always includes both Addition and Subtraction choices", () => {
    const { experiences } = allAttemptsFor("choose_operation");
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        const part = problem.parts[0];
        expect(part.choices).toContain("Addition");
        expect(part.choices).toContain("Subtraction");
        expect(part.choices).toContain(part.correctAnswer);
      }
    }
  });

  it("generated addition stories resolve to Addition", () => {
    const { experiences } = allAttemptsFor("choose_operation");
    let found = false;
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        if (problem.prompt.includes("more") && problem.prompt.includes("total")) {
          found = true;
          expect(problem.parts[0].correctAnswer).toBe("Addition");
        }
      }
    }
    expect(found).toBe(true);
  });

  it("generated subtraction stories resolve to Subtraction", () => {
    const { experiences } = allAttemptsFor("choose_operation");
    let found = false;
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        if (problem.prompt.includes("gives away") || problem.prompt.includes("left")) {
          found = true;
          expect(problem.parts[0].correctAnswer).toBe("Subtraction");
        }
      }
    }
    expect(found).toBe(true);
  });

  it("estimate_then_solve has both estimate and exact answer parts", () => {
    const { experiences } = allAttemptsFor("estimate_then_solve");
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        expect(problem.parts.length).toBe(2);
        const keys = problem.parts.map((p) => p.key);
        expect(keys).toContain("estimate");
        expect(keys).toContain("exact");
      }
    }
  });

  it("estimate_then_solve estimate and exact answers are mathematically correct", () => {
    const { experiences } = allAttemptsFor("estimate_then_solve");
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        const numbers = problem.prompt.match(/\d+/g)?.map(Number) ?? [];
        expect(numbers.length).toBe(2);
        const [first, second] = numbers;
        const estimatePart = problem.parts.find((p) => p.key === "estimate");
        const exactPart = problem.parts.find((p) => p.key === "exact");
        expect(estimatePart).toBeDefined();
        expect(exactPart).toBeDefined();

        if (problem.prompt.includes("taken away")) {
          expect(first).toBeGreaterThanOrEqual(second);
          expect(Number(estimatePart!.correctAnswer)).toBe(roundToTen(first) - roundToTen(second));
          expect(Number(exactPart!.correctAnswer)).toBe(first - second);
        } else {
          expect(Number(estimatePart!.correctAnswer)).toBe(roundToTen(first) + roundToTen(second));
          expect(Number(exactPart!.correctAnswer)).toBe(first + second);
        }
      }
    }
  });

  it("two_step_unknowns genuinely requires two sequential operations", () => {
    const { experiences } = allAttemptsFor("two_step_unknowns");
    for (const experience of experiences) {
      for (const problem of experience.problems) {
        const parts = (problem.problemKey ?? "").split(":");
        expect(parts.length).toBe(5);
        const form = parts[1];
        const operands = parts.slice(2).map(Number);
        expect(operands.length).toBe(3);
        const [x, y, z] = operands;

        let first: number;
        let result: number;
        if (form === "start_remove_add") {
          first = x - y;
          result = x - y + z;
        } else if (form === "start_add_remove" || form === "combine_remove") {
          first = x + y;
          result = x + y - z;
        } else {
          throw new Error(`Unknown two-step form ${form}`);
        }

        expect(first).toBeGreaterThanOrEqual(0);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(Number(problem.parts[0].correctAnswer)).toBe(result);
      }
    }
  });

  it("Unit 8 problemKeys contain the actual canonical operands and distinguish changed third operands", () => {
    for (const practiceType of unit8Types) {
      const { experiences } = allAttemptsFor(practiceType);
      for (const experience of experiences) {
        for (const problem of experience.problems) {
          const promptNumbers = (problem.prompt.match(/\d+/g) ?? []).map(Number);
          const keyNumbers = (problem.problemKey?.match(/\d+/g) ?? []).map(Number);
          expect(promptNumbers.length).toBeGreaterThanOrEqual(2);
          expect(keyNumbers.length).toBeGreaterThanOrEqual(2);

          if (practiceType === "two_step_unknowns") {
            expect(keyNumbers.length).toBe(3);
          }

          for (const n of keyNumbers) {
            expect(promptNumbers).toContain(n);
          }
        }
      }
    }
  });

  it("same attemptKey remains deterministic for Unit 8 types", () => {
    for (const practiceType of unit8Types) {
      const lessonId = findLessonId(practiceType);
      expect(lessonId).toBeDefined();
      const a = getResolvedTryItExperience(lessonId!, { attemptKey: "u8-det" });
      const b = getResolvedTryItExperience(lessonId!, { attemptKey: "u8-det" });
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it("no duplicate problemKeys within an attempt for Unit 8 types", () => {
    for (const practiceType of unit8Types) {
      const { experience } = resolve(practiceType);
      const keys = experience.problems.map((p) => p.problemKey);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
});
