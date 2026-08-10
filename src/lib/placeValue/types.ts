export type PlaceValue =
  | "ones"
  | "tens"
  | "hundreds"
  | "thousands"
  | "ten thousands";

export type DigitValueProblem = {
  form: "digit_value";
  number: number;
  targetPlace: PlaceValue;
  targetDigit: number;
  placeValue: number;
  correctAnswer: number;
  problemKey: string;
};

export type RoundingPracticeType = "round_ten" | "round_hundred" | "round_place_value";

export type RoundingProblem = {
  form: "rounding";
  number: number;
  targetPlace: 10 | 100 | 1_000;
  correctAnswer: number;
  problemKey: string;
};

export type EstimationOperation = "addition" | "subtraction";

export type EstimationProblem = {
  form: "estimation";
  operation: EstimationOperation;
  left: number;
  right: number;
  targetPlace: 10 | 100;
  correctAnswer: number;
  problemKey: string;
};
