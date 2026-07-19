# LumaMath Architectural Decisions

## ADR-001: Hybrid Content Model
**Status**: Accepted  
**Date**: 2026-07-19

### Context
The app needs to manage curriculum content that is growing in complexity. We have two options:
1. Keep all content in TypeScript files (current approach)
2. Move all content to JSON files

### Decision
Adopt a **hybrid model**:
- JSON for: bigIdea, flashcardDeckId (Week 1 curriculum data)
- TypeScript for: tryIt, quickCheck, lessonHero (lessonExperience.ts)

### Rationale
- JSON provides better structure for curriculum metadata
- TypeScript files allow for complex nested data structures
- Incremental migration reduces risk
- Flexibility to migrate remaining content when needed

### Consequences
- Content lives in two places temporarily
- Curriculum loader provides abstraction layer
- Future migration path remains open

---

## ADR-002: Centralized State Management with React Context
**Status**: Accepted  
**Date**: 2026-07-19

### Context
The app has multiple state concerns:
- Lesson progress
- Flashcard progress
- Practice rewards
- Star profile

Previous approach: Direct localStorage helper calls scattered across components.

### Decision
Implement **StudentProgressContext** as single source of truth for all student data.

### Rationale
- Eliminates prop drilling
- Centralized state management
- Consistent data access patterns
- Easier to add new state concerns
- Better testability

### Consequences
- All screens migrated to use context
- Old localStorage helpers deprecated
- Single context provider at app root
- Automatic localStorage persistence

---

## ADR-003: Tablet-First Design Strategy
**Status**: Proposed  
**Date**: 2026-07-19

### Context
Target users are homeschool families using iPads/tablets for learning. Parents may use phones for controls.

### Decision
Adopt **Tablet-First Student Design, Browser-First Technology, Phone-Friendly Parent Controls**.

### Rationale
- iPad is primary learning device for students
- Web technology ensures cross-platform compatibility
- Parents need mobile access to controls/reports
- Responsive design supports all screen sizes

### Consequences
- Design breakpoints optimized for tablet screens
- Touch-friendly interactions for students
- Compact layouts for parent controls on mobile
- Progressive enhancement for smaller screens

---

## ADR-004: Week-Aware Lesson IDs
**Status**: Accepted  
**Date**: 2026-07-19

### Context
Curriculum is organized by weeks, but lesson IDs were originally simple (e.g., `lesson-1`).

### Decision
Implement **week-aware lesson ID format**: `unit-{unit}-week-{week}-day-{day}`.

### Rationale
- Better reflects curriculum structure
- Enables week-based navigation
- Supports future week-specific features
- Clearer data organization

### Consequences
- Lesson ID parsing required in multiple places
- Backward compatibility considerations
- Curriculum loader handles ID mapping

---

## ADR-005: Deprecation Strategy for Helper Files
**Status**: Accepted  
**Date**: 2026-07-19

### Context
After migrating to context, old localStorage helper files are no longer needed.

### Decision
**Deprecate** rather than delete immediately:
- Add deprecation notices to files
- Keep utility-only functions (e.g., `getRandomStarName`, `getNextUnansweredCardIndex`)
- Allow time for any remaining references to be updated

### Rationale
- Safer migration path
- Preserves useful utility functions
- Clear communication about deprecation
- Reduces risk of breaking changes

### Consequences
- Some files contain only deprecation notices
- Utility functions remain accessible
- Clean removal possible in future
