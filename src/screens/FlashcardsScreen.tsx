import {
  BookOpen,
  ChevronRight,
  Clock3,
  Layers3,
  Play,
  RotateCcw,
  Sparkles,
  Star,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";

const FLASHCARD_ASSET_VERSION = "v4";

function flashcardAsset(filename: string) {
  return `${new URL(`../assets/images/flashcards/${filename}`, import.meta.url).href}?${FLASHCARD_ASSET_VERSION}`;
}

type ImageSpec = {
  src?: string;
  alt: string;
  width: number;
  height: number;
};

type ReviewDeck = {
  title: string;
  subtitle: string;
  progress: number;
  icon: string;
  accentClass: string;
  barClass: string;
  image: ImageSpec;
};

type BrowseCard = {
  title: string;
  subtitle: string;
  icon: string;
  className: string;
  image: ImageSpec;
  imageClassName?: string;
  active?: boolean;
  locked?: boolean;
};

const recommendedDeck = {
  title: "Zero and Identity Rules",
  subtitle: "Review ×0 and ×1 rules, plus key math words.",
  lessonMeta: "Unit 1 • Week 1 • Day 1",
  cardCount: 10,
  minutes: 5,
  topics: 3,
  image: {
    src: flashcardAsset("hero.webp"),
    alt: "Mascot holding a math flashcard beside a stack of star cards",
    width: 620,
    height: 320,
  },
};

const continueDecks: ReviewDeck[] = [
  {
    title: "Zero and Identity Rules",
    subtitle: "6 / 10 cards reviewed",
    progress: 60,
    icon: "⭐",
    accentClass: "from-[#00AFB9] to-[#0081A7]",
    barClass: "bg-[#00AFB9]",
    image: {
      src: flashcardAsset("cont-zero.webp"),
      alt: "Star flashcard deck thumbnail",
      width: 120,
      height: 120,
    },
  },
  {
    title: "Equal Groups",
    subtitle: "4 / 8 cards reviewed",
    progress: 50,
    icon: "•••",
    accentClass: "from-[#FED9B7] to-[#F07167]",
    barClass: "bg-[#F07167]",
    image: {
      src: flashcardAsset("cont-groups.webp"),
      alt: "Equal groups flashcard thumbnail",
      width: 120,
      height: 120,
    },
  },
  {
    title: "Repeated Addition",
    subtitle: "2 / 6 cards reviewed",
    progress: 34,
    icon: "+",
    accentClass: "from-[#BDEFF2] to-[#00AFB9]",
    barClass: "bg-[#0081A7]",
    image: {
      src: flashcardAsset("cont-addition.webp"),
      alt: "Repeated addition flashcard thumbnail",
      width: 120,
      height: 120,
    },
  },
  {
    title: "Multiplication Words",
    subtitle: "1 / 8 cards reviewed",
    progress: 13,
    icon: "Aa",
    accentClass: "from-[#FDFCDC] to-[#FED9B7]",
    barClass: "bg-[#F7B733]",
    image: {
      src: flashcardAsset("cont-words.webp"),
      alt: "Vocabulary flashcard thumbnail",
      width: 120,
      height: 120,
    },
  },
];

const gradeCards: BrowseCard[] = [
  {
    title: "Kindergarten",
    subtitle: "Counting, shapes, and more",
    icon: "K",
    className: "bg-[#FFF8E9] border-[#F4D589]",
    image: {
      src: flashcardAsset("grade-k.webp"),
      alt: "Kindergarten flashcard character",
      width: 118,
      height: 86,
    },
  },
  {
    title: "1st Grade",
    subtitle: "Addition, subtraction, and more",
    icon: "1",
    className: "bg-[#E9F7F8] border-[#00AFB9]/20",
    image: {
      src: flashcardAsset("grade-1.webp"),
      alt: "First grade flashcard character",
      width: 118,
      height: 86,
    },
  },
  {
    title: "2nd Grade",
    subtitle: "Place value, addition, subtraction",
    icon: "2",
    className: "bg-[#FFF4E3] border-[#FED9B7]",
    image: {
      src: flashcardAsset("grade-2.webp"),
      alt: "Second grade flashcard character",
      width: 118,
      height: 86,
    },
  },
  {
    title: "3rd Grade",
    subtitle: "Multiplication, division, fractions",
    icon: "3",
    className: "bg-white border-[#00AFB9]",
    image: {
      src: flashcardAsset("grade-3.webp"),
      alt: "Third grade sprout flashcard character",
      width: 118,
      height: 86,
    },
    active: true,
  },
  {
    title: "4th Grade",
    subtitle: "Fractions, decimals, geometry",
    icon: "4",
    className: "bg-[#F8FBFB] border-[#073B5A]/10",
    image: {
      src: flashcardAsset("grade-4.webp"),
      alt: "Fourth grade flashcard character",
      width: 118,
      height: 86,
    },
  },
  {
    title: "5th Grade",
    subtitle: "Fractions, decimals, algebra",
    icon: "5",
    className: "bg-[#FCE9E5] border-[#F07167]/20",
    image: {
      src: flashcardAsset("grade-5.webp"),
      alt: "Fifth grade flashcard character",
      width: 118,
      height: 86,
    },
    imageClassName: "h-[64px] w-[82px] bottom-0 right-1",
  },
  {
    title: "6th Grade",
    subtitle: "Ratios, algebra, geometry",
    icon: "6",
    className: "bg-[#F3F6F8] border-[#073B5A]/10",
    image: {
      src: flashcardAsset("grade-6.webp"),
      alt: "Sixth grade flashcard character",
      width: 118,
      height: 86,
    },
    imageClassName: "h-[62px] w-[76px] bottom-0 right-1",
  },
];

const unitCards: BrowseCard[] = [
  {
    title: "Unit 1",
    subtitle: "Multiplication & Division Foundations",
    icon: "🌱",
    className: "bg-white border-[#00AFB9]",
    image: {
      src: flashcardAsset("unit-1.webp"),
      alt: "Unit 1 sprout deck illustration",
      width: 118,
      height: 74,
    },
    active: true,
  },
  {
    title: "Unit 2",
    subtitle: "Arrays and Area",
    icon: "▦",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("unit-2.webp"),
      alt: "Unit 2 array deck illustration",
      width: 118,
      height: 74,
    },
  },
  {
    title: "Unit 3",
    subtitle: "Fractions",
    icon: "◔",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("unit-3.webp"),
      alt: "Unit 3 fractions deck illustration",
      width: 118,
      height: 74,
    },
  },
  {
    title: "Unit 4",
    subtitle: "Measurement",
    icon: "📏",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("unit-4.webp"),
      alt: "Unit 4 measurement deck illustration",
      width: 118,
      height: 74,
    },
  },
  {
    title: "Unit 5",
    subtitle: "Data & Geometry",
    icon: "▥",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("unit-5.webp"),
      alt: "Unit 5 data and geometry deck illustration",
      width: 118,
      height: 74,
    },
  },
];

