import { describe, it, expect } from "vitest";
import { getAllCurricula } from "../../data/curriculum/curriculumRegistry";
import type { Lesson } from "../../data/curriculum/curriculumSchema";
import { getLessonById } from "../lessonLookup";
import {
  generateQuickCheckForLesson,
  type QuickCheckGeneratorOptions,
} from "./quickCheckGenerator";
import { QuickCheckSchema } from "./schema";

function getAllRegularGrade3Lessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const curriculum of getAllCurricula()) {
    if (curriculum.grade_level !== 3) continue;
    for (const week of curriculum.weeks) {
      for (const lesson of week.lessons) {
        if (lesson.lesson_type === "lesson") {
          lessons.push(lesson);
        }
      }
    }
  }
  return lessons;
}

const REGRESSION_LESSONS = [
  "g3-u20-w1-l1",
  "g3-u26-w1-l1",
  "g3-u29-w1-l3",
  "g3-u30-w1-l3",
  "g3-u33-w1-l2",
  "g3-u34-w1-l1",
  "g3-u2-w1-l2",
  "g3-u11-w1-l4",
];

describe("Quick Check contract", () => {
  it("validates the canonical shape for a generated Quick Check", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const quickCheck = generateQuickCheckForLesson(lesson);
    expect(quickCheck).toBeDefined();
    const parsed = QuickCheckSchema.safeParse(quickCheck);
    expect(parsed.success).toBe(true);
  });

  it("has exactly one direct, one conceptual, and one reasoning question", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const quickCheck = generateQuickCheckForLesson(lesson)!;

    const roles = quickCheck.questions.map((q) => q.role);
    expect(roles).toHaveLength(3);
    expect(roles.filter((r) => r === "direct")).toHaveLength(1);
    expect(roles.filter((r) => r === "conceptual")).toHaveLength(1);
    expect(roles.filter((r) => r === "reasoning")).toHaveLength(1);
  });
});

describe("Quick Check multiple-choice invariant", () => {
  function assertMultipleChoice(question: {
    interaction: { type: string; choices?: { value: string }[]; correctAnswer: string };
  }) {
    expect(question.interaction.type).toBe("multiple_choice");
    const interaction = question.interaction as {
      type: "multiple_choice";
      choices: { value: string }[];
      correctAnswer: string;
    };
    const choiceValues = interaction.choices.map((c) => c.value);

    expect(choiceValues.length).toBeGreaterThanOrEqual(3);
    expect(new Set(choiceValues).size).toBe(choiceValues.length);

    const correctOccurrences = choiceValues.filter((v) => v === interaction.correctAnswer);
    expect(correctOccurrences).toHaveLength(1);
    expect(choiceValues).toContain(interaction.correctAnswer);
  }

  it("enforces the invariant for all multiple-choice questions across 144 regular lessons", () => {
    const lessons = getAllRegularGrade3Lessons();
    expect(lessons.length).toBe(144);

    for (const lesson of lessons) {
      const quickCheck = generateQuickCheckForLesson(lesson);
      expect(quickCheck).toBeDefined();

      for (const question of quickCheck!.questions) {
        if (question.interaction.type === "multiple_choice") {
          assertMultipleChoice(question);
        }
      }
    }
  }, 60000);

  it.each(REGRESSION_LESSONS)(
    "regression: %s produces valid multiple-choice direct and conceptual questions",
    (lessonId) => {
      const { lesson } = getLessonById(lessonId);
      const quickCheck = generateQuickCheckForLesson(lesson)!;

      const direct = quickCheck.questions.find((q) => q.role === "direct");
      const conceptual = quickCheck.questions.find((q) => q.role === "conceptual");

      expect(direct).toBeDefined();
      expect(conceptual).toBeDefined();

      if (direct!.interaction.type === "multiple_choice") {
        assertMultipleChoice(direct!);
      }

      if (conceptual!.interaction.type === "multiple_choice") {
        assertMultipleChoice(conceptual!);
      }
    },
  );
});

describe("Quick Check Grade 3 coverage", () => {
  it("generates a valid 3-question Quick Check for every regular Grade 3 lesson", () => {
    const lessons = getAllRegularGrade3Lessons();
    expect(lessons.length).toBe(144);

    const roleCounts = { direct: 0, conceptual: 0, reasoning: 0 };
    const ids = new Set<string>();

    for (const lesson of lessons) {
      const quickCheck = generateQuickCheckForLesson(lesson);
      expect(quickCheck).toBeDefined();

      const parsed = QuickCheckSchema.safeParse(quickCheck);
      expect(parsed.success).toBe(true);

      expect(quickCheck!.questions).toHaveLength(3);

      for (const question of quickCheck!.questions) {
        expect(question.id).toBeTruthy();
        expect(ids.has(question.id)).toBe(false);
        ids.add(question.id);

        roleCounts[question.role] += 1;

        const interaction = question.interaction;
        if (interaction.type === "multiple_choice") {
          const choiceValues = interaction.choices.map((c) => c.value);
          expect(choiceValues).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "true_false") {
          expect(["true", "false"]).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "mistake_detection") {
          expect(["yes", "no"]).toContain(interaction.correctAnswer);
        }

        if (interaction.type === "text_entry") {
          expect(interaction.correctAnswer).toBeTruthy();
          expect(["numeric", "text"]).toContain(interaction.answerType);
        }

        // No mascot / boost / charge language.
        const allText = [
          question.prompt,
          question.stem,
          question.feedback.hint,
          question.feedback.success,
          question.feedback.explanation,
          question.topicTag,
          question.skill,
        ]
          .filter(Boolean)
          .join(" ");
        expect(allText).not.toMatch(/\b(luma|spark|charge|boost|energy)\b/i);
      }
    }

    expect(roleCounts.direct).toBe(144);
    expect(roleCounts.conceptual).toBe(144);
    expect(roleCounts.reasoning).toBe(144);
  }, 30000);
});

