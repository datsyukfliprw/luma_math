// @SECTION BIGIDEA_IMPORTS
import { useState } from "react";
import { GraduationCap, Lightbulb, Star } from "lucide-react";
import LumaAvatar from "../../components/luma/LumaAvatar";
import {
  getBigIdeaDescription,
  getBigQuestion,
  getLessonVideoUrl,
  getMissionSteps,
  getRuleCards,
  getTopicTip,
  getVideoCaption,
  type LearnLesson,
} from "../../lib/learnContent";
import { curriculumToLearnLesson, type CurriculumLearnLesson } from "../../lib/curriculumLoader";

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
    // Fallback to repeated-addition thumbnail (factors-products.webp doesn't exist)
    return "/images/learn/thumbnails/repeated-addition.webp";
  }

  if (practiceType === "equal_groups_with_objects" || practiceType === "equal_groups") {
    // Fallback to zero-one-rules thumbnail (equal-groups.webp doesn't exist)
    return "/images/learn/thumbnails/zero-one-rules.webp";
  }

  if (practiceType.includes("array")) {
    // Fallback to repeated-addition thumbnail (arrays.webp doesn't exist)
    return "/images/learn/thumbnails/repeated-addition.webp";
  }

  return "/images/learn/thumbnails/zero-one-rules.webp";
}

// @SECTION BIGIDEA_PAGE
type BigIdeaPageProps = {
  lesson: LearnLesson;
  starName: string;
};

