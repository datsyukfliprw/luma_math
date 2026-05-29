// @SECTION FILE_OVERVIEW
// learnContent.ts
// Small data-normalization helpers for turning lesson JSON into reusable Learn page content.

// @SECTION LEARN_CONTENT_TYPES
export type LearnExample = {
  prompt?: string
  visual_type?: string
  groups?: number
  items_per_group?: number
  equation?: string
}

export type LearnLesson = {
  day_number?: number
  day_name?: string
  lesson_title?: string
  objective?: string
  concept?: string
  practice?: string
  practice_type?: string
  lesson_video_url?: string
  learn?: {
    title?: string
    teaching_points?: string[]
    example?: LearnExample
    vocabulary?: string[]
  }
}

export type BuildRound = {
  groups: number
  targetCount: number
  instruction: string
  summary: string
  pattern: string
}

export type SeeItClue = {
  visualLabel: string
  groups: number
  inEach: number
  choices: string[]
  sneakyEquation: string
  feedback: string
  tip: string
  ruleFocus: 'identity' | 'zero' | 'product'
}

export type VocabularyWord = {
  word: string
  definition: string
  example: string
  visual: string[]
  equation: string
  color: string
  border: string
  labelColor: string
}

export type MatchingCard = {
  id: string
  correctWord: string
  title: string
  color: string
  border: string
}

export type QuickCheckQuestion = {
  prompt: string
  equationStart: string
  productPrompt: string
  choices: string[]
  correctAnswer: string
  ruleType: string
  tipTitle: string
  tipText: string
  hint: string
  success: string
  visualGroups: number
  visualCount: number
}

const DEFAULT_EXAMPLE = {
  prompt: 'There are 4 groups with 1 star in each group.',
  groups: 4,
  items_per_group: 1,
  equation: '4 × 1 = 4',
}

const VOCABULARY_DETAILS: Record<
  string,
  Omit<VocabularyWord, 'word' | 'color' | 'border' | 'labelColor'>
> = {
  'equal groups': {
    definition: 'Same amount in each group.',
    example: '4 groups of 1',
    visual: ['⭐', '⭐', '⭐', '⭐'],
    equation: '4 groups of 1',
  },
  'repeated addition': {
    definition: 'Adding the same number again and again.',
    example: '1 + 1 + 1 + 1',
    visual: ['1', '+', '1', '+', '1'],
    equation: '1 + 1 + 1 + 1 = 4',
  },
  factor: {
    definition: 'A number being multiplied.',
    example: '4 and 1 are factors',
    visual: ['4', '×', '1'],
    equation: 'factor × factor',
  },
  product: {
    definition: 'The answer to a multiplication problem.',
    example: '4 is the product',
    visual: ['4', '×', '1', '=', '4'],
    equation: 'product = answer',
  },
  'zero rule': {
    definition: 'When a number is multiplied by 0, the product is 0.',
    example: '4 × 0 = 0',
    visual: ['0', '0', '0', '0'],
    equation: 'any number × 0 = 0',
  },
  'identity rule': {
    definition: 'When a number is multiplied by 1, the product stays the same.',
    example: '4 × 1 = 4',
    visual: ['4', '×', '1', '=', '4'],
    equation: 'any number × 1 = same number',
  },
}

const VOCABULARY_STYLES = [
  {
    color: 'bg-[#E9F7F8]',
    border: 'border-[#00AFB9]/25',
    labelColor: 'text-[#0081A7]',
  },
  {
    color: 'bg-[#FFF3D9]',
    border: 'border-[#F7B733]/30',
    labelColor: 'text-[#C78300]',
  },
  {
    color: 'bg-[#FCE9E5]',
    border: 'border-[#F07167]/25',
    labelColor: 'text-[#F07167]',
  },
  {
    color: 'bg-[#F8FBFB]',
    border: 'border-[#073B5A]/10',
    labelColor: 'text-[#073B5A]',
  },
]

// @SECTION LEARN_CONTENT_CORE_HELPERS
export function getLearnTitle(lesson: LearnLesson) {
  return lesson.learn?.title ?? lesson.lesson_title ?? 'Today’s Lesson'
}

export function getBigIdeaDescription(lesson: LearnLesson) {
  return (
    lesson.learn?.teaching_points?.[0] ??
    lesson.concept ??
    lesson.objective ??
    'Look for patterns and connect the picture to the equation.'
  )
}

export function getLessonVideoUrl(lesson: LearnLesson) {
  return lesson.lesson_video_url || 'https://www.youtube.com/embed/gLcD7otUHxw'
}

export function getVideoCaption(lesson: LearnLesson) {
  return lesson.learn?.title ?? lesson.lesson_title ?? 'Watch the lesson idea'
}

