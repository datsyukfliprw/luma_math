// @SECTION FLASHCARD_SESSION_IMPORTS
import { useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  RotateCcw,
  Star,
} from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import {
  getFlashcardDeckProgress,
  getNextUnansweredCardIndex,
  recordFlashcardAnswer,
  resetFlashcardDeckProgress,
} from '../lib/flashcardProgress'
import { getFlashcardDeck, recommendedFlashcardDeckId } from '../flashcards/deckRegistry'
import type { Flashcard } from '../flashcards/types'

// @SECTION FLASHCARD_SESSION_ASSETS
const MASCOT_ASSET_VERSION = 'v1'
const CURRENT_STUDENT_ID = 'default-student'
const DEFAULT_DECK_ID = recommendedFlashcardDeckId

function mascotAsset(filename: string) {
  return `${new URL(`../assets/images/mascot/${filename}`, import.meta.url).href}?${MASCOT_ASSET_VERSION}`
}

// @SECTION FLASHCARD_SESSION_TYPES
type AnswerResult = 'correct' | 'incorrect' | null

// @SECTION FLASHCARD_SESSION_HELPERS
function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isAnswerCorrect(card: Flashcard, answer: string) {
  const normalizedAnswer = normalizeAnswer(answer)
  const normalizedCorrect = normalizeAnswer(card.correctAnswer)

  if (!normalizedAnswer) {
    return false
  }

  if (card.answerMode === 'number') {
    return Number(normalizedAnswer) === Number(normalizedCorrect)
  }

  const acceptedAnswers = [
    card.correctAnswer,
    ...(card.acceptableAnswers ?? []),
  ].map(normalizeAnswer)

  return acceptedAnswers.includes(normalizedAnswer)
}

function getCardVisual(card: Flashcard) {
  if (card.cardType === 'vocabulary') {
    return (
      <div className="mt-6 rounded-3xl border border-[#00AFB9]/20 bg-[#E9F7F8]/65 px-6 py-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
          Math Word
        </p>
        <p className="mt-2 text-[2.35rem] font-black leading-tight tracking-[-0.04em] text-[#073B5A]">
          {card.displayPrompt}
        </p>
      </div>
    )
  }

  return (
    <p className="mt-8 text-[4.5rem] font-black leading-none tracking-[-0.05em] text-[#073B5A] drop-shadow-sm">
      {card.displayPrompt}
    </p>
  )
}

