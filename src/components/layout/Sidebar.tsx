import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  ChevronDown,
  House,
  Layers,
  Map,
  Pencil,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { icon: House, label: "Home", to: "/" },
  { icon: Map, label: "Learning Path", to: "/learning-path" },
  { icon: BookOpen, label: "Lesson", to: "/lesson" },
  { icon: Layers, label: "Flashcards", to: "/flashcards" },
  { icon: Pencil, label: "Practice", to: "/practice" },
  { icon: ChartNoAxesColumnIncreasing, label: "Progress", to: "/progress" },
  { icon: Users, label: "Parent Area", to: "/parent-area" },
];

function Sidebar() {
  return (
    <>
      <aside className="hidden h-full w-[245px] shrink-0 overflow-hidden rounded-[2rem] bg-[#073B5A] text-white shadow-2xl lg:flex lg:flex-col 2xl:w-[270px]">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#0081A7_0%,#073B5A_42%,#052A40_100%)] px-4 py-4 2xl:px-5 2xl:py-5">
          <div className="pointer-events-none absolute inset-0 opacity-25">
            <div className="absolute left-[-80px] top-[-80px] h-60 w-60 rounded-full border border-white/20" />
            <div className="absolute right-[-120px] top-20 h-72 w-72 rounded-full border border-white/10" />
            <div className="absolute bottom-20 left-[-90px] h-72 w-72 rounded-full border border-white/10" />
          </div>

          <div className="relative z-10 mb-3 flex shrink-0 justify-center">
            <img
              src="/lumamath_logo.png"
              alt="LumaMath"
              className="h-36 w-auto drop-shadow-[0_0_30px_rgba(0,175,185,0.65)] xl:h-40 2xl:h-44"
            />
          </div>

          <nav className="relative z-10 shrink-0 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm font-extrabold transition 2xl:px-4 2xl:py-3 ${
                      isActive
                        ? "bg-[#00AFB9] text-white shadow-[0_0_28px_rgba(0,175,185,0.75)]"
                        : "text-white/85 hover:bg-white/10"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={19} strokeWidth={2.7} className="shrink-0" />

                      <span className="min-w-0 flex-1 whitespace-nowrap">{item.label}</span>

                      {isActive && <span className="shrink-0 text-[#FDFCDC]">✦</span>}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="relative z-10 mt-auto flex shrink-0 flex-col gap-3 pt-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur 2xl:p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-black">Level 3</p>
                <span className="text-[#FDFCDC]">✦</span>
              </div>

              <p className="text-sm text-white/80">Stellar Learner</p>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[64%] rounded-full bg-[#00AFB9]" />
              </div>

              <p className="mt-2 text-right text-sm font-bold text-white/85">320 / 500 XP</p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-[#052A40]/55 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-white/10"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FED9B7] text-lg shadow-sm">
                    👧
                  </div>

                  <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-black text-white">Ava J.</p>
                    <p className="truncate text-xs font-bold text-white/65">3rd Grade</p>
                  </div>

                  <ChevronDown size={15} strokeWidth={3} className="shrink-0 text-white/70" />
                </button>

                <NavLink
                  to="/settings"
                  aria-label="Settings"
                  className={({ isActive }) =>
                    `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      isActive
                        ? "bg-[#00AFB9] text-white shadow-[0_0_18px_rgba(0,175,185,0.45)]"
                        : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-white"
                    }`
                  }
                >
                  <Settings size={18} strokeWidth={2.7} />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[1.5rem] border border-[#073B5A]/10 border-b-0 bg-white/95 px-2 pb-safe pt-2 shadow-2xl backdrop-blur lg:hidden">
        <div className="flex snap-x snap-mandatory overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex min-w-[4.5rem] flex-1 snap-start flex-col items-center justify-center rounded-2xl px-2 py-2 text-[11px] font-black transition ${
                    isActive
                      ? "bg-[#00AFB9] text-white shadow-[0_0_18px_rgba(0,175,185,0.45)]"
                      : "text-[#073B5A]/70 hover:bg-[#E9F7F8]"
                  }`
                }
              >
                <Icon size={20} strokeWidth={2.7} />
                <span className="mt-1 max-w-full truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
