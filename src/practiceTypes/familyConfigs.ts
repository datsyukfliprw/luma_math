export type AdditionRepresentation =
  | "direct"
  | "number_line_jumps"
  | "expanded_form"
  | "compensation"
  | "missing_addend"
  | "word_problem"
  | "missing_digit"
  | "balanced_equation"
  | "property"
  | "error_identification";

export type RegroupingRequirement = "none" | "required" | "mixed";

export type AdditionFamilyConfig = {
  family: "addition";
  practiceType: string;
  skillLabel: string;
  operandRange: { min: number; max: number };
  resultRange?: { min: number; max: number };
  addendCount: number;
  regrouping: RegroupingRequirement;
  requiredColumn?: "ones" | "tens";
  representations: readonly AdditionRepresentation[];
  allowWordProblems: boolean;
  compensation?: boolean;
};

export const additionFamilyConfigs: Record<string, AdditionFamilyConfig> = {
  addition_number_line: {
    family: "addition",
    practiceType: "addition_number_line",
    skillLabel: "Solve using a number line",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "none",
    representations: ["number_line_jumps"],
    allowWordProblems: false,
  },
  addition_expanded_form: {
    family: "addition",
    practiceType: "addition_expanded_form",
    skillLabel: "Add using expanded form",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "none",
    representations: ["expanded_form"],
    allowWordProblems: false,
  },
  addition_compensation: {
    family: "addition",
    practiceType: "addition_compensation",
    skillLabel: "Add using compensation",
    operandRange: { min: 100, max: 900 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "mixed",
    representations: ["compensation"],
    allowWordProblems: false,
    compensation: true,
  },
  addition_no_regroup: {
    family: "addition",
    practiceType: "addition_no_regroup",
    skillLabel: "Add without regrouping",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "none",
    representations: ["direct", "missing_addend", "word_problem"],
    allowWordProblems: true,
  },
  addition_regroup_ones: {
    family: "addition",
    practiceType: "addition_regroup_ones",
    skillLabel: "Regroup ones when adding",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "required",
    requiredColumn: "ones",
    representations: ["direct", "missing_addend"],
    allowWordProblems: false,
  },
  addition_regroup_tens: {
    family: "addition",
    practiceType: "addition_regroup_tens",
    skillLabel: "Regroup tens when adding",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "required",
    requiredColumn: "tens",
    representations: ["direct", "missing_addend"],
    allowWordProblems: false,
  },
  addition_three_numbers: {
    family: "addition",
    practiceType: "addition_three_numbers",
    skillLabel: "Add three numbers",
    operandRange: { min: 10, max: 499 },
    resultRange: { min: 10, max: 999 },
    addendCount: 3,
    regrouping: "mixed",
    representations: ["direct", "missing_addend"],
    allowWordProblems: false,
  },
  missing_digits_properties: {
    family: "addition",
    practiceType: "missing_digits_properties",
    skillLabel: "Find missing digits and use properties",
    operandRange: { min: 100, max: 499 },
    resultRange: { min: 100, max: 999 },
    addendCount: 2,
    regrouping: "mixed",
    representations: ["missing_digit", "balanced_equation", "property", "error_identification"],
    allowWordProblems: false,
  },
};

export const additionPracticeTypes = Object.keys(additionFamilyConfigs);
