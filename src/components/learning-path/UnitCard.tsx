import { Link } from 'react-router-dom'
import WeekCard from './WeekCard'

type LessonStatus = 'complete' | 'current' | 'locked'
type WeekStatus = 'complete' | 'current' | 'locked'

type UnitCardProps = {
  unitNumber: number
  title: string
  description: string
  progress: number
  weeks: {
    weekNumber: number
    title: string
    status: WeekStatus
    lessons: {
      id: string
      day: string
      title: string
      status: LessonStatus
    }[]
  }[]
}

function UnitCard({
  unitNumber,
  title,
  description,
  progress,
  weeks,
}: UnitCardProps) {
  return (
    <article className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
            Unit {unitNumber}
          </p>

          <h2 className="mt-2 text-3xl font-black">{title}</h2>

          <p className="mt-3 max-w-2xl font-medium leading-relaxed text-[#073B5A]/70">
            {description}
          </p>
        </div>

        <div className="rounded-2xl bg-[#FDFCDC] px-5 py-3 text-center">
          <p className="text-2xl font-black">{progress}%</p>
          <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/65">
            Complete
          </p>
        </div>
      </div>

      <div className="mb-5 h-3 overflow-hidden rounded-full bg-[#073B5A]/10">
        <div
          className="h-full rounded-full bg-[#00AFB9]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-4">
        {weeks.map((week) => (
          <WeekCard
            key={week.weekNumber}
            weekNumber={week.weekNumber}
            title={week.title}
            status={week.status}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {week.lessons.map((lesson) => (
                <Link
                  key={lesson.day}
                  to={lesson.status === 'locked' ? '#' : '/lesson/${lesson,id}'}
                  className={`rounded-2xl border bg-white/75 p-4 text-left transition ${
                    lesson.status === 'complete'
                      ? 'border-[#00AFB9]/35'
                      : lesson.status === 'current'
                        ? 'border-[#F07167]/50 shadow-sm'
                        : 'pointer-events-none border-[#073B5A]/10 opacity-70'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wide text-[#073B5A]/65">
                      {lesson.day}
                    </p>

                    <span className="font-black">
                      {lesson.status === 'complete'
                        ? '✓'
                        : lesson.status === 'current'
                          ? '▶'
                          : '🔒'}
                    </span>
                  </div>

                  <h4 className="text-sm font-black leading-snug">
                    {lesson.title}
                  </h4>
                </Link>
              ))}
            </div>
          </WeekCard>
        ))}
      </div>
    </article>
  )
}

export default UnitCard