describe("Quick Check determinism", () => {
  it("produces identical output for the same lesson and seed", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const options: QuickCheckGeneratorOptions = { seed: "test-seed" };
    const first = generateQuickCheckForLesson(lesson, options);
    const second = generateQuickCheckForLesson(lesson, options);
    expect(first).toEqual(second);
  });

  it("produces stable output when no seed is supplied", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const first = generateQuickCheckForLesson(lesson);
    const second = generateQuickCheckForLesson(lesson);
    expect(first).toEqual(second);
  });

  it("produces different output for a different seed where variation is supported", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const first = generateQuickCheckForLesson(lesson, { seed: "a" });
    const second = generateQuickCheckForLesson(lesson, { seed: "b" });
    expect(first).not.toEqual(second);
  });
});

describe("Quick Check authored precedence", () => {
  it("returns an authored curriculum quick_check even when fallback sources are missing", () => {
    const { lesson } = getLessonById("g3-u11-w1-l1");
    const authored: typeof lesson.quick_check = {
      title: "Authored Quick Check",
      subtitle: "Unit 1 Week 1",
      passingScore: 3,
      questions: [
        {
          id: "authored-direct",
          role: "direct",
          prompt: "What is 3 × 4?",
          interaction: {
            type: "multiple_choice",
            choices: [
              { label: "12", value: "12" },
              { label: "7", value: "7" },
              { label: "11", value: "11" },
            ],
            correctAnswer: "12",
          },
          feedback: { hint: "Multiply.", success: "Great!" },
        },
        {
          id: "authored-conceptual",
          role: "conceptual",
          prompt: "Which matches?",
          interaction: {
            type: "multiple_choice",
            choices: [
              { label: "3 groups of 4", value: "3 groups of 4" },
              { label: "4 groups of 3", value: "4 groups of 3" },
              { label: "3 + 4", value: "3 + 4" },
            ],
            correctAnswer: "3 groups of 4",
          },
          feedback: { hint: "Think about groups.", success: "Yes!" },
        },
        {
          id: "authored-reasoning",
          role: "reasoning",
          prompt: "Is the student correct?",
          interaction: {
            type: "mistake_detection",
            statement: "A student says 3 × 4 = 7.",
            correctAnswer: "no",
          },
          feedback: { hint: "Check the product.", success: "Right!" },
        },
      ],
    };

    const fixture = {
      ...lesson,
      quick_check: authored,
      warmup: undefined,
      try_it: undefined,
    } as unknown as Lesson;

    const quickCheck = generateQuickCheckForLesson(fixture);
    expect(quickCheck).toEqual(authored);
  });
});

describe("Quick Check reasoning feedback", () => {
  it.each(REGRESSION_LESSONS)(
    "regression: %s reasoning success feedback does not contain learner failure wording",
    (lessonId) => {
      const { lesson } = getLessonById(lessonId);
      const quickCheck = generateQuickCheckForLesson(lesson)!;
      const reasoning = quickCheck.questions.find((q) => q.role === "reasoning")!;

      expect(reasoning.interaction.type).toBe("mistake_detection");
      const interaction = reasoning.interaction as { correctAnswer: "yes" | "no" };

      if (interaction.correctAnswer === "no") {
        const learnerResponse = reasoning.feedback.success.toLowerCase();
        expect(learnerResponse).not.toContain("not quite");
        expect(learnerResponse).not.toContain("try again");
        expect(learnerResponse).not.toContain("incorrect");

        const explanation = reasoning.feedback.explanation?.toLowerCase() ?? "";
        expect(explanation.length).toBeGreaterThan(0);
      }
    },
  );
});

describe("Quick Check mascot language handling", () => {
  it("detects and neutralizes mascot wording consistently across sequential calls", () => {
    const samples = [
      "Luma is here",
      "Spark your energy",
      "boost your charge",
      "Luma Spark",
      "Energy boost",
    ];

    for (const sample of samples) {
      const quickCheck = generateQuickCheckForLesson({
        ...getLessonById("g3-u11-w1-l1").lesson,
        quick_check: {
          title: sample,
          subtitle: sample,
          passingScore: 1,
          questions: [
            {
              id: "mascot-test",
              role: "direct",
              prompt: sample,
              interaction: {
                type: "multiple_choice",
                choices: [
                  { label: "yes", value: "yes" },
                  { label: "no", value: "no" },
                  { label: "maybe", value: "maybe" },
                ],
                correctAnswer: "yes",
              },
              feedback: { hint: sample, success: sample },
            },
          ],
        },
      } as unknown as Lesson);

      expect(quickCheck?.title).not.toMatch(/\b(luma|spark|charge|boost|energy)\b/i);
      expect(quickCheck?.subtitle).not.toMatch(/\b(luma|spark|charge|boost|energy)\b/i);
      expect(quickCheck?.questions[0].prompt).not.toMatch(/\b(luma|spark|charge|boost|energy)\b/i);
      expect(quickCheck?.questions[0].feedback.hint).not.toMatch(
        /\b(luma|spark|charge|boost|energy)\b/i,
      );
      expect(quickCheck?.questions[0].feedback.success).not.toMatch(
        /\b(luma|spark|charge|boost|energy)\b/i,
      );
    }
  });
});
