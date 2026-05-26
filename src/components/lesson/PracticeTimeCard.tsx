import { Calculator, Pencil, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'

type PracticeTimeCardProps = {
  lessonId?: string
  activities: {
    icon: string
    title: string
    subtitle: string
  }[]
}

function PracticeTimeCard({
  lessonId,
  activities: _activities,
}: PracticeTimeCardProps) {
  const practicePath = lessonId ? `/practice/${lessonId}` : '/practice'

  const activities = [
    {
      icon: Calculator,
      title: 'Guided Practice',
      subtitle: 'Step-by-step problems with hints',
      rowClass: 'bg-[#E9F7F8]',
      iconClass: 'bg-[#00AFB9]/20 text-[#0081A7]',
      to: practicePath,
    },
    {
      icon: Pencil,
      title: 'Independent Practice',
      subtitle: 'Solve on your own',
      rowClass: 'bg-[#FFF4E3]',
      iconClass: 'bg-[#FED9B7]/70 text-[#F07167]',
      to: practicePath,
    },
    {
      icon: Trophy,
      title: 'Challenge Yourself',
      subtitle: 'Take it up a notch!',
      rowClass: 'bg-[#FCE9E5]',
      iconClass: 'bg-[#F07167]/20 text-[#F07167]',
      to: practicePath,
    },
  ]

  return (
    <div className="h-full rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-extrabold text-[#073B5A]">
          <span className="mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#073B5A] text-sm text-white">
            4
          </span>
          Practice Time
        </h3>

        <p className="text-sm font-bold text-[#073B5A]/70">15 min</p>
      </div>

      <p className="mb-4 text-sm font-semibold text-[#073B5A]">
        Choose a practice activity.
      </p>

      <div className="space-y-2.5">
        {activities.map((activity) => {
          const Icon = activity.icon

          return (
            <Link
              key={activity.title}
              to={activity.to}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:scale-[1.01] ${activity.rowClass}`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${activity.iconClass}`}
              >
                <Icon size={26} strokeWidth={2.7} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[#073B5A]">
                  {activity.title}
                </span>

                <span className="mt-0.5 block text-xs font-semibold leading-snug text-[#073B5A]/70">
                  {activity.subtitle}
                </span>
              </span>

              <span className="text-xl font-black text-[#073B5A]">›</span>
            </Link>
          )
        })}
      </div>

      <Link
        to={practicePath}
        className="mt-4 inline-block text-sm font-black text-[#0081A7]"
      >
        See All Activities ›
      </Link>
    </div>
  )
}

export default PracticeTimeCard
