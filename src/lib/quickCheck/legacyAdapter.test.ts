import { describe, it, expect } from "vitest";
import { getLessonExperience } from "../../data/lessonExperience";
import { toLegacyQuickCheck } from "./legacyAdapter";
import type { QuickCheck } from "./schema";

const WEEK_ONE_REGULAR_LESSONS = ["g3-u1-w1-l1", "g3-u1-w1-l2", "g3-u1-w1-l3", "g3-u1-w1-l4"];

describe("toCanonicalQuickCheck (legacy adapter)", () => {
  it("preserves Week 1 authored correct answers through the canonical contract", () => {
    for (const lessonId of WEEK_ONE_REGULAR_LESSONS) {
      const lesson = getLessonExperience(lessonId);
      expect(lesson).toBeDefined();
      expect(lesson!.source).toBe("authored");

      const canonical = lesson!.canonicalQuickCheck;
      const legacy = lesson!.quickCheck;

      expect(canonical).toBeDefined();
      expect(legacy).toBeDefined();
      expect(canonical!.questions).toHaveLength(legacy!.questions.length);

      for (let i = 0; i < canonical!.questions.length; i += 1) {
        const canonicalQuestion = canonical!.questions[i];
        const legacyQuestion = legacy!.questions[i];

        const interaction = canonicalQuestion.interaction;
        if (interaction.type === "multiple_choice") {
          const choiceValues = interaction.choices.map((c) => c.value);
          expect(choiceValues).toContain(interaction.correctAnswer);
          expect(interaction.correctAnswer).toBe(legacyQuestion.correctAnswer);
        }
      }
    }
  });

  it("balances Week 1 authored Quick Checks with direct, conceptual, and reasoning roles", () => {
    const MASCOT_PATTERN = /\b(luma|spark|charge|boost|energy)\b/i;

    for (const lessonId of WEEK_ONE_REGULAR_LESSONS) {
      const lesson = getLessonExperience(lessonId);
      expect(lesson, lessonId).toBeDefined();
      expect(lesson!.source, lessonId).toBe("authored");

      const canonical = lesson!.canonicalQuickCheck;
      expect(canonical, `${lessonId} canonical quick check`).toBeDefined();
      expect(canonical!.questions, `${lessonId} question count`).toHaveLength(3);

      const roles = canonical!.questions.map((q) => q.role);
      expect(new Set(roles), `${lessonId} roles`).toEqual(
        new Set(["direct", "conceptual", "reasoning"]),
      );

      for (const question of canonical!.questions) {
        const allText = [
          question.prompt,
          question.stem,
          question.feedback.hint,
          question.feedback.success,
        ]
          .filter(Boolean)
          .join(" ");
        expect(allText).not.toMatch(MASCOT_PATTERN);
      }
    }
  });
});

describe("toLegacyQuickCheck (view-model adapter)", () => {
  it("round-trips a canonical Quick Check back to the legacy shape", () => {
    const canonical: QuickCheck = {
      title: "Quick Check",
      subtitle: "Round trip",
      passingScore: 3,
      questions: [
        {
          id: "q1",
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
          visual: { type: "equal_groups", groups: 3, itemsPerGroup: 4 },
          feedback: { hint: "Multiply.", success: "Great!" },
          topicTag: "multiplication",
        },
        {
          id: "q2",
          role: "reasoning",
          prompt: "Is the student correct?",
          interaction: {
            type: "mistake_detection",
            statement: "A student says 3 × 4 = 7.",
            correctAnswer: "no",
          },
          feedback: { hint: "Check the product.", success: "Yes, the student is wrong." },
        },
      ],
    };

    const legacy = toLegacyQuickCheck(canonical);
    expect(legacy.questions).toHaveLength(2);
    expect(legacy.questions[0].correctAnswer).toBe("12");
    expect(legacy.questions[0].visualGroups).toBe(3);
    expect(legacy.questions[0].visualCount).toBe(4);
    expect(legacy.questions[1].correctAnswer).toBe("No");
    expect(legacy.questions[1].choices).toEqual(["Yes", "No"]);
  });
});
