function LessonHero() {
  return (
    <section className="mb-5 rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-xl shadow-[#0081A7]/5">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr_420px] lg:items-center">
        <div className="flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FDFCDC] to-[#00AFB9]/50">
          <div className="text-center">
            <div className="text-7xl">✦</div>
            <div className="mt-4 h-20 w-52 rounded-[50%] bg-[#00AFB9]/30" />
          </div>
        </div>

        <div>
          <div className="mb-4 inline-flex rounded-full bg-[#FDFCDC] px-5 py-2 text-sm font-black text-[#073B5A]">
            Lesson 12 · Multiplication & Division
          </div>

          <h2 className="max-w-xl text-4xl font-black leading-tight tracking-tight lg:text-5xl">
            Repeated Addition to Multiplication
          </h2>

          <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed text-[#073B5A]/75">
            Discover how repeated addition helps us understand multiplication.
          </p>

          <div className="mt-5 flex gap-8 text-sm font-black text-[#073B5A]/80">
            <span>◷ 25 min</span>
            <span>▥ 3rd Grade</span>
          </div>
        </div>

        <div className="rounded-3xl bg-[#FED9B7]/35 p-8">
          <div className="flex items-center gap-8">
            <div className="text-8xl">⭐</div>

            <div>
              <h3 className="text-xl font-black">
                You’re doing great, Ava!
              </h3>

              <p className="mt-3 font-medium leading-relaxed text-[#073B5A]/75">
                Keep up the amazing work and keep shining.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LessonHero
