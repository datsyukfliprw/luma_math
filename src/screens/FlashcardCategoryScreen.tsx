// @SECTION FLASHCARD_CATEGORY_IMPORTS
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock3,
  Layers3,
  Sparkles,
  Star,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import {
  getDecksForFlashcardCatalogCategory,
  getFlashcardCatalogCategory,
} from '../flashcards/deckRegistry'
import type { FlashcardDeck } from '../flashcards/types'
import { getFlashcardDeckProgress } from '../lib/flashcardProgress'

const CURRENT_STUDENT_ID = 'default-student'

// @SECTION FLASHCARD_CATEGORY_HELPERS
function getDeckProgressSummary(deck: FlashcardDeck) {
  const progress = getFlashcardDeckProgress(
    CURRENT_STUDENT_ID,
    deck.deckId,
    deck.cards.map((card) => card.id),
  )

  const reviewedCount = progress.answeredCardIds.length
  const progressPercent =
    deck.cards.length > 0 ? Math.round((reviewedCount / deck.cards.length) * 100) : 0

  return {
    reviewedCount,
    progressPercent,
    completed: progress.completed,
  }
}

function getKindLabel(kind: FlashcardDeck['kind']) {
  if (kind === 'math_facts') return 'Math Facts'
  if (kind === 'vocabulary') return 'Vocabulary'
  if (kind === 'rules') return 'Rules'
  if (kind === 'visual_models') return 'Visual Models'
  if (kind === 'mistake_review') return 'Mistake Review'
  return 'Challenge'
}

// @SECTION FLASHCARD_DECK_LIBRARY_CARD
function FlashcardDeckLibraryCard({ deck }: { deck: FlashcardDeck }) {
  const progress = getDeckProgressSummary(deck)

  return (
    <Link
      to={`/flashcards/deck/${deck.deckId}`}
      className="group relative overflow-hidden rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="absolute right-4 top-4 text-[#00AFB9] opacity-0 transition group-hover:opacity-100">
        <ChevronRight size={22} strokeWidth={3} />
      </div>

      <div className="flex items-start justify-between gap-4 pr-7">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-[#E9F7F8] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
            {getKindLabel(deck.kind)}
          </p>

          {progress.completed && (
            <p className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-[#FDFCDC] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#C78300]">
              <Star size={12} fill="currentColor" />
              Complete
            </p>
          )}

          <h2 className="mt-3 text-xl font-black leading-tight tracking-[-0.03em] text-[#073B5A]">
            {deck.title}
          </h2>

          <p className="mt-1 text-sm font-bold leading-snug text-[#073B5A]/65">
            {deck.subtitle}
          </p>

          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#073B5A]/45">
            {deck.meta}
          </p>
        </div>

        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#E9F7F8] text-2xl shadow-sm">
          {deck.kind === 'vocabulary'
            ? 'Aa'
            : deck.kind === 'visual_models'
              ? '•••'
              : deck.kind === 'rules'
                ? '🛡️'
                : deck.kind === 'challenge'
                  ? '🏆'
                  : '⭐'}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#F8FBFB] p-2">
        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[#0081A7]">
            <Layers3 size={16} strokeWidth={2.7} />
            <p className="text-sm font-black text-[#073B5A]">{deck.cardCount}</p>
          </div>
          <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[#073B5A]/50">
            Cards
          </p>
        </div>

        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[#0081A7]">
            <Clock3 size={16} strokeWidth={2.7} />
            <p className="text-sm font-black text-[#073B5A]">
              {deck.estimatedMinutes ?? 5}m
            </p>
          </div>
          <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[#073B5A]/50">
            Time
          </p>
        </div>

        <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
          <div className="flex items-center gap-1.5 text-[#0081A7]">
            <BookOpen size={16} strokeWidth={2.7} />
            <p className="text-sm font-black text-[#073B5A]">{deck.topics}</p>
          </div>
          <p className="mt-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[#073B5A]/50">
            Topics
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-black text-[#073B5A]/65">
          <span>
            {progress.reviewedCount} / {deck.cardCount} reviewed
          </span>
          <span>{progress.progressPercent}%</span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#073B5A]/10">
          <div
            className="h-full rounded-full bg-[#00AFB9]"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
      </div>
    </Link>
  )
}

// @SECTION FLASHCARD_CATEGORY_SCREEN
function FlashcardCategoryScreen() {
  const { categoryType, categoryId } = useParams()
  const category = getFlashcardCatalogCategory(categoryType, categoryId)
  const decks = getDecksForFlashcardCatalogCategory(categoryType, categoryId)

  return (
    <PageLayout>
      <div
        data-name="flashcard-category-screen"
        className="flex h-full min-h-0 flex-col overflow-hidden"
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <Link
              to="/flashcards"
              className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm transition hover:bg-[#E9F7F8]"
            >
              <ArrowLeft size={18} strokeWidth={3} />
              Back to Flashcards
            </Link>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00AFB9]">
              {category.eyebrow}
            </p>

            <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#073B5A]">
              {category.title}
            </h1>

            <p className="mt-1.5 text-sm font-bold text-[#073B5A]/70">
              {category.subtitle}
            </p>
          </div>

          <div className="hidden items-center gap-3 xl:flex">
            <div className="flex items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-3.5 py-2.5 shadow-sm">
              <Star size={22} className="text-[#F7B733]" fill="currentColor" />
              <span className="text-lg font-black text-[#073B5A]">1,250</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-[#073B5A]/10 bg-white px-3.5 py-2.5 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FED9B7] text-xl">
                👧
              </div>

              <div>
                <p className="text-[0.82rem] font-black text-[#073B5A]">Ava Johnson</p>
                <p className="text-xs font-bold text-[#073B5A]/60">3rd Grade</p>
              </div>
            </div>
          </div>
        </header>

        <section
          className={`relative mb-4 overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-gradient-to-br ${category.accentClass} p-5 shadow-sm`}
        >
          <div className="absolute right-8 top-4 text-8xl font-black text-white/35">
            {category.icon}
          </div>

          <div className="relative z-10 max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7] shadow-sm">
              <Sparkles size={14} fill="currentColor" />
              Deck Shelf
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#073B5A]">
              Choose a deck to practice
            </h2>

            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              {category.description}
            </p>
          </div>
        </section>

        <main className="min-h-0 flex-1 overflow-y-auto pr-1">
          {decks.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {decks.map((deck) => (
                <FlashcardDeckLibraryCard key={deck.deckId} deck={deck} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.75rem] border border-dashed border-[#073B5A]/15 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#E9F7F8] text-4xl">
                {category.icon}
              </div>

              <h2 className="mt-4 text-2xl font-black text-[#073B5A]">
                More decks coming soon
              </h2>

              <p className="mx-auto mt-2 max-w-xl text-sm font-bold leading-relaxed text-[#073B5A]/65">
                This shelf is ready, but we have not added its flashcard decks yet.
                As we build more lessons, this category will fill with practice decks.
              </p>

              <Link
                to="/flashcards"
                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#00AFB9] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
              >
                Back to Flashcards
                <ChevronRight size={17} strokeWidth={3} />
              </Link>
            </div>
          )}
        </main>
      </div>
    </PageLayout>
  )
}

export default FlashcardCategoryScreen
