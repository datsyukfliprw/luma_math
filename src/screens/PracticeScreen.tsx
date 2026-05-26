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

function getHintText(visualType?: string) {
  if (visualType === 'fair_sharing') {
    return 'Fair sharing means splitting items equally so each group gets the same amount.'
  }

  if (visualType === 'array_rows_columns') {
    return 'Rows go across. Columns go up and down. Count both to find the product.'
  }

  if (visualType === 'multiple_choice') {
    return 'The commutative property means you can switch the order of the factors and keep the same product.'
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
  if (visualType === 'fair_sharing') {
    return 'Share the items equally into each group.'
  }

  if (visualType === 'array_rows_columns') {
    return 'Count the rows, then count the columns.'
  }

  if (visualType === 'multiple_choice') {
    return 'Try flipping the two factors around.'
  }

  if (visualType === 'repeated_addition') {
    return 'Count how many times the same number repeats.'
  }

  if (visualType === 'factor_product') {
    return 'Look at the equation and decide which numbers are factors and which number is the product.'
  }

  return 'Count all the stars to find the total.'
}

function getFactorProductSlotOrder(problemIndex: number) {
  const orders = [
    ['factorA', 'factorB', 'product'],
    ['product', 'factorA', 'factorB'],
    ['factorA', 'product', 'factorB'],
  ] as const

  return orders[problemIndex % orders.length]
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
  const [quotientAnswer, setQuotientAnswer] = useState('')
  const [selectedChoice, setSelectedChoice] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [correctProblemIndexes, setCorrectProblemIndexes] = useState<number[]>([])

  const currentProblem = problems[currentProblemIndex]
  const visualData = currentProblem?.visualData

  const lessonPath = lessonId ? `/lesson/${lessonId}` : '/lesson'
  const practiceTypeLabel = formatPracticeType(lesson.practice_type)
  const correctCount = correctProblemIndexes.length

  function recordFeedback(isCorrect: boolean) {
    setFeedback(isCorrect ? 'correct' : 'incorrect')

    if (isCorrect) {
      setCorrectProblemIndexes((current) => {
        if (current.includes(currentProblemIndex)) {
          return current
        }

        return [...current, currentProblemIndex]
      })
    }
  }

  function checkAnswer() {
    if (!currentProblem) return

    if (currentProblem.visualType === 'factor_product') {
      const expected = currentProblem.answerData

      const studentFactors = [
        normalizeAnswer(factorAAnswer),
        normalizeAnswer(factorBAnswer),
      ].sort()

      const expectedFactors = [
        normalizeAnswer(expected?.factorA ?? ''),
        normalizeAnswer(expected?.factorB ?? ''),
      ].sort()

      const factorsAreCorrect =
        studentFactors[0] === expectedFactors[0] &&
        studentFactors[1] === expectedFactors[1]

      const productIsCorrect =
        normalizeAnswer(productAnswer) === normalizeAnswer(expected?.product ?? '')

      recordFeedback(factorsAreCorrect && productIsCorrect)
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

      recordFeedback(rowsAreCorrect && columnsAreCorrect && productIsCorrect)
      return
    }

    if (currentProblem.visualType === 'multiple_choice') {
      recordFeedback(
        normalizeAnswer(selectedChoice) ===
          normalizeAnswer(currentProblem.correctAnswer),
      )

      return
    }

    if (currentProblem.visualType === 'fair_sharing') {
      const expected = currentProblem.answerData

      recordFeedback(
        normalizeAnswer(quotientAnswer) ===
          normalizeAnswer(expected?.quotient ?? ''),
      )

      return
    }

    const userAnswer = normalizeAnswer(answer)
    const correctAnswer = normalizeAnswer(currentProblem.correctAnswer)

    recordFeedback(userAnswer === correctAnswer)
  }

  function goToNextQuestion() {
    setAnswer('')
    setFactorAAnswer('')
    setFactorBAnswer('')
    setProductAnswer('')
    setRowsAnswer('')
    setColumnsAnswer('')
    setQuotientAnswer('')
    setSelectedChoice('')
    setShowHint(false)
    setFeedback(null)

    if (currentProblemIndex < problems.length - 1) {
      setCurrentProblemIndex((current) => current + 1)
    }
  }

  function renderHintVisual() {
    if (currentProblem?.visualType === 'factor_product') {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <p className="text-2xl font-black text-[#073B5A]">
            {visualData?.equation ?? '3 × 4 = 12'}
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs font-black">
            <span className="rounded-full bg-white px-3 py-1 text-[#0081A7]">
              Factors are the numbers being multiplied
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-[#F07167]">
              Product is the answer
            </span>
          </div>
        </div>
      )
    }

    if (currentProblem?.visualType === 'array_rows_columns') {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <div className="mx-auto grid w-fit grid-cols-4 gap-1.5 rounded-xl bg-white p-3">
            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="h-3 w-3 rounded-full bg-[#F07167]"
              />
            ))}
          </div>

          <p className="mt-2 text-xs font-black text-[#073B5A]/70">
            3 rows × 4 columns
          </p>
        </div>
      )
    }

    if (currentProblem?.visualType === 'multiple_choice') {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <p className="text-xl font-black text-[#073B5A]">3 × 4</p>
          <p className="text-sm font-black text-[#0081A7]">flips to</p>
          <p className="text-xl font-black text-[#073B5A]">4 × 3</p>
        </div>
      )
    }

    if (currentProblem?.visualType === 'fair_sharing') {
      return (
        <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((group) => (
              <div
                key={group}
                className="rounded-xl border border-dashed border-[#00AFB9] bg-white p-2"
              >
                <p className="text-xs font-black text-[#0081A7]">Group</p>
                <p className="text-lg">🍎🍎🍎🍎</p>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-center">
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((group) => (
            <div
              key={group}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-[#00AFB9] bg-white"
            >
              <div className="grid grid-cols-2 gap-1">
                {[1, 2, 3, 4].map((dot) => (
                  <span
                    key={dot}
                    className="h-2 w-2 rounded-full bg-[#00AFB9]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function renderProblemVisual() {
    if (!currentProblem || !visualData) return null

    if (currentProblem.visualType === 'factor_product') {
      return (
        <div className="mt-4 overflow-hidden rounded-3xl border border-[#F4D589] bg-[radial-gradient(circle_at_8%_28%,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_30%),linear-gradient(90deg,#FEF3D9_0%,#FFF8E9_100%)] p-6 text-center">
          <p className="text-[3.25rem] font-black tracking-wide text-[#073B5A]">
            {visualData.equation}
          </p>

          <p className="mt-3 text-base font-bold text-[#073B5A]/75">
            Which numbers are being multiplied, and which number is the answer?
          </p>
        </div>
      )
    }

    if (currentProblem.visualType === 'equal_groups') {
      return (
        <div className="mt-4 rounded-3xl bg-[#FEF3D9]/70 px-4 py-5">
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: visualData.groups ?? 0 }).map(
              (_, groupIndex) => (
                <div
                  key={groupIndex}
                  className="rounded-2xl border border-[#00AFB9]/35 bg-[#E9F7F8] p-4 shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-2.5 text-[2rem] leading-none">
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
      )
    }

    if (currentProblem.visualType === 'repeated_addition') {
      return (
        <div className="mt-4 rounded-3xl bg-[#FEF3D9] p-5 text-center">
          <p className="text-4xl font-black text-[#073B5A]">
            {visualData.repeatedAddition}
          </p>

          <p className="mt-2 text-sm font-bold text-[#073B5A]/70">
            Write this as a multiplication sentence.
          </p>
        </div>
      )
    }

    if (currentProblem.visualType === 'array_rows_columns') {
      return (
        <div className="mt-4 rounded-3xl bg-[#FEF3D9] p-5 text-center">
          <div
            className="mx-auto grid w-fit gap-2.5 rounded-2xl bg-white p-4 shadow-sm"
            style={{
              gridTemplateColumns: `repeat(${visualData.columns ?? 1}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({
              length: (visualData.rows ?? 0) * (visualData.columns ?? 0),
            }).map((_, index) => (
              <span
                key={index}
                className="h-8 w-8 rounded-full bg-[#F07167]"
              />
            ))}
          </div>

          <p className="mt-3 text-sm font-bold text-[#073B5A]/70">
            Count the rows and columns to find the product.
          </p>
        </div>
      )
    }

    if (currentProblem.visualType === 'multiple_choice') {
      return (
        <div className="mt-4 rounded-3xl bg-[#FEF3D9] p-5 text-center">
          <p className="text-4xl font-black text-[#073B5A]">
            {visualData.equation}
          </p>

          <p className="mt-2 text-sm font-bold text-[#073B5A]/70">
            Multiplication can be flipped around and still have the same product.
          </p>
        </div>
      )
    }

    if (currentProblem.visualType === 'fair_sharing') {
      return (
        <div className="mt-4 rounded-3xl bg-[#FEF3D9] p-5 text-center">
          <p className="text-4xl font-black text-[#073B5A]">
            {visualData.equation}
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {Array.from({ length: visualData.groupsToShare ?? 0 }).map(
              (_, groupIndex) => (
                <div
                  key={groupIndex}
                  className="rounded-2xl border border-[#00AFB9]/35 bg-white p-3 shadow-sm"
                >
                  <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#0081A7]">
                    Group {groupIndex + 1}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-xl">
                    {Array.from({
                      length: visualData.itemsPerGroup ?? 0,
                    }).map((_, itemIndex) => (
                      <span key={itemIndex}>🍎</span>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>

          <p className="mt-3 text-sm font-bold text-[#073B5A]/70">
            Share {visualData.items} items equally into{' '}
            {visualData.groupsToShare} groups.
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <PageLayout>
      <div className="mb-3 flex items-center justify-between gap-4">
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

          <h1 className="mt-0.5 text-[1.45rem] font-black leading-tight tracking-[-0.02em] text-[#073B5A]">
            {lesson.lesson_title}
          </h1>
        </div>

        <div className="hidden rounded-xl border border-[#073B5A]/10 bg-white px-3 py-1.5 shadow-sm md:flex md:items-center md:gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FED9B7] text-lg">
            👧
          </div>

          <div>
            <p className="text-xs font-black text-[#073B5A]">Ava Johnson</p>
            <p className="text-[0.7rem] font-bold text-[#073B5A]/60">
              3rd Grade
            </p>
          </div>
        </div>
      </div>

      <section className="mb-3 rounded-[1.2rem] border border-[#F4D589] bg-[radial-gradient(circle_at_82%_50%,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.48)_18%,rgba(254,243,217,0.86)_38%,rgba(254,243,217,1)_72%),linear-gradient(90deg,#FEF3D9_0%,#FEF3D9_48%,#FFF8E9_100%)] p-3 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[210px_1fr_90px] lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
              ⭐
            </div>

            <div>
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#00AFB9]">
                Skill
              </p>

              <h2 className="text-lg font-black leading-tight text-[#073B5A]">
                {practiceTypeLabel}
              </h2>
            </div>
          </div>

          <div className="border-[#073B5A]/10 lg:border-l lg:pl-4">
            <p className="text-sm font-bold leading-relaxed text-[#073B5A]/75">
              {lesson.practice}
            </p>
          </div>

          <div className="text-xs font-black text-[#073B5A]/70 lg:text-right">
            ◷ 5 min
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        {currentProblem ? (
          <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FDFDFC] p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="rounded-full border border-[#00AFB9]/20 bg-[#E9F7F8] px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-[#0081A7]">
                Question {currentProblemIndex + 1} of {problems.length}
              </p>

              <p className="rounded-full bg-[#E9F7F8] px-3 py-1 text-xs font-bold text-[#0081A7]">
                {formatPracticeType(currentProblem.visualType)}
              </p>
            </div>

            <h2 className="max-w-3xl text-[1.35rem] font-black leading-snug tracking-[-0.01em] text-[#073B5A]">
              {currentProblem.questionText}
            </h2>

            {renderProblemVisual()}

            {currentProblem.visualType === 'factor_product' ? (
              <div className="mx-auto mt-5 grid max-w-2xl gap-3 md:grid-cols-3">
                {getFactorProductSlotOrder(currentProblemIndex).map((slot) => {
                  const isProduct = slot === 'product'

                  const value =
                    slot === 'factorA'
                      ? factorAAnswer
                      : slot === 'factorB'
                        ? factorBAnswer
                        : productAnswer

                  const setValue =
                    slot === 'factorA'
                      ? setFactorAAnswer
                      : slot === 'factorB'
                        ? setFactorBAnswer
                        : setProductAnswer

                  return (
                    <label key={slot} className="block">
                      <span
                        className={`mb-1.5 block text-center text-xs font-black uppercase tracking-wide ${
                          isProduct ? 'text-[#F07167]' : 'text-[#0081A7]'
                        }`}
                      >
                        {isProduct ? 'Product' : 'Factor'}
                      </span>

                      <input
                        value={value}
                        onChange={(event) => {
                          setValue(event.target.value)
                          setFeedback(null)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') checkAnswer()
                        }}
                        className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-2.5 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                        placeholder="Enter a number"
                      />
                    </label>
                  )
                })}

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="mx-auto rounded-xl bg-[#00AFB9] px-6 py-3 font-black text-white shadow-sm md:col-span-3"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === 'array_rows_columns' ? (
              <div className="mx-auto mt-5 grid max-w-2xl gap-3 md:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#0081A7]">
                    Rows
                  </span>

                  <input
                    value={rowsAnswer}
                    onChange={(event) => {
                      setRowsAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-2.5 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#0081A7]">
                    Columns
                  </span>

                  <input
                    value={columnsAnswer}
                    onChange={(event) => {
                      setColumnsAnswer(event.target.value)
                      setFeedback(null)
                    }}
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-2.5 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-center text-xs font-black uppercase tracking-wide text-[#F07167]">
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
                    className="w-full rounded-xl border border-[#073B5A]/15 bg-white px-4 py-2.5 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                    placeholder="?"
                  />
                </label>

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="mx-auto rounded-xl bg-[#00AFB9] px-6 py-3 font-black text-white shadow-sm md:col-span-3"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === 'multiple_choice' ? (
              <div className="mx-auto mt-5 grid max-w-2xl gap-2.5">
                {visualData?.choices?.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => {
                      setSelectedChoice(choice)
                      setFeedback(null)
                    }}
                    className={`rounded-xl border px-4 py-3 text-left text-lg font-black transition ${
                      selectedChoice === choice
                        ? 'border-[#00AFB9] bg-[#E9F7F8] text-[#0081A7]'
                        : 'border-[#073B5A]/10 bg-white text-[#073B5A] hover:border-[#00AFB9]/40 hover:bg-[#F5FBFC]'
                    }`}
                  >
                    {choice}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={checkAnswer}
                  disabled={!selectedChoice}
                  className={`mt-1 rounded-xl px-6 py-3 font-black shadow-sm ${
                    selectedChoice
                      ? 'bg-[#00AFB9] text-white'
                      : 'bg-[#DDEEEF] text-[#073B5A]/55'
                  }`}
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : currentProblem.visualType === 'fair_sharing' ? (
              <div className="mx-auto mt-5 flex max-w-xl gap-3">
                <input
                  value={quotientAnswer}
                  onChange={(event) => {
                    setQuotientAnswer(event.target.value)
                    setFeedback(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') checkAnswer()
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                  placeholder="How many in each group?"
                />

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm"
                >
                  ✓ Check Answer
                </button>
              </div>
            ) : (
              <div className="mx-auto mt-5 flex max-w-xl gap-3">
                <input
                  value={answer}
                  onChange={(event) => {
                    setAnswer(event.target.value)
                    setFeedback(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') checkAnswer()
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-[#073B5A]/15 bg-white px-4 py-3 text-center text-base font-bold outline-none focus:border-[#00AFB9]"
                  placeholder="Your answer"
                />

                <button
                  type="button"
                  onClick={checkAnswer}
                  className="rounded-xl bg-[#00AFB9] px-5 py-3 font-black text-white shadow-sm"
                >
                  ✓ Check Answer
                </button>
              </div>
            )}

            <div className="mx-auto mt-4 flex max-w-3xl items-center gap-4 rounded-2xl border border-[#00AFB9]/25 bg-[#E9F7F8] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00AFB9] text-xl text-white">
                ★
              </div>

              <p className="text-sm font-bold leading-relaxed text-[#073B5A]">
                {getSmallHintText(currentProblem.visualType)}
              </p>
            </div>

            {feedback === 'correct' && (
              <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-[#00AFB9]/30 bg-[#E9F7F8] p-3 text-center">
                <p className="font-black text-[#073B5A]">
                  Nice! That’s correct. ✨
                </p>
              </div>
            )}

            {feedback === 'incorrect' && (
              <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-[#F07167]/25 bg-[#FCE9E5] p-3 text-center">
                <p className="font-black text-[#073B5A]">
                  Not quite. Try again.
                </p>

                <p className="mt-1 text-sm font-semibold text-[#073B5A]/70">
                  {getHintText(currentProblem.visualType)}
                </p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-[#073B5A]/10 pt-4">
              <Link
                to={lessonPath}
                className="rounded-xl border border-[#00AFB9]/40 bg-white px-4 py-2.5 text-sm font-black text-[#0081A7]"
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
                className={`rounded-xl px-4 py-2.5 text-sm font-black shadow-sm ${
                  feedback === 'correct' &&
                  currentProblemIndex < problems.length - 1
                    ? 'bg-[#00AFB9] text-white'
                    : 'bg-[#DDEEEF] text-[#073B5A]/55'
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

        <aside className="space-y-3">
          <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-[#FFFDF7] p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              Need a hint?
            </p>

            {showHint ? (
              <>
                {renderHintVisual()}

                <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-bold leading-relaxed text-[#073B5A]/80">
                  {getHintText(currentProblem?.visualType)}
                </p>
              </>
            ) : (
              <p className="mt-3 rounded-2xl bg-[#E9F7F8] p-3 text-sm font-bold leading-relaxed text-[#073B5A]/60">
                Stuck? Tap the button for a clue.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowHint((current) => !current)}
              className="mt-3 w-full rounded-xl border border-[#00AFB9]/40 bg-white px-4 py-2.5 text-sm font-black text-[#0081A7]"
            >
              {showHint ? 'Hide Hint' : '💡 Show Hint'}
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-[#073B5A]/10 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              Progress
            </p>

            <p className="mt-2 text-sm font-bold text-[#073B5A]/70">
              Question {currentProblemIndex + 1} of {problems.length}
            </p>

            <div className="mt-3 flex items-center gap-2">
              {problems.map((problem, index) => (
                <div
                  key={problem.id}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-black ${
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

            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#073B5A]/10">
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

            <p className="mt-4 text-sm font-black text-[#073B5A]/75">
              Correct answers:{' '}
              <span className="text-[#0081A7]">{correctCount}</span>
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-[#F4D589] bg-[#FEF3D9] p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0081A7]">
              Today&apos;s Goal
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-4xl shadow-sm">
                🎯
              </div>

              <div className="space-y-2 text-sm font-bold text-[#073B5A]/80">
                <p>◉ Answer 3 questions</p>
                <p>◉ Score 80% or higher</p>
              </div>
            </div>

            <div className="mt-4 border-t border-[#F4D589] pt-3">
              <p className="font-black text-[#073B5A]">You&apos;ve got this! ⭐</p>
            </div>
          </div>
        </aside>
      </section>
    </PageLayout>
  )
}

export default PracticeScreen
