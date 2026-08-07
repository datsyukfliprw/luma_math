// @SECTION WORDS_IMPORTS
import { useState } from "react";
import { BookOpen, CheckCircle2 } from "lucide-react";
import {
  getMatchingCards,
  getVocabularyWords,
  type LearnLesson,
  type MatchingCard,
} from "../../lib/learnContent";

// @SECTION WORDS_TYPES
type WordsPageProps = {
  lesson: LearnLesson;
};

function WordsPage({ lesson }: WordsPageProps) {
  // @SECTION WORDS_DATA
  const vocabularyWords = getVocabularyWords(lesson);

  const matchingCards = getMatchingCards(lesson);

  // @SECTION WORDS_STATE
  const [wordsStep, setWordsStep] = useState<"learn" | "match">("learn");
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [matchMessage, setMatchMessage] = useState(
    "Tap a word choice, then tap its matching picture.",
  );

  const matchedWords = Object.values(matches);
  const matchedCount = matchedWords.length;
  const isMatchingComplete = matchedCount === matchingCards.length;

  // @SECTION WORDS_HELPERS
  function isWordMatched(word: string) {
    return matchedWords.includes(word);
  }

  function chooseWord(word: string) {
    if (isWordMatched(word)) {
      return;
    }

    setSelectedWord(word);
    setMatchMessage(`Now tap the picture that shows "${word}".`);
  }

  function chooseVisual(cardId: string, correctWord: string) {
    if (matches[cardId]) {
      return;
    }

    if (!selectedWord) {
      setMatchMessage("Pick a word choice first, then tap its matching picture.");
      return;
    }

    if (selectedWord === correctWord) {
      setMatches((currentMatches) => ({
        ...currentMatches,
        [cardId]: selectedWord,
      }));

      setSelectedWord(null);
      setMatchMessage(`Nice! "${correctWord}" matches that picture.`);
      return;
    }

    setMatchMessage(`Almost! Try matching "${selectedWord}" to another picture.`);
  }

  // @SECTION WORDS_MATCHING_VISUAL_RENDERER
  function renderMatchingVisual(card: MatchingCard) {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-base font-black text-[#073B5A]">
          {card.visual.map((piece, index) => {
            const isOperator = piece === "+" || piece === "×" || piece === "=";

            return (
              <span
                key={`${card.id}-${piece}-${index}`}
                className={`flex min-h-7 min-w-7 items-center justify-center rounded-lg px-1.5 ${
                  isOperator ? "bg-transparent text-[#9AB5C7]" : "bg-white shadow-inner"
                }`}
              >
                {piece}
              </span>
            );
          })}
        </div>

        <p className="text-center text-xs font-black text-[#0081A7]">{card.equation}</p>
      </div>
    );
  }

  return (
    <>
      {/* @SECTION WORDS_MAIN_CARD */}
      <main
        data-name="words-main-card"
        className="w-full rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-3 shadow-sm"
      >
        {/* @SECTION WORDS_HEADER_TABS */}
        <section
          data-name="words-header-and-navigation-card"
          className="mb-2 rounded-[1.35rem] border border-[#073B5A]/10 bg-[#F8FBFB] p-2.5 shadow-sm"
        >
          <div
            data-name="words-header-and-navigation-top-row"
            className="mb-2 flex flex-wrap items-start justify-between gap-3"
          >
            <div data-name="words-header-title-group" className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9F7F8] text-[#00AFB9]">
                <BookOpen size={22} strokeWidth={2.7} />
              </div>

              <div>
                <h2 className="text-[1.35rem] font-black leading-tight text-[#073B5A]">Math Words</h2>
                <p className="mt-0.5 text-[0.82rem] font-bold leading-snug text-[#275875]">
                  Learn each word, then match it to the picture it explains.
                </p>
              </div>
            </div>

          </div>

          <div data-name="words-internal-step-tabs" className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setWordsStep("learn")}
              data-name="words-step-learn-button"
              className={`rounded-xl px-4 py-2 text-left transition ${
                wordsStep === "learn"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 1
              </p>
              <p className="text-sm font-black">Learn word cards</p>
            </button>

            <button
              type="button"
              onClick={() => setWordsStep("match")}
              data-name="words-step-match-button"
              className={`rounded-xl px-4 py-2 text-left transition ${
                wordsStep === "match"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 2
              </p>
              <p className="text-sm font-black">Matching activity</p>
            </button>
          </div>
        </section>

        {wordsStep === "learn" ? (
          <>
            {/* @SECTION WORDS_LEARN_CARDS */}
            <div data-name="words-vocabulary-grid" className="grid gap-2 md:grid-cols-2">
              {vocabularyWords.map((item, index) => (
                <section
                  key={item.word}
                  data-name={`words-vocabulary-card-${index + 1}`}
                  className={`rounded-[1.35rem] border ${item.border} ${item.color} p-3 shadow-sm`}
                >
                  <div
                    data-name={`words-vocabulary-card-${index + 1}-header`}
                    className="mb-2 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p
                        className={`text-[0.62rem] font-black uppercase tracking-[0.14em] ${item.labelColor}`}
                      >
                        Word {index + 1}
                      </p>

                      <h3 className="text-lg font-black leading-tight text-[#073B5A]">{item.word}</h3>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-[#00AFB9] shadow-sm">
                      <BookOpen size={15} strokeWidth={2.7} />
                    </div>
                  </div>

                  <p
                    data-name={`words-vocabulary-card-${index + 1}-definition`}
                    className="text-[0.82rem] font-black leading-snug text-[#073B5A]"
                  >
                    {item.definition}
                  </p>

                  <div
                    data-name={`words-vocabulary-card-${index + 1}-visual`}
                    className="mt-2 rounded-xl border border-white/80 bg-white p-2 shadow-sm"
                  >
                    <div className="flex min-h-8 flex-wrap items-center justify-center gap-1.5 text-lg font-black text-[#073B5A]">
                      {item.visual.map((piece, pieceIndex) => (
                        <span
                          key={`${item.word}-${piece}-${pieceIndex}`}
                          className={`flex min-h-7 min-w-7 items-center justify-center rounded-lg px-1.5 ${
                            piece === "+" || piece === "×" || piece === "="
                              ? "bg-transparent text-[#9AB5C7]"
                              : "bg-[#F8FBFB]"
                          }`}
                        >
                          {piece}
                        </span>
                      ))}
                    </div>

                    <p className="mt-1 text-center text-[0.68rem] font-black text-[#0081A7]">
                      {item.equation}
                    </p>
                  </div>

                  <div
                    data-name={`words-vocabulary-card-${index + 1}-example`}
                    className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-white/75 px-3 py-1.5"
                  >
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.14em] text-[#275875]/70">
                      Example
                    </p>

                    <p className="text-[0.7rem] font-black text-[#073B5A]">{item.example}</p>
                  </div>
                </section>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* @SECTION WORDS_MATCH_ACTIVITY */}
            <section
              data-name="words-matching-instructions"
              className="mb-2 rounded-[1.25rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-2 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Matching activity
                  </p>

                  <h3 className="mt-0.5 text-base font-black text-[#073B5A]">
                    {isMatchingComplete ? "Great matching! You matched every word." : matchMessage}
                  </h3>
                </div>

                {isMatchingComplete && (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#0081A7] shadow-sm">
                    All matched
                    <CheckCircle2 size={18} strokeWidth={2.7} />
                  </div>
                )}
              </div>
            </section>

            {/* @SECTION WORDS_MATCH_VISUALS */}
            <section data-name="words-matching-visual-grid" className="grid gap-2.5 sm:grid-cols-2">
              {matchingCards.map((card, index) => {
                const matchedWord = matches[card.id];
                const isMatched = Boolean(matchedWord);

                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => chooseVisual(card.id, card.correctWord)}
                    disabled={isMatched}
                    data-name={`words-matching-visual-card-${index + 1}`}
                    className={`min-h-[100px] rounded-[1.25rem] border ${card.border} ${card.color} p-3 text-left shadow-sm transition ${
                      isMatched
                        ? "cursor-default ring-2 ring-[#00AFB9]/25"
                        : "hover:shadow-md"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                          Picture {index + 1}
                        </p>
                        <h3 className="mt-0.5 text-sm font-black text-[#073B5A]">{card.title}</h3>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${
                          isMatched ? "bg-white text-[#0081A7]" : "bg-white/75 text-[#275875]/60"
                        }`}
                      >
                        {matchedWord ? `✓ ${matchedWord}` : "Tap"}
                      </div>
                    </div>

                    <div
                      data-name={`words-matching-visual-card-${index + 1}-picture`}
                      className="flex min-h-[46px] items-center justify-center rounded-xl bg-white/80 px-3 py-2 shadow-inner"
                    >
                      {renderMatchingVisual(card)}
                    </div>
                  </button>
                );
              })}
            </section>

            {/* @SECTION WORDS_MATCH_WORD_CHOICES */}
            <section
              data-name="words-matching-word-choice-grid"
              className="mt-2 grid gap-2 sm:grid-cols-2"
            >
              {vocabularyWords.map((item) => {
                const isSelected = selectedWord === item.word;
                const isMatched = isWordMatched(item.word);

                return (
                  <button
                    key={item.word}
                    type="button"
                    onClick={() => chooseWord(item.word)}
                    disabled={isMatched}
                    data-name={`words-matching-word-${item.word.replaceAll(" ", "-")}`}
                    className={`rounded-xl border px-4 py-2 text-left shadow-sm transition ${
                      isMatched
                        ? "cursor-default border-[#00AFB9]/25 bg-[#E9F7F8] text-[#0081A7]"
                        : isSelected
                          ? "border-[#F7B733] bg-[#FFF3D9] text-[#073B5A] ring-2 ring-[#F7B733]/30"
                          : "border-[#073B5A]/10 bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] opacity-70">
                          Word choice
                        </p>

                        <p className="mt-0.5 text-sm font-black">{item.word}</p>
                      </div>

                      {isMatched && <CheckCircle2 size={18} strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </section>
          </>
        )}
      </main>

      {/* @SECTION WORDS_SIDEBAR */}
      <aside data-name="words-right-sidebar" className="flex flex-col gap-3">
        {/* @SECTION WORDS_PROGRESS_CARD */}
        <section
          data-name="words-progress-card"
          className="rounded-[1.35rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Word Progress</h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                {wordsStep === "match" ? "Match the ideas" : "Learn the language"}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9F7F8] text-[#0081A7] shadow-inner">
              <BookOpen size={21} strokeWidth={2.7} />
            </div>
          </div>

          {wordsStep === "match" ? (
            <>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-3xl font-black leading-none text-[#073B5A]">{matchedCount}</span>
                <span className="pb-0.5 text-sm font-black text-[#073B5A]/65">
                  of {matchingCards.length} matched
                </span>
              </div>

              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#E6EEF2] shadow-inner">
                <div
                  className="h-full rounded-full bg-[#00AFB9] transition-all duration-300"
                  style={{ width: `${(matchedCount / matchingCards.length) * 100}%` }}
                />
              </div>

              <p className="mt-2 text-[0.82rem] font-bold leading-snug text-[#275875]">
                {isMatchingComplete
                  ? "You connected every word to its math picture."
                  : "Match each word to the picture that explains it."}
              </p>
            </>
          ) : (
            <p className="mt-3 text-[0.82rem] font-bold leading-snug text-[#275875]">
              Read each word card, say the word aloud, and notice how the example shows its meaning.
            </p>
          )}
        </section>

        {/* @SECTION WORDS_SAY_IT_CARD */}
        <section
          data-name="words-say-it-card"
          className="rounded-[1.35rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E9F7F8] text-xl">
              💬
            </div>

            <div>
              <h2 className="text-lg font-black text-[#073B5A]">Say It Like This</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Math talk
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-2.5">
              <p className="text-sm font-black text-[#0081A7]">Say it</p>

              <p className="mt-0.5 text-lg font-black text-[#073B5A]">4 groups of 1</p>
            </div>

            <div className="rounded-xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-2.5">
              <p className="text-sm font-black text-[#0081A7]">Write it</p>

              <p className="mt-0.5 text-lg font-black text-[#073B5A]">4 × 1 = 4</p>
            </div>
          </div>
        </section>

        {/* @SECTION WORDS_PATTERN_CARD */}
        <section
          data-name="words-mini-pattern-card"
          className="rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-black text-[#00AFB9] shadow-sm">
              =
            </div>

            <div>
              <h2 className="text-lg font-black text-[#073B5A]">Mini Pattern</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Keep it straight
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <p className="text-center text-base font-black text-[#073B5A]">
                groups × in each = total
              </p>
            </div>

            <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <p className="text-center text-base font-black text-[#073B5A]">
                factor × factor = product
              </p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

export default WordsPage;