const skillCards: BrowseCard[] = [
  {
    title: "Math Facts",
    subtitle: "42 decks",
    icon: "123",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-facts.webp"),
      alt: "Math facts deck icon",
      width: 72,
      height: 72,
    },
  },
  {
    title: "Vocabulary",
    subtitle: "36 decks",
    icon: "Aa",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-words.webp"),
      alt: "Vocabulary deck icon",
      width: 72,
      height: 72,
    },
  },
  {
    title: "Rules",
    subtitle: "28 decks",
    icon: "🛡️",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-rules.webp"),
      alt: "Rules deck icon",
      width: 72,
      height: 72,
    },
  },
  {
    title: "Visual Models",
    subtitle: "24 decks",
    icon: "•••",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-visual.webp"),
      alt: "Visual models deck icon",
      width: 72,
      height: 72,
    },
  },
  {
    title: "Mistake Review",
    subtitle: "Your missed topics",
    icon: "🎯",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-mistakes.webp"),
      alt: "Mistake review deck icon",
      width: 72,
      height: 72,
    },
  },
  {
    title: "Challenge Cards",
    subtitle: "Think deeper",
    icon: "🏆",
    className: "bg-white border-[#073B5A]/10",
    image: {
      src: flashcardAsset("skill-challenge.webp"),
      alt: "Challenge cards deck icon",
      width: 72,
      height: 72,
    },
  },
];

