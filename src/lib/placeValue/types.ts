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
