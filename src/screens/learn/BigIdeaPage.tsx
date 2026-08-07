// @SECTION BIGIDEA_IMPORTS
import { useState } from "react";
import { CheckCircle2, CircleHelp, Lightbulb, PlayCircle } from "lucide-react";
import {
  getBigIdeaDescription,
  getBigQuestion,
  getLessonVideoUrl,
  getRuleCards,
  getVideoCaption,
  type LearnLesson,
} from "../../lib/learnContent";
import { curriculumToLearnLesson, type CurriculumLearnLesson } from "../../lib/curriculumLoader";

// @SECTION BIGIDEA_HELPERS
function getLessonThumbnailUrl(lesson: LearnLesson) {
  const title = (lesson.lesson_title ?? "").toLowerCase();
  const practiceType = lesson.practice_type ?? "";

  if (title.includes("zero") || title.includes("identity")) {
    return "/images/learn/thumbnails/zero-one-rules.webp";
  }

  if (practiceType === "repeated_addition_to_multiplication") {
    return "/images/learn/thumbnails/repeated-addition.webp";
  }

  if (practiceType === "factor_product_identification") {
    return "/images/learn/thumbnails/repeated-addition.webp";
  }

  if (practiceType === "equal_groups_with_objects" || practiceType === "equal_groups") {
    return "/images/learn/thumbnails/zero-one-rules.webp";
  }

  if (practiceType.includes("array")) {
    return "/images/learn/thumbnails/repeated-addition.webp";
  }

  return "/images/learn/thumbnails/zero-one-rules.webp";
}

function getSafeVideoUrl(videoUrl: string | undefined | null) {
  const trimmedUrl = videoUrl?.trim();

  if (!trimmedUrl) {
    return null;
  }

  if (trimmedUrl.startsWith("/")) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    return parsedUrl.protocol === "https:" ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

function addAutoplay(videoUrl: string) {
  return `${videoUrl}${videoUrl.includes("?") ? "&" : "?"}autoplay=1`;
}

// @SECTION BIGIDEA_PAGE
type BigIdeaPageProps = {
  lesson: LearnLesson;
};

function BigIdeaPage({ lesson }: BigIdeaPageProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const {
    unit_number: unitNumber,
    week_number: weekNumber,
    day_number: dayNumber,
  } = lesson as CurriculumLearnLesson;
  const curriculumLesson =
    unitNumber && weekNumber && dayNumber
      ? curriculumToLearnLesson(unitNumber, weekNumber, dayNumber)
      : undefined;

  const videoCaption = getVideoCaption(lesson);
  const bigIdeaDescription = getBigIdeaDescription(lesson);
  const bigQuestion = getBigQuestion(lesson);
  const ruleCards = getRuleCards(lesson);
  const lessonThumbnailUrl = curriculumLesson?.big_idea_thumbnail || getLessonThumbnailUrl(lesson);
  const safeVideoUrl = getSafeVideoUrl(getLessonVideoUrl(lesson));

  return (
    <main
      data-name="big-idea-main-card"
      className="w-full rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
    >
      {/* @SECTION BIGIDEA_HEADER */}
      <div data-name="big-idea-card-header" className="flex items-start gap-3">
        <div
          data-name="big-idea-title-icon"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-[#F7B733]"
        >
          <Lightbulb size={25} strokeWidth={2.6} />
        </div>

        <div data-name="big-idea-title-text" className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0081A7]">
            Learn the idea
          </p>
          <h2 className="mt-0.5 text-2xl font-black text-[#073B5A]">Today’s Big Idea</h2>
          <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
            {bigIdeaDescription}
          </p>
        </div>
      </div>

      {/* @SECTION BIGIDEA_CORE_QUESTION */}
      <section
        data-name="big-idea-core-question-card"
        className="mt-4 rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3.5"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00AFB9] shadow-sm">
            <CircleHelp size={22} strokeWidth={2.7} />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              Big Question
            </p>
            <p className="mt-1 text-lg font-black leading-snug text-[#073B5A]">{bigQuestion}</p>
          </div>
        </div>
      </section>

      {/* @SECTION BIGIDEA_RULE_CARDS */}
      <section data-name="big-idea-rule-section" className="mt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              See the pattern
            </p>
            <h3 className="mt-0.5 text-xl font-black text-[#073B5A]">
              Compare the two examples
            </h3>
          </div>
        </div>

        <div data-name="big-idea-rule-cards-grid" className="grid gap-3 md:grid-cols-2">
          {ruleCards.map((card, index) => (
            <div
              key={`${card.eyebrow}-${card.equation}`}
              data-name={`big-idea-rule-card-${index + 1}`}
              className={`rounded-[1.35rem] border p-4 ${card.cardClass}`}
            >
              <p
                className={`text-xs font-black uppercase tracking-[0.14em] ${card.eyebrowClass}`}
              >
                {card.eyebrow}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-3xl font-black text-[#073B5A]">{card.equation}</p>

                <div
                  className={`rounded-xl bg-white px-3 py-2 text-sm font-black shadow-sm ${card.badgeClass}`}
                >
                  {card.badge}
                </div>
              </div>

              <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* @SECTION BIGIDEA_RULE_SUMMARY */}
      <section
        data-name="big-idea-rule-summary"
        className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.35rem] border border-[#073B5A]/10 bg-[#F8FBFB] px-4 py-3.5"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#00AFB9] shadow-sm">
          <CheckCircle2 size={22} strokeWidth={2.7} />
        </div>

        <div className="min-w-[180px] flex-1">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
            Remember
          </p>
          <p className="mt-0.5 text-sm font-black text-[#073B5A]">
            Look for what stays the same, what changes, and what that tells you about the product.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {ruleCards.map((card) => (
            <span
              key={`summary-${card.eyebrow}-${card.badge}`}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-[#073B5A] shadow-sm"
            >
              {card.badge}
            </span>
          ))}
        </div>
      </section>

      {/* @SECTION BIGIDEA_OPTIONAL_VIDEO */}
      {safeVideoUrl && (
        <section
          data-name="big-idea-optional-video"
          className="mt-4 grid items-center gap-4 rounded-[1.35rem] border border-[#073B5A]/10 bg-white p-4 md:grid-cols-[minmax(0,1fr)_280px]"
        >
          <div>
            <div className="flex items-center gap-2 text-[#0081A7]">
              <PlayCircle size={20} strokeWidth={2.7} />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Optional video</p>
            </div>
            <h3 className="mt-1 text-lg font-black text-[#073B5A]">Watch this idea</h3>
            <p className="mt-1 text-sm font-bold leading-relaxed text-[#275875]">
              {videoCaption}
            </p>
          </div>

          <div
            data-name="big-idea-video-card"
            className="overflow-hidden rounded-[1.1rem] border border-[#00AFB9]/20 bg-[#073B5A] shadow-sm"
          >
            <div data-name="big-idea-video-frame" className="aspect-video w-full overflow-hidden">
              {isVideoOpen ? (
                <iframe
                  title={`${videoCaption} video`}
                  src={addAutoplay(safeVideoUrl)}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVideoOpen(true)}
                  data-name="big-idea-video-thumbnail-button"
                  className="group relative h-full w-full overflow-hidden bg-[#073B5A] text-left"
                  aria-label={`Play ${videoCaption} lesson video`}
                >
                  <img
                    src={lessonThumbnailUrl}
                    alt={`${videoCaption} lesson video`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-[#073B5A]/25" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07167] text-white shadow-[0_10px_22px_rgba(7,59,90,0.32)]">
                      <span className="ml-0.5 text-xl leading-none">▶</span>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default BigIdeaPage;