function BigIdeaPage({ lesson, starName }: BigIdeaPageProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Try to get curriculum data first, fall back to string-matching for non-Week 1 lessons
  const {
    unit_number: unitNumber,
    week_number: weekNumber,
    day_number: dayNumber,
  } = lesson as CurriculumLearnLesson;
  const curriculumLesson =
    unitNumber && weekNumber && dayNumber
      ? curriculumToLearnLesson(unitNumber, weekNumber, dayNumber)
      : undefined;

  const lessonVideoUrl = getLessonVideoUrl(lesson);
  const videoCaption = getVideoCaption(lesson);
  const bigIdeaDescription = getBigIdeaDescription(lesson);
  const missionSteps = getMissionSteps(lesson);

  // Use curriculum data if available, otherwise fall back to lesson experience data
  const ruleCards = getRuleCards(lesson);
  const bigQuestion = getBigQuestion(lesson);
  const topicTip = getTopicTip(lesson);
  const lessonThumbnailUrl = curriculumLesson?.big_idea_thumbnail || getLessonThumbnailUrl(lesson);
  const learnMissionStepIndex = Math.max(
    missionSteps.findIndex((step) => step.toLowerCase().includes("learn")),
    0,
  );

  return (
    <>
      {/* @SECTION BIGIDEA_MAIN_CARD */}
      <main
        data-name="big-idea-main-card"
        className="self-start rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
      >
        {/* @SECTION BIGIDEA_HEADER */}
        <div
          data-name="big-idea-card-header"
          className="mb-3 flex items-start justify-between gap-3"
        >
          <div data-name="big-idea-title-group" className="flex min-w-0 items-start gap-3">
            <div
              data-name="big-idea-title-icon"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-[#F7B733]"
            >
              <Lightbulb size={25} strokeWidth={2.6} />
            </div>

            <div data-name="big-idea-title-text" className="min-w-0">
              <h2 className="text-2xl font-black text-[#073B5A]">Today’s Big Idea</h2>

              <p className="mt-1 text-base font-bold leading-snug text-[#275875]">
                {bigIdeaDescription}
              </p>
            </div>
          </div>

          <div
            data-name="big-idea-page-badge"
            className="hidden shrink-0 rounded-full bg-[#E9F7F8] px-3 py-1.5 text-xs font-black text-[#0081A7] md:block"
          >
            Learn 1 of 5
          </div>
        </div>

        {/* @SECTION BIGIDEA_VIDEO */}
        <div
          data-name="big-idea-video-card"
          className="overflow-hidden rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#073B5A] shadow-sm"
        >
          <div data-name="big-idea-video-frame" className="aspect-[16/7.15] w-full overflow-hidden">
            {isVideoOpen ? (
              <iframe
                title={`${videoCaption} video`}
                src={`${lessonVideoUrl}?autoplay=1`}
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
                  className="h-full w-full object-cover transition duration-300"
                />

                <div
                  data-name="big-idea-video-thumbnail-scrim"
                  className="absolute inset-0 bg-[#073B5A]/20"
                />

                <div
                  data-name="big-idea-video-play-button-wrap"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div
                    data-name="big-idea-video-play-button"
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F07167] text-white shadow-[0_12px_26px_rgba(7,59,90,0.32)] transition group-hover:shadow-[0_0_22px_rgba(240,113,103,0.42)]"
                  >
                    <span className="ml-1 text-3xl leading-none">▶</span>
                  </div>
                </div>

                <div
                  data-name="big-idea-video-caption"
                  className="absolute bottom-2.5 left-2.5 right-2.5 rounded-2xl bg-white/92 px-3.5 py-2 shadow-sm backdrop-blur"
                >
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Watch first
                  </p>

                  <p className="mt-0.5 text-sm font-black text-[#073B5A]">{videoCaption}</p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* @SECTION BIGIDEA_RULE_CARDS */}
        <div data-name="big-idea-rule-cards-grid" className="mt-3 grid gap-3 md:grid-cols-2">
          {ruleCards.map((card, index) => {
            return (
              <div
                key={`${card.eyebrow}-${card.equation}`}
                data-name={`big-idea-rule-card-${index + 1}`}
                className={`rounded-2xl border p-3.5 ${card.cardClass}`}
              >
                <p
                  className={`text-xs font-black uppercase tracking-[0.14em] ${card.eyebrowClass}`}
                >
                  {card.eyebrow}
                </p>

                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <p className="text-2xl font-black text-[#073B5A]">{card.equation}</p>

                  <div
                    className={`rounded-xl bg-white px-3 py-1.5 text-sm font-black shadow-sm ${card.badgeClass}`}
                  >
                    {card.badge}
                  </div>
                </div>

                <p className="mt-1.5 text-sm font-bold leading-relaxed text-[#073B5A]/70">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>

      {/* @SECTION BIGIDEA_SIDEBAR */}
      <aside data-name="big-idea-right-sidebar" className="flex flex-col gap-3">
        {/* @SECTION BIGIDEA_LUMA_TIP */}
        <section
          data-name="big-idea-luma-tip-card"
          className="relative min-h-[145px] overflow-hidden rounded-[1.35rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-4 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <Star size={20} strokeWidth={2.7} className="fill-[#F7B733] text-[#F7B733]" />

              <p className="text-base font-black text-[#C78300]">{starName}'s Tip</p>
            </div>

            <p className="mb-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#C78300]">
              {topicTip.title}
            </p>

            <div className="w-fit rounded-2xl bg-white px-4 py-3 text-lg font-black leading-tight text-[#073B5A] shadow-sm">
              {topicTip.lines[0]}
              <br />
              {topicTip.lines[1]}
            </div>
          </div>

          <div className="absolute bottom-[-38px] right-[-8px] w-28">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* @SECTION BIGIDEA_MISSION_MAP */}
        <section
          data-name="big-idea-mission-map-card"
          className="rounded-[1.35rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
              <GraduationCap size={24} strokeWidth={2.6} />
            </div>

            <div>
              <h2 className="text-lg font-black text-[#073B5A]">Today’s Mission</h2>

              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Whole lesson • {missionSteps.length} steps
              </p>
            </div>
          </div>

          <div data-name="big-idea-mission-steps" className="space-y-2">
            {missionSteps.map((step, index) => {
              const isDone = index < learnMissionStepIndex;
              const isCurrent = index === learnMissionStepIndex;

              return (
                <div
                  key={step}
                  data-name={`big-idea-mission-step-${index + 1}`}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
                    isCurrent ? "bg-[#E9F7F8]" : "bg-[#F8FBFB]"
                  }`}
                >
                  <div
                    data-name={`big-idea-mission-step-${index + 1}-number`}
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                      isCurrent
                        ? "bg-[#00AFB9] text-white"
                        : isDone
                          ? "bg-white text-[#0081A7]"
                          : "bg-white text-[#275875]/70"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </div>

                  <p
                    className={`text-sm font-black ${
                      isCurrent ? "text-[#073B5A]" : "text-[#073B5A]/75"
                    }`}
                  >
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* @SECTION BIGIDEA_CORE_QUESTION */}
        <section
          data-name="big-idea-core-question-card"
          className="rounded-[1.35rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-3.5 shadow-sm"
        >
          <div data-name="big-idea-core-question-content" className="flex items-start gap-3">
            <div
              data-name="big-idea-core-question-icon"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#00AFB9] shadow-sm"
            >
              ?
            </div>

            <div data-name="big-idea-core-question-text">
              <h2 className="text-base font-black text-[#073B5A]">Big Question</h2>

              <p className="mt-1 text-sm font-black leading-relaxed text-[#073B5A]">
                {bigQuestion}
              </p>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}

export default BigIdeaPage;
