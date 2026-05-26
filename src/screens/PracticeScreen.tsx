import { useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import { getLessonById } from '../lib/lessonLookup'
import { generateProblemsForPracticeType } from '../practiceTypes/registry'

function formatPracticeType(practiceType: string) {
  return practiceType
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function PracticeScreen() {
  const { lessonId } = useParams()
  const { unit, week, lesson } = getLessonById(lessonId)
  const problems = generateProblemsForPracticeType(lesson.practice_type)
  const firstProblem = problems[0]

  return (
    <PageLayout>
      <div className="rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
          Practice Time
        </p>

        <h1 className="mt-3 text-4xl font-black">{lesson.lesson_title}</h1>

        <p className="mt-3 text-lg font-bold text-[#073B5A]/70">
          Unit {unit.unit_number} · Week {week.week_number} · Day{' '}
          {lesson.day_number}
        </p>

        <div className="mt-6 rounded-2xl bg-[#FEF3D9] p-5">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Practice Type
          </p>

          <p className="mt-2 text-2xl font-black text-[#073B5A]">
            {formatPracticeType(lesson.practice_type)}
          </p>

          <p className="mt-3 max-w-3xl font-semibold leading-relaxed text-[#073B5A]/75">
            {lesson.practice}
          </p>
        </div>

        {firstProblem ? (
          <div className="mt-6 rounded-[1.75rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#00AFB9]">
                Question 1 of {problems.length}
              </p>

              <p className="text-sm font-bold text-[#073B5A]/60">
                {firstProblem.visualType}
              </p>
            </div>

            <h2 className="text-2xl font-black leading-snug text-[#073B5A]">
              {firstProblem.questionText}
            </h2>
            {firstProblem.visualType === 'equal_groups' && (
  <div className="mt-6 flex flex-wrap gap-4">
    {Array.from({ length: 3 }).map((_, groupIndex) => (
      <div
        key={groupIndex}
        className="rounded-2xl border border-[#00AFB9]/30 bg-[#E9F7F8] p-4"
      >
        <div className="grid grid-cols-2 gap-2 text-2xl">
          {Array.from({ length: 4 }).map((_, starIndex) => (
            <span key={starIndex}>⭐</span>
          ))}
        </div>
      </div>
    ))}
  </div>
)}

{firstProblem.visualType === 'repeated_addition' && (
  <div className="mt-6 rounded-2xl bg-[#FEF3D9] p-6 text-center">
    <p className="text-4xl font-black text-[#073B5A]">
      5 + 5 + 5 = 15
    </p>

    <p className="mt-3 text-lg font-bold text-[#073B5A]/70">
      Write this as a multiplication sentence.
    </p>
  </div>
)}


            <div className="mt-6 flex max-w-sm gap-3">
              <input
                className="min-w-0 flex-1 rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                placeholder="Your answer"
              />

              <button className="rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm">
                Check
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-5">
            <p className="font-black text-[#073B5A]">
              No practice generator exists for this practice type yet.
            </p>

            <p className="mt-2 font-semibold text-[#073B5A]/70">
              Practice type: {lesson.practice_type}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default PracticeScreen
