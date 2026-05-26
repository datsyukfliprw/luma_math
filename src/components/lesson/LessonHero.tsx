type LessonHeroProps = {
  unitNumber: number
  weekNumber: number
  dayNumber: number
  title: string
  topic: string
  description: string
  minutes: number
  grade: string
}

function LessonHero({
  unitNumber: _unitNumber,
  weekNumber: _weekNumber,
  dayNumber,
  title,
  topic,
  description,
  minutes,
  grade,
}: LessonHeroProps) {
  return (
    <section className="mb-5 rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-xl shadow-[#0081A7]/5">
      <div className="grid gap-8 xl:grid-cols-[250px_1fr_390px] xl:items-center">
        <div className="relative h-[225px] overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FDFCDC] to-[#00AFB9]/45">
          <div className="absolute left-8 top-10 text-2xl text-[#00AFB9]">✦</div>
          <div className="absolute left-20 top-8 text-sm text-[#F07167]">•</div>
          <div className="absolute right-9 top-12 text-2xl text-[#0081A7]">✦</div>
          <div className="absolute right-16 top-8 text-sm text-[#F7B733]">•</div>

          <div className="absolute left-1/2 top-13 -translate-x-1/2 text-8xl text-[#F7B733] drop-shadow-sm">
            ✦
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-28 rounded-t-[55%] bg-[#00AFB9]/35" />
          <div className="absolute bottom-0 left-[-25px] h-24 w-[320px] rounded-t-[60%] bg-[#0081A7]/50" />
          <div className="absolute bottom-0 right-[-40px] h-20 w-[280px] rounded-t-[60%] bg-[#00AFB9]/60" />
        </div>

        <div>
          <div className="mb-4 inline-flex max-w-full rounded-full bg-[#FDFCDC] px-5 py-2 text-sm font-black text-[#073B5A]">
            Lesson {dayNumber}
            <span className="mx-2 text-[#F07167]">•</span>
            <span className="truncate">{topic}</span>
          </div>

          <h2 className="max-w-xl text-[2.55rem] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#073B5A]">
            {title}
          </h2>

          <p className="mt-4 max-w-[540px] text-base font-bold leading-relaxed text-[#073B5A]/75">
            {description}
          </p>

          <div className="mt-5 flex items-center gap-6 text-sm font-black text-[#073B5A]/80">
            <span>◷ {minutes} min</span>
            <span className="h-6 w-px bg-[#073B5A]/15" />
            <span>▥ {grade}</span>
          </div>
        </div>

        <div className="rounded-3xl bg-[#FED9B7]/35 px-9 py-10">
          <div className="flex items-center gap-8">
            <div className="relative text-8xl leading-none">
              <span className="text-[#FFD43B] drop-shadow-sm">★</span>
              <span className="absolute -right-4 top-1 text-xl text-[#F07167]">
                ✦
              </span>
              <span className="absolute -bottom-2 right-2 text-lg text-[#F7B733]">
                ✦
              </span>
            </div>

            <div>
              <h3 className="text-xl font-black leading-snug text-[#073B5A]">
                You’re doing great!
              </h3>

              <p className="mt-3 max-w-[210px] font-bold leading-relaxed text-[#073B5A]/75">
                Keep going. Every lesson is another step toward stronger math
                confidence.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LessonHero
