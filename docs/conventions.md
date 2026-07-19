# LumaMath Code Conventions

## General Principles
- **Clarity over cleverness**: Write code that is easy to understand
- **Consistency**: Follow established patterns across the codebase
- **Type safety**: Leverage TypeScript to catch errors early
- **Minimal dependencies**: Prefer simple solutions over complex ones

## TypeScript Conventions

### Type Definitions
- Export types that are used across files
- Use `type` for object shapes, `interface` for class-like structures
- Prefer explicit types over `any`
- Use `Partial<T>` for optional updates

```typescript
// Good
export type LessonProgress = {
  lessonId: string;
  warmupComplete: boolean;
  // ...
};

// Avoid
export interface LessonProgress {
  lessonId: string;
  warmupComplete: boolean;
  // ...
}
```

### Function Signatures
- Use descriptive parameter names
- Return types should be explicit
- Avoid overly complex generic types

```typescript
// Good
function updateLessonProgress(
  lessonId: string,
  updates: Partial<Omit<LessonProgress, "lessonId" | "updatedAt">>,
): LessonProgress {
  // ...
}
```

## React Conventions

### Component Structure
- Functional components with hooks
- Props interfaces defined above component
- Helper functions defined before return
- Early returns for conditional rendering

```typescript
function MyComponent({ prop1, prop2 }: Props) {
  // Hooks
  const [state, setState] = useState();

  // Helper functions
  function handleClick() {
    // ...
  }

  // Early returns
  if (loading) return <Loading />;

  // Render
  return <div>...</div>;
}
```

### Context Usage
- Use `useStudentProgress` hook to access context
- Destructure only what you need
- Pass context functions as parameters to helpers

```typescript
// Good
const { updateLessonProgress, studentState } = useStudentProgress();
const starName = studentState.starProfile.starName;

// Helper function pattern
function getLessonCompletionPercent(
  lessonId: string,
  getLessonProgress: (id: string) => LessonProgress,
) {
  const progress = getLessonProgress(lessonId);
  // ...
}
```

### State Management
- Use local state for UI-specific concerns
- Use context for shared application state
- Avoid prop drilling when context is available

## File Naming Conventions

### Components
- PascalCase for component files: `LessonScreen.tsx`
- kebab-case for utilities: `lessonProgress.ts`
- camelCase for hooks: `useStudentProgress.ts`

### Directories
- Plural for collections: `components/`, `screens/`, `types/`
- Singular for single-purpose: `context/`, `lib/`

## Styling Conventions

### TailwindCSS
- Use utility classes for styling
- Avoid custom CSS when possible
- Use responsive prefixes for mobile-first design
- Group related classes for readability

```tsx
// Good
<div className="flex items-center gap-4 p-4 rounded-lg bg-white">
  <span className="text-lg font-bold">Content</span>
</div>
```

### Color Palette
- Primary: `#073B5A` (Dark Blue)
- Accent: `#00AFB9` (Teal)
- Warning: `#F7B733` (Gold)
- Background: `#faf9f4` (Off-white)
- Use semantic color names in comments

## Import Conventions

### Import Order
1. React and third-party libraries
2. Internal components
3. Internal utilities
4. Types
5. Styles (if any)

```typescript
import { useState } from "react";
import { Link } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import { useStudentProgress } from "../contexts/StudentProgressContext";
import type { LessonProgress } from "../types/lesson";
```

### Absolute vs Relative Imports
- Use relative imports for same-directory files
- Use absolute imports from `src/` root for cross-file references

## Comment Conventions

### Section Comments
Use section comments to organize large files:

```typescript
// @SECTION IMPORTS
import ...

// @SECTION TYPES
type ...

// @SECTION HELPERS
function ...

// @SECTION COMPONENT
function Component() {
  // ...
}
```

### JSDoc Comments
Use JSDoc for complex functions:

```typescript
/**
 * Calculates the next unanswered card index in a flashcard deck.
 * @param cardIds - Array of all card IDs in the deck
 * @param answeredCardIds - Array of card IDs that have been answered
 * @param startIndex - Index to start searching from
 * @returns Index of the next unanswered card
 */
export function getNextUnansweredCardIndex(
  cardIds: string[],
  answeredCardIds: string[],
  startIndex = 0,
) {
  // ...
}
```

## Git Conventions

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Reference related issues if applicable

```
Add StudentProgressContext for centralized state management
Migrate LessonScreen to use context
Fix TypeScript errors in PracticeScreen
```

### Branch Naming
- `feature/feature-name`
- `fix/bug-description`
- `docs/documentation-update`

## Testing Conventions
(When tests are added)
- Test files named `*.test.ts` or `*.spec.ts`
- Co-locate with source files when possible
- Use descriptive test names
- Arrange-Act-Assert pattern

## Error Handling
- Use try-catch for localStorage operations
- Provide fallback defaults for missing data
- Log errors for debugging
- Show user-friendly error messages

```typescript
try {
  const data = JSON.parse(raw);
  return data;
} catch {
  return defaultValue; // Fallback
}
```

## Performance Considerations
- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers passed to children
- Avoid unnecessary re-renders
- Lazy load routes when appropriate

## Accessibility
- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Use ARIA labels when necessary
