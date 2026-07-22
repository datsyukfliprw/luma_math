import { describe, it, expect } from "vitest";
import { validateCurriculum } from "./validateCurriculum";

function makeCurriculum(warmupQuestion: Record<string, unknown>) {
  return {
    grade_level: 3,
    unit_number: 1,
    unit_title: "Test",
    unit_slug: "test",
    unit_description: "Test unit",
    unit_goals: ["test"],
    fact_focus: ["test"],
    weeks: [
      {
        week_number: 1,
        week_title: "Test",
        weekly_focus: "test",
        lessons: [
          {
            lesson_id: "g3-u1-w1-l1",
            day_number: 1,
            day_name: "Monday",
            lesson_title: "Test",
            lesson_type: "lesson",
            fact_drill: "test",
            concept: "test",
            practice: "test",
            objective: "test",
            practice_type: "test",
            skills: ["test"],
            lesson_video_url: "",
            worksheet_url: "",
            quiz_question_count: 3,
            warmup: {
              title: "Warm-Up",
              type: "test",
              question_count: 1,
              instructions: "Warm up.",
              questions: [warmupQuestion],
            },
            learn: {
              title: "Learn",
              teaching_points: ["Point"],
              example: {
                prompt: "In 5,328, what does the digit 3 stand for?",
                visual_type: "base_ten",
                groups: 1,
                items_per_group: 1,
                equation: "3 x 100 = 300",
              },
              vocabulary: ["digit"],
            },
            try_it: {
              title: "Try It",
              type: "digit_value",
              prompt: "In 7,521, what does the 7 represent?",
              correct_answer: "7000",
              hint: "7 is in the thousands place.",
              visual_data: { groups: 1, items_per_group: 1 },
            },
            practice_block: {
              title: "Practice",
              type: "test",
              question_count: 1,
              instructions: "Practice.",
            },
          },
        ],
      },
    ],
  };
}

describe("validateCurriculum", () => {
  it("rejects Markdown-style target-digit markup __4__", () => {
    const invalid = makeCurriculum({
      id: "q1",
      prompt: "In __4__56, what is the value of the underlined digit?",
      correct_answer: "400",
      hint: "Hint",
      skill: "digit_value",
    });

    expect(() => validateCurriculum(invalid)).toThrow();
  });

  it("rejects Markdown-style group markup __456__", () => {
    const invalid = makeCurriculum({
      id: "q1",
      prompt: "In 23__,456__, what is the value of the underlined digits?",
      correct_answer: "3000",
      hint: "Hint",
      skill: "digit_value",
    });

    expect(() => validateCurriculum(invalid)).toThrow();
  });

  it("rejects the phrase 'underlined digit'", () => {
    const invalid = makeCurriculum({
      id: "q1",
      prompt: "In 456, what is the value of the underlined digit?",
      correct_answer: "400",
      hint: "Hint",
      skill: "digit_value",
    });

    expect(() => validateCurriculum(invalid)).toThrow();
  });

  it("accepts the target_digit_value structured format", () => {
    const valid = makeCurriculum({
      id: "q1",
      question_type: "target_digit_value",
      number: "456",
      target_digit_index: 0,
      prompt: "What is the value of the bold digit?",
      correct_answer: "400",
      hint: "The 4 is in the hundreds place.",
      skill: "digit_value",
    });

    expect(() => validateCurriculum(valid)).not.toThrow();
  });
});