function ImagePlaceholder({
  image,
  className = "",
  children,
}: {
  image: ImageSpec;
  className?: string;
  children?: ReactNode;
}) {
  if (image.src) {
    return (
      <img
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className={className}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={image.alt}
      className={`flex items-center justify-center border border-dashed border-[#073B5A]/15 bg-[#EDF2F4] text-[#073B5A]/35 ${className}`}
      style={{
        width: image.width,
        height: image.height,
      }}
    >
      {children ?? (
        <span className="px-3 text-center text-xs font-black uppercase tracking-[0.12em]">
          Image
          <br />
          {image.width} × {image.height}
        </span>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  actionLabel = "See all",
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-lg font-black tracking-[-0.02em] text-[#073B5A]">{title}</h2>

      <button
        type="button"
        className="inline-flex items-center gap-1 text-sm font-black text-[#0081A7]"
      >
        {actionLabel}
        <ChevronRight size={16} strokeWidth={3} />
      </button>
    </div>
  );
}

function ContinueDeckCard({ deck }: { deck: ReviewDeck }) {
  return (
    <button
      type="button"
      className="group flex min-w-[245px] flex-1 items-center gap-3 rounded-2xl border border-[#073B5A]/10 bg-white p-2.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl shadow-sm">
        <ImagePlaceholder image={deck.image} className="h-14 w-14 rounded-2xl object-cover">
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${deck.accentClass} text-xl font-black text-white`}
          >
            {deck.icon}
          </div>
        </ImagePlaceholder>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.82rem] font-black text-[#073B5A]">{deck.title}</p>

        <p className="mt-0.5 text-xs font-bold text-[#073B5A]/65">{deck.subtitle}</p>

        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#073B5A]/10">
          <div
            className={`h-full rounded-full ${deck.barClass}`}
            style={{ width: `${deck.progress}%` }}
          />
        </div>
      </div>
    </button>
  );
}

function BrowseTile({ card }: { card: BrowseCard }) {
  return (
    <button
      type="button"
      className={`relative min-h-[88px] overflow-hidden rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${card.className} ${
        card.active ? "ring-2 ring-[#00AFB9]/20" : ""
      }`}
    >
      <div className="relative z-10 max-w-[67%]">
        <div
          className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-xl text-sm font-black ${
            card.active ? "bg-[#00AFB9] text-white" : "bg-white text-[#073B5A] shadow-sm"
          }`}
        >
          {card.icon}
        </div>

        <p className="text-[0.82rem] font-black text-[#073B5A]">{card.title}</p>

        <p className="mt-0.5 text-[0.64rem] font-bold leading-snug text-[#073B5A]/65">
          {card.subtitle}
        </p>
      </div>

      <ImagePlaceholder
        image={card.image}
        className={`absolute -bottom-1 -right-2 h-[86px] w-[118px] rounded-tl-2xl object-contain object-right-bottom ${card.imageClassName ?? ""}`}
      >
        <div className="flex h-full w-full items-center justify-center rounded-tl-2xl bg-[#EDF2F4]/70 text-lg font-black text-[#073B5A]/25">
          {card.locked ? "🔒" : card.icon}
        </div>
      </ImagePlaceholder>

      {card.locked && (
        <div className="absolute bottom-3 right-3 z-20 rounded-full bg-white/90 px-2 py-1 text-xs font-black text-[#073B5A]/55 shadow-sm">
          Locked
        </div>
      )}

      {card.active && (
        <div className="absolute right-3 top-3 z-20 text-[#00AFB9]">
          <Sparkles size={16} fill="currentColor" />
        </div>
      )}
    </button>
  );
}

// @SECTION FLASHCARDS_SCREEN
function FlashcardsScreen() {
  return (
    <PageLayout>
      <div className="flex min-h-0 flex-col">
        {/* @SECTION FLASHCARDS_HEADER */}
        <header className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00AFB9]">
              Quick Review
            </p>

            <h1 className="mt-1 text-[2rem] font-black leading-none tracking-[-0.04em] text-[#073B5A]">
              Flashcards
            </h1>

            <p className="mt-1.5 text-sm font-bold text-[#073B5A]/70">
              Quick reviews to build strong memories and brighter skills. ✨
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

        {/* @SECTION FLASHCARDS_HERO */}
        <section className="relative mb-3 min-h-[235px] overflow-hidden rounded-[1.75rem] border border-[#073B5A]/10 bg-[radial-gradient(circle_at_74%_28%,rgba(0,175,185,0.32),transparent_30%),linear-gradient(115deg,#073B5A_0%,#075A78_58%,#0081A7_100%)] p-5 text-white shadow-sm">
          <div className="absolute inset-0 opacity-35">
            <div className="absolute left-[53%] top-8 h-48 w-48 rounded-full border border-white/20" />
            <div className="absolute left-[62%] top-[-30px] h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute bottom-5 right-12 text-2xl text-[#FDFCDC]">✦</div>
            <div className="absolute right-[29%] top-12 text-xl text-[#FED9B7]">✦</div>
          </div>

          {/* Hero art fills the right side like a background layer, then fades into the teal card. */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden lg:block">
            <ImagePlaceholder
              image={recommendedDeck.image}
              className="h-full w-full border-0 bg-transparent object-cover object-right-center [mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.68)_22%,black_42%,black_100%)]"
            >
              <div className="flex h-full w-full items-center justify-center bg-white/10 text-center text-sm font-black uppercase tracking-[0.16em] text-white/45">
                Hero Art
                <br />
                620 × 320
              </div>
            </ImagePlaceholder>
          </div>

          <div className="relative z-10 max-w-[535px]">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7] shadow-sm">
              <Sparkles size={14} fill="currentColor" />
              Recommended for Today
            </p>

            <h2 className="mt-3 max-w-2xl text-[2rem] font-black leading-tight tracking-[-0.04em]">
              {recommendedDeck.title}
            </h2>

            <p className="mt-2 max-w-xl text-sm font-bold leading-relaxed text-white/85">
              {recommendedDeck.subtitle}
            </p>

            <p className="mt-1 text-sm font-black text-[#BDEFF2]">{recommendedDeck.lessonMeta}</p>

            <div className="mt-3 flex max-w-md flex-wrap gap-2 rounded-2xl bg-white/95 p-1.5 text-[#073B5A] shadow-sm">
              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5">
                <Layers3 size={19} className="text-[#0081A7]" />
                <div>
                  <p className="text-sm font-black">{recommendedDeck.cardCount}</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#073B5A]/55">
                    Cards
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-[#073B5A]/10" />

              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5">
                <Clock3 size={19} className="text-[#0081A7]" />
                <div>
                  <p className="text-sm font-black">{recommendedDeck.minutes} min</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#073B5A]/55">
                    Est. Time
                  </p>
                </div>
              </div>

              <div className="h-8 w-px bg-[#073B5A]/10" />

              <div className="flex flex-1 items-center gap-2 rounded-xl px-3 py-1.5">
                <BookOpen size={19} className="text-[#0081A7]" />
                <div>
                  <p className="text-sm font-black">{recommendedDeck.topics}</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-[#073B5A]/55">
                    Topics
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                to="/flashcards/unit-1-week-1-day-1"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#00AFB9] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0081A7]"
              >
                <Play size={18} fill="currentColor" />
                Start Flashcards
              </Link>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-black text-white shadow-sm backdrop-blur transition hover:bg-white/20"
              >
                <RotateCcw size={18} />
                Review Missed
              </button>
            </div>
          </div>
        </section>

        {/* @SECTION FLASHCARDS_LIBRARY */}
        <div className="space-y-3 pb-2">
          <section>
            <SectionHeader title="Continue Reviewing" />

            <div className="grid gap-3 xl:grid-cols-4">
              {continueDecks.map((deck) => (
                <ContinueDeckCard key={deck.title} deck={deck} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="By Grade" />

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-7">
              {gradeCards.map((card) => (
                <BrowseTile key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="By Unit" />

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {unitCards.map((card) => (
                <BrowseTile key={card.title} card={card} />
              ))}
            </div>
          </section>

          <section>
            <SectionHeader title="By Skill" />

            <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {skillCards.map((card) => (
                <BrowseTile key={card.title} card={card} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

export default FlashcardsScreen;
