function LessonFooter() {
  return (
    <footer className="relative mt-5 overflow-hidden rounded-[1.5rem] bg-[#FDFCDC] px-8 py-6 shadow-sm">
      <p className="relative z-10 text-lg font-semibold text-[#073B5A]">
        ✦ LumaMath makes math make sense—so every child can{' '}
        <span className="font-black text-[#F07167]">shine.</span>
      </p>

      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-[420px] overflow-hidden">
        <div className="absolute bottom-[-40px] right-[-20px] h-32 w-32 rounded-full bg-[#FED9B7]/70" />

        <div className="absolute bottom-[-35px] right-0 h-24 w-[310px] rounded-t-[100%] bg-[#00AFB9]/75" />
        <div className="absolute bottom-[-35px] right-24 h-20 w-[300px] rounded-t-[100%] bg-[#0081A7]" />
        <div className="absolute bottom-[-45px] right-[-40px] h-24 w-[260px] rounded-t-[100%] bg-[#00AFB9]" />

        <div className="absolute right-24 top-8 text-2xl text-[#F7B733]">✦</div>
        <div className="absolute right-14 top-5 text-2xl text-[#F07167]">✦</div>
        <div className="absolute right-7 top-12 text-sm text-[#8BCB88]">•</div>
      </div>
    </footer>
  )
}

export default LessonFooter
