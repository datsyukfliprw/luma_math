function TopBar() {
  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <button className="rounded-2xl border border-[#073B5A]/10 bg-white px-6 py-3 font-black shadow-sm">
        Grade 3⌄
      </button>

      <button className="flex items-center gap-3 rounded-2xl border border-[#073B5A]/10 bg-white px-5 py-3 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FED9B7] text-2xl">
          👧
        </div>

        <div className="text-left">
          <p className="font-black">Ava Johnson</p>
          <p className="text-sm font-bold text-[#073B5A]/70">3rd Grade</p>
        </div>

        <span className="ml-4">⌄</span>
      </button>
    </header>
  )
}

export default TopBar
