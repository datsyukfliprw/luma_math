function TopBar() {
  return (
    <header className="mb-4 flex items-center justify-between gap-4">
      <button className="h-10 rounded-xl border border-[#073B5A]/10 bg-white px-3 text-sm font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]">
        Grade 3⌄
      </button>

      <button className="flex h-12 items-center gap-2 rounded-xl border border-[#073B5A]/10 bg-white px-3 shadow-sm transition hover:bg-[#F8FBFB]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FED9B7] text-base">
          👧
        </div>

        <div className="text-left leading-tight">
          <p className="text-sm font-black text-[#073B5A]">Ava Johnson</p>
          <p className="text-xs font-bold text-[#073B5A]/70">3rd Grade</p>
        </div>

        <span className="ml-2 text-xs font-black text-[#073B5A]">⌄</span>
      </button>
    </header>
  );
}

export default TopBar;
