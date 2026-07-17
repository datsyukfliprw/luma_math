export type FlashcardAnswerState = "known" | "review_again";

export type FlashcardDeckProgress = {
  deckId: string;
  currentCardIndex: number;
  completed: boolean;
  knownCardIds: string[];
  reviewAgainCardIds: string[];
  answeredCardIds: string[];
  updatedAt: string;
  completedAt?: string;
};

const STORAGE_KEY = "lumamath.flashcardProgress";

function readAllFlashcardProgress(): Record<string, Record<string, FlashcardDeckProgress>> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllFlashcardProgress(
  progress: Record<string, Record<string, FlashcardDeckProgress>>,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export function getNextUnansweredCardIndex(
  cardIds: string[],
  answeredCardIds: string[],
  startIndex = 0,
) {
  if (cardIds.length === 0) {
    return 0;
  }

  const safeStartIndex = Math.min(Math.max(startIndex, 0), cardIds.length - 1);

  for (let index = safeStartIndex; index < cardIds.length; index += 1) {
    if (!answeredCardIds.includes(cardIds[index])) {
      return index;
    }
  }

  for (let index = 0; index < safeStartIndex; index += 1) {
    if (!answeredCardIds.includes(cardIds[index])) {
      return index;
    }
  }

  return cardIds.length - 1;
}

export function getFlashcardDeckProgress(
  studentId: string,
  deckId: string,
  cardIds: string[] = [],
): FlashcardDeckProgress {
  const allProgress = readAllFlashcardProgress();
  const savedProgress = allProgress[studentId]?.[deckId];

  if (!savedProgress) {
    return {
      deckId,
      currentCardIndex: 0,
      completed: false,
      knownCardIds: [],
      reviewAgainCardIds: [],
      answeredCardIds: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const answeredCardIds = unique(
    savedProgress.answeredCardIds ?? [
      ...(savedProgress.knownCardIds ?? []),
      ...(savedProgress.reviewAgainCardIds ?? []),
    ],
  );

  const completed =
    savedProgress.completed || (cardIds.length > 0 && answeredCardIds.length >= cardIds.length);

  return {
    ...savedProgress,
    deckId,
    knownCardIds: unique(savedProgress.knownCardIds ?? []),
    reviewAgainCardIds: unique(savedProgress.reviewAgainCardIds ?? []),
    answeredCardIds,
    completed,
    currentCardIndex: completed
      ? Math.min(
          savedProgress.currentCardIndex ?? cardIds.length - 1,
          Math.max(cardIds.length - 1, 0),
        )
      : getNextUnansweredCardIndex(cardIds, answeredCardIds, savedProgress.currentCardIndex ?? 0),
  };
}

export function saveFlashcardDeckProgress(
  studentId: string,
  deckId: string,
  progress: FlashcardDeckProgress,
) {
  const allProgress = readAllFlashcardProgress();
  const studentProgress = allProgress[studentId] ?? {};

  writeAllFlashcardProgress({
    ...allProgress,
    [studentId]: {
      ...studentProgress,
      [deckId]: progress,
    },
  });

  return progress;
}

export function recordFlashcardAnswer({
  studentId,
  deckId,
  cardId,
  answerState,
  cardIds,
  currentCardIndex,
}: {
  studentId: string;
  deckId: string;
  cardId: string;
  answerState: FlashcardAnswerState;
  cardIds: string[];
  currentCardIndex: number;
}) {
  const previousProgress = getFlashcardDeckProgress(studentId, deckId, cardIds);

  const knownCardIds =
    answerState === "known"
      ? unique([...previousProgress.knownCardIds, cardId])
      : previousProgress.knownCardIds.filter((knownCardId) => knownCardId !== cardId);

  const reviewAgainCardIds =
    answerState === "review_again"
      ? unique([...previousProgress.reviewAgainCardIds, cardId])
      : previousProgress.reviewAgainCardIds.filter((reviewCardId) => reviewCardId !== cardId);

  const answeredCardIds = unique([...previousProgress.answeredCardIds, cardId]);

  const completed = cardIds.length > 0 && answeredCardIds.length >= cardIds.length;
  const nextCardIndex = completed
    ? currentCardIndex
    : getNextUnansweredCardIndex(cardIds, answeredCardIds, currentCardIndex + 1);

  const nextProgress: FlashcardDeckProgress = {
    deckId,
    currentCardIndex: nextCardIndex,
    completed,
    knownCardIds,
    reviewAgainCardIds,
    answeredCardIds,
    updatedAt: new Date().toISOString(),
    completedAt: completed ? (previousProgress.completedAt ?? new Date().toISOString()) : undefined,
  };

  return saveFlashcardDeckProgress(studentId, deckId, nextProgress);
}

export function resetFlashcardDeckProgress(studentId: string, deckId: string) {
  const allProgress = readAllFlashcardProgress();
  const studentProgress = { ...(allProgress[studentId] ?? {}) };

  delete studentProgress[deckId];

  writeAllFlashcardProgress({
    ...allProgress,
    [studentId]: studentProgress,
  });
}