// @SECTION FLASHCARD_SESSION_SCREEN
function FlashcardSessionScreen() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const { deckId: routeDeckId } = useParams()
  const deck = getFlashcardDeck(routeDeckId ?? DEFAULT_DECK_ID)
  const deckId = deck.deckId
  const cards = deck.cards
  const cardIds = cards.map((card) => card.id)
  const savedProgress = getFlashcardDeckProgress(
    CURRENT_STUDENT_ID,
    deckId,
    cardIds,
  )

  const [currentCardIndex, setCurrentCardIndex] = useState(
    savedProgress.currentCardIndex,
  )
  const [typedAnswer, setTypedAnswer] = useState('')
  const [result, setResult] = useState<AnswerResult>(null)
  const [knownCardIds, setKnownCardIds] = useState<string[]>(
    savedProgress.knownCardIds,
  )
  const [reviewAgainCardIds, setReviewAgainCardIds] = useState<string[]>(
    savedProgress.reviewAgainCardIds,
  )
  const [answeredCardIds, setAnsweredCardIds] = useState<string[]>(
    savedProgress.answeredCardIds,
  )
  const [deckComplete, setDeckComplete] = useState(savedProgress.completed)

  const currentCard = cards[currentCardIndex] ?? cards[0]
  const answeredCount = answeredCardIds.length
  const progressPercent = (answeredCount / cards.length) * 100
  const progressLabel = `${answeredCount} / ${cards.length}`
  const isCorrect = result === 'correct'
  const isIncorrect = result === 'incorrect'
  const isDeckComplete = deckComplete || (answeredCount >= cards.length && cards.length > 0)

  const ringPercent = Math.round(progressPercent)
  const newCount = Math.max(cards.length - answeredCount, 0)

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (result) {
      if (!isDeckComplete) {
        nextCard()
      }

      return
    }

    const answerIsCorrect = isAnswerCorrect(currentCard, typedAnswer)
    const nextProgress = recordFlashcardAnswer({
      studentId: CURRENT_STUDENT_ID,
      deckId,
      cardId: currentCard.id,
      answerState: answerIsCorrect ? 'known' : 'review_again',
      cardIds,
      currentCardIndex,
    })

    setResult(answerIsCorrect ? 'correct' : 'incorrect')
    setKnownCardIds(nextProgress.knownCardIds)
    setReviewAgainCardIds(nextProgress.reviewAgainCardIds)
    setAnsweredCardIds(nextProgress.answeredCardIds)
    setDeckComplete(nextProgress.completed)
  }

  function handleAnswerKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter' || !result) {
      return
    }

    event.preventDefault()

    if (!isDeckComplete) {
      nextCard()
    }
  }

  function nextCard() {
    if (isDeckComplete) {
      return
    }

    const nextIndex = getNextUnansweredCardIndex(
      cardIds,
      answeredCardIds,
      currentCardIndex + 1,
    )

    setCurrentCardIndex(nextIndex)
    setTypedAnswer('')
    setResult(null)

    window.setTimeout(() => {
      inputRef.current?.focus()
    }, 40)
  }

  function restartDeck() {
    resetFlashcardDeckProgress(CURRENT_STUDENT_ID, deckId)

    setCurrentCardIndex(0)
    setTypedAnswer('')
    setResult(null)
    setKnownCardIds([])
    setReviewAgainCardIds([])
    setAnsweredCardIds([])
    setDeckComplete(false)

    window.setTimeout(() => {
      inputRef.current?.focus()
    }, 40)
  }

  return (
    <PageLayout>
      <div
        data-name="flashcard-session-screen"
        className="grid h-full min-h-0 gap-6 overflow-hidden xl:grid-cols-[minmax(0,1fr)_300px]"
      >
        {/* @SECTION FLASHCARD_SESSION_MAIN */}
        <main
          data-name="flashcard-session-main"
          className="min-h-0 overflow-y-auto pr-1"
        >
          {/* @SECTION FLASHCARD_SESSION_HEADER */}
          <header
            data-name="flashcard-session-header"
            className="mb-4 flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.26em] text-[#00AFB9]">
                Flashcard Session
              </p>

              <h1 className="mt-1 text-[2.15rem] font-black leading-none tracking-[-0.045em] text-[#073B5A]">
                {deck.title}
              </h1>

              <p className="mt-2 text-base font-bold text-[#073B5A]/70">
                {deck.subtitle}
              </p>
            </div>

            <div className="hidden items-center gap-3 2xl:flex">
              <div className="flex items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white px-3.5 py-2.5 shadow-sm">
                <Star size={22} className="text-[#F7B733]" fill="currentColor" />
                <span className="text-lg font-black text-[#073B5A]">1,250</span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-[#073B5A]/10 bg-white px-3.5 py-2.5 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FED9B7] text-xl">
                  👧
                </div>

                <div>
                  <p className="text-[0.82rem] font-black text-[#073B5A]">
                    Ava Johnson
                  </p>
                  <p className="text-xs font-bold text-[#073B5A]/60">3rd Grade</p>
                </div>
              </div>
            </div>
          </header>

          {/* @SECTION FLASHCARD_SESSION_META */}
          <section
            data-name="flashcard-session-meta"
            className="mb-4 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex min-w-[335px] flex-1 items-center gap-4">
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#073B5A]/10">
                <div
                  className="h-full rounded-full bg-[#00AFB9]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="rounded-full border border-[#073B5A]/10 bg-white px-4 py-2 text-base font-black text-[#073B5A] shadow-sm">
                {progressLabel}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-[#4A77FF]/20 bg-[#EFF4FF] px-4 py-2 text-sm font-black text-[#2563EB] shadow-sm">
                <BookOpen size={19} strokeWidth={2.7} />
                {deck.kind === 'vocabulary' ? 'Vocabulary' : deck.kind === 'visual_models' ? 'Visual Models' : 'Math Facts'}
              </div>

              <div className="inline-flex overflow-hidden rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] text-sm font-black text-[#0081A7] shadow-sm">
                <div className="inline-flex items-center gap-2 px-4 py-2">
                  🌱 {deck.unit ? `Unit ${deck.unit}` : 'Deck'}
                </div>

                <button
                  type="button"
                  onClick={restartDeck}
                  aria-label="Restart this flashcard deck"
                  title="Restart this deck"
                  className={`inline-flex items-center justify-center border-l border-[#00AFB9]/20 px-3 transition hover:bg-white hover:text-[#073B5A] ${
                    isDeckComplete
                      ? 'bg-[#FFF8E9] text-[#C78300] shadow-[0_0_14px_rgba(247,183,51,0.38)] ring-2 ring-[#F7B733]/25'
                      : 'bg-white/55 text-[#0081A7]'
                  }`}
                >
                  <RotateCcw size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          </section>

          {/* @SECTION FLASHCARD_CARD_STACK */}
          <section
            data-name="flashcard-card-stack"
            className="relative mx-auto mb-3 max-w-[760px]"
          >
            <div className="absolute -right-8 top-8 h-[285px] w-[130px] rotate-[5deg] rounded-[2rem] border border-[#00AFB9]/30 bg-[#DFF6F7] shadow-sm" />

            <div
              data-name="flashcard-main-card"
              className="relative min-h-[330px] overflow-hidden rounded-[2rem] border border-[#073B5A]/10 bg-[radial-gradient(circle_at_20%_25%,rgba(253,252,220,0.75),transparent_20%),linear-gradient(180deg,#FFFFFF_0%,#FFFDF7_100%)] px-8 py-8 text-center shadow-[0_16px_35px_rgba(7,59,90,0.14)]"
            >
              <span className="absolute left-20 top-24 text-2xl text-[#FDFCDC]">
                ✦
              </span>
              <span className="absolute right-28 top-6 text-5xl text-[#F7B733]">
                ★
              </span>
              <span className="absolute right-20 bottom-20 text-4xl text-[#FDFCDC]">
                ✦
              </span>
              <span className="absolute left-14 bottom-24 text-2xl text-[#FDFCDC]">
                ✦
              </span>

              <div className="relative z-10 flex min-h-[260px] flex-col items-center justify-center">
                {getCardVisual(currentCard)}

                <div className="mt-8 h-1 w-64 rounded-full bg-[#073B5A]/10" />

                <p className="mt-6 text-2xl font-black text-[#7186A3]">
                  {currentCard.tag}
                </p>
              </div>
            </div>
          </section>

          {/* @SECTION FLASHCARD_ANSWER_RESULT */}
          <section
            data-name="flashcard-answer-result"
            className={`mx-auto mb-3 flex min-h-[86px] max-w-[840px] items-center justify-center rounded-3xl border px-5 py-3 shadow-sm transition ${
              isCorrect
                ? 'border-[#6BBF45] bg-[#F0FBEA]'
                : isIncorrect
                  ? 'border-[#F07167] bg-[#FCE9E5]'
                  : 'border-[#073B5A]/10 bg-white'
            }`}
          >
            {result ? (
              <div className="grid w-full items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm ${
                      isCorrect ? 'bg-[#6BBF45]' : 'bg-[#F07167]'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 size={28} strokeWidth={3} />
                    ) : (
                      <RotateCcw size={26} strokeWidth={3} />
                    )}
                  </div>

                  <p
                    className={`text-2xl font-black ${
                      isCorrect ? 'text-[#3A9E2B]' : 'text-[#D94F45]'
                    }`}
                  >
                    {isCorrect ? 'Correct!' : 'Not quite.'}
                  </p>
                </div>

                <div className="text-center">
                  <p
                    className={`text-[3.5rem] font-black leading-none ${
                      isCorrect ? 'text-[#3A9E2B]' : 'text-[#D94F45]'
                    }`}
                  >
                    {currentCard.correctAnswer}
                  </p>
                </div>

                <p className="text-sm font-bold leading-snug text-[#073B5A]/70">
                  {isCorrect
                    ? currentCard.explanation
                    : `The answer is ${currentCard.correctAnswer}. ${currentCard.explanation}`}
                </p>
              </div>
            ) : (
              <p className="text-base font-black text-[#073B5A]/55">
                Type your answer and submit when you’re ready.
              </p>
            )}
          </section>

          {/* @SECTION FLASHCARD_INPUT_CONTROLS */}
          <form
            data-name="flashcard-input-controls"
            onSubmit={submitAnswer}
            className="mx-auto mb-3 flex max-w-[645px] items-center gap-3"
          >
            <input
              ref={inputRef}
              value={typedAnswer}
              onChange={(event) => setTypedAnswer(event.target.value)}
              onKeyDown={handleAnswerKeyDown}
              placeholder={result ? 'Answer submitted' : 'Type your answer...'}
              readOnly={result !== null}
              className={`h-16 min-w-0 flex-1 rounded-2xl border px-5 text-xl font-black text-[#073B5A] shadow-sm outline-none transition placeholder:text-[#9AB5C7] focus:border-[#00AFB9] focus:ring-4 focus:ring-[#00AFB9]/15 ${
                result
                  ? 'cursor-not-allowed border-[#073B5A]/10 bg-[#F1F5F7] text-[#073B5A]/55'
                  : 'border-[#073B5A]/15 bg-white'
              }`}
            />

            <button
              type="submit"
              disabled={isDeckComplete}
              className={`flex h-16 w-20 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_10px_22px_rgba(0,175,185,0.28)] transition ${
                isDeckComplete
                  ? 'cursor-not-allowed bg-[#9AB5C7]'
                  : result
                    ? 'bg-[#073B5A] hover:bg-[#052E46]'
                    : 'bg-[#00AFB9] hover:bg-[#0081A7]'
              }`}
              aria-label="Submit answer"
            >
              <Check size={32} strokeWidth={3.2} />
            </button>

            {result && !isDeckComplete && (
              <button
                type="button"
                onClick={nextCard}
                className="hidden h-16 rounded-2xl bg-[#073B5A] px-5 text-sm font-black text-white shadow-sm transition hover:bg-[#052E46] md:inline-flex md:items-center"
              >
                Next Card
              </button>
            )}

            {isDeckComplete && (
              <Link
                to="/flashcards"
                className="inline-flex h-16 items-center justify-center gap-2 rounded-2xl border border-[#F7B733] bg-[#FFF8E9] px-5 text-sm font-black text-[#073B5A] shadow-[0_0_0_5px_rgba(247,183,51,0.20),0_0_28px_rgba(247,183,51,0.55),0_16px_34px_rgba(247,183,51,0.34)] ring-4 ring-[#F7B733]/25 transition hover:bg-[#FDFCDC]"
              >
                <Star size={18} fill="currentColor" className="text-[#F7B733]" />
                Back to Flashcards
              </Link>
            )}
          </form>

          {/* @SECTION FLASHCARD_ENCOURAGEMENT */}
          <section
            data-name="flashcard-encouragement-card"
            className="relative mx-auto flex max-w-[920px] items-center gap-5 overflow-hidden rounded-3xl border border-[#F4D589] bg-[#FFF8E9] px-6 py-4 shadow-sm"
          >
            <img
              src={mascotAsset('star-happy.png')}
              alt="Happy star mascot"
              className="h-24 w-24 shrink-0 object-contain"
            />

            <div className="relative z-10">
              <p className="text-xl font-black text-[#073B5A]">
                {isDeckComplete ? 'Deck complete! ⭐' : 'Keep going! ⭐'}
              </p>
              <p className="mt-1 text-base font-bold text-[#275875]">
                {isDeckComplete
                  ? 'Great review! Head back to Flashcards when you’re ready.'
                  : 'Every card review builds stronger math confidence.'}
              </p>
            </div>

            <span className="absolute right-24 top-5 text-5xl text-white/60">
              ★
            </span>
            <span className="absolute bottom-4 right-44 text-3xl text-white/60">
              ★
            </span>
          </section>
        </main>

        {/* @SECTION FLASHCARD_SESSION_SIDEBAR */}
        <aside
          data-name="flashcard-session-sidebar"
          className="hidden min-h-0 space-y-4 overflow-y-auto xl:block"
        >
          <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-[#073B5A]">Deck Progress</h2>
              <p className="rounded-full bg-[#E9F7F8] px-3 py-1 text-sm font-black text-[#0081A7]">
                {progressLabel}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative grid h-32 w-32 shrink-0 place-items-center">
                <svg
                  viewBox="0 0 140 140"
                  className="absolute inset-0 h-full w-full -rotate-90 overflow-visible"
                  aria-hidden="true"
                >
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="#E6ECEF"
                    strokeWidth="13"
                  />
                  <circle
                    cx="70"
                    cy="70"
                    r="50"
                    fill="none"
                    stroke="#00AFB9"
                    strokeWidth="13"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 50 * (1 - ringPercent / 100)
                    }`}
                  />
                </svg>

                <div className="relative z-10 text-center">
                  <p className="text-[1.65rem] font-black leading-none tracking-[-0.06em] text-[#073B5A]">
                    {ringPercent}%
                  </p>
                  <p className="mt-0.5 text-[0.68rem] font-bold leading-none text-[#275875]">
                    Complete
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm font-bold text-[#275875]">
                <p className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#00AFB9]" />
                  <span className="min-w-6 text-base font-black text-[#073B5A]">
                    {knownCardIds.length}
                  </span>
                  Known
                </p>

                <p className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#F07167]" />
                  <span className="min-w-6 text-base font-black text-[#073B5A]">
                    {reviewAgainCardIds.length}
                  </span>
                  Review Again
                </p>

                <p className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-[#DCE5EA]" />
                  <span className="min-w-6 text-base font-black text-[#073B5A]">
                    {newCount}
                  </span>
                  New
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#073B5A]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#6BBF45] text-white shadow-sm">
                  <CheckCircle2 size={28} strokeWidth={3} />
                </div>

                <div>
                  <p className="text-lg font-black text-[#073B5A]">Known</p>
                  <p className="text-sm font-bold text-[#275875]/80">
                    Cards you’ve mastered
                  </p>
                </div>
              </div>

              <p className="text-2xl font-black text-[#073B5A]">
                {knownCardIds.length}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F28C28] text-white shadow-sm">
                  <RotateCcw size={27} strokeWidth={3} />
                </div>

                <div>
                  <p className="text-lg font-black text-[#073B5A]">Review Again</p>
                  <p className="text-sm font-bold text-[#275875]/80">
                    Keep practicing!
                  </p>
                </div>
              </div>

              <p className="text-2xl font-black text-[#073B5A]">
                {reviewAgainCardIds.length}
              </p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-[#073B5A]">Today’s Goal</h2>
              <button
                type="button"
                className="text-sm font-black text-[#0081A7]"
              >
                Change
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-[#FCE9E5] text-4xl shadow-sm">
                🎯
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-sm font-black text-[#073B5A]">
                  <span>Review 10 cards</span>
                  <span>
                    {answeredCount} / {cards.length}
                  </span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#073B5A]/10">
                  <div
                    className="h-full rounded-full bg-[#00AFB9]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🔥</div>

              <div>
                <p className="text-lg font-black text-[#073B5A]">
                  Current Streak
                </p>

                <p className="mt-1 text-3xl font-black text-[#073B5A]">
                  7 <span className="text-base text-[#275875]">days</span>
                </p>

                <p className="mt-1 text-sm font-bold text-[#275875]/80">
                  Amazing streak! Keep it up! 🎉
                </p>
              </div>
            </div>
          </section>

          <Link
            to="/flashcards"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-black shadow-sm transition ${
              isDeckComplete
                ? 'border-[#F7B733] bg-[#FFF8E9] text-[#073B5A] shadow-sm hover:bg-[#FDFCDC]'
                : 'border-[#073B5A]/10 bg-white text-[#0081A7] hover:bg-[#E9F7F8]'
            }`}
          >
            {isDeckComplete ? (
              <Star size={18} fill="currentColor" className="text-[#F7B733]" />
            ) : (
              <ArrowLeft size={18} strokeWidth={3} />
            )}
            {isDeckComplete ? 'Back to Flashcards' : 'Back to Flashcards'}
          </Link>
        </aside>
      </div>
    </PageLayout>
  )
}

export default FlashcardSessionScreen