export function getEqualGroupsExample(lesson: LearnLesson) {
  const example = lesson.learn?.example ?? DEFAULT_EXAMPLE
  const groups = example.groups ?? DEFAULT_EXAMPLE.groups
  const itemsPerGroup =
    example.items_per_group ?? DEFAULT_EXAMPLE.items_per_group
  const total = groups * itemsPerGroup

  return {
    prompt:
      example.prompt ??
      `There are ${groups} groups with ${itemsPerGroup} star in each group.`,
    groups,
    itemsPerGroup,
    total,
    equation: example.equation ?? `${groups} × ${itemsPerGroup} = ${total}`,
  }
}

export function getMissionSteps(lesson: LearnLesson) {
  const teachingPoints = lesson.learn?.teaching_points ?? []

  if (teachingPoints.length >= 3) {
    return [
      'Watch the idea',
      'Build the model',
      'Spot the pattern',
      'Learn the words',
      'Quick check',
    ]
  }

  return [
    'Watch the idea',
    'Build equal groups',
    'Turn groups into math',
    'Learn the words',
    'Quick check',
  ]
}

export function getBigQuestion(lesson: LearnLesson) {
  const example = getEqualGroupsExample(lesson)

  if (lesson.practice_type === 'equal_groups') {
    return `What changes when each group has ${example.itemsPerGroup}, 1, or 0 items?`
  }

  return lesson.objective ?? 'How can the model help us understand the math?'
}

export function getRuleCards(lesson: LearnLesson) {
  const example = getEqualGroupsExample(lesson)
  const groups = example.groups

  return [
    {
      eyebrow: 'Multiplying by 1',
      equation: `${groups} × 1 = ${groups}`,
      badge: 'Same number',
      description:
        'One in each group keeps the total the same as the number of groups.',
      cardClass: 'border-[#00AFB9]/20 bg-[#E9F7F8]',
      eyebrowClass: 'text-[#0081A7]',
      badgeClass: 'text-[#0081A7]',
    },
    {
      eyebrow: 'Multiplying by 0',
      equation: `${groups} × 0 = 0`,
      badge: 'Zero total',
      description: 'Zero in each group means there are no items to count.',
      cardClass: 'border-[#F07167]/20 bg-[#FCE9E5]',
      eyebrowClass: 'text-[#F07167]',
      badgeClass: 'text-[#F07167]',
    },
  ]
}

// @SECTION LEARN_CONTENT_PAGE_DATA
export function getBuildRounds(lesson: LearnLesson): BuildRound[] {
  const example = getEqualGroupsExample(lesson)
  const firstGroups = example.groups
  const secondGroups = Math.max(firstGroups + 2, 6)

  return [
    {
      groups: firstGroups,
      targetCount: 1,
      instruction: 'Put 1 star in each group.',
      summary: `${firstGroups} groups of 1 = ${firstGroups} total`,
      pattern:
        'When each group has 1, the total stays the same as the number of groups.',
    },
    {
      groups: firstGroups,
      targetCount: 0,
      instruction: `Make ${firstGroups} groups with 0 stars in each group.`,
      summary: `${firstGroups} groups of 0 = 0 total`,
      pattern: 'When each group has 0, there are no stars to count.',
    },
    {
      groups: secondGroups,
      targetCount: 1,
      instruction: 'Put 1 star in each group.',
      summary: `${secondGroups} groups of 1 = ${secondGroups} total`,
      pattern: 'Multiplying by 1 keeps the number the same.',
    },
    {
      groups: secondGroups,
      targetCount: 0,
      instruction: `Make ${secondGroups} groups with 0 stars in each group.`,
      summary: `${secondGroups} groups of 0 = 0 total`,
      pattern: 'Multiplying by 0 always gives 0.',
    },
  ]
}

export function getSeeItClues(lesson: LearnLesson): SeeItClue[] {
  const example = getEqualGroupsExample(lesson)
  const baseGroups = example.groups
  const secondGroups = Math.max(baseGroups + 2, 6)

  return [
    {
      visualLabel: `The picture shows ${baseGroups} groups of 1`,
      groups: baseGroups,
      inEach: 1,
      choices: [
        `${baseGroups} × 1 = ${baseGroups}`,
        `${baseGroups} × 0 = ${baseGroups}`,
        Array.from({ length: baseGroups }, () => '1').join(' + ') +
          ` = ${baseGroups}`,
      ],
      sneakyEquation: `${baseGroups} × 0 = ${baseGroups}`,
      feedback: 'Nice spotting! The picture shows 1 in each group, not 0.',
      tip: 'Check the groups first. Then check what is in each group.',
      ruleFocus: 'identity',
    },
    {
      visualLabel: `The picture shows ${baseGroups} groups of 0`,
      groups: baseGroups,
      inEach: 0,
      choices: [
        `${baseGroups} × 0 = 0`,
        `${baseGroups} × 1 = 0`,
        Array.from({ length: baseGroups }, () => '0').join(' + ') + ' = 0',
      ],
      sneakyEquation: `${baseGroups} × 1 = 0`,
      feedback:
        'Good eye! The groups are empty, so the equation should use 0 in each group.',
      tip: 'Empty groups mean there are no items to count.',
      ruleFocus: 'zero',
    },
    {
      visualLabel: `The picture shows ${secondGroups} groups of 1`,
      groups: secondGroups,
      inEach: 1,
      choices: [
        `${secondGroups} × 1 = ${secondGroups}`,
        Array.from({ length: secondGroups }, () => '1').join(' + ') +
          ` = ${secondGroups}`,
        `${secondGroups} × 1 = 1`,
      ],
      sneakyEquation: `${secondGroups} × 1 = 1`,
      feedback: `You found it! ${secondGroups} groups of 1 makes ${secondGroups} total, not 1.`,
      tip: 'When each group has 1, the total matches the number of groups.',
      ruleFocus: 'identity',
    },
  ]
}

export function getSeeItExamples(lesson: LearnLesson) {
  const example = getEqualGroupsExample(lesson)
  const groups = example.groups

  return [
    {
      title: 'Groups of 1',
      subtitle: 'Each group has 1 star.',
      groups,
      inEach: 1,
      equation: `${groups} × 1 = ${groups}`,
      sentence: `${groups} groups of 1 makes ${groups} total.`,
      color: 'bg-[#E9F7F8]',
      border: 'border-[#00AFB9]/25',
      labelColor: 'text-[#0081A7]',
    },
    {
      title: 'Groups of 0',
      subtitle: 'Each group has 0 stars.',
      groups,
      inEach: 0,
      equation: `${groups} × 0 = 0`,
      sentence: `${groups} groups of 0 makes 0 total.`,
      color: 'bg-[#FCE9E5]',
      border: 'border-[#F07167]/25',
      labelColor: 'text-[#F07167]',
    },
  ]
}

export function getVocabularyWords(lesson: LearnLesson): VocabularyWord[] {
  const vocabulary = lesson.learn?.vocabulary?.length
    ? lesson.learn.vocabulary
    : ['equal groups', 'repeated addition', 'factor', 'product']

  return vocabulary.slice(0, 4).map((word, index) => {
    const normalizedWord = word.toLowerCase()
    const details = VOCABULARY_DETAILS[normalizedWord] ?? {
      definition: `A math word for today’s lesson.`,
      example: word,
      visual: [word.slice(0, 1).toUpperCase()],
      equation: word,
    }
    const style = VOCABULARY_STYLES[index % VOCABULARY_STYLES.length]

    return {
      word,
      ...details,
      ...style,
    }
  })
}

export function getMatchingCards(lesson: LearnLesson): MatchingCard[] {
  return getVocabularyWords(lesson).map((item) => ({
    id: `${item.word.toLowerCase().replace(/\s+/g, '-')}-visual`,
    correctWord: item.word,
    title: item.definition,
    color: item.color,
    border: item.border,
  }))
}

export function getQuickCheckQuestions(
  lesson: LearnLesson,
): QuickCheckQuestion[] {
  const example = getEqualGroupsExample(lesson)
  const groups = example.groups
  const secondGroups = Math.max(groups + 1, 5)

  return [
    {
      prompt: `${secondGroups} groups of 1`,
      equationStart: `${secondGroups} × 1 =`,
      productPrompt: 'Product:',
      choices: ['0', '1', String(secondGroups)],
      correctAnswer: String(secondGroups),
      ruleType: 'Identity Rule',
      tipTitle: 'Use the Identity Rule',
      tipText: 'Any number × 1 stays the same.',
      hint: 'Multiplying by 1 keeps the number the same.',
      success: 'Nice! Anything × 1 stays the same.',
      visualGroups: secondGroups,
      visualCount: 1,
    },
    {
      prompt: `${secondGroups} groups of 0`,
      equationStart: `${secondGroups} × 0 =`,
      productPrompt: 'Product:',
      choices: ['0', '1', String(secondGroups)],
      correctAnswer: '0',
      ruleType: 'Zero Rule',
      tipTitle: 'Use the Zero Rule',
      tipText: 'Any number × 0 equals 0.',
      hint: 'Each group is empty, so there are no items to count.',
      success: 'Correct! Empty groups make 0 total.',
      visualGroups: secondGroups,
      visualCount: 0,
    },
    {
      prompt: `In ${groups} × 1 = ${groups}, what is the product?`,
      equationStart: `${groups} × 1 =`,
      productPrompt: 'Product:',
      choices: [String(groups), '1', '×'],
      correctAnswer: String(groups),
      ruleType: 'Product',
      tipTitle: 'Find the product',
      tipText: 'The product is the answer to a multiplication problem.',
      hint: 'The product is the answer to a multiplication problem.',
      success: `Nice! The product is ${groups}.`,
      visualGroups: groups,
      visualCount: 1,
    },
  ]
}
