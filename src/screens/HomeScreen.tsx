// @SECTION IMPORTS
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Pencil, Sparkles, Star, Zap } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";
import {
  useStudentProgress,
  type FlashcardDeckProgress,
  type LessonPracticeRewardState,
  type LessonProgress,
  type StudentState,
} from "../contexts/StudentProgressContext";
import { getCurriculum } from "../data/curriculum/curriculumRegistry";
import { getFlashcardDeckIdFromCurriculum } from "../lib/curriculumLoader";
import { getFlashcardDeck } from "../flashcards/deckRegistry";
import { getLessonById } from "../lib/lessonLookup";
import { useReducedMotion } from "../hooks/useReducedMotion";

// @SECTION TYPES
type NextAction = {
  label: string;
  to: string;
};

type CurriculumLessonLite = {
  lesson_id?: string;
  lesson_type: "lesson" | "evaluation";
};

// @SECTION HELPERS
function seededRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function buildLessonId(
  unitNumber: number,
  weekNumber: number,
  lesson: CurriculumLessonLite,
  lessonIndex: number,
): string {
  if (lesson.lesson_id) return lesson.lesson_id;
  if (lesson.lesson_type === "evaluation") {
    return `g3-u${unitNumber}-w${weekNumber}-eval`;
  }
  return `g3-u${unitNumber}-w${weekNumber}-l${lessonIndex + 1}`;
}

function getCurrentLessonId(getLessonProgress: (id: string) => LessonProgress): string {
  const curriculum = getCurriculum(3, 1);
  if (!curriculum) return "g3-u1-w1-l1";

  for (const week of curriculum.weeks) {
    for (let index = 0; index < week.lessons.length; index += 1) {
      const lesson = week.lessons[index];
      const id = buildLessonId(curriculum.unit_number, week.week_number, lesson, index);
      const progress = getLessonProgress(id);
      if (!progress.lessonComplete) return id;
    }
  }

  const lastWeek = curriculum.weeks[curriculum.weeks.length - 1];
  const lastIndex = lastWeek.lessons.length - 1;
  return buildLessonId(
    curriculum.unit_number,
    lastWeek.week_number,
    lastWeek.lessons[lastIndex],
    lastIndex,
  );
}

function getDeckIdForLesson(lessonId: string): string {
  const { week, lesson, weekDayNumber } = getLessonById(lessonId);
  const dayNumber = lesson.day_number ?? weekDayNumber;
  return getFlashcardDeckIdFromCurriculum(week.week_number, dayNumber) ?? `lesson-${lessonId}`;
}

function isFlashcardDeckComplete(
  deckId: string,
  getFlashcardDeckProgress: (deckId: string, cardIds: string[]) => FlashcardDeckProgress,
): boolean {
  const deck = getFlashcardDeck(deckId);
  if (deck.deckId !== deckId) return true;

  const cardIds = deck.cards.map((card) => card.id);
  if (cardIds.length === 0) return true;

  return getFlashcardDeckProgress(deckId, cardIds).completed;
}

function getNextAction(
  lessonId: string,
  progress: LessonProgress,
  getPracticeRewardState: (lessonId: string) => LessonPracticeRewardState,
  getFlashcardDeckProgress: (deckId: string, cardIds: string[]) => FlashcardDeckProgress,
): NextAction {
  if (!progress.warmupComplete) {
    return { label: "Start Warm-Up", to: `/warmup/${lessonId}` };
  }

  if (!progress.learnComplete) {
    return { label: "Continue Lesson", to: `/learn/${lessonId}` };
  }

  if (!progress.tryItComplete) {
    return { label: "Try It", to: `/try-it/${lessonId}` };
  }

  const rewards = getPracticeRewardState(lessonId);
  if (!rewards.guided?.completed) {
    return { label: "Guided Practice", to: `/practice/${lessonId}?mode=guided` };
  }
  if (!rewards.independent?.completed) {
    return { label: "Independent Practice", to: `/practice/${lessonId}?mode=independent` };
  }
  if (!rewards.challenge?.completed) {
    return { label: "Challenge", to: `/practice/${lessonId}?mode=challenge` };
  }

  const deckId = getDeckIdForLesson(lessonId);
  if (!isFlashcardDeckComplete(deckId, getFlashcardDeckProgress)) {
    return { label: "Flashcards", to: `/flashcards/deck/${deckId}` };
  }

  return { label: "Mission Complete", to: `/lesson/${lessonId}` };
}

function calculateStarPower(studentState: StudentState): number {
  const lessons = Object.values(studentState.lessonProgress);
  const correctAnswers = lessons.reduce((sum, progress) => sum + progress.correctAnswers, 0);
  const completedLessons = lessons.filter((progress) => progress.lessonComplete).length;
  const practiceRewards = Object.values(studentState.practiceRewards).reduce(
    (sum, rewards) => sum + Object.values(rewards).filter((reward) => reward?.completed).length,
    0,
  );

  return correctAnswers * 50 + completedLessons * 100 + practiceRewards * 75;
}

