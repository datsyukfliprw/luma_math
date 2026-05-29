export type FlashcardAnswerMode = 'number' | 'text' | 'self_check'

export type FlashcardCardType =
  | 'math_fact'
  | 'vocabulary'
  | 'rule'
  | 'visual_model'
  | 'mistake_review'

export type FlashcardCategory =
  | 'lesson'
  | 'grade'
  | 'unit'
  | 'skill'

export type FlashcardDeckKind =
  | 'math_facts'
  | 'vocabulary'
  | 'rules'
  | 'visual_models'
  | 'mistake_review'
  | 'challenge'

export type Flashcard = {
  id: string
  cardType: FlashcardCardType
  prompt: string
  displayPrompt: string
  correctAnswer: string
  acceptableAnswers?: string[]
  explanation: string
  tag: string
  answerMode: FlashcardAnswerMode
}

export type FlashcardDeck = {
  deckId: string
  title: string
  subtitle: string
  meta: string
  category: FlashcardCategory
  kind: FlashcardDeckKind
  grade: number
  unit?: number
  week?: number
  day?: number
  lessonId?: string
  cardCount: number
  topics: number
  estimatedMinutes?: number
  cards: Flashcard[]
}
