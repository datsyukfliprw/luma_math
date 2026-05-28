// @SECTION WORDS_IMPORTS
import { useState } from "react";
import { BookOpen, CheckCircle2, Sparkles, Star } from "lucide-react";
import LumaAvatar from "../../components/luma/LumaAvatar";

// @SECTION WORDS_PAGE
function WordsPage() {
  // @SECTION WORDS_DATA
  const vocabularyWords = [
    {
      word: "equal groups",
      definition: "Same amount in each group.",
      example: "4 groups of 1",
      visual: ["⭐", "⭐", "⭐", "⭐"],
      equation: "4 groups of 1",
      color: "bg-[#E9F7F8]",
      border: "border-[#00AFB9]/25",
      labelColor: "text-[#0081A7]",
    },
    {
      word: "repeated addition",
      definition: "Adding the same number again and again.",
      example: "1 + 1 + 1 + 1",
      visual: ["1", "+", "1", "+", "1", "+", "1"],
      equation: "1 + 1 + 1 + 1 = 4",
      color: "bg-[#FFF3D9]",
      border: "border-[#F7B733]/30",
      labelColor: "text-[#C78300]",
    },
    {
      word: "factor",
      definition: "A number being multiplied.",
      example: "4 and 1 are factors",
      visual: ["4", "×", "1"],
      equation: "factor × factor",
      color: "bg-[#FCE9E5]",
      border: "border-[#F07167]/25",
      labelColor: "text-[#F07167]",
    },
    {
      word: "product",
      definition: "The answer to a multiplication problem.",
      example: "4 is the product",
      visual: ["4", "×", "1", "=", "4"],
      equation: "product = answer",
      color: "bg-[#F8FBFB]",
      border: "border-[#073B5A]/10",
      labelColor: "text-[#073B5A]",
    },
  ];

  const matchingCards = [
    {
      id: "equal-groups-visual",
      correctWord: "equal groups",
      title: "Same-size groups",
      color: "bg-[#E9F7F8]",
      border: "border-[#00AFB9]/25",
    },
    {
      id: "repeated-addition-visual",
      correctWord: "repeated addition",
      title: "Add again and again",
      color: "bg-[#FFF3D9]",
      border: "border-[#F7B733]/30",
    },
    {
      id: "factor-visual",
      correctWord: "factor",
      title: "Numbers being multiplied",
      color: "bg-[#FCE9E5]",
      border: "border-[#F07167]/25",
    },
    {
      id: "product-visual",
      correctWord: "product",
      title: "The answer",
      color: "bg-[#F8FBFB]",
      border: "border-[#073B5A]/10",
    },
  ];

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
      setMatchMessage(
        "Pick a word choice first, then tap its matching picture.",
      );
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

    setMatchMessage(
      `Almost! Try matching "${selectedWord}" to another picture.`,
    );
  }

  // @SECTION WORDS_MATCHING_VISUAL_RENDERER
  function renderMatchingVisual(cardId: string) {
    if (cardId === "equal-groups-visual") {
      return (
        <div className="grid grid-cols-2 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#00AFB9]/20 bg-white text-base shadow-inner"
            >
              ⭐
            </div>
          ))}
        </div>
      );
    }

    if (cardId === "repeated-addition-visual") {
      return (
        <div className="flex flex-wrap items-center justify-center gap-1 text-base font-black text-[#073B5A]">
          {["1", "+", "1", "+", "1", "+", "1"].map((piece, index) => (
            <span
              key={`${piece}-${index}`}
              className={`flex h-7 min-w-7 items-center justify-center rounded-lg ${
                piece === "+"
                  ? "bg-transparent text-[#9AB5C7]"
                  : "bg-white px-1.5 shadow-inner"
              }`}
            >
              {piece}
            </span>
          ))}
        </div>
      );
    }

    if (cardId === "factor-visual") {
      return (
        <div className="flex items-center justify-center gap-1.5 text-lg font-black text-[#073B5A]">
          <span className="rounded-xl bg-white px-3 py-1.5 text-[#F07167] shadow-inner">
            4
          </span>
          <span className="text-[#9AB5C7]">×</span>
          <span className="rounded-xl bg-white px-3 py-1.5 text-[#F07167] shadow-inner">
            1
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1.5 text-lg font-black text-[#073B5A]">
        <span>4</span>
        <span className="text-[#9AB5C7]">×</span>
        <span>1</span>
        <span className="text-[#9AB5C7]">=</span>
        <span className="rounded-xl bg-white px-3 py-1.5 text-[#00AFB9] shadow-inner">
          4
        </span>
      </div>
    );
  }

  return (
    <>
      {/* @SECTION WORDS_MAIN_CARD */}
      <main
        data-name="words-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
      >
        {/* @SECTION WORDS_HEADER_TABS */}
        <section
          data-name="words-header-and-navigation-card"
          className="mb-3 rounded-[1.5rem] border border-[#073B5A]/10 bg-[#F8FBFB] p-3 shadow-sm"
        >
          <div
            data-name="words-header-and-navigation-top-row"
            className="mb-3 flex flex-wrap items-start justify-between gap-3"
          >
            <div
              data-name="words-header-title-group"
              className="flex items-start gap-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
                <BookOpen size={26} strokeWidth={2.7} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-[#073B5A]">
                  Math Words
                </h2>
                <p className="mt-0.5 text-sm font-bold leading-relaxed text-[#275875]">
                  Learn each word, then match it to the picture it explains.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
              Page 4 of 5
            </div>
          </div>

          <div
            data-name="words-internal-step-tabs"
            className="grid gap-2 sm:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setWordsStep("learn")}
              data-name="words-step-learn-button"
              className={`rounded-2xl px-4 py-2.5 text-left transition ${
                wordsStep === "learn"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 1
              </p>
              <p className="mt-0.5 text-sm font-black">Learn word cards</p>
            </button>

            <button
              type="button"
              onClick={() => setWordsStep("match")}
              data-name="words-step-match-button"
              className={`rounded-2xl px-4 py-2.5 text-left transition ${
                wordsStep === "match"
                  ? "bg-[#00AFB9] text-white shadow-sm"
                  : "bg-white text-[#073B5A] hover:bg-[#E9F7F8]"
              }`}
            >
              <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-80">
                Step 2
              </p>
              <p className="mt-0.5 text-sm font-black">Matching activity</p>
            </button>
          </div>
        </section>

        {wordsStep === "learn" ? (
          <>
            {/* @SECTION WORDS_LEARN_CARDS */}
            <div
              data-name="words-vocabulary-grid"
              className="grid gap-2.5 md:grid-cols-2"
            >
              {vocabularyWords.map((item, index) => (
                <section
                  key={item.word}
                  data-name={`words-vocabulary-card-${index + 1}`}
                  className={`rounded-[1.5rem] border ${item.border} ${item.color} p-4 shadow-sm`}
                >
                  <div
                    data-name={`words-vocabulary-card-${index + 1}-header`}
                    className="mb-3 flex items-start justify-between gap-3"
                  >
                    <div>
                      <p
                        className={`text-[0.68rem] font-black uppercase tracking-[0.14em] ${item.labelColor}`}
                      >
                        Word {index + 1}
                      </p>

                      <h3 className="mt-0.5 text-xl font-black text-[#073B5A]">
                        {item.word}
                      </h3>
                    </div>

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-base font-black text-[#00AFB9] shadow-sm">
                      ✦
                    </div>
                  </div>

                  <p
                    data-name={`words-vocabulary-card-${index + 1}-definition`}
                    className="text-sm font-black leading-relaxed text-[#073B5A]"
                  >
                    {item.definition}
                  </p>

                  <div
                    data-name={`words-vocabulary-card-${index + 1}-visual`}
                    className="mt-3 rounded-2xl border border-white/80 bg-white p-3 shadow-sm"
                  >
                    <div className="flex min-h-10 flex-wrap items-center justify-center gap-1.5 text-xl font-black text-[#073B5A]">
                      {item.visual.map((piece, pieceIndex) => (
                        <span
                          key={`${item.word}-${piece}-${pieceIndex}`}
                          className={`flex min-h-8 min-w-8 items-center justify-center rounded-xl px-1.5 ${
                            piece === "+" || piece === "×" || piece === "="
                              ? "bg-transparent text-[#9AB5C7]"
                              : "bg-[#F8FBFB]"
                          }`}
                        >
                          {piece}
                        </span>
                      ))}
                    </div>

                    <p className="mt-2 text-center text-xs font-black text-[#0081A7]">
                      {item.equation}
                    </p>
                  </div>

                  <div
                    data-name={`words-vocabulary-card-${index + 1}-example`}
                    className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/75 px-3 py-2"
                  >
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-[#275875]/70">
                      Example
                    </p>

                    <p className="text-xs font-black text-[#073B5A]">
                      {item.example}
                    </p>
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
              className="mb-3 rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-2.5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Matching activity
                  </p>

                  <h3 className="mt-0.5 text-base font-black text-[#073B5A]">
                    {isMatchingComplete
                      ? "Great matching! Luma is fully charged!"
                      : matchMessage}
                  </h3>
                </div>

                {isMatchingComplete && (
                  <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#C78300] shadow-sm">
                    Full charge!
                    <Sparkles
                      size={18}
                      strokeWidth={2.7}
                      className="text-[#F7B733]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* @SECTION WORDS_MATCH_VISUALS */}
            <section
              data-name="words-matching-visual-grid"
              className="grid gap-2.5 sm:grid-cols-2"
            >
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
                    className={`min-h-[118px] rounded-[1.35rem] border ${card.border} ${card.color} p-3 text-left shadow-sm transition ${
                      isMatched
                        ? "cursor-default ring-2 ring-[#00AFB9]/25"
                        : "hover:scale-[1.01] hover:shadow-md"
                    }`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                          Picture {index + 1}
                        </p>
                        <h3 className="mt-0.5 text-sm font-black text-[#073B5A]">
                          {card.title}
                        </h3>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1 text-xs font-black shadow-sm ${
                          isMatched
                            ? "bg-white text-[#0081A7]"
                            : "bg-white/75 text-[#275875]/60"
                        }`}
                      >
                        {matchedWord ? `✓ ${matchedWord}` : "Tap"}
                      </div>
                    </div>

                    <div
                      data-name={`words-matching-visual-card-${index + 1}-picture`}
                      className="flex min-h-[54px] items-center justify-center rounded-2xl bg-white/80 px-3 py-2 shadow-inner"
                    >
                      {renderMatchingVisual(card.id)}
                    </div>
                  </button>
                );
              })}
            </section>

            {/* @SECTION WORDS_MATCH_WORD_CHOICES */}
            <section
              data-name="words-matching-word-choice-grid"
              className="mt-3 grid gap-2.5 sm:grid-cols-2"
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
                    data-name={`words-matching-word-${item.word.replaceAll(
                      " ",
                      "-",
                    )}`}
                    className={`rounded-2xl border px-4 py-2.5 text-left shadow-sm transition ${
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
      <aside data-name="words-right-sidebar" className="flex flex-col gap-4">
        {/* @SECTION WORDS_LUMA_CHARGE */}
        <section
          data-name="words-luma-charge-card"
          className="relative min-h-[155px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/30 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div
              data-name="words-luma-charge-title-row"
              className="mb-3 flex items-center gap-2"
            >
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />

              <p className="text-lg font-black text-[#C78300]">
                {wordsStep === "match" ? "Luma’s Charge" : "Luma Tip"}
              </p>
            </div>

            {wordsStep === "match" ? (
              <div
                data-name="words-luma-charge-content"
                className="max-w-[190px]"
              >
                <div
                  data-name="words-luma-charge-progress-box"
                  className="inline-flex items-end gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm"
                >
                  <span className="text-3xl font-black leading-none text-[#073B5A]">
                    {matchedCount}
                  </span>

                  <span className="pb-0.5 text-base font-black text-[#073B5A]/70">
                    / {matchingCards.length} matched
                  </span>
                </div>

                <p className="mt-2 text-sm font-black leading-relaxed text-[#073B5A]/70">
                  {isMatchingComplete
                    ? "Full charge! Great matching."
                    : "Match words to power up Luma."}
                </p>

                <div
                  data-name="words-luma-charge-progress-bar"
                  className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/80 shadow-inner"
                >
                  <div
                    className="h-full rounded-full bg-[#F7B733] transition-all duration-300"
                    style={{
                      width: `${(matchedCount / matchingCards.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div
                data-name="words-luma-tip-box"
                className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm"
              >
                Math words
                <br />
                explain your
                <br />
                thinking!
              </div>
            )}
          </div>

          <div className="absolute bottom-[-34px] right-[-8px] w-32">
            <LumaAvatar
              size="lg"
              state={isMatchingComplete ? "celebrate" : "happy"}
              showEnergy={false}
            />
          </div>
        </section>

        {/* @SECTION WORDS_SAY_IT_CARD */}
        <section
          data-name="words-say-it-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              💬
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Say It Like This
              </h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Math talk
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3">
              <p className="text-sm font-black text-[#0081A7]">Say it</p>

              <p className="mt-1 text-xl font-black text-[#073B5A]">
                4 groups of 1
              </p>
            </div>

            <div className="rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-3">
              <p className="text-sm font-black text-[#0081A7]">Write it</p>

              <p className="mt-1 text-xl font-black text-[#073B5A]">
                4 × 1 = 4
              </p>
            </div>
          </div>
        </section>

        {/* @SECTION WORDS_PATTERN_CARD */}
        <section
          data-name="words-mini-pattern-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Mini Pattern
              </h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Keep it straight
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-center text-lg font-black text-[#073B5A]">
                groups × in each = total
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <p className="text-center text-lg font-black text-[#073B5A]">
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
