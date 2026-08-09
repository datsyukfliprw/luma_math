import { BookOpen, Clock3, Layers3, Play, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import {
  flashcardDecks,
  getFlashcardDeck,
  recommendedFlashcardDeckId,
} from "../flashcards/deckRegistry";
import type { FlashcardDeck } from "../flashcards/types";

function DeckProgress({ deck }: { deck: FlashcardDeck }) {
  const { getFlashcardDeckProgress } = useStudentProgress();
  const cardIds = deck.cards.map((card) => card.id);
  const progress = getFlashcardDeckProgress(deck.deckId, cardIds);
  const reviewed = progress.answeredCardIds.length;
  const percent = deck.cardCount > 0 ? Math.round((reviewed / deck.cardCount) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs font-black text-[#073B5A]/65">
        <span>{reviewed} of {deck.cardCount} reviewed</span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#073B5A]/10">
        <div className="h-full rounded-full bg-[#00AFB9]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function DeckCard({ deck }: { deck: FlashcardDeck }) {
  return (
    <Link
      to={`/flashcards/deck/${deck.deckId}`}
      className="group flex min-h-[180px] flex-col rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#00AFB9]/30 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#0081A7] shadow-sm">
          <Layers3 size={22} strokeWidth={2.6} />
        </div>
        <span className="rounded-full bg-[#F8FBFB] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#0081A7]">
          {deck.kind.replaceAll("_", " ")}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-black leading-tight text-[#073B5A]">{deck.title}</h3>
      <p className="mt-2 text-sm font-bold leading-5 text-[#073B5A]/65">{deck.subtitle}</p>

      <div className="mt-auto pt-3">
        <DeckProgress deck={deck} />
      </div>
    </Link>
  );
}

function FlashcardsScreen() {
  const recommendedDeck = getFlashcardDeck(recommendedFlashcardDeckId);
  const lessonDecks = flashcardDecks.filter((deck) => deck.category === "lesson");
  const reviewDecks = flashcardDecks.filter((deck) => deck.category !== "lesson");

  return (
    <PageLayout>
      <div className="flex min-h-0 flex-col pb-4">
        <header className="mb-5">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00AFB9]">
            Quick Review
          </p>
          <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#073B5A]">
            Flashcards
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#073B5A]/70">
            Review the Grade 3 decks that are ready today. Lesson decks track progress locally on this device.
          </p>
        </header>

        <section className="relative mb-6 overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-[linear-gradient(115deg,#073B5A_0%,#075A78_58%,#0081A7_100%)] p-6 text-white shadow-sm">
          <div aria-hidden="true" className="absolute inset-0 opacity-30">
            <div className="absolute right-[-40px] top-[-70px] h-72 w-72 rounded-full border border-white/20" />
            <div className="absolute right-28 top-12 h-44 w-44 rounded-full border border-white/10" />
          </div>

          <div className="relative z-10 grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <p className="inline-flex rounded-full bg-white/95 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7] shadow-sm">
                Recommended deck
              </p>
              <h2 className="mt-4 text-[2rem] font-black leading-tight tracking-[-0.04em]">
                {recommendedDeck.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm font-bold leading-relaxed text-white/85">
                {recommendedDeck.subtitle}
              </p>
              <p className="mt-2 text-sm font-black text-[#BDEFF2]">{recommendedDeck.meta}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-[#073B5A]">
                <span className="rounded-xl bg-white/95 px-3 py-2 text-sm font-black">
                  {recommendedDeck.cardCount} cards
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-black">
                  <Clock3 size={16} strokeWidth={2.6} className="text-[#0081A7]" />
                  {recommendedDeck.estimatedMinutes ?? 5} min
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm font-black">
                  <BookOpen size={16} strokeWidth={2.6} className="text-[#0081A7]" />
                  {recommendedDeck.topics} topics
                </span>
              </div>

              <Link
                to={`/flashcards/deck/${recommendedDeck.deckId}`}
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-[#00AFB9] px-6 text-sm font-black text-white shadow-[0_10px_22px_rgba(0,175,185,0.28)] transition hover:bg-[#00A1AA]"
              >
                <Play size={17} fill="currentColor" />
                Review Deck
              </Link>
            </div>

            <div aria-hidden="true" className="relative mx-auto hidden h-40 w-52 lg:block">
              <div className="absolute left-4 top-5 h-32 w-44 rotate-[-8deg] rounded-[1.5rem] border border-white/25 bg-white/15 shadow-xl" />
              <div className="absolute left-9 top-3 h-32 w-44 rotate-[5deg] rounded-[1.5rem] border border-white/30 bg-[#FDFCDC]/20 shadow-xl" />
              <div className="absolute left-7 top-7 flex h-32 w-44 items-center justify-center rounded-[1.5rem] border border-white/45 bg-white/95 text-[#073B5A] shadow-2xl">
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">Quick Review</p>
                  <p className="mt-2 text-4xl font-black">8 × 1</p>
                  <p className="mt-1 text-sm font-bold text-[#275875]">What is the product?</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">Unit 1</p>
              <h2 className="mt-1 text-xl font-black text-[#073B5A]">Lesson decks</h2>
            </div>
            <Link
              to="/flashcards/category/grade/3"
              className="text-sm font-black text-[#0081A7] hover:text-[#00AFB9]"
            >
              Browse Grade 3 ›
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {lessonDecks.map((deck) => <DeckCard key={deck.deckId} deck={deck} />)}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">Extra review</p>
              <h2 className="mt-1 text-xl font-black text-[#073B5A]">Skill and unit decks</h2>
            </div>
            <Link
              to="/flashcards/category/unit/g3-u1-foundations"
              className="inline-flex items-center gap-2 text-sm font-black text-[#0081A7] hover:text-[#00AFB9]"
            >
              <RotateCcw size={16} strokeWidth={2.8} />
              Unit 1 review
            </Link>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {reviewDecks.map((deck) => <DeckCard key={deck.deckId} deck={deck} />)}
          </div>
        </section>
      </div>
    </PageLayout>
  );
}

export default FlashcardsScreen;