// @SECTION BACKGROUND_STARS
function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 45 }).map((_, index) => ({
        id: index,
        top: seededRandom(index + 1) * 100,
        left: seededRandom(index + 51) * 100,
        size: seededRandom(index + 101) * 3 + 2,
        delay: seededRandom(index + 151) * 4,
        duration: seededRandom(index + 201) * 3 + 2,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

// @SECTION PLANET_BUTTON
const MotionLink = motion(Link);

type PlanetButtonProps = {
  to?: string;
  icon: ReactNode;
  label: string;
  gradient: string;
  onClick?: () => void;
  disabled?: boolean;
  reduced: boolean;
};

function PlanetButton({
  to,
  icon,
  label,
  gradient,
  onClick,
  disabled,
  reduced,
}: PlanetButtonProps) {
  const buttonContent = (
    <>
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg shadow-black/20 sm:h-20 sm:w-20 ${gradient}`}
      >
        {icon}
      </div>
      <span className="mt-2 text-xs font-black text-white/90 sm:text-sm">{label}</span>
    </>
  );

  if (disabled || !to) {
    return (
      <motion.button
        type="button"
        disabled
        onClick={onClick}
        whileHover={reduced ? undefined : { scale: 1.05 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className="flex flex-col items-center opacity-60"
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <MotionLink
      to={to}
      whileHover={reduced ? undefined : { scale: 1.08, y: -4 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      className="flex flex-col items-center"
    >
      {buttonContent}
    </MotionLink>
  );
}

// @SECTION BIG_CTA
function BigCta({ action, reduced }: { action: NextAction; reduced: boolean }) {
  return (
    <MotionLink
      to={action.to}
      whileHover={reduced ? undefined : { scale: 1.05 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      animate={reduced ? { scale: 1 } : { scale: [1, 1.04, 1] }}
      transition={reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 mt-6 inline-flex items-center gap-2 rounded-full bg-[#F7B733] px-8 py-4 text-lg font-black text-[#073B5A] shadow-[0_12px_28px_rgba(247,183,51,0.45)] sm:px-10 sm:py-5 sm:text-xl"
    >
      {action.label}
      <Sparkles size={20} strokeWidth={3} />
    </MotionLink>
  );
}

// @SECTION MISSION_TRAIL
function MissionTrail({
  unitNumber,
  week,
  getLessonProgress,
  reduced,
}: {
  unitNumber: number;
  week: { week_number: number; week_title: string; lessons: CurriculumLessonLite[] };
  getLessonProgress: (id: string) => LessonProgress;
  reduced: boolean;
}) {
  const navigate = useNavigate();

  const currentIndex = week.lessons.findIndex((lesson, index) => {
    const id = buildLessonId(unitNumber, week.week_number, lesson, index);
    return !getLessonProgress(id).lessonComplete;
  });

  const stars = week.lessons.map((lesson, index) => {
    const id = buildLessonId(unitNumber, week.week_number, lesson, index);
    const progress = getLessonProgress(id);
    const isComplete = progress.lessonComplete;
    const isCurrent = index === currentIndex;

    return { id, isComplete, isCurrent, label: `${index + 1}` };
  });

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:p-5">
      <p className="mb-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white/70">
        {week.week_title}
      </p>

      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {stars.map((star, index) => (
          <div key={star.id} className="flex items-center">
            <motion.button
              type="button"
              onClick={() => navigate(`/lesson/${star.id}`)}
              whileHover={reduced ? undefined : { scale: 1.15 }}
              whileTap={reduced ? undefined : { scale: 0.95 }}
              animate={star.isCurrent && !reduced ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={
                star.isCurrent && !reduced ? { duration: 1.5, repeat: Infinity } : { duration: 0 }
              }
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black shadow-sm sm:h-10 sm:w-10 ${
                star.isComplete
                  ? "bg-[#F7B733] text-[#073B5A]"
                  : star.isCurrent
                    ? "bg-white text-[#073B5A] ring-4 ring-[#F7B733]/50"
                    : "bg-white/10 text-white/40"
              }`}
            >
              {star.isComplete ? "★" : star.label}
            </motion.button>
            {index < stars.length - 1 && (
              <div className="mx-1 h-0.5 w-3 bg-white/20 sm:mx-2 sm:w-5" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// @SECTION DAILY_CHEST
function DailyChest({ reduced }: { reduced: boolean }) {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!showMessage) return undefined;

    const timer = window.setTimeout(() => setShowMessage(false), 2500);
    return () => window.clearTimeout(timer);
  }, [showMessage]);

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        onClick={() => setShowMessage(true)}
        animate={reduced ? { rotate: 0 } : { rotate: [-2, 2, -2] }}
        transition={
          reduced ? { duration: 0 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={reduced ? undefined : { scale: 1.1 }}
        whileTap={reduced ? undefined : { scale: 0.95 }}
        className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F7B733]/40 bg-[#FFF8E9] text-3xl shadow-lg shadow-[#F7B733]/20 sm:h-16 sm:w-16"
      >
        🎁
      </motion.button>

      {showMessage && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-full bg-white px-4 py-2 text-center text-xs font-black text-[#073B5A] shadow-sm sm:text-sm"
        >
          Come back tomorrow for a surprise!
        </motion.div>
      )}

      {!showMessage && <p className="mt-2 text-xs font-black text-white/70">Daily Spark</p>}
    </div>
  );
}

// @SECTION HOMESCREEN
function HomeScreen() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const { studentState, getLessonProgress, getPracticeRewardState, getFlashcardDeckProgress } =
    useStudentProgress();

  const starName = studentState.starProfile.starName || "Star";
  const starPower = useMemo(() => calculateStarPower(studentState), [studentState]);

  const currentLessonId = getCurrentLessonId(getLessonProgress);

  const { unit, week } = getLessonById(currentLessonId);
  const progress = getLessonProgress(currentLessonId);
  const nextAction = getNextAction(
    currentLessonId,
    progress,
    getPracticeRewardState,
    getFlashcardDeckProgress,
  );

  const starPowerPercent = Math.min(100, (starPower / Math.max(1000, starPower)) * 100);

  return (
    <PageLayout>
      <section className="relative flex min-h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#073B5A] via-[#075A78] to-[#00AFB9] p-4 text-white shadow-sm sm:p-6 lg:p-8">
        <StarField />

        {/* @SECTION HOMESCREEN_HEADER */}
        <header className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
            <Zap size={16} className="text-[#F7B733]" fill="currentColor" />
            <span className="text-sm font-black sm:text-base">{starPower}</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm sm:px-4 sm:py-2">
            <Star size={16} className="text-[#F7B733]" fill="currentColor" />
            <span className="text-sm font-black sm:text-base">Level 3</span>
          </div>
        </header>

        {/* @SECTION HOMESCREEN_HERO */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-6 text-center sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            className="mb-4 rounded-[1.5rem] border border-white/20 bg-white/90 px-5 py-3 text-[#073B5A] shadow-lg"
          >
            <p className="text-lg font-black sm:text-xl">Hey {starName}!</p>
            <p className="text-sm font-bold text-[#073B5A]/70 sm:text-base">Ready to grow today?</p>
          </motion.div>

          <motion.img
            src="/images/luma/star_idle.png"
            alt="Your learning star"
            animate={reduced ? { y: 0 } : { y: [0, -12, 0] }}
            transition={
              reduced ? { duration: 0 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            whileHover={reduced ? undefined : { scale: 1.05, rotate: [0, -5, 5, 0] }}
            className="h-36 w-auto object-contain drop-shadow-[0_12px_32px_rgba(0,0,0,0.25)] sm:h-44 lg:h-52"
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <PlanetButton
              to={`/learn/${currentLessonId}`}
              icon={<BookOpen size={28} strokeWidth={2.5} className="text-white" />}
              label="Learn"
              gradient="bg-gradient-to-br from-[#00AFB9] to-[#0081A7]"
              reduced={reduced}
            />
            <PlanetButton
              to="/flashcards"
              icon={<Layers size={28} strokeWidth={2.5} className="text-white" />}
              label="Cards"
              gradient="bg-gradient-to-br from-[#F7B733] to-[#C78300]"
              reduced={reduced}
            />
            <PlanetButton
              to={`/practice/${currentLessonId}`}
              icon={<Pencil size={28} strokeWidth={2.5} className="text-white" />}
              label="Practice"
              gradient="bg-gradient-to-br from-[#F07167] to-[#C44C3F]"
              reduced={reduced}
            />
            <PlanetButton
              icon={<Sparkles size={28} strokeWidth={2.5} className="text-white" />}
              label="Closet"
              gradient="bg-gradient-to-br from-[#9AB5C7] to-[#6D8EA0]"
              disabled
              onClick={() => navigate("/settings")}
              reduced={reduced}
            />
          </div>

          <BigCta action={nextAction} reduced={reduced} />

          {/* @SECTION STAR_POWER_METER */}
          <div className="mt-6 w-full max-w-xs">
            <div className="mb-1 flex items-center justify-between text-xs font-black text-white/80 sm:text-sm">
              <span>Star Power</span>
              <span>{Math.round(starPowerPercent)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <motion.div
                className="h-full rounded-full bg-[#F7B733]"
                initial={{ width: 0 }}
                animate={{ width: `${starPowerPercent}%` }}
                transition={reduced ? { duration: 0 } : { duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* @SECTION HOMESCREEN_FOOTER */}
        <footer className="relative z-10 mt-auto flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="md:flex-1">
            <MissionTrail
              unitNumber={unit.unit_number}
              week={
                week as { week_number: number; week_title: string; lessons: CurriculumLessonLite[] }
              }
              getLessonProgress={getLessonProgress}
              reduced={reduced}
            />
          </div>

          <div className="flex justify-center md:justify-end">
            <DailyChest reduced={reduced} />
          </div>
        </footer>
      </section>
    </PageLayout>
  );
}

export default HomeScreen;
