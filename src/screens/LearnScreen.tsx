import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Star,
} from 'lucide-react'
import PageLayout from '../components/layout/PageLayout'
import LumaAvatar from '../components/luma/LumaAvatar'
import { getLessonById } from '../lib/lessonLookup'
import { updateLessonProgress } from '../lib/lessonProgress'
import { getStarProfile } from '../lib/starProfile'

const CURRENT_STUDENT_ID = 'default-student'

const lessonVideoUrl = 'https://www.youtube.com/embed/gLcD7otUHxw'

const learnSteps = [
  {
    label: 'Big Idea',
    nextLabel: 'Next: Build It',
  },
  {
    label: 'Build It',
    nextLabel: 'Next: See It',
  },
  {
    label: 'See It',
    nextLabel: 'Next: Words',
  },
  {
    label: 'Words',
    nextLabel: 'Next: Quick Check',
  },
  {
    label: 'Quick Check',
    nextLabel: 'Finish Learn',
  },
]

function getCurrentLessonId({
  lessonId,
  unitNumber,
  weekNumber,
  dayNumber,
}: {
  lessonId?: string
  unitNumber: number
  weekNumber: number
  dayNumber: number
}) {
  return lessonId ?? `unit-${unitNumber}-week-${weekNumber}-day-${dayNumber}`
}

function LearnStepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex min-w-[520px] items-start justify-end gap-0">
      {learnSteps.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep

        return (
          <div key={step.label} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-base font-black shadow-sm ${
                  isActive
                    ? 'border-[#00AFB9] bg-[#00AFB9] text-white shadow-[0_0_18px_rgba(0,175,185,0.45)]'
                    : isDone
                      ? 'border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]'
                      : 'border-[#9AB5C7]/55 bg-white text-[#275875]'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </div>

              <p
                className={`mt-2 whitespace-nowrap text-center text-xs font-black ${
                  isActive ? 'text-[#073B5A]' : 'text-[#275875]/75'
                }`}
              >
                {step.label}
              </p>
            </div>

            {index < learnSteps.length - 1 && (
              <div className="mt-5 h-0.5 w-14 border-t-2 border-dashed border-[#9AB5C7]/45" />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DotGroup({ count = 3 }: { count?: number }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#00AFB9] bg-[#E9F7F8]">
      <div className="flex gap-1">
        {Array.from({ length: count }).map((_, index) => (
          <span key={index} className="h-2.5 w-2.5 rounded-full bg-[#F07167]" />
        ))}
      </div>
    </div>
  )
}

function CompactTodaysWordsCard() {
  const words = [
    {
      icon: '●●●',
      title: 'equal groups',
      body: 'same amount',
      color: 'text-[#00AFB9]',
      bg: 'bg-[#E9F7F8]',
    },
    {
      icon: '+',
      title: 'repeated addition',
      body: 'add again',
      color: 'text-[#F07167]',
      bg: 'bg-[#FCE9E5]',
    },
    {
      icon: '×',
      title: 'factor',
      body: 'number multiplied',
      color: 'text-[#0081A7]',
      bg: 'bg-[#E9F7F8]',
    },
    {
      icon: '=',
      title: 'product',
      body: 'the answer',
      color: 'text-[#F7B733]',
      bg: 'bg-[#FFF3D9]',
    },
  ]

  return (
    <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3 pr-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E9F7F8] text-lg">
            📖
          </div>

          <div>
            <h2 className="whitespace-nowrap text-base font-black text-[#073B5A]">
              Today’s Words
            </h2>
            <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#0081A7]">
              Words you’ll use
            </p>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {words.map((word) => (
            <div
              key={word.title}
              className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] px-3 py-2"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${word.bg} text-xs font-black ${word.color}`}
              >
                {word.icon}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-black text-[#073B5A]">
                  {word.title}
                </p>
                <p className="truncate text-xs font-bold text-[#073B5A]/60">
                  {word.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BigIdeaPage() {
  return (
    <>
      <main className="self-start rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-[#F7B733]">
            <Lightbulb size={28} strokeWidth={2.6} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#073B5A]">
              Today’s Big Idea
            </h2>
            <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
              Equal groups help us see why the ×0 and ×1 rules work.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#073B5A] shadow-sm">
          <div className="aspect-video w-full overflow-hidden">
            <iframe
              title="Zero and Identity Rules lesson video"
              src={lessonVideoUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] p-4">
          <p className="text-base font-black text-[#073B5A]">
            Watch first, then we’ll build it together.
          </p>

          <p className="mt-2 text-sm font-bold leading-relaxed text-[#275875]">
            This lesson shows how equal groups connect to multiplication. After
            the video, we’ll use pictures and equations to understand what
            happens when we multiply by 0 and 1.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[#00AFB9]/20 bg-[#E9F7F8] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
              Multiplying by 1
            </p>
            <p className="mt-1 text-xl font-black text-[#073B5A]">
              4 × 1 = 4
            </p>
            <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
              One in each group keeps the total the same as the number of
              groups.
            </p>
          </div>

          <div className="rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#F07167]">
              Multiplying by 0
            </p>
            <p className="mt-1 text-xl font-black text-[#073B5A]">
              4 × 0 = 0
            </p>
            <p className="mt-1 text-sm font-bold text-[#073B5A]/70">
              Zero in each group means there are no items to count.
            </p>
          </div>
        </div>
      </main>

      <aside className="flex flex-col gap-4">
        <section className="relative min-h-[135px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              Look for
              <br />
              equal groups!
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9F7F8] text-[#00AFB9]">
              <GraduationCap size={27} strokeWidth={2.6} />
            </div>

            <h2 className="text-xl font-black text-[#0081A7]">
              What you’ll learn
            </h2>
          </div>

          <div className="space-y-3">
            {[
              'How equal groups show multiplication',
              'What happens when groups have 1 item',
              'What happens when groups have 0 items',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={18}
                  strokeWidth={3}
                  className="shrink-0 text-[#00AFB9]"
                />
                <p className="text-sm font-bold text-[#073B5A]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FCE9E5] text-[#F07167]">
              <Lightbulb size={25} strokeWidth={2.6} />
            </div>

            <h2 className="text-xl font-black text-[#F07167]">Remember</h2>
          </div>

          <p className="text-sm font-bold leading-relaxed text-[#073B5A]">
            4 groups of 3 can be shown as 4 × 3.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <DotGroup key={index} count={3} />
            ))}

            <div className="rounded-xl bg-[#E9F7F8] px-4 py-2 text-xl font-black text-[#073B5A]">
              4 × 3 = 12
            </div>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-lg font-black text-[#073B5A]">
                Math Pattern
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Notice the rule
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 1 stays the same.
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                7 × 1 = 7
              </p>
            </div>

            <div className="rounded-2xl bg-white px-4 py-3">
              <p className="text-sm font-black text-[#073B5A]">
                Any number × 0 becomes 0.
              </p>
              <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                7 × 0 = 0
              </p>
            </div>
          </div>
        </section>
      </aside>
    </>
  )
}



function BuildItPage() {
  const buildRounds = [
    {
      groups: 4,
      targetCount: 1,
      instruction: 'Put 1 star in each group.',
      summary: '4 groups of 1 = 4 total',
      pattern:
        'When each group has 1, the total stays the same as the number of groups.',
    },
    {
      groups: 4,
      targetCount: 0,
      instruction: 'Make 4 groups with 0 stars in each group.',
      summary: '4 groups of 0 = 0 total',
      pattern: 'When each group has 0, there are no stars to count.',
    },
    {
      groups: 6,
      targetCount: 1,
      instruction: 'Put 1 star in each group.',
      summary: '6 groups of 1 = 6 total',
      pattern: 'Multiplying by 1 keeps the number the same.',
    },
    {
      groups: 6,
      targetCount: 0,
      instruction: 'Make 6 groups with 0 stars in each group.',
      summary: '6 groups of 0 = 0 total',
      pattern: 'Multiplying by 0 always gives 0.',
    },
  ]

  const [roundIndex, setRoundIndex] = useState(0)
  const currentRound = buildRounds[roundIndex]

  const [groupCounts, setGroupCounts] = useState<number[]>(
    Array.from({ length: currentRound.groups }, () => 0),
  )
  const [hasChecked, setHasChecked] = useState(false)
  const [completedRounds, setCompletedRounds] = useState<number[]>([])

  const totalStars = groupCounts.reduce((sum, count) => sum + count, 0)
  const isZeroRound = currentRound.targetCount === 0
  const isCorrect = groupCounts.every(
    (count) => count === currentRound.targetCount,
  )
  const canMoveNextRound = hasChecked && isCorrect

  function getStarWord(count: number) {
    return count === 1 ? 'star' : 'stars'
  }

  function resetRound(nextRoundIndex: number) {
    const nextRound = buildRounds[nextRoundIndex]

    setRoundIndex(nextRoundIndex)
    setGroupCounts(Array.from({ length: nextRound.groups }, () => 0))
    setHasChecked(false)
  }

  function toggleGroup(index: number) {
    if (isZeroRound) {
      return
    }

    setHasChecked(false)

    setGroupCounts((currentGroups) =>
      currentGroups.map((count, groupIndex) => {
        if (groupIndex !== index) {
          return count
        }

        return count === currentRound.targetCount ? 0 : currentRound.targetCount
      }),
    )
  }

  function checkGroups() {
    setHasChecked(true)

    if (isCorrect && !completedRounds.includes(roundIndex)) {
      setCompletedRounds((currentCompletedRounds) => [
        ...currentCompletedRounds,
        roundIndex,
      ])
    }
  }

  function goToNextBuildRound() {
    if (roundIndex < buildRounds.length - 1) {
      resetRound(roundIndex + 1)
    }
  }

  function goToPreviousBuildRound() {
    if (roundIndex > 0) {
      resetRound(roundIndex - 1)
    }
  }

  return (
    <>
      <main className="w-full rounded-[2rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E9F7F8] text-2xl">
              👐
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#073B5A]">
                Build It Together
              </h2>
              <p className="mt-1 text-base font-bold leading-relaxed text-[#275875]">
                {currentRound.instruction}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-full bg-[#E9F7F8] px-4 py-2 text-sm font-black text-[#0081A7]">
            Round {roundIndex + 1} of {buildRounds.length}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[#BFEAF0] bg-[#F7FCFD] p-4">
          <div
            className={`grid gap-4 ${
              currentRound.groups === 6 ? 'md:grid-cols-6' : 'md:grid-cols-4'
            }`}
          >
            {groupCounts.map((count, index) => (
              <button
                key={index}
                type="button"
                onClick={() => toggleGroup(index)}
                disabled={isZeroRound}
                className={`flex h-28 items-center justify-center rounded-[1.35rem] border-2 transition ${
                  isZeroRound
                    ? 'cursor-default border-[#42C8DC]/75 bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)]'
                    : 'border-[#42C8DC] bg-white shadow-[0_10px_20px_rgba(0,129,167,0.08)] hover:scale-[1.02]'
                }`}
              >
                {count === currentRound.targetCount && !isZeroRound ? (
                  <span className="text-4xl drop-shadow-sm">⭐</span>
                ) : isZeroRound ? (
                  <div className="text-center">
                    <Sparkles
                      size={17}
                      strokeWidth={2.8}
                      className="mx-auto mb-2 text-[#A9D7E1]"
                    />
                    <p className="text-sm font-black text-[#6D9AB1]">
                      Empty
                    </p>
                  </div>
                ) : (
                  <p className="text-sm font-black text-[#6D9AB1]">Tap</p>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid overflow-hidden rounded-2xl border border-[#073B5A]/10 bg-[#F8FBFB] text-center md:grid-cols-3">
          <div className="flex items-center justify-center gap-3 px-4 py-3">
            <span className="text-2xl text-[#00AFB9]">👥</span>
            <p className="text-base font-black text-[#073B5A]">
              {currentRound.groups} groups
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="text-2xl text-[#00AFB9]">⭐</span>
            <p className="text-base font-black text-[#073B5A]">
              {currentRound.targetCount} in each
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 border-t border-[#073B5A]/10 px-4 py-3 md:border-l md:border-t-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00AFB9] text-base font-black text-white">
              =
            </span>
            <p className="text-base font-black text-[#073B5A]">
              {totalStars} total
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {roundIndex > 0 && (
            <button
              type="button"
              onClick={goToPreviousBuildRound}
              className="rounded-2xl border border-[#073B5A]/10 bg-white px-7 py-3 text-base font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB]"
            >
              Previous
            </button>
          )}

          <button
            type="button"
            onClick={checkGroups}
            className="rounded-2xl bg-[#00AFB9] px-8 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#0081A7]"
          >
            {isZeroRound ? 'Check Empty Groups' : 'Check My Groups'}
          </button>

          {roundIndex < buildRounds.length - 1 && canMoveNextRound && (
            <button
              type="button"
              onClick={goToNextBuildRound}
              className="rounded-2xl bg-[#073B5A] px-7 py-3 text-base font-black text-white shadow-sm transition hover:bg-[#052A40]"
            >
              Next Round
            </button>
          )}
        </div>

        {hasChecked && (
          <div
            className={`mt-4 rounded-2xl border px-4 py-3 ${
              isCorrect
                ? 'border-[#00AFB9]/25 bg-[#E9F7F8]'
                : 'border-[#F07167]/25 bg-[#FCE9E5]'
            }`}
          >
            <p className="text-sm font-black text-[#073B5A]">
              {isCorrect
                ? `Nice! You made ${currentRound.groups} equal groups with ${
                    currentRound.targetCount
                  } ${getStarWord(currentRound.targetCount)} in each group.`
                : `Almost! Each group needs exactly ${
                    currentRound.targetCount
                  } ${getStarWord(currentRound.targetCount)}.`}
            </p>
          </div>
        )}

        <section className="mt-5 rounded-[1.5rem] border border-[#BFEAF0] bg-[#F6FCFD] p-4">
          <div className="mb-3 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3D9] text-2xl">
              💡
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                What did you build?
              </h2>
              <p className="mt-1 text-base font-bold text-[#275875]">
                {hasChecked && isCorrect
                  ? `You're building groups with ${
                      currentRound.targetCount
                    } ${getStarWord(currentRound.targetCount)} in each.`
                  : 'Build the groups, then check your work.'}
              </p>
            </div>
          </div>

          {hasChecked && isCorrect ? (
            <div className="mt-4 rounded-[1.5rem] border border-white/80 bg-white px-5 py-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF6D8] text-5xl shadow-inner">
                    ⭐
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-[#073B5A]">
                      {isZeroRound
                        ? `You've built ${currentRound.groups} empty groups!`
                        : `You've built ${currentRound.groups} groups of 1!`}
                    </h3>
                    <p className="mt-2 text-base font-bold text-[#355F7C]">
                      {isZeroRound
                        ? 'Nice work! Every group has 0 stars.'
                        : `Nice work! You made ${currentRound.groups} equal groups with 1 star in each.`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 text-[#F7B733]">
                  <Sparkles size={18} strokeWidth={2.6} />
                  <Sparkles size={14} strokeWidth={2.6} />
                  <Sparkles size={10} strokeWidth={2.6} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[#00AFB9]/35 bg-white px-5 py-8 text-center">
              <p className="text-lg font-black text-[#073B5A]">
                Your groups will appear here after you check.
              </p>
              <p className="mt-2 text-sm font-bold text-[#073B5A]/65">
                Finish the round above, then we’ll show what you built.
              </p>
            </div>
          )}
        </section>
      </main>

      <aside className="flex flex-col gap-4">
        <section className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Build Progress
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Round {roundIndex + 1} of {buildRounds.length}
              </p>
            </div>

            <p className="text-sm font-black text-[#073B5A]">
              {completedRounds.length}/{buildRounds.length}
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {buildRounds.map((round, index) => {
              const isDone = completedRounds.includes(index)
              const isCurrent = index === roundIndex

              return (
                <button
                  key={`${round.groups}-${round.targetCount}`}
                  type="button"
                  onClick={() => resetRound(index)}
                  className={`rounded-2xl border px-2 py-3 text-center shadow-sm transition ${
                    isCurrent
                      ? 'border-[#00AFB9] bg-[#E9F7F8]'
                      : isDone
                        ? 'border-[#00AFB9]/30 bg-white'
                        : 'border-[#073B5A]/10 bg-white'
                  }`}
                >
                  <p className="text-sm font-black text-[#073B5A]">
                    {isDone ? '✓' : index + 1}
                  </p>
                  <p className="mt-1 text-[0.68rem] font-bold text-[#073B5A]/65">
                    {round.groups}×{round.targetCount}
                  </p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="relative min-h-[150px] overflow-hidden rounded-[1.5rem] border border-[#F7B733]/25 bg-[#FFF3D9] p-5 shadow-sm">
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <Star
                size={22}
                strokeWidth={2.7}
                className="fill-[#F7B733] text-[#F7B733]"
              />
              <p className="text-lg font-black text-[#C78300]">Luma Tip</p>
            </div>

            <div className="w-fit rounded-2xl bg-white px-5 py-4 text-xl font-black leading-tight text-[#073B5A] shadow-sm">
              {isZeroRound ? (
                <>
                  Leave each box
                  <br />
                  empty!
                </>
              ) : (
                <>
                  Tap each box
                  <br />
                  to add 1 star!
                </>
              )}
            </div>
          </div>

          <div className="absolute bottom-[-40px] right-[-10px] w-32">
            <LumaAvatar size="lg" state="happy" showEnergy={false} />
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-[#00AFB9]/20 bg-[#E9F7F8] p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-[#00AFB9] shadow-sm">
              ✦
            </div>

            <div>
              <h2 className="text-xl font-black text-[#073B5A]">
                Math Pattern
              </h2>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Notice the rule
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4">
            <p className="text-sm font-black text-[#073B5A]">
              {currentRound.pattern}
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.groups} × {currentRound.targetCount} ={' '}
                  {currentRound.groups * currentRound.targetCount}
                </p>
                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                  This round
                </p>
              </div>

              <div className="rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-3 text-center">
                <p className="text-xl font-black text-[#073B5A]">
                  {currentRound.targetCount === 0 ? '9 × 0 = 0' : '7 × 1 = 7'}
                </p>
                <p className="mt-1 text-xs font-bold text-[#073B5A]/65">
                  Same pattern
                </p>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </>
  )
}

function PlaceholderPage({
  stepIndex,
  title,
  body,
}: {
  stepIndex: number
  title: string
  body: string
}) {
  return (
    <>
      <main className="self-start rounded-[2rem] border border-[#073B5A]/10 bg-white p-8 shadow-sm">
        <div className="flex min-h-[430px] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-[#E9F7F8] text-[#00AFB9]">
            <BookOpen size={40} strokeWidth={2.6} />
          </div>

          <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-[#0081A7]">
            Page {stepIndex + 1}
          </p>

          <h2 className="mt-2 text-3xl font-black text-[#073B5A]">{title}</h2>

          <p className="mt-4 max-w-[520px] text-lg font-bold leading-relaxed text-[#275875]">
            {body}
          </p>
        </div>
      </main>

      <aside className="self-start rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#073B5A]">Learning Tip</h2>
        <p className="mt-3 text-base font-bold leading-relaxed text-[#073B5A]/70">
          We’ll fill this page with a focused teaching activity next.
        </p>
      </aside>
    </>
  )
}
function ScrollMoreHint({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-8 z-40 hidden xl:block">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#073B5A]/10 bg-white/95 text-2xl font-black text-[#0081A7] shadow-lg backdrop-blur">
        <span className="animate-bounce leading-none">↓</span>
      </div>
    </div>
  )
}

function LearnScreen() {
  const navigate = useNavigate()
  const { lessonId } = useParams()

  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId)

  const currentLessonId = getCurrentLessonId({
    lessonId,
    unitNumber: unit.unit_number,
    weekNumber: week.week_number,
    dayNumber: weekDayNumber,
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [isCompactHeader, setIsCompactHeader] = useState(false)
  const [showScrollHint, setShowScrollHint] = useState(false)
  const topSentinelRef = useRef<HTMLDivElement | null>(null)
  const pageContentRef = useRef<HTMLDivElement | null>(null)
  const [isFooterExpanded, setIsFooterExpanded] = useState(false)

  const starName = getStarProfile(CURRENT_STUDENT_ID).starName

  const page = useMemo(() => {
    if (currentStep === 0) {
      return <BigIdeaPage />
    }

    if (currentStep === 1) {
      return <BuildItPage />
    }

    if (currentStep === 2) {
      return (
        <PlaceholderPage
          stepIndex={currentStep}
          title="See It"
          body="Look at the model, the repeated addition, and the multiplication equation together."
        />
      )
    }

    if (currentStep === 3) {
      return (
        <PlaceholderPage
          stepIndex={currentStep}
          title="Words"
          body="Learn the key math words that help explain this skill."
        />
      )
    }

    return (
      <PlaceholderPage
        stepIndex={currentStep}
        title="Quick Check"
        body={`Answer one quick question to show ${
          starName || 'your star'
        } that you're ready for Try It.`}
      />
    )
  }, [currentStep, starName])

  useEffect(() => {
    const sentinel = topSentinelRef.current

    if (!sentinel) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCompactHeader(!entry.isIntersecting)
      },
      {
        threshold: 0,
      },
    )

    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [])

useEffect(() => {
  const pageContent = pageContentRef.current

  if (!pageContent) {
    return
  }

  function getScrollParent(element: HTMLElement | null) {
    let currentElement = element?.parentElement ?? null

    while (currentElement) {
      const styles = window.getComputedStyle(currentElement)
      const overflowY = styles.overflowY

      if (overflowY === 'auto' || overflowY === 'scroll') {
        return currentElement
      }

      currentElement = currentElement.parentElement
    }

    return document.documentElement
  }

  const scrollElement = getScrollParent(pageContent)

  const checkScrollPosition = () => {
    const hasScrollableContent =
      scrollElement.scrollHeight > scrollElement.clientHeight + 24

    const isNearBottom =
      scrollElement.scrollTop + scrollElement.clientHeight >=
      scrollElement.scrollHeight - 96

    setShowScrollHint(hasScrollableContent && !isNearBottom)
    setIsFooterExpanded(!hasScrollableContent || isNearBottom)
  }

  requestAnimationFrame(checkScrollPosition)

  scrollElement.addEventListener('scroll', checkScrollPosition, {
    passive: true,
  })
  window.addEventListener('resize', checkScrollPosition)

  return () => {
    scrollElement.removeEventListener('scroll', checkScrollPosition)
    window.removeEventListener('resize', checkScrollPosition)
  }
}, [currentStep])

function scrollLearnPageToTop() {
  const pageContent = pageContentRef.current

  if (!pageContent) {
    return
  }

  let scrollElement = pageContent.parentElement

  while (scrollElement) {
    const styles = window.getComputedStyle(scrollElement)
    const overflowY = styles.overflowY

    if (overflowY === 'auto' || overflowY === 'scroll') {
      break
    }

    scrollElement = scrollElement.parentElement
  }

  const target = scrollElement ?? document.documentElement

  requestAnimationFrame(() => {
    target.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  })
}





  function backToLesson() {
    navigate(`/lesson/${currentLessonId}`)
  }
function goNext() {
  if (currentStep >= learnSteps.length - 1) {
    updateLessonProgress(currentLessonId, {
      learnComplete: true,
    })

    navigate(`/lesson/${currentLessonId}`)
    return
  }

  setCurrentStep((current) => current + 1)
  scrollLearnPageToTop()
}

function goBack() {
  if (currentStep === 0) {
    backToLesson()
    return
  }

  setCurrentStep((current) => current - 1)
  scrollLearnPageToTop()
}


  return (
    <PageLayout>
      <div ref={pageContentRef} className="flex min-h-full flex-col gap-4 pb-4">
        <div ref={topSentinelRef} className="h-px" />

        <header
          className={`sticky top-0 z-30 rounded-[1.75rem] border border-[#073B5A]/10 bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
            isCompactHeader ? 'px-4 py-2' : 'px-5 py-4'
          }`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={backToLesson}
                className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white text-sm font-black text-[#0081A7] shadow-sm transition hover:bg-[#E9F7F8] ${
                  isCompactHeader ? 'px-3 py-2' : 'px-4 py-2.5'
                }`}
              >
                <ArrowLeft size={18} strokeWidth={3} />
                Back to Lesson
              </button>

              <div
                className={`flex shrink-0 items-center justify-center rounded-full bg-[#073B5A] font-black text-white shadow-sm transition-all ${
                  isCompactHeader ? 'h-9 w-9 text-base' : 'h-12 w-12 text-xl'
                }`}
              >
                2
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1
                    className={`font-black text-[#073B5A] transition-all ${
                      isCompactHeader ? 'text-xl' : 'text-2xl'
                    }`}
                  >
                    Learn
                  </h1>

                  <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                  <p className="text-sm font-black text-[#00AFB9]">
                    Page {currentStep + 1} • {learnSteps[currentStep].label}
                  </p>

                  {!isCompactHeader && (
                    <>
                      <span className="hidden h-1.5 w-1.5 rounded-full bg-[#9AB5C7] sm:block" />

                      <div className="flex items-center gap-1.5 text-sm font-black text-[#275875]">
                        <Clock3 size={16} strokeWidth={2.7} />
                        10 min
                      </div>
                    </>
                  )}
                </div>

                {!isCompactHeader && (
                  <p className="mt-1 truncate text-base font-black text-[#073B5A]">
                    {lesson.lesson_title}
                  </p>
                )}
              </div>
            </div>

            <div className="hidden xl:block">
              {isCompactHeader ? (
                <div className="flex min-w-[300px] items-center gap-3">
                  <p className="shrink-0 text-sm font-black text-[#073B5A]">
                    Step {currentStep + 1} of {learnSteps.length}
                  </p>

                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#DDEEEF]">
                    <div
                      className="h-full rounded-full bg-[#00AFB9] transition-all"
                      style={{
                        width: `${
                          ((currentStep + 1) / learnSteps.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <LearnStepper currentStep={currentStep} />
              )}
            </div>
          </div>

          {!isCompactHeader && (
            <div className="mt-4 xl:hidden">
              <LearnStepper currentStep={currentStep} />
            </div>
          )}
        </header>

        <CompactTodaysWordsCard />

        <section
          className={`grid items-start gap-5 ${
            currentStep === 1
              ? 'xl:grid-cols-[1.55fr_0.75fr]'
              : 'xl:grid-cols-[1.15fr_0.85fr]'
          }`}
        >
          {page}
        </section>

        <ScrollMoreHint isVisible={showScrollHint} />

<footer
  className={`sticky bottom-0 z-30 mx-auto w-[calc(100%-1rem)] rounded-[1.5rem] border border-[#073B5A]/10 bg-white/95 shadow-lg backdrop-blur transition-all duration-300 ${
    isFooterExpanded
      ? 'translate-y-0 p-4'
      : 'translate-y-6 px-3 py-1.5'
  }`}
>
  <div className="flex items-center justify-between gap-4">
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 rounded-2xl border border-[#073B5A]/10 bg-white font-black text-[#073B5A] shadow-sm transition hover:bg-[#F8FBFB] ${
        isFooterExpanded ? 'px-6 py-3 text-base' : 'px-3 py-1.5 text-xs'
      }`}
    >
      <ArrowLeft size={isFooterExpanded ? 20 : 17} strokeWidth={3} />
      {isFooterExpanded ? 'Previous Page' : 'Prev'}
    </button>

    <div className="flex min-w-0 flex-1 items-center justify-center gap-4">
      <p
        className={`shrink-0 font-black text-[#073B5A] ${
          isFooterExpanded ? 'text-sm' : 'text-xs'
        }`}
      >
        {isFooterExpanded
          ? `Step ${currentStep + 1} of ${learnSteps.length}`
          : `${currentStep + 1}/${learnSteps.length}`}
      </p>

      <div
        className={`max-w-[420px] flex-1 overflow-hidden rounded-full bg-[#DDEEEF] ${
          isFooterExpanded ? 'h-3' : 'h-1.5'
        }`}
      >
        <div
          className="h-full rounded-full bg-[#00AFB9] transition-all"
          style={{
            width: `${((currentStep + 1) / learnSteps.length) * 100}%`,
          }}
        />
      </div>
    </div>

    <button
      type="button"
      onClick={goNext}
      className={`inline-flex items-center gap-3 rounded-2xl bg-[#00AFB9] font-black text-white shadow-sm transition hover:bg-[#0081A7] ${
        isFooterExpanded ? 'px-8 py-3 text-base' : 'px-4 py-1.5 text-xs'
      }`}
    >
      {isFooterExpanded ? learnSteps[currentStep].nextLabel : 'Next'}
      <ArrowRight size={isFooterExpanded ? 21 : 18} strokeWidth={3} />
    </button>
  </div>
</footer>
      </div>
    </PageLayout>
  )
}

export default LearnScreen
