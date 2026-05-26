import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  House,
  Layers,
  Map,
  Pencil,
  Trophy,
  Users,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { icon: House, label: 'Home', to: '/' },
  { icon: Map, label: 'Learning Path', to: '/learning-path' },
  { icon: BookOpen, label: 'Lesson', to: '/lesson' },
  { icon: Layers, label: 'Flashcards', to: '/flashcards' },
  { icon: Pencil, label: 'Practice', to: '/practice' },
  { icon: ChartNoAxesColumnIncreasing, label: 'Progress', to: '/progress' },
  { icon: Users, label: 'Parent Area', to: '/parent-area' },
]

function Sidebar() {
  return (
    <aside className="hidden w-[270px] shrink-0 overflow-hidden rounded-[2rem] bg-[#073B5A] text-white shadow-2xl lg:flex lg:flex-col">
      <div className="relative flex-1 overflow-hidden bg-[radial-gradient(circle_at_top,#0081A7_0%,#073B5A_42%,#052A40_100%)] px-5 py-5">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute left-[-80px] top-[-80px] h-60 w-60 rounded-full border border-white/20" />
          <div className="absolute right-[-120px] top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute bottom-20 left-[-90px] h-72 w-72 rounded-full border border-white/10" />
        </div>

        <div className="relative z-10 mb-2 flex justify-center">
          <img
            src="/lumamath_logo.png"
            alt="LumaMath"
            className="h-50 w-auto drop-shadow-[0_0_30px_rgba(0,175,185,0.65)]"
          />
        </div>

        <nav className="relative z-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-extrabold transition ${
                    isActive
                      ? 'bg-[#00AFB9] text-white shadow-[0_0_28px_rgba(0,175,185,0.75)]'
                      : 'text-white/85 hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={20} strokeWidth={2.7} className="shrink-0" />

                    <span className="min-w-0 flex-1 whitespace-nowrap">
                      {item.label}
                    </span>

                    {isActive && (
                      <span className="shrink-0 text-[#FDFCDC]">✦</span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="relative z-10 mt-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-black">Level 3</p>
            <span className="text-[#FDFCDC]">✦</span>
          </div>

          <p className="text-sm text-white/80">Stellar Learner</p>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[64%] rounded-full bg-[#00AFB9]" />
          </div>

          <p className="mt-2 text-right text-sm font-bold text-white/85">
            320 / 500 XP
          </p>
        </div>

        <div className="relative z-10 mt-3.5 rounded-2xl bg-[#0081A7]/45 p-3.5">
          <div className="flex items-center gap-3">
            <Trophy
              size={36}
              strokeWidth={2.7}
              className="shrink-0 text-[#FDFCDC]"
            />

            <div>
              <p className="font-black">Keep going!</p>
              <p className="text-sm text-white/80">You’re on a 7-day streak!</p>
            </div>
          </div>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar
