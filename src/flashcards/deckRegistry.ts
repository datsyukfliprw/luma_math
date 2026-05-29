import type { Flashcard, FlashcardDeck } from './types'

function mathFactCard(
  id: string,
  displayPrompt: string,
  correctAnswer: string,
  explanation: string,
  tag = 'Math Fact',
): Flashcard {
  return {
    id,
    cardType: 'math_fact',
    prompt: displayPrompt.replace(' = ?', ''),
    displayPrompt,
    correctAnswer,
    explanation,
    tag,
    answerMode: 'number',
  }
}

const zeroIdentityCards: Flashcard[] = [
  mathFactCard(
    'zero-one-1',
    '0 × 0 = ?',
    '0',
    'Zero groups or zero in a group makes 0.',
    'Zero Rule',
  ),
  mathFactCard(
    'zero-one-2',
    '3 × 0 = ?',
    '0',
    'Any number multiplied by 0 equals 0.',
    'Zero Rule',
  ),
  mathFactCard(
    'zero-one-3',
    '4 × 1 = ?',
    '4',
    'Multiplying by 1 keeps the number the same.',
    'Identity Rule',
  ),
  mathFactCard(
    'zero-one-4',
    '7 × 1 = ?',
    '7',
    'One group of 7 makes 7.',
    'Identity Rule',
  ),
  mathFactCard(
    'zero-one-5',
    '8 × 0 = ?',
    '0',
    'Eight groups of zero makes 0.',
    'Zero Rule',
  ),
  mathFactCard(
    'zero-one-6',
    '1 × 9 = ?',
    '9',
    'One group of 9 makes 9.',
    'Identity Rule',
  ),
  mathFactCard(
    'zero-one-7',
    '6 × 1 = ?',
    '6',
    'Multiplying by 1 keeps 6 the same.',
    'Identity Rule',
  ),
  mathFactCard(
    'zero-one-8',
    '5 × 0 = ?',
    '0',
    'Five groups of zero makes 0.',
    'Zero Rule',
  ),
  {
    id: 'zero-one-9',
    cardType: 'vocabulary',
    prompt: 'product',
    displayPrompt: 'What does product mean?',
    correctAnswer: 'answer',
    acceptableAnswers: [
      'answer',
      'the answer',
      'total',
      'the total',
      'result',
      'the result',
      'multiplication answer',
      'answer to a multiplication problem',
      'the answer to a multiplication problem',
      'what you get when you multiply',
    ],
    explanation: 'The product is the answer to a multiplication problem.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  mathFactCard(
    'zero-one-10',
    '9 × 1 = ?',
    '9',
    'Nine groups of 1 makes 9.',
    'Identity Rule',
  ),
]

