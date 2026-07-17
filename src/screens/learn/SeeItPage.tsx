// @SECTION SEEIT_IMPORTS
import { useState } from "react";
import { Binoculars, BookOpen, Search, Sparkles, Star } from "lucide-react";
import LumaAvatar from "../../components/luma/LumaAvatar";
import { getSeeItClues, type LearnLesson } from "../../lib/learnContent";

// @SECTION SEEIT_TYPES
type SeeItClue = {
  visualLabel: string;
  groups: number;
  inEach: number;
  choices: string[];
  sneakyEquation: string;
  feedback: string;
  tip: string;
  ruleFocus: "identity" | "zero" | "product";
};

// @SECTION SEEIT_PAGE
type SeeItPageProps = {
  lesson: LearnLesson;
  starName: string;
};

function SeeItPage({ lesson, starName }: SeeItPageProps) {
  // @SECTION SEEIT_DATA
  const clues: SeeItClue[] = getSeeItClues(lesson);

  // @SECTION SEEIT_STATE
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [selectedEquation, setSelectedEquation] = useState<string | null>(null);
  const [foundClues, setFoundClues] = useState<number[]>([]);

  const currentClue = clues[currentClueIndex];
  const isSneakyFound = selectedEquation === currentClue.sneakyEquation;
  const hasSelected = selectedEquation !== null;
  const cluesFoundCount = foundClues.length;
  const isPatrolComplete = cluesFoundCount === clues.length;

  // @SECTION SEEIT_HELPERS
  function chooseEquation(equation: string) {
    setSelectedEquation(equation);

    if (equation === currentClue.sneakyEquation && !foundClues.includes(currentClueIndex)) {
      setFoundClues((currentFoundClues) => [...currentFoundClues, currentClueIndex]);
    }
  }

  function goToNextClue() {
    if (currentClueIndex < clues.length - 1) {
      setCurrentClueIndex((currentIndex) => currentIndex + 1);
      setSelectedEquation(null);
    }
  }

  function goToClue(index: number) {
    setCurrentClueIndex(index);
    setSelectedEquation(null);
  }

  function renderGroupVisual() {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {Array.from({ length: currentClue.groups }).map((_, groupIndex) => (
          <div key={groupIndex} className="flex items-center gap-3">
            <div className="flex h-20 w-24 items-center justify-center rounded-[1.35rem] border border-[#F7B733]/35 bg-[#FFF9E8] text-4xl shadow-sm">
              {currentClue.inEach === 0 ? <span className="text-[#9AB5C7]">∅</span> : "⭐"}
            </div>

            {groupIndex < currentClue.groups - 1 && (
              <span className="text-3xl font-black text-[#00AFB9]">+</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* @SECTION SEEIT_MAIN_CARD */}
      <main
        data-name="see-it-main-card"
        className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* @SECTION SEEIT_HEADER */}
        <div
          data-name="see-it-card-header"
          className="mb-5 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#0081A7]">
              <Search size={28} strokeWidth={2.7} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">See It</h2>

              <p className="mt-1 text-xl font-black leading-tight text-[#00AFB9]">
                Spot the Sneaky Equation
              </p>

              <p className="mt-2 max-w-[620px] text-sm font-bold leading-relaxed text-[#275875]">
                Look at the picture. One equation is trying to trick Luma. Tap the equation that
                does <span className="font-black text-[#0081A7]">NOT</span> match.
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Clue {currentClueIndex + 1} of {clues.length}
          </div>
        </div>

        {/* @SECTION SEEIT_VISUAL_MODEL */}
        <section
          data-name="see-it-visual-model-card"
          className="rounded-[1.75rem] border border-[#00AFB9]/20 bg-[#F7FCFD] p-5 shadow-sm"
        >
          <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
            <Sparkles size={22} strokeWidth={2.6} className="text-[#00AFB9]" />

            <div className="h-px w-16 bg-[#00AFB9]/45" />

            <h3 className="text-center text-xl font-black text-[#0081A7]">
              {currentClue.visualLabel}
            </h3>

            <div className="h-px w-16 bg-[#00AFB9]/45" />

            <Sparkles size={22} strokeWidth={2.6} className="text-[#00AFB9]" />
          </div>

          <div data-name="see-it-visual-model-groups">{renderGroupVisual()}</div>
        </section>

        {/* @SECTION SEEIT_EQUATION_CHOICES */}
        <section data-name="see-it-equation-choice-grid" className="mt-5 grid gap-4 lg:grid-cols-3">
          {currentClue.choices.map((equation) => {
            const isSelected = selectedEquation === equation;
            const isSneakyEquation = equation === currentClue.sneakyEquation;

            // The correct answer to THIS activity is the equation that does NOT match.
            const isCorrectSneakyPick = isSelected && isSneakyEquation;

            // These equations are mathematically/pictorially correct, but they are not the answer
            // to “tap the sneaky equation.”
            const isMatchingEquationMiss = isSelected && !isSneakyEquation;

            return (
              <button
                key={equation}
                type="button"
                onClick={() => chooseEquation(equation)}
                data-name={`see-it-equation-choice-${equation
                  .replaceAll(" ", "-")
                  .replaceAll("×", "x")
                  .replaceAll("+", "plus")
                  .replaceAll("=", "equals")}`}
                className={`relative min-h-[128px] rounded-[1.5rem] border p-5 text-center text-2xl font-black shadow-sm transition hover:scale-[1.015] ${
                  isCorrectSneakyPick
                    ? "border-[#7CCB5B]/70 bg-[#EEF9EA] text-[#2F7D32] ring-2 ring-[#7CCB5B]/25"
                    : isMatchingEquationMiss
                      ? "border-[#F07167]/60 bg-[#FCE9E5] text-[#F07167] ring-2 ring-[#F07167]/15"
                      : "border-[#00AFB9]/20 bg-white text-[#073B5A] hover:bg-[#F8FBFB]"
                }`}
              >
                <span>{equation}</span>

                {isCorrectSneakyPick && (
                  <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#7CCB5B] text-base text-white">
                    ✓
                  </span>
                )}

                {isMatchingEquationMiss && (
                  <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F07167] text-base text-white">
                    ×
                  </span>
                )}

                <span className="absolute left-4 top-4 text-[#00AFB9]/45">✦</span>
                <span className="absolute bottom-4 right-5 text-[#00AFB9]/35">✦</span>
              </button>
            );
          })}
        </section>

        {/* @SECTION SEEIT_FEEDBACK */}
        <section
          data-name="see-it-feedback-card"
          className={`mt-5 rounded-[1.5rem] border px-5 py-4 shadow-sm ${
            isSneakyFound
              ? "border-[#7CCB5B]/25 bg-[#EEF9EA]"
              : hasSelected
                ? "border-[#F7B733]/35 bg-[#FFF3D9]"
                : "border-[#00AFB9]/20 bg-[#E9F7F8]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-3xl shadow-inner ${
                  isSneakyFound ? "bg-[#FFF6D8]" : hasSelected ? "bg-white" : "bg-white"
                }`}
              >
                {isSneakyFound ? "🌟" : hasSelected ? "🔎" : "🕵️"}
              </div>

              <div>
                <h3
                  className={`text-lg font-black ${
                    isSneakyFound ? "text-[#2F7D32]" : "text-[#073B5A]"
                  }`}
                >
                  {isSneakyFound
                    ? "Nice spotting!"
                    : hasSelected
                      ? "That one matches the picture."
                      : "Find the sneaky equation."}
                </h3>

                <p className="mt-1 text-sm font-bold leading-relaxed text-[#275875]">
                  {isSneakyFound
                    ? currentClue.feedback
                    : hasSelected
                      ? "Try the equation that does not match what you see."
                      : "Tap the equation that does NOT match the picture."}
                </p>
              </div>
            </div>

            {isSneakyFound && currentClueIndex < clues.length - 1 && (
              <button
                type="button"
                onClick={goToNextClue}
                data-name="see-it-next-clue-button"
                className="rounded-2xl bg-[#00AFB9] px-7 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
              >
                Next Clue →
              </button>
            )}

            {isPatrolComplete && (
              <div className="rounded-2xl bg-white px-5 py-3 text-base font-black text-[#C78300] shadow-sm">
                Pattern found!
              </div>
            )}
          </div>
        </section>
      </main>

      {/* @SECTION SEEIT_SIDEBAR */}
      <aside data-name="see-it-right-sidebar" className="flex flex-col gap-4">
        {/* @SECTION SEEIT_LUMA_TIP */}
        <section
          data-name="see-it-luma-tip-card"
          className="relative min-h-[165px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div data-name="see-it-luma-tip-title-row" className="mb-3 flex items-center gap-2">
              <Star size={22} strokeWidth={2.7} className="fill-[#F7B733] text-[#F7B733]" />

              <p className="text-lg font-black text-[#C78300]">{starName}'s Tip</p>
            </div>

            <div
              data-name="see-it-luma-tip-content"
              className="max-w-[230px] rounded-2xl bg-white px-4 py-3 shadow-sm"
            >
              <p className="text-sm font-black uppercase tracking-[0.12em] text-[#0081A7]">
                Spot the pattern
              </p>

              <p className="mt-1 text-lg font-black leading-tight text-[#073B5A]">
                Check groups.
                <br />
                Check in each.
                <br />
                Check total.
              </p>
            </div>

            <div
              data-name="see-it-luma-tip-mini-steps"
              className="mt-3 flex max-w-[230px] items-center gap-1.5 rounded-full bg-white/65 px-3 py-2 shadow-sm"
            >
              <span className="rounded-full bg-[#00AFB9] px-2.5 py-1 text-xs font-black text-white">
                1
              </span>
              <span className="text-xs font-black text-[#073B5A]/70">Picture</span>
              <span className="text-[#9AB5C7]">→</span>
              <span className="rounded-full bg-[#00AFB9] px-2.5 py-1 text-xs font-black text-white">
                2
              </span>
              <span className="text-xs font-black text-[#073B5A]/70">Equation</span>
            </div>
          </div>

          <div className="absolute bottom-[-34px] right-[-8px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* @SECTION SEEIT_PATTERN_PATROL */}
        <section
          data-name="see-it-pattern-patrol-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#00AFB9] shadow-sm">
              <Binoculars size={25} strokeWidth={2.7} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Pattern Patrol</h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Clues found
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-[#00AFB9] text-white shadow-sm">
              <p className="text-2xl font-black leading-none">{cluesFoundCount}</p>
              <p className="text-xs font-black">of {clues.length}</p>
            </div>

            <div className="flex flex-1 items-center gap-2">
              {clues.map((clue, index) => {
                const isFound = foundClues.includes(index);
                const isCurrent = index === currentClueIndex;

                return (
                  <button
                    key={clue.visualLabel}
                    type="button"
                    onClick={() => goToClue(index)}
                    className={`flex h-11 flex-1 items-center justify-center rounded-2xl border text-xl shadow-sm transition ${
                      isFound
                        ? "border-[#00AFB9] bg-[#00AFB9] text-white"
                        : isCurrent
                          ? "border-[#F7B733]/45 bg-[#FFF3D9] text-[#F7B733]"
                          : "border-[#073B5A]/10 bg-white text-[#9AB5C7]"
                    }`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm font-bold leading-relaxed text-[#275875]">
            {isPatrolComplete
              ? "Pattern found! You caught every sneaky equation."
              : "Keep going! You’re on the case."}
          </p>
        </section>

        {/* @SECTION SEEIT_RULE_REMINDER */}
        <section
          data-name="see-it-rule-reminder-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#00AFB9] shadow-sm">
              <BookOpen size={25} strokeWidth={2.7} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">Rule Reminder</h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Two patterns
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`rounded-2xl bg-white px-4 py-3 shadow-sm ${
                currentClue.ruleFocus === "identity" ? "ring-2 ring-[#00AFB9]/20" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-sm font-black text-white">
                  ×1
                </div>

                <div>
                  <p className="text-sm font-black text-[#073B5A]">
                    Any number × 1 = the same number
                  </p>

                  <p className="mt-1 text-xs font-bold text-[#073B5A]/65">5 × 1 = 5</p>
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl bg-white px-4 py-3 shadow-sm ${
                currentClue.ruleFocus === "zero" ? "ring-2 ring-[#F07167]/20" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-sm font-black text-white">
                  ×0
                </div>

                <div>
                  <p className="text-sm font-black text-[#073B5A]">Any number × 0 = 0</p>

                  <p className="mt-1 text-xs font-bold text-[#073B5A]/65">5 × 0 = 0</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

export default SeeItPage;
