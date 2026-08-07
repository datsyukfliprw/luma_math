import type { LegacyQuickCheck, LegacyQuickCheckQuestion } from "../../data/lessonExperience/types";
import { normalizeNumericAnswer } from "../answerValidation";
import type { QuickCheck, QuickCheckQuestion, QuickCheckRole } from "./schema";

function inferLegacyRole(legacy: LegacyQuickCheckQuestion): QuickCheckRole {
  const prompt = legacy.prompt.toLowerCase();
  const ruleType = legacy.ruleType.toLowerCase();

  if (
    prompt.includes("is maya") ||
    prompt.includes("is the student") ||
    prompt.includes("is this correct") ||
    prompt.includes("which statement is true") ||
    prompt.includes("which statement is false") ||
    prompt.includes("who is right") ||
    ruleType.includes("reasoning")
  ) {
    return "reasoning";
  }

  if (
    prompt.includes("which") ||
    prompt.includes("what does the word") ||
    prompt.includes("what is the word") ||
    prompt.includes("matches") ||
    prompt.includes("what is the product of") ||
    ruleType.includes("concept")
  ) {
    return "conceptual";
  }

  return "direct";
}

function legacyChoicesToCanonical(choices: string[]): {
  label: string;
  value: string;
}[] {
  return choices.map((choice) => ({ label: choice, value: choice }));
}

function buildTextDistractors(correct: string, answerType: "numeric" | "text"): string[] {
  if (answerType === "numeric") {
    const normalized = normalizeNumericAnswer(correct);
    const value = Number(normalized);

    if (!Number.isNaN(value)) {
      const candidates = [value + 1, value - 1, value + 10, value - 10, value * 2, Math.abs(value)];

      const distractors = candidates
        .filter((n) => Number.isFinite(n) && n >= 0 && String(n) !== correct)
        .map(String);

      if (distractors.length >= 2) {
        return [correct, ...distractors.slice(0, 2)];
      }
    }
  }

  return [correct, "0", "1"];
}

export function toCanonicalQuickCheckQuestion(
  legacy: LegacyQuickCheckQuestion,
): QuickCheckQuestion {
  const visual: QuickCheckQuestion["visual"] =
    legacy.visualGroups > 0
      ? {
          type: "equal_groups",
          groups: legacy.visualGroups,
          itemsPerGroup: legacy.visualCount,
        }
      : undefined;

  return {
    id: legacy.id,
    role: inferLegacyRole(legacy),
    prompt: legacy.prompt,
    stem: legacy.equationStart || legacy.prompt,
    interaction: {
      type: "multiple_choice",
      choices: legacyChoicesToCanonical(legacy.choices),
      correctAnswer: legacy.correctAnswer,
    },
    visual,
    feedback: {
      hint: legacy.hint,
      success: legacy.success,
    },
    topicTag: legacy.ruleType,
  };
}

export function toCanonicalQuickCheck(legacy: LegacyQuickCheck): QuickCheck {
  return {
    title: legacy.title,
    subtitle: legacy.subtitle,
    passingScore: legacy.passingScore,
    questions: legacy.questions.map(toCanonicalQuickCheckQuestion),
  };
}

function canonicalInteractionToChoices(interaction: QuickCheckQuestion["interaction"]): string[] {
  switch (interaction.type) {
    case "multiple_choice":
      return interaction.choices.map((c) => c.value);
    case "true_false":
      return ["True", "False"];
    case "mistake_detection":
      return ["Yes", "No"];
    case "text_entry":
      return buildTextDistractors(interaction.correctAnswer, interaction.answerType);
    default:
      return [];
  }
}

function canonicalCorrectAnswerToLegacy(interaction: QuickCheckQuestion["interaction"]): string {
  if (interaction.type === "true_false") {
    return interaction.correctAnswer === "true" ? "True" : "False";
  }

  if (interaction.type === "mistake_detection") {
    return interaction.correctAnswer === "yes" ? "Yes" : "No";
  }

  return interaction.correctAnswer;
}

export function toLegacyQuickCheckQuestion(question: QuickCheckQuestion): LegacyQuickCheckQuestion {
  const visual = question.visual?.type === "equal_groups" ? question.visual : undefined;

  return {
    id: question.id,
    prompt: question.prompt,
    equationStart: question.stem ?? question.prompt,
    productPrompt: "",
    choices: canonicalInteractionToChoices(question.interaction),
    correctAnswer: canonicalCorrectAnswerToLegacy(question.interaction),
    ruleType: question.topicTag ?? question.role,
    tipTitle: "",
    tipText: "",
    hint: question.feedback.hint,
    success: question.feedback.success,
    visualGroups: visual?.groups ?? 0,
    visualCount: visual?.itemsPerGroup ?? 0,
  };
}

export function toLegacyQuickCheckQuestions(quickCheck: QuickCheck): LegacyQuickCheckQuestion[] {
  return quickCheck.questions.map(toLegacyQuickCheckQuestion);
}

export function toLegacyQuickCheck(quickCheck: QuickCheck): LegacyQuickCheck {
  return {
    title: quickCheck.title,
    subtitle: quickCheck.subtitle,
    passingScore: quickCheck.passingScore ?? quickCheck.questions.length,
    questions: toLegacyQuickCheckQuestions(quickCheck),
  };
}
