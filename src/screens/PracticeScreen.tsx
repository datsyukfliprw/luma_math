import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageLayout from '../components/layout/PageLayout'
import { getLessonById } from '../lib/lessonLookup'
import { generateProblemsForPracticeType } from '../practiceTypes/registry'

function formatPracticeType(practiceType: string) {
  return practiceType
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function normalizeAnswer(answer: string) {
  return answer
    .toLowerCase()
    .replaceAll(' ', '')
    .replaceAll('×', 'x')
    .replaceAll('*', 'x')
}

function getPracticeExample(practiceType: string) {
  if (practiceType === 'array_rows_columns') {
    return '3 rows of 4 = 3 × 4'
  }

  if (practiceType === 'repeated_addition_to_multiplication') {
    return '5 + 5 + 5 = 3 × 5'
  }

  if (practiceType === 'factor_product_identification') {
    return '3 × 4 = 12, product is 12'
  }

  return '3 groups of 4 = 3 × 4'
}

function getHintText(visualType?: string) {
  if (visualType === 'array_rows_columns') {
    return 'Rows go across. Columns go up and down. Count both to find the product.'
  }

  if (visualType === 'repeated_addition') {
    return 'Repeated addition adds the same number again and again. Count how many times it repeats.'
  }

  if (visualType === 'factor_product') {
    return 'Factors are the numbers being multiplied. The product is the answer.'
  }

  return 'Equal groups have the same number of items in each group.'
}

function getSmallHintText(visualType?: string) {
  if (visualType === 'array_rows_columns') {
    return '💡 Count the rows, then count the columns.'
  }

  if (visualType === 'repeated_addition') {
    return '💡 Count how many times the same number repeats.'
  }

  if (visualType === 'factor_product') {
    return '💡 Factors are the numbers before the equals sign.'
  }

  return '💡 Count all the stars to find the total.'
}

function PracticeScreen() {
  const { lessonId } = useParams()
  const { unit, week, lesson, weekDayNumber } = getLessonById(lessonId)

  const problems = generateProblemsForPracticeType(lesson.practice_type)

  const [currentProblemIndex, setCurrentProblemIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [factorAAnswer, setFactorAAnswer] = useState('')
  const [factorBAnswer, setFactorBAnswer] = useState('')
  const [productAnswer, setProductAnswer] = useState('')
  const [rowsAnswer, setRowsAnswer] = useState('')
  const [columnsAnswer, setColumnsAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const currentProblem = problems[currentProblemIndex]
  const visualData = currentProblem?.visualData

  const lessonPath = lessonId ? `/lesson/${lessonId}` : '/lesson'
  const practiceTypeLabel = formatPracticeType(lesson.practice_type)

  function checkAnswer() {
    if (!currentProblem) return

    if (currentProblem.visualType === 'factor_product') {
      const expected = currentProblem.answerData

      const factorAIsCorrect =
        normalizeAnswer(factorAAnswer) === normalizeAnswer(expected?.factorA ?? '')

      const factorBIsCorrect =
        normalizeAnswer(factorBAnswer) === normalizeAnswer(expected?.factorB ?? '')

      const productIsCorrect =
        normalizeAnswer(productAnswer) === normalizeAnswer(expected?.product ?? '')

      setFeedback(
        factorAIsCorrect && factorBIsCorrect && productIsCorrect
          ? 'correct'
          : 'incorrect',
      )

      return
    }

    if (currentProblem.visualType === 'array_rows_columns') {
      const expected = currentProblem.answerData

      const rowsAreCorrect =
        normalizeAnswer(rowsAnswer) === normalizeAnswer(expected?.rows ?? '')

      const columnsAreCorrect =
        normalizeAnswer(columnsAnswer) === normalizeAnswer(expected?.columns ?? '')

      const productIsCorrect =
        normalizeAnswer(productAnswer) === normalizeAnswer(expected?.product ?? '')

      setFeedback(
        rowsAreCorrect && columnsAreCorrect && productIsCorrect
          ? 'correct'
          : 'incorrect',
      )

      return
    }

    const userAnswer = normalizeAnswer(answer)
    const correctAnswer = normalizeAnswer(currentProblem.correctAnswer)

    setFeedback(userAnswer === correctAnswer ? 'correct' : 'incorrect')
  }

  function goToNextQuestion() {
    setAnswer('')
    setFactorAAnswer('')
    setFactorBAnswer('')
    setProductAnswer('')
    setRowsAnswer('')
    setColumnsAnswer('')
    setFeedback(null)

    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex((current) => current + 1)
    }
  }

  return (
    <PageLayout>
<div className="mb-4 flex items-center justify-between gap-5">
  <div>
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00AFB9]">
        Practice Time
      </p>

      <span className="hidden h-4 w-px bg-[#073B5A]/15 sm:block" />

      <p className="text-sm font-black text-[#073B5A]/60">
        Unit {unit.unit_number} · Week {week.week_number} · Day{' '}
        {weekDayNumber}
      </p>
    </div>

    <h1 className="mt-1 text-[1.7rem] font-black leading-tight tracking-[-0.02em] text-[#073B5A]">
      {lesson.lesson_title}
    </h1>
  </div>

  <div className="hidden rounded-2xl border border-[#073B5A]/10 bg-white px-4 py-2 shadow-sm md:flex md:items-center md:gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FED9B7] text-xl">
      👧
    </div>

    <div>
      <p className="text-sm font-black text-[#073B5A]">Ava Johnson</p>
      <p className="text-xs font-bold text-[#073B5A]/60">3rd Grade</p>
    </div>
  </div>
</div>
      <section className="mb-5 rounded-[1.75rem] border border-[#F4D589] bg-[radial-gradient(circle_at_82%_50%,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.48)_18%,rgba(254,243,217,0.86)_38%,rgba(254,243,217,1)_72%),linear-gradient(90deg,#FEF3D9_0%,#FEF3D9_48%,#FFF8E9_100%)] p-5 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-[260px_1fr_120px] lg:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
              ⭐
            </div>

            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#00AFB9]">
                Skill
              </p>

              <h2 className="text-2xl font-black text-[#073B5A]">
                {practiceTypeLabel}
              </h2>
            </div>
          </div>

          <div className="border-[#073B5A]/10 lg:border-l lg:pl-6">
            <p className="font-bold leading-relaxed text-[#073B5A]/75">
              {lesson.practice}
            </p>

            <p className="mt-2 font-black text-[#073B5A]">
              Example:{' '}
              <span className="text-[#0081A7]">
                {getPracticeExample(lesson.practice_type)}
              </span>
            </p>
          </div>

          <div className="text-sm font-black text-[#073B5A]/70 lg:text-right">
            ◷ Est. 5 min
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
        {currentProblem ? (
          <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <p className="rounded-full border border-[#00AFB9]/20 bg-[#E9F7F8] px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#0081A7]">
                Question {currentProblemIndex + 1} of {problems.length}
              </p>

              <p className="rounded-full bg-[#E9F7F8] px-3 py-1 text-sm font-bold text-[#0081A7]">
                {formatPracticeType(currentProblem.visualType)}
              </p>
            </div>

            <h2 className="max-w-3xl text-[1.65rem] font-black leading-snug tracking-[-0.01em] text-[#073B5A]">
              {currentProblem.questionText}
            </h2>

            {currentProblem.visualType === 'equal_groups' && visualData && (
              <div className="mt-8 rounded-3xl bg-[#FEF3D9]/70 px-6 py-8">
                <div className="flex flex-wrap justify-center gap-7">
                  {Array.from({ length: visualData.groups ?? 0 }).map(
                    (_, groupIndex) => (
                      <div
                        key={groupIndex}
                        className="rounded-3xl border border-[#00AFB9]/35 bg-[#E9F7F8] p-7 shadow-sm"
                      >
                        <div className="grid grid-cols-2 gap-3.5 text-[2.75rem] leading-none">
                          {Array.from({
                            length: visualData.itemsPerGroup ?? 0,
                          }).map((_, starIndex) => (
                            <span key={starIndex}>⭐</span>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {currentProblem.visualType === 'repeated_addition' && visualData && (
              <div className="mt-8 rounded-3xl bg-[#FEF3D9] p-8 text-center">
                <p className="text-5xl font-black text-[#073B5A]">
                  {visualData.repeatedAddition}
                </p>

                <p className="mt-4 text-lg font-bold text-[#073B5A]/70">
                  Write this as a multiplication sentence.
                </p>
              </div>
            )}

            {currentProblem.visualType === 'factor_product' && visualData && (
              <div className="mt-8 rounded-3xl bg-[#FEF3D9] p-8 text-center">
                <p className="text-5xl font-black text-[#073B5A]">
                  {visualData.equation}
                </p>

                <p className="mt-4 text-lg font-bold text-[#073B5A]/70">
                  Type the two factors and the product.
                </p>
              </div>
            )}

            {currentProblem.visualType === 'array_rows_columns' && visualData && (
              <div className="mt-8 rounded-3xl bg-[#FEF3D9] p-8 text-center">
                <div
                  className="mx-auto grid w-fit gap-3 rounded-2xl bg-white p-6 shadow-sm"
                  style={{
                    gridTemplateColumns: `repeat(${visualData.columns ?? 1}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({
                    length: (visualData.rows ?? 0) * (visualData.columns ?? 0),
                  }).map((_, index) => (
                    <span
                      key={index}
                      className="h-10 w-10 rounded-full bg-[#F07167]"
                    />
                  ))}
                </div>

                <p className="mt-4 text-lg font-bold text-[#073B5A]/70">
                  Count the rows and columns to find the product.
                </p>
              </div>
            )}

            {currentProblem.visualType === 'factor_product' ? (
              <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                    Factor 1
                  </span>

                  <input
                    value={factorAAnswer}
                    onChange={(event) => {
                      setFactorAAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                    Factor 2
                  </span>

                  <input
                    value={factorBAnswer}
                    onChange={(event) => {
                      setFactorBAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#F07167]">
                    Product
                  </span>

                  <input
                    value={productAnswer}
                    onChange={(event) => {
                      setProductAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') checkAnswer()
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm md:col-span-3 md:w-fit"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === 'array_rows_columns' ? (
              <div className="mt-8 grid max-w-2xl gap-4 md:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                    Rows
                  </span>

                  <input
                    value={rowsAnswer}
                    onChange={(event) => {
                      setRowsAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#0081A7]">
                    Columns
                  </span>

                  <input
                    value={columnsAnswer}
                    onChange={(event) => {
                      setColumnsAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-black uppercase tracking-wide text-[#F07167]">
                    Product
                  </span>

                  <input
                    value={productAnswer}
                    onChange={(event) => {
                      setProductAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') checkAnswer()
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm md:col-span-3 md:w-fit"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : (
              <div className="mt-8 flex max-w-xl gap-3">
                <input
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value)
                    setFeedback(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') checkAnswer()
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-[#073B5A]/15 bg-white px-5 py-4 text-lg font-bold outline-none focus:border-[#00AFB9]"
                  placeholder="Your answer"
                />

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-xl bg-[#00AFB9] px-6 py-4 font-black text-white shadow-sm"
                >
                  ✓ Check Answer
                </button>
              </div>
            )}

            <p className="mt-4 text-sm font-semibold text-[#073B5A]/60">
              {getSmallHintText(currentProblem.visualType)}
            </p>

            {feedback === 'correct' && (
              <div className="mt-5 rounded-2xl border border-[#00AFB9]/30 bg-[#E9F7F8] p-4">
                <p className="font-black text-[#073B5A]">
                  Nice! That’s correct. ✨
                </p>
              </div>
            )}

            {feedback === 'incorrect' && (
              <div className="mt-5 rounded-2xl border border-[#F07167]/25 bg-[#FCE9E5] p-4">
                <p className="font-black text-[#073B5A]">
                  Not quite. Try again.
                </p>

                <p className="mt-2 text-sm font-semibold text-[#073B5A]/70">
                  {getHintText(currentProblem.visualType)}
                </p>
              </div>
            )}

            <div className="mt-7 flex items-center justify-between border-t border-[#073B5A]/10 pt-5">
              <Link
                to={lessonPath}
                className="rounded-xl border border-[#00AFB9]/40 bg-white px-5 py-3 font-black text-[#0081A7]"
              >
                ← Back to Lesson
              </Link>

              <button
                type="button"
                onClick={goToNextQuestion}
                disabled={
                  feedback !== 'correct' ||
                  currentProblemIndex >= problems.length - 1
                }
                className={`rounded-xl px-5 py-3 font-black shadow-sm ${
                  feedback === 'correct' &&
                  currentProblemIndex < problems.length - 1
                    ? 'bg-[#00AFB9] text-white'
                    : 'bg-[#E9F7F8] text-[#073B5A]/35'
                }`}
              >
                Next Question →
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#F07167]/20 bg-[#FCE9E5] p-5">
            <p className="font-black text-[#073B5A]">
              No practice generator exists for this practice type yet.
            </p>

            <p className="mt-2 font-semibold text-[#073B5A]/70">
              Practice type: {lesson.practice_type}
            </p>
          </div>
        )}

        <aside className="space-y-4">
          <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-[#FFFDF7] p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Need a hint?
            </p>

            <div className="mt-4 rounded-2xl bg-[#E9F7F8] p-4 text-center">
              <div className="flex justify-center gap-3">
                {[1, 2, 3].map((group) => (
                  <div
                    key={group}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-[#00AFB9] bg-white"
                  >
                    <div className="grid grid-cols-2 gap-1">
                      {[1, 2, 3, 4].map((dot) => (
                        <span
                          key={dot}
                          className="h-2.5 w-2.5 rounded-full bg-[#00AFB9]"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="mt-4 text-lg font-bold leading-relaxed text-[#073B5A]/80">
              {getHintText(currentProblem?.visualType)}
            </p>

            <button className="mt-5 w-full rounded-xl border border-[#00AFB9]/40 bg-white px-4 py-3 font-black text-[#0081A7]">
              💡 Show Example
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-white p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Progress
            </p>

            <p className="mt-3 text-lg font-bold text-[#073B5A]/70">
              Question {currentProblemIndex + 1} of {problems.length}
            </p>

            <div className="mt-4 flex items-center gap-3">
              {problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-black ${
                    index === currentProblemIndex
                      ? 'border-[#00AFB9] bg-[#00AFB9] text-white'
                      : index < currentProblemIndex
                        ? 'border-[#00AFB9]/30 bg-[#E9F7F8] text-[#0081A7]'
                        : 'border-[#073B5A]/15 bg-white text-[#073B5A]/45'
                  }`}
                >
                  {index + 1}
                </div>
              ))}
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#073B5A]/10">
              <div
                className="h-full rounded-full bg-[#00AFB9]"
                style={{
                  width: `${
                    ((currentProblemIndex + 1) /
                      Math.max(problems.length, 1)) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#073B5A]/10 bg-[#FEF3D9] p-5 shadow-sm">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0081A7]">
              Streak
            </p>

            <div className="mt-3 flex items-center gap-4">
              <div className="text-5xl">🔥</div>

              <div>
                <p className="text-3xl font-black text-[#073B5A]">7 days</p>
                <p className="font-bold text-[#073B5A]/70">
                  Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </PageLayout>
  )
}

export default PracticeScreen
