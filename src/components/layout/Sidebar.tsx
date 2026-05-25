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
    <aside className="hidden w-[260px] shrink-0 overflow-hidden rounded-[2rem] bg-[#073B5A] text-white shadow-2xl lg:flex lg:flex-col">
      <div className="relative flex-1 bg-[radial-gradient(circle_at_top,#0081A7_0%,#073B5A_45%,#052A40_100%)] p-6">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#00AFB9]/20 text-[#FDFCDC] shadow-[0_0_35px_rgba(0,175,185,0.6)]">
            <Layers size={44} strokeWidth={2.8} />
          </div>

          <h1 className="text-4xl font-black tracking-tight">LumaMath</h1>

          <p className="mt-2 text-xs font-bold uppercase tracking-[0.28em] text-[#FDFCDC]/80">
            Bright minds.
          </p>

          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FDFCDC]/80">
            Stronger futures.
          </p>
        </div>

        <nav className="space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left text-base font-extrabold transition ${
                    isActive
                      ? 'bg-[#00AFB9] text-white shadow-[0_0_24px_rgba(0,175,185,0.65)]'
                      : 'text-white/85 hover:bg-white/10'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={2.7} />
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="ml-auto text-[#FDFCDC]">✦</span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
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

        <div className="mt-4 rounded-2xl bg-[#0081A7]/45 p-4">
          <div className="flex items-center gap-3">
            <Trophy size={38} strokeWidth={2.7} className="text-[#FDFCDC]" />

            <div>
              <p className="font-black">Keep going!</p>
              <p className="text-sm text-white/80">You’re on a 7-day streak!</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-28 bg-[linear-gradient(135deg,transparent_20%,rgba(0,175,185,0.65)_21%,rgba(0,129,167,0.75)_55%,transparent_56%)] opacity-80" />
      </div>
    </aside>
  )
}

export default Sidebar
