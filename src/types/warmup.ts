export type WarmUpQuestion = {
  id: string;
  question_type?: "text" | "target_digit_value";
  number?: string;
  target_digit_index?: number;
  prompt: string;
  correct_answer: string;
  hint: string;
  skill: string;
};

export type WarmUpRound = {
  id: string;
  title: string;
  description: string;
  questions: WarmUpQuestion[];
};

export type WarmUpData = {
  title: string;
  type?: string;
  estimated_minutes?: number;
  question_count?: number;
  instructions: string;
  questions?: WarmUpQuestion[];
  rounds?: WarmUpRound[];
};

export function getWarmUpRounds(warmup?: WarmUpData): WarmUpRound[] {
  if (!warmup) {
    return [];
  }

  if (warmup.rounds && warmup.rounds.length > 0) {
    return warmup.rounds;
  }

  if (warmup.questions && warmup.questions.length > 0) {
    return [
      {
        id: "quick_recall",
        title: "Quick Recall",
        description: "Fast review to warm up your brain!",
        questions: warmup.questions,
      },
    ];
  }

  return [];
}

export function getWarmUpQuestionTotal(warmup?: WarmUpData) {
  return getWarmUpRounds(warmup).reduce((total, round) => total + round.questions.length, 0);
}
