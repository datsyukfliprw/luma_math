export type LessonProgress = {
  lessonId: string
  warmupComplete: boolean
  learnComplete: boolean
  tryItComplete: boolean
  practiceComplete: boolean
  lessonComplete: boolean
  correctAnswers: number
  totalQuestions: number
  updatedAt: string
}

const STORAGE_KEY = 'lumamath_lesson_progress'

function getAllProgress(): Record<string, LessonProgress> {
  const saved = window.localStorage.getItem(STORAGE_KEY)

  if (!saved) {
    return {}
  }

  try {
    return JSON.parse(saved) as Record<string, LessonProgress>
  } catch {
    return {}
  }
}

function saveAllProgress(progress: Record<string, LessonProgress>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function getLessonProgress(lessonId: string): LessonProgress {
  const allProgress = getAllProgress()

  return (
    allProgress[lessonId] ?? {
      lessonId,
      warmupComplete: false,
      learnComplete: false,
      tryItComplete: false,
      practiceComplete: false,
      lessonComplete: false,
      correctAnswers: 0,
      totalQuestions: 0,
      updatedAt: new Date().toISOString(),
    }
  )
}

export function updateLessonProgress(
  lessonId: string,
  updates: Partial<Omit<LessonProgress, 'lessonId' | 'updatedAt'>>,
): LessonProgress {
  const allProgress = getAllProgress()
  const currentProgress = getLessonProgress(lessonId)

  const nextProgress: LessonProgress = {
    ...currentProgress,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  nextProgress.lessonComplete =
    nextProgress.warmupComplete &&
    nextProgress.learnComplete &&
    nextProgress.tryItComplete &&
    nextProgress.practiceComplete

  allProgress[lessonId] = nextProgress
  saveAllProgress(allProgress)

  return nextProgress
}

export function resetLessonProgress(lessonId: string) {
  const allProgress = getAllProgress()
  delete allProgress[lessonId]
  saveAllProgress(allProgress)
}