const equalGroupsCards: Flashcard[] = [
  mathFactCard('equal-groups-1', '3 × 2 = ?', '6', 'Three groups of 2 makes 6.', 'Equal Groups'),
  mathFactCard('equal-groups-2', '4 × 3 = ?', '12', 'Four groups of 3 makes 12.', 'Equal Groups'),
  mathFactCard('equal-groups-3', '2 × 5 = ?', '10', 'Two groups of 5 makes 10.', 'Equal Groups'),
  mathFactCard('equal-groups-4', '5 × 2 = ?', '10', 'Five groups of 2 makes 10.', 'Equal Groups'),
  {
    id: 'equal-groups-5',
    cardType: 'vocabulary',
    prompt: 'equal groups',
    displayPrompt: 'What are equal groups?',
    correctAnswer: 'same number',
    acceptableAnswers: [
      'same number',
      'same amount',
      'groups with the same number',
      'groups with the same amount',
      'each group has the same number',
    ],
    explanation: 'Equal groups have the same number of items in each group.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  mathFactCard('equal-groups-6', '3 × 4 = ?', '12', 'Three groups of 4 makes 12.', 'Equal Groups'),
  mathFactCard('equal-groups-7', '6 × 2 = ?', '12', 'Six groups of 2 makes 12.', 'Equal Groups'),
  mathFactCard('equal-groups-8', '2 × 6 = ?', '12', 'Two groups of 6 makes 12.', 'Equal Groups'),
]

const repeatedAdditionCards: Flashcard[] = [
  {
    id: 'repeated-addition-1',
    cardType: 'rule',
    prompt: '3 + 3 + 3 + 3',
    displayPrompt: '3 + 3 + 3 + 3 = ?',
    correctAnswer: '12',
    explanation: 'Four 3s make 12. That matches 4 × 3.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
  {
    id: 'repeated-addition-2',
    cardType: 'rule',
    prompt: '5 + 5',
    displayPrompt: '5 + 5 = ?',
    correctAnswer: '10',
    explanation: 'Two 5s make 10. That matches 2 × 5.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
  {
    id: 'repeated-addition-3',
    cardType: 'rule',
    prompt: '2 + 2 + 2 + 2 + 2',
    displayPrompt: '2 + 2 + 2 + 2 + 2 = ?',
    correctAnswer: '10',
    explanation: 'Five 2s make 10. That matches 5 × 2.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
  {
    id: 'repeated-addition-4',
    cardType: 'rule',
    prompt: '4 + 4 + 4',
    displayPrompt: '4 + 4 + 4 = ?',
    correctAnswer: '12',
    explanation: 'Three 4s make 12. That matches 3 × 4.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
  {
    id: 'repeated-addition-5',
    cardType: 'rule',
    prompt: '6 + 6 + 6',
    displayPrompt: '6 + 6 + 6 = ?',
    correctAnswer: '18',
    explanation: 'Three 6s make 18. That matches 3 × 6.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
  {
    id: 'repeated-addition-6',
    cardType: 'rule',
    prompt: '3 + 3 + 3 + 3 + 3',
    displayPrompt: '3 + 3 + 3 + 3 + 3 = ?',
    correctAnswer: '15',
    explanation: 'Five 3s make 15. That matches 5 × 3.',
    tag: 'Repeated Addition',
    answerMode: 'number',
  },
]

const factorProductCards: Flashcard[] = [
  {
    id: 'factor-product-1',
    cardType: 'vocabulary',
    prompt: 'factor',
    displayPrompt: 'What is a factor?',
    correctAnswer: 'number you multiply',
    acceptableAnswers: [
      'number you multiply',
      'a number you multiply',
      'number being multiplied',
      'one of the numbers in multiplication',
    ],
    explanation: 'A factor is a number you multiply to get a product.',
    tag: 'Factors',
    answerMode: 'text',
  },
  {
    id: 'factor-product-2',
    cardType: 'vocabulary',
    prompt: 'product',
    displayPrompt: 'What is a product?',
    correctAnswer: 'answer',
    acceptableAnswers: [
      'answer',
      'the answer',
      'result',
      'total',
      'answer to a multiplication problem',
    ],
    explanation: 'The product is the answer to a multiplication problem.',
    tag: 'Product',
    answerMode: 'text',
  },
  mathFactCard('factor-product-3', '3 × 4 = ?', '12', 'In 3 × 4 = 12, the product is 12.', 'Product'),
  mathFactCard('factor-product-4', '5 × 1 = ?', '5', 'In 5 × 1 = 5, the product is 5.', 'Product'),
  {
    id: 'factor-product-5',
    cardType: 'rule',
    prompt: '2 and 6',
    displayPrompt: 'In 2 × 6 = 12, what are the factors?',
    correctAnswer: '2 and 6',
    acceptableAnswers: ['2 and 6', '2,6', '2 6', '2 & 6'],
    explanation: 'The factors are the numbers being multiplied: 2 and 6.',
    tag: 'Factors',
    answerMode: 'text',
  },
  {
    id: 'factor-product-6',
    cardType: 'rule',
    prompt: '4 and 0',
    displayPrompt: 'In 4 × 0 = 0, what are the factors?',
    correctAnswer: '4 and 0',
    acceptableAnswers: ['4 and 0', '4,0', '4 0', '4 & 0'],
    explanation: 'The factors are 4 and 0. The product is 0.',
    tag: 'Factors',
    answerMode: 'text',
  },
]

const objectGroupsCards: Flashcard[] = [
  mathFactCard('object-groups-1', '3 × 1 = ?', '3', 'Three groups with 1 object in each group makes 3.', 'Object Groups'),
  mathFactCard('object-groups-2', '4 × 0 = ?', '0', 'Four groups with 0 objects in each group makes 0.', 'Object Groups'),
  mathFactCard('object-groups-3', '2 × 5 = ?', '10', 'Two groups with 5 objects in each group makes 10.', 'Object Groups'),
  mathFactCard('object-groups-4', '5 × 3 = ?', '15', 'Five groups with 3 objects in each group makes 15.', 'Object Groups'),
  mathFactCard('object-groups-5', '6 × 1 = ?', '6', 'Six groups with 1 object in each group makes 6.', 'Object Groups'),
  mathFactCard('object-groups-6', '7 × 0 = ?', '0', 'Seven groups with 0 objects in each group makes 0.', 'Object Groups'),
]

const weekOneReviewCards: Flashcard[] = [
  ...zeroIdentityCards.slice(0, 6),
  ...equalGroupsCards.slice(0, 5),
  ...repeatedAdditionCards.slice(0, 4),
  ...factorProductCards.slice(0, 4),
  ...objectGroupsCards.slice(0, 3),
]

const multiplicationWordsCards: Flashcard[] = [
  {
    id: 'words-1',
    cardType: 'vocabulary',
    prompt: 'factor',
    displayPrompt: 'What is a factor?',
    correctAnswer: 'number you multiply',
    acceptableAnswers: [
      'number you multiply',
      'a number you multiply',
      'number being multiplied',
      'one of the numbers in multiplication',
    ],
    explanation: 'A factor is a number you multiply to get a product.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-2',
    cardType: 'vocabulary',
    prompt: 'product',
    displayPrompt: 'What is a product?',
    correctAnswer: 'answer',
    acceptableAnswers: [
      'answer',
      'the answer',
      'result',
      'total',
      'answer to a multiplication problem',
    ],
    explanation: 'The product is the answer to a multiplication problem.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-3',
    cardType: 'vocabulary',
    prompt: 'equal groups',
    displayPrompt: 'What are equal groups?',
    correctAnswer: 'same number',
    acceptableAnswers: [
      'same number',
      'same amount',
      'groups with the same number',
      'each group has the same number',
    ],
    explanation: 'Equal groups have the same number of items in each group.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-4',
    cardType: 'vocabulary',
    prompt: 'repeated addition',
    displayPrompt: 'What is repeated addition?',
    correctAnswer: 'adding same number again and again',
    acceptableAnswers: [
      'adding same number again and again',
      'adding the same number',
      'same number again and again',
      'adding equal groups',
    ],
    explanation: 'Repeated addition means adding the same number again and again.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-5',
    cardType: 'vocabulary',
    prompt: 'equation',
    displayPrompt: 'What is an equation?',
    correctAnswer: 'number sentence',
    acceptableAnswers: ['number sentence', 'math sentence', 'a math sentence'],
    explanation: 'An equation is a math sentence that shows two things are equal.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-6',
    cardType: 'vocabulary',
    prompt: 'identity rule',
    displayPrompt: 'What does the identity rule mean?',
    correctAnswer: 'number stays the same',
    acceptableAnswers: [
      'number stays the same',
      'multiply by 1 same number',
      'times 1 same number',
      'any number times 1 is itself',
    ],
    explanation: 'The identity rule says any number multiplied by 1 stays the same.',
    tag: 'Math Word',
    answerMode: 'text',
  },
  {
    id: 'words-7',
    cardType: 'vocabulary',
    prompt: 'zero rule',
    displayPrompt: 'What does the zero rule mean?',
    correctAnswer: 'answer is 0',
    acceptableAnswers: [
      'answer is 0',
      'multiply by 0 is 0',
      'times 0 is 0',
      'any number times 0 equals 0',
    ],
    explanation: 'The zero rule says any number multiplied by 0 equals 0.',
    tag: 'Math Word',
    answerMode: 'text',
  },
]

const starterDecks: FlashcardDeck[] = [
  {
    deckId: 'lesson-g3-u1-w1-d1-zero-identity',
    title: 'Zero and Identity Rules',
    subtitle: 'Review ×0 and ×1 rules, plus key math words.',
    meta: 'Unit 1 • Week 1 • Day 1',
    category: 'lesson',
    kind: 'math_facts',
    grade: 3,
    unit: 1,
    week: 1,
    day: 1,
    lessonId: 'unit-1-week-1-day-1',
    cardCount: zeroIdentityCards.length,
    topics: 3,
    estimatedMinutes: 5,
    cards: zeroIdentityCards,
  },
  {
    deckId: 'skill-g3-math-facts-zero-one',
    title: 'Zero and Identity Facts',
    subtitle: 'Practice ×0 and ×1 facts until they feel automatic.',
    meta: '3rd Grade • Math Facts',
    category: 'skill',
    kind: 'math_facts',
    grade: 3,
    unit: 1,
    cardCount: zeroIdentityCards.length,
    topics: 2,
    estimatedMinutes: 5,
    cards: zeroIdentityCards,
  },
  {
    deckId: 'skill-g3-visual-models-equal-groups',
    title: 'Equal Groups',
    subtitle: 'Review groups, items in each group, and totals.',
    meta: '3rd Grade • Visual Models',
    category: 'skill',
    kind: 'visual_models',
    grade: 3,
    unit: 1,
    cardCount: equalGroupsCards.length,
    topics: 2,
    estimatedMinutes: 4,
    cards: equalGroupsCards,
  },
  {
    deckId: 'lesson-g3-u1-w1-d2-repeated-addition',
    title: 'Repeated Addition',
    subtitle: 'Add equal groups, then connect the total to multiplication.',
    meta: 'Unit 1 • Week 1 • Day 2',
    category: 'lesson',
    kind: 'math_facts',
    grade: 3,
    unit: 1,
    week: 1,
    day: 2,
    lessonId: 'unit-1-week-1-day-2',
    cardCount: repeatedAdditionCards.length,
    topics: 2,
    estimatedMinutes: 4,
    cards: repeatedAdditionCards,
  },
  {
    deckId: 'lesson-g3-u1-w1-d3-factors-products',
    title: 'Factors and Products',
    subtitle: 'Practice identifying the numbers being multiplied and the answer.',
    meta: 'Unit 1 • Week 1 • Day 3',
    category: 'lesson',
    kind: 'vocabulary',
    grade: 3,
    unit: 1,
    week: 1,
    day: 3,
    lessonId: 'unit-1-week-1-day-3',
    cardCount: factorProductCards.length,
    topics: 2,
    estimatedMinutes: 4,
    cards: factorProductCards,
  },
  {
    deckId: 'lesson-g3-u1-w1-d4-object-groups',
    title: 'Equal Groups With Objects',
    subtitle: 'Review object groups, piles, and matching equations.',
    meta: 'Unit 1 • Week 1 • Day 4',
    category: 'lesson',
    kind: 'visual_models',
    grade: 3,
    unit: 1,
    week: 1,
    day: 4,
    lessonId: 'unit-1-week-1-day-4',
    cardCount: objectGroupsCards.length,
    topics: 3,
    estimatedMinutes: 4,
    cards: objectGroupsCards,
  },
  {
    deckId: 'lesson-g3-u1-w1-d5-week-review',
    title: 'Week 1 Review',
    subtitle: 'Review equal groups, repeated addition, factors, and products.',
    meta: 'Unit 1 • Week 1 • Day 5',
    category: 'lesson',
    kind: 'math_facts',
    grade: 3,
    unit: 1,
    week: 1,
    day: 5,
    lessonId: 'unit-1-week-1-day-5',
    cardCount: weekOneReviewCards.length,
    topics: 5,
    estimatedMinutes: 8,
    cards: weekOneReviewCards,
  },
  {
    deckId: 'skill-g3-rules-zero-identity',
    title: 'Zero and Identity Rules',
    subtitle: 'Practice the two big multiplication rules.',
    meta: '3rd Grade • Rules',
    category: 'skill',
    kind: 'rules',
    grade: 3,
    unit: 1,
    cardCount: zeroIdentityCards.length,
    topics: 2,
    estimatedMinutes: 5,
    cards: zeroIdentityCards,
  },
  {
    deckId: 'skill-g3-vocabulary-multiplication',
    title: 'Multiplication Words',
    subtitle: 'Practice key multiplication vocabulary.',
    meta: '3rd Grade • Vocabulary',
    category: 'skill',
    kind: 'vocabulary',
    grade: 3,
    unit: 1,
    cardCount: multiplicationWordsCards.length,
    topics: 7,
    estimatedMinutes: 5,
    cards: multiplicationWordsCards,
  },
  {
    deckId: 'unit-g3-u1-foundations',
    title: 'Unit 1 Foundations',
    subtitle: 'A mixed review deck for multiplication and division foundations.',
    meta: '3rd Grade • Unit 1',
    category: 'unit',
    kind: 'math_facts',
    grade: 3,
    unit: 1,
    cardCount: [
      ...zeroIdentityCards,
      ...equalGroupsCards,
      ...repeatedAdditionCards,
      ...factorProductCards,
      ...objectGroupsCards,
      ...multiplicationWordsCards,
    ].length,
    topics: 7,
    estimatedMinutes: 10,
    cards: [
      ...zeroIdentityCards,
      ...equalGroupsCards,
      ...repeatedAdditionCards,
      ...factorProductCards,
      ...objectGroupsCards,
      ...multiplicationWordsCards,
    ],
  },
]

export const flashcardDecks = starterDecks

export const recommendedFlashcardDeckId = 'lesson-g3-u1-w1-d1-zero-identity'

export function getFlashcardDeck(deckId: string | undefined) {
  return (
    flashcardDecks.find((deck) => deck.deckId === deckId) ??
    flashcardDecks.find((deck) => deck.deckId === recommendedFlashcardDeckId) ??
    flashcardDecks[0]
  )
}

export function getFlashcardDeckCardIds(deckId: string | undefined) {
  return getFlashcardDeck(deckId).cards.map((card) => card.id)
}

export function getDecksByKind(kind: FlashcardDeck['kind']) {
  return flashcardDecks.filter((deck) => deck.kind === kind)
}

export function getDecksByCategory(category: FlashcardDeck['category']) {
  return flashcardDecks.filter((deck) => deck.category === category)
}


export type FlashcardCatalogCategoryType = 'grade' | 'unit' | 'skill'

export type FlashcardCatalogCategory = {
  categoryType: FlashcardCatalogCategoryType
  categoryId: string
  title: string
  subtitle: string
  eyebrow: string
  description: string
  icon: string
  accentClass: string
}

export const flashcardCatalogCategories: FlashcardCatalogCategory[] = [
  {
    categoryType: 'grade',
    categoryId: 'k',
    title: 'Kindergarten Flashcards',
    subtitle: 'Counting, shapes, and early number sense.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for Kindergarten decks. More decks will appear here as the curriculum grows.',
    icon: 'K',
    accentClass: 'from-[#FFF8E9] to-[#FDFCDC]',
  },
  {
    categoryType: 'grade',
    categoryId: '1',
    title: '1st Grade Flashcards',
    subtitle: 'Addition, subtraction, and number confidence.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for 1st grade decks. More decks will appear here as the curriculum grows.',
    icon: '1',
    accentClass: 'from-[#E9F7F8] to-[#BDEFF2]',
  },
  {
    categoryType: 'grade',
    categoryId: '2',
    title: '2nd Grade Flashcards',
    subtitle: 'Place value, fact fluency, and problem solving.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for 2nd grade decks. More decks will appear here as the curriculum grows.',
    icon: '2',
    accentClass: 'from-[#FFF4E3] to-[#FED9B7]',
  },
  {
    categoryType: 'grade',
    categoryId: '3',
    title: '3rd Grade Flashcards',
    subtitle: 'Multiplication, division, fractions, and more.',
    eyebrow: 'By Grade',
    description: 'Review all available 3rd grade decks from lessons, units, and skill shelves.',
    icon: '3',
    accentClass: 'from-[#E9F7F8] to-[#00AFB9]/20',
  },
  {
    categoryType: 'grade',
    categoryId: '4',
    title: '4th Grade Flashcards',
    subtitle: 'Fractions, decimals, geometry, and multi-step thinking.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for 4th grade decks. More decks will appear here as the curriculum grows.',
    icon: '4',
    accentClass: 'from-[#F8FBFB] to-[#E9F7F8]',
  },
  {
    categoryType: 'grade',
    categoryId: '5',
    title: '5th Grade Flashcards',
    subtitle: 'Fractions, decimals, algebra patterns, and more.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for 5th grade decks. More decks will appear here as the curriculum grows.',
    icon: '5',
    accentClass: 'from-[#FCE9E5] to-[#FED9B7]',
  },
  {
    categoryType: 'grade',
    categoryId: '6',
    title: '6th Grade Flashcards',
    subtitle: 'Ratios, algebra, geometry, and advanced review.',
    eyebrow: 'By Grade',
    description: 'A focused shelf for 6th grade decks. More decks will appear here as the curriculum grows.',
    icon: '6',
    accentClass: 'from-[#F3F6F8] to-[#E9F7F8]',
  },
  {
    categoryType: 'unit',
    categoryId: 'g3-u1-foundations',
    title: 'Unit 1 Flashcards',
    subtitle: 'Multiplication & Division Foundations',
    eyebrow: 'By Unit',
    description: 'All flashcard decks connected to Unit 1, including lesson decks and mixed unit review.',
    icon: '🌱',
    accentClass: 'from-[#E9F7F8] to-[#FDFCDC]',
  },
  {
    categoryType: 'unit',
    categoryId: 'g3-u2-arrays-area',
    title: 'Unit 2 Flashcards',
    subtitle: 'Arrays and Area',
    eyebrow: 'By Unit',
    description: 'This unit shelf is ready for future decks as Unit 2 grows.',
    icon: '▦',
    accentClass: 'from-[#F8FBFB] to-[#E9F7F8]',
  },
  {
    categoryType: 'unit',
    categoryId: 'g3-u3-fractions',
    title: 'Unit 3 Flashcards',
    subtitle: 'Fractions',
    eyebrow: 'By Unit',
    description: 'This unit shelf is ready for future decks as Unit 3 grows.',
    icon: '◔',
    accentClass: 'from-[#FFF8E9] to-[#FED9B7]',
  },
  {
    categoryType: 'unit',
    categoryId: 'g3-u4-measurement',
    title: 'Unit 4 Flashcards',
    subtitle: 'Measurement',
    eyebrow: 'By Unit',
    description: 'This unit shelf is ready for future decks as Unit 4 grows.',
    icon: '📏',
    accentClass: 'from-[#FDFCDC] to-[#FFF8E9]',
  },
  {
    categoryType: 'unit',
    categoryId: 'g3-u5-data-geometry',
    title: 'Unit 5 Flashcards',
    subtitle: 'Data & Geometry',
    eyebrow: 'By Unit',
    description: 'This unit shelf is ready for future decks as Unit 5 grows.',
    icon: '▥',
    accentClass: 'from-[#E9F7F8] to-[#F8FBFB]',
  },
  {
    categoryType: 'skill',
    categoryId: 'math-facts',
    title: 'Math Facts Decks',
    subtitle: 'Fast recall for number facts and fluency.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for math fact decks across grades, lessons, and units.',
    icon: '123',
    accentClass: 'from-[#E9F7F8] to-[#BDEFF2]',
  },
  {
    categoryType: 'skill',
    categoryId: 'vocabulary',
    title: 'Vocabulary Decks',
    subtitle: 'Math words, meanings, and examples.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for vocabulary decks across grades, lessons, and units.',
    icon: 'Aa',
    accentClass: 'from-[#FFF8E9] to-[#FED9B7]',
  },
  {
    categoryType: 'skill',
    categoryId: 'rules',
    title: 'Rules Decks',
    subtitle: 'Properties, patterns, and math rules.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for rules and properties. More decks will appear here as lessons grow.',
    icon: '🛡️',
    accentClass: 'from-[#F8FBFB] to-[#E9F7F8]',
  },
  {
    categoryType: 'skill',
    categoryId: 'visual-models',
    title: 'Visual Model Decks',
    subtitle: 'Arrays, groups, pictures, and models.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for visual model decks across grades, lessons, and units.',
    icon: '•••',
    accentClass: 'from-[#E9F7F8] to-[#FDFCDC]',
  },
  {
    categoryType: 'skill',
    categoryId: 'mistake-review',
    title: 'Mistake Review Decks',
    subtitle: 'Review missed ideas and common traps.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for targeted review. More decks will appear here as progress tracking grows.',
    icon: '🎯',
    accentClass: 'from-[#FCE9E5] to-[#FED9B7]',
  },
  {
    categoryType: 'skill',
    categoryId: 'challenge',
    title: 'Challenge Decks',
    subtitle: 'Deeper thinking and stretch cards.',
    eyebrow: 'By Skill',
    description: 'A skill shelf for challenge decks. More decks will appear here as challenge content grows.',
    icon: '🏆',
    accentClass: 'from-[#FFF8E9] to-[#FDFCDC]',
  },
]

export function getFlashcardCatalogCategory(
  categoryType: string | undefined,
  categoryId: string | undefined,
) {
  return (
    flashcardCatalogCategories.find(
      (category) =>
        category.categoryType === categoryType && category.categoryId === categoryId,
    ) ??
    flashcardCatalogCategories.find(
      (category) => category.categoryType === 'skill' && category.categoryId === 'math-facts',
    )!
  )
}

export function getDecksForFlashcardCatalogCategory(
  categoryType: string | undefined,
  categoryId: string | undefined,
) {
  if (categoryType === 'grade') {
    const grade = Number(categoryId)

    if (Number.isNaN(grade)) {
      return []
    }

    return flashcardDecks.filter((deck) => deck.grade === grade)
  }

  if (categoryType === 'unit') {
    if (categoryId === 'g3-u1-foundations') {
      return flashcardDecks.filter((deck) => deck.grade === 3 && deck.unit === 1)
    }

    return []
  }

  if (categoryType === 'skill') {
    if (categoryId === 'math-facts') {
      return flashcardDecks.filter((deck) => deck.kind === 'math_facts')
    }

    if (categoryId === 'vocabulary') {
      return flashcardDecks.filter((deck) => deck.kind === 'vocabulary')
    }

    if (categoryId === 'rules') {
      return flashcardDecks.filter((deck) => deck.kind === 'rules')
    }

    if (categoryId === 'visual-models') {
      return flashcardDecks.filter((deck) => deck.kind === 'visual_models')
    }

    if (categoryId === 'mistake-review') {
      return flashcardDecks.filter((deck) => deck.kind === 'mistake_review')
    }

    if (categoryId === 'challenge') {
      return flashcardDecks.filter((deck) => deck.kind === 'challenge')
    }
  }

  return []
}
