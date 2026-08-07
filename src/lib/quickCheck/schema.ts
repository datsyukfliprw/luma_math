import { z } from "zod";

export type QuickCheckRole = "direct" | "conceptual" | "reasoning";

export type QuickCheckAnswerType = "numeric" | "text";

const QuickCheckChoiceSchema = z.object({
  label: z.string(),
  value: z.string(),
});

export type QuickCheckChoice = z.infer<typeof QuickCheckChoiceSchema>;

const QuickCheckInteractionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("multiple_choice"),
    choices: z.array(QuickCheckChoiceSchema),
    correctAnswer: z.string(),
  }),
  z.object({
    type: z.literal("text_entry"),
    correctAnswer: z.string(),
    answerType: z.enum(["numeric", "text"]),
    placeholder: z.string().optional(),
  }),
  z.object({
    type: z.literal("true_false"),
    correctAnswer: z.enum(["true", "false"]),
  }),
  z.object({
    type: z.literal("mistake_detection"),
    statement: z.string(),
    correctAnswer: z.enum(["yes", "no"]),
    reasonChoices: z.array(z.string()).optional(),
    correctReason: z.string().optional(),
  }),
]);

export type QuickCheckInteraction = z.infer<typeof QuickCheckInteractionSchema>;

const QuickCheckVisualSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("none") }),
  z.object({
    type: z.literal("equal_groups"),
    groups: z.number(),
    itemsPerGroup: z.number(),
  }),
  z.object({
    type: z.literal("array"),
    rows: z.number(),
    columns: z.number(),
  }),
  z.object({
    type: z.literal("number_line"),
    start: z.number(),
    end: z.number(),
    jumps: z.array(z.number()).optional(),
    mark: z.number().optional(),
  }),
  z.object({
    type: z.literal("place_value_chart"),
    number: z.string(),
    highlightedPlace: z
      .enum(["hundred_thousands", "ten_thousands", "thousands", "hundreds", "tens", "ones"])
      .optional(),
  }),
  z.object({
    type: z.literal("base_ten_blocks"),
    thousands: z.number().optional(),
    hundreds: z.number().optional(),
    tens: z.number().optional(),
    ones: z.number().optional(),
  }),
  z.object({
    type: z.literal("fraction_bar"),
    numerator: z.number(),
    denominator: z.number(),
    shadedParts: z.number().optional(),
  }),
  z.object({
    type: z.literal("fraction_circle"),
    numerator: z.number(),
    denominator: z.number(),
  }),
  z.object({
    type: z.literal("shape"),
    kind: z.enum(["rectangle", "square", "triangle", "quadrilateral"]),
    width: z.number().optional(),
    height: z.number().optional(),
    sideLabels: z.record(z.string(), z.number()).optional(),
  }),
  z.object({
    type: z.literal("clock"),
    hour: z.number(),
    minute: z.number(),
  }),
  z.object({
    type: z.literal("bar_graph"),
    title: z.string().optional(),
    categories: z.array(z.object({ label: z.string(), value: z.number() })),
    scale: z.number().optional(),
  }),
  z.object({
    type: z.literal("picture_graph"),
    title: z.string().optional(),
    categories: z.array(z.object({ label: z.string(), value: z.number() })),
    key: z.string(),
  }),
  z.object({
    type: z.literal("line_plot"),
    title: z.string().optional(),
    values: z.array(z.number()),
    scale: z.number().optional(),
  }),
]);

export type QuickCheckVisual = z.infer<typeof QuickCheckVisualSchema>;

const QuickCheckFeedbackSchema = z.object({
  hint: z.string(),
  success: z.string(),
  explanation: z.string().optional(),
});

export type QuickCheckFeedback = z.infer<typeof QuickCheckFeedbackSchema>;

export const QuickCheckQuestionSchema = z.object({
  id: z.string(),
  role: z.enum(["direct", "conceptual", "reasoning"]),
  prompt: z.string(),
  stem: z.string().optional(),
  interaction: QuickCheckInteractionSchema,
  visual: QuickCheckVisualSchema.optional(),
  feedback: QuickCheckFeedbackSchema,
  topicTag: z.string().optional(),
  skill: z.string().optional(),
});

export type QuickCheckQuestion = z.infer<typeof QuickCheckQuestionSchema>;

export const QuickCheckSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  passingScore: z.number().optional(),
  questions: z.array(QuickCheckQuestionSchema),
});

export type QuickCheck = z.infer<typeof QuickCheckSchema>;
