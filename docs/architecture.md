# LumaMath Architecture

## Overview
LumaMath is a K-6 homeschool math application built with React, TypeScript, and TailwindCSS. The app uses a hybrid content model with JSON curriculum data and centralized state management via React Context.

## Technology Stack
- **Frontend**: React 19 with TypeScript
- **Styling**: TailwindCSS
- **Routing**: React Router
- **State Management**: React Context (StudentProgressContext)
- **Storage**: localStorage for persistence
- **Build Tool**: Vite
- **Validation**: Zod for data schema validation

## Key Architectural Decisions

### State Management
- **StudentProgressContext**: Centralized state for lesson progress, flashcard progress, practice rewards, and star profile
- **Single Source of Truth**: All student data flows through the context provider
- **LocalStorage Persistence**: State is automatically persisted to localStorage on changes

### Content Model (Modular Structure)
- **JSON Curriculum**: Curriculum data stored in JSON with Zod validation
- **Lesson Experience Data**: Organized by grade/unit/week in TypeScript files
- **Shared Types**: Centralized type definitions for curriculum and lesson experiences
- **Validation**: Zod schemas ensure data integrity at import time
- **Rationale**: Modular structure enables scalability and type safety

### Component Structure
- **Screens**: Top-level route components (LessonScreen, PracticeScreen, etc.)
- **Components**: Reusable UI components organized by feature
- **Layout**: PageLayout wrapper for consistent page structure

### Data Flow
1. User action → Component event handler
2. Component calls context function (e.g., `updateLessonProgress`)
3. Context updates state and persists to localStorage
4. State change triggers re-renders in subscribed components

## File Organization
```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components
│   ├── lesson/         # Lesson-specific components
│   └── luma/           # Luma mascot components
├── contexts/           # React Context providers
├── data/               # Static lesson data
│   ├── curriculum/     # JSON curriculum files with validation
│   │   ├── curriculumSchema.ts    # Zod validation schemas
│   │   ├── validateCurriculum.ts # Validation functions
│   │   ├── curriculumRegistry.ts  # Central curriculum registry
│   │   └── grade_3/               # Grade-specific curriculum data
│   └── lessonExperience/ # Lesson experience data
│       ├── types.ts               # Shared type definitions
│       ├── experienceSchema.ts    # Zod validation schemas
│       ├── validateExperience.ts  # Validation functions
│       └── grade3/                # Grade-specific lesson data
│           └── unit1/
│               └── week1/         # Week-specific lesson modules
├── flashcards/         # Flashcard deck registry and types
├── lib/                # Utility functions and adapters
├── screens/            # Route-level components
└── types/              # TypeScript type definitions
```

## Responsive Design Strategy
- **Tablet-First**: Primary design target for iPad/tablet experience
- **Browser-First**: Web-based technology accessible on all devices
- **Phone-Friendly**: Parent controls optimized for mobile screens
- **Tailwind Breakpoints**: Used for responsive layouts

## Key Patterns

### Context Usage Pattern
```typescript
const { updateLessonProgress, studentState } = useStudentProgress();
const starName = studentState.starProfile.starName;
```

### Progress Tracking Pattern
```typescript
updateLessonProgress(lessonId, {
  learnComplete: true,
});
```

### Flashcard Progress Pattern
```typescript
recordFlashcardAnswer(deckId, cardId, "known", cardIds, currentIndex);
```

## Storage Keys
- `lumamath_lesson_progress`: Lesson completion data
- `lumamath.flashcardProgress`: Flashcard deck progress
- `lumamath.practiceRewards`: Practice reward states
- `lumamath_star_profiles`: Star profile data

## Migration Notes
- Old localStorage helper files (`lessonProgress.ts`, `practiceRewards.ts`) have been deprecated
- Utility-only files (`starProfile.ts`, `flashcardProgress.ts`) retained for helper functions
- All screens migrated to use StudentProgressContext
