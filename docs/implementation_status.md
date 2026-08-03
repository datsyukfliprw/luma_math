# LumaMath Implementation Status

## Purpose

This document is a living operational snapshot of LumaMath. It describes what has actually been built, what is currently being worked on, and what limitations exist today. It is not the long-term architecture, the curriculum philosophy, or the roadmap. For those, see `blueprint.md`, `curriculum.md`, `learning_model.md`, and `roadmap.md`.

This document should be updated whenever the implementation changes significantly.

## Project Summary

LumaMath is an early-stage K–6 homeschool math application. The first vertical slice covers Grade 3 place value, operations, and related concepts. The core student experience is functional: a child can follow a learning path, complete Lessons with Warm-Up, Learn, Try It, and Practice sections, take Evaluations, use Flashcards, and track progress. The foundational documentation has been completed and now governs future development.

## Completed Foundations

The following canonical documents are now complete and authoritative:

- `manifesto.md` — values and beliefs
- `vision.md` — long-term future
- `product_philosophy.md` — product decision principles
- `learning_model.md` — how children learn in the platform
- `curriculum.md` — platform-wide curriculum organization
- `content_architecture.md` — content model and contracts
- `blueprint.md` — software architecture and evolution strategy
- `design_system.md` — visual and interaction principles
- `project_rules.md` — governance and contribution rules

## Current Implementation

The following functionality exists today:

- **Student profiles**: A simple star-name profile is stored locally for the active learner.
- **Learning path**: `LearningPathScreen` displays Units and Lessons and tracks completion status.
- **Lesson runtime**: Lessons load curriculum data and present the Warm-Up, Learn, Try It, and Practice sequence.
- **Guided Practice**: Practice problems with scaffolding and hints are supported in `PracticeScreen`.
- **Independent Practice**: Independent practice mode is implemented.
- **Challenge**: Challenge practice mode exists for extending lesson Skills.
- **Try It**: A scaffolded Try It section is rendered before full practice.
- **Flashcards**: `FlashcardSessionScreen` and `FlashcardCategoryScreen` support spaced retrieval practice.
- **Evaluations**: Evaluation Lessons with `lesson_type: "evaluation"` are supported and excluded from the instructional-section contract.
- **Progress tracking**: `StudentProgressContext` tracks lesson progress, practice rewards, flashcard progress, and star profile, persisted to `localStorage`. Skill mastery is automatically re-evaluated using the canonical `evaluateSkillMastery` service after each evidence commit. Guided Practice sets `practiceComplete` and records one procedural evidence entry per lesson-linked Skill; Independent Practice records a second, distinct procedural evidence entry and can advance a Skill to `developing` without changing lesson progression or completion state. The 80% accuracy requirement for Independent Practice is enforced inside the domain transaction (`applyPracticeCompletion`) using the typed `PracticeCompletionMetrics` so no caller can grant the reward or record evidence for a non-qualifying session.
- **Curriculum validation**: `CurriculumSchema` enforces the canonical lesson contract and `npm run curriculum:check` validates every Grade 3 unit.
- **Target digit questions**: A structured `target_digit_value` question type and renderer exist, replacing Markdown-style digit emphasis.

## Current Architecture

The current implementation is a single-page web application built with React 19, TypeScript, Vite, and TailwindCSS. It runs entirely in the browser and persists student state to `localStorage`.

For a complete description of the architecture and its target state, see `blueprint.md`. In summary, the system currently combines a declarative curriculum layer with a runtime layer that adapts authored content into screen-ready experiences. `StudentProgressContext` is the single source of truth for student state.

## Active Development

The foundational documentation set is now complete and authoritative. The active effort has shifted to aligning the runtime with `blueprint.md` and `content_architecture.md` and resolving the technical debt identified in this document.

Recent implementation work completed before this maintenance effort includes:

- Canonical lesson contract enforcement for `lesson_type: "lesson"`.
- `curriculum:check` validation workflow integration.
- UI filtering to exclude incomplete instructional Lessons from availability.
- Place-value prompt migration to structured `target_digit_value` questions.

## Known Technical Debt

The following compromises and temporary implementations exist today:

- **Local-only persistence**: All progress lives in `localStorage`. Multi-device sync, multiple student profiles, and parent reports require a future persistence layer.
- **Grade 3 vertical slice**: The implementation is shaped around the first Grade 3 units. The runtime and file organization reflect this first implementation rather than the generic K–6 abstraction described in `blueprint.md`.
- **Hybrid lesson content**: Some lesson experience data still lives in TypeScript modules while curriculum metadata is in JSON. The long-term target is full content authored through the declarative content layer.
- **Runtime adapters**: `lessonExperienceAdapter.ts` and similar adapter functions bridge authored content to the runtime. These are temporary stabilization points and should be replaced by direct content-contract consumption as the content layer matures.
- **Deprecated helpers**: `lessonProgress.ts` and `practiceRewards.ts` are deprecated; `starProfile.ts` and `flashcardProgress.ts` are utility-only. These files should be removed once all references are migrated.

## Current Constraints

The following assumptions are true today but are expected to change as the platform evolves:

- **Single student, single device**: The current persistence model assumes one learner on one browser.
- **Client-side curriculum loading**: All curriculum content is bundled and loaded in the browser. Lazy loading and grade-aware content selection are not yet implemented.
- **Instructional lessons only for Grade 3**: The canonical lesson contract has been validated against Grade 3 content. Other grades have not yet been added.
- **No remote services**: AI, sync, analytics, and parent reporting are local-only or absent.

## Next Engineering Milestones

The next major implementation priorities are:

1. Align the runtime with the `blueprint.md` Presentation Layer and the `content_architecture.md` Content Contracts.
2. Implement the tablet-first responsive strategy described in `design_system.md`.
3. Generalize the content-loading layer from a Grade 3 vertical slice to a K–6 grade abstraction.
4. Add multi-student profile support and a remote or structured persistence layer.
5. Build the parent reporting and insights surface.

For the full roadmap, see `roadmap.md`.

## Documentation References

- `blueprint.md` — current, target, and evolving software architecture
- `curriculum.md` — K–6 curriculum organization and mastery principles
- `learning_model.md` — how children learn inside LumaMath
- `roadmap.md` — planned execution and milestones
