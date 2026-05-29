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
  getVideoCaption,
  type LearnLesson,
} from "../../lib/learnContent";

// @SECTION BIGIDEA_PAGE
type BigIdeaPageProps = {
  lesson: LearnLesson;
  starName: string;
};

function BigIdeaPage({ lesson, starName }: BigIdeaPageProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const lessonVideoUrl = getLessonVideoUrl(lesson);
  const videoCaption = getVideoCaption(lesson);
  const bigIdeaDescription = getBigIdeaDescription(lesson);
  const missionSteps = getMissionSteps(lesson);
  const ruleCards = getRuleCards(lesson);
  const bigQuestion = getBigQuestion(lesson);

  return (
    <>
      {/* @SECTION BIGIDEA_MAIN_CARD */}
      <main
        data-name="big-idea-main-card"
        className="self-start rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
      >
        {/* @SECTION BIGIDEA_HEADER */}
        <div
          data-name="big-idea-card-header"
          className="mb-4 flex items-start justify-between gap-4"
        >
          <div
            data-name="big-idea-title-group"
            className="flex items-start gap-4"
          >
            <div
              data-name="big-idea-title-icon"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-[#F7B733]"
            >
              <Lightbulb size={28} strokeWidth={2.6} />
            </div>

            <div data-name="big-idea-title-text">
              <h2 className="text-2xl font-black text-[#073B5A]">
                Today’s Big Idea
              </h2>

              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                {bigIdeaDescription}
              </p>
            </div>
          </div>

          <div
            data-name="big-idea-page-badge"
            className="hidden shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7] md:block"
          >
            Page 1 of 5
          </div>
        </div>

        {/* @SECTION BIGIDEA_VIDEO */}
        <div
          data-name="big-idea-video-card"
          className="overflow-hidden rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#073B5A] shadow-sm"
        >
          <div
            data-name="big-idea-video-frame"
            className="aspect-[16/8.4] w-full overflow-hidden"
          >
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
                  src="/images/learn/thumbnails/zero-one-rules.webp"
                  alt={`${videoCaption} lesson video`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
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
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F07167] text-white shadow-[0_14px_30px_rgba(7,59,90,0.35)] transition group-hover:scale-105"
                  >
                    <span className="ml-1 text-4xl leading-none">▶</span>
                  </div>
                </div>

                <div
                  data-name="big-idea-video-caption"
                  className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/92 px-4 py-2.5 shadow-sm backdrop-blur"
                >
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[#0081A7]">
                    Watch first
                  </p>

                  <p className="mt-0.5 text-base font-black text-[#073B5A]">
                    {videoCaption}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* @SECTION BIGIDEA_RULE_CARDS */}
        <div
          data-name="big-idea-rule-cards-grid"
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <div
            data-name="big-idea-rule-times-one-card"
            className="rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              {ruleCards[0].eyebrow}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-black text-[#073B5A]">{ruleCards[0].equation}</p>

              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#0081A7] shadow-sm">
                {ruleCards[0].badge}
              </div>
            </div>

            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              {ruleCards[0].description}
            </p>
          </div>

          <div
            data-name="big-idea-rule-times-zero-card"
            className="rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-4"
          >
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#F07167]">
              {ruleCards[1].eyebrow}
            </p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-black text-[#073B5A]">{ruleCards[1].equation}</p>

              <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-[#F07167] shadow-sm">
                {ruleCards[1].badge}
              </div>
            </div>

            <p className="mt-2 text-sm font-bold leading-relaxed text-[#073B5A]/70">
              {ruleCards[1].description}
            </p>
          </div>
        </div>
      </main>

      {/* @SECTION BIGIDEA_SIDEBAR */}
      <aside data-name="big-idea-right-sidebar" className="flex flex-col gap-4">
        {/* @SECTION BIGIDEA_LUMA_TIP */}
        <section
          data-name="big-idea-luma-tip-card"
          className="relative min-h-[165px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm"
        >
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />

              <p className="text-lg font-black text-[#C78300]">
                {starName}'s Tip
              </p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              Look for
              <br />
              equal groups!
            </div>
          </div>

          <div className="absolute bottom-[-34px] right-[-8px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        {/* @SECTION BIGIDEA_MISSION_MAP */}
        <section
          data-name="big-idea-mission-map-card"
          className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
              <GraduationCap size={27} strokeWidth={2.6} />
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Today’s Mission
              </h2>

              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                One idea, five steps
              </p>
            </div>
          </div>

          <div data-name="big-idea-mission-steps" className="space-y-2.5">
            {missionSteps.map((step, index) => (
              <div
                key={step}
                data-name={`big-idea-mission-step-${index + 1}`}
                className="flex items-center gap-3 rounded-2xl bg-[#F8FBFB] px-4 py-2.5"
              >
                <div
                  data-name={`big-idea-mission-step-${index + 1}-number`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                    index === 0
                      ? "bg-[#00AFB9] text-white"
                      : "bg-white text-[#0081A7]"
                  }`}
                >
                  {index + 1}
                </div>

                <p className="text-sm font-black text-[#073B5A]">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* @SECTION BIGIDEA_CORE_QUESTION */}
        <section
          data-name="big-idea-core-question-card"
          className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] px-5 py-4 shadow-sm"
        >
          <div
            data-name="big-idea-core-question-content"
            className="flex items-start gap-3"
          >
            <div
              data-name="big-idea-core-question-icon"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black text-[#00AFB9] shadow-sm"
            >
              ?
            </div>

            <div data-name="big-idea-core-question-text">
              <h2 className="text-lg font-black text-[#073B5A]">
                Big Question
              </h2>

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
