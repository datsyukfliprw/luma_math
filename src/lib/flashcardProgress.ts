// NOTE: This file now only contains utility functions.
// The main flashcard progress logic has been migrated to StudentProgressContext.

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
