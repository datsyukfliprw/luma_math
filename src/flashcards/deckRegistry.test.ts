import { describe, expect, it } from "vitest";
import { getAllCurricula } from "../data/curriculum";
import {
  findFlashcardDeck,
  getFlashcardDeck,
  getFlashcardDeckCardIds,
  recommendedFlashcardDeckId,
} from "./deckRegistry";

describe("flashcard deck lookup integrity", () => {
  it("keeps the recommended deck as the explicit default", () => {
    expect(getFlashcardDeck(undefined).deckId).toBe(recommendedFlashcardDeckId);
  });

  it("does not silently substitute the recommended deck for an unknown deck id", () => {
    expect(findFlashcardDeck("missing-deck")).toBeUndefined();
    expect(getFlashcardDeckCardIds("missing-deck")).toEqual([]);
  });

  it("never reports cards for curriculum deck ids that are not actually registered", () => {
    for (const unit of getAllCurricula()) {
      for (const week of unit.weeks) {
        for (const lesson of week.lessons) {
          const deckId = lesson.flashcards?.deckId;
          if (!deckId || findFlashcardDeck(deckId)) continue;
          expect(getFlashcardDeckCardIds(deckId)).toEqual([]);
        }
      }
    }
  });
});
