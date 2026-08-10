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
- **Try It**: `TryItScreen` at `/try-it/:lessonId` presents authored multi-part Try It problems (groups, in each group, equation) and a shared, stable resolver produces fallback problems from `try_it`, canonical practice prompts, warm-up questions, learn examples, or a safe acknowledgement check for sparse data. `markTryItComplete` is idempotent, recomputes `lessonComplete` when all other steps are complete, and does not alter skill evidence, practice rewards, or mastery status.
- **Flashcards**: `FlashcardSessionScreen` and `FlashcardCategoryScreen` support spaced retrieval practice.
- **Evaluations**: All 36 Grade 3 evaluation lessons now generate their configured question count. `generateEvaluationProblems` resolves each configured `review_type` to a matching regular lesson in the same unit, uses a specialized generator when one is registered, a documented alias for semantically equivalent review-type labels, or the canonical lesson-backed default generator. A balanced plan gives every review type coverage with counts differing by at most one, and the final question sequence is deterministically interleaved. When a parent `options.seed` is supplied, `generateEvaluationProblems` derives a stable child seed per review type using `derivePracticeSeed` and forwards it to the family generator so evaluation questions participate in the same seeded session as direct practice. Every problem receives a unique, stable `problemKey` namespaced by evaluation lesson and review type. Unsupported review types are not silently discarded; `EvaluationGenerationError` reports the review type, requested count, and resolution path. Evaluation completion requires 80% first-attempt accuracy, persists a durable `EvaluationCompletionRecord`, and unlocks the first lesson of the next Grade 3 unit. Failed evaluations are retryable and state-neutral. Evaluation completion creates no Practice reward, no Skill evidence, and no mastery-status change.
- **Progress tracking**: `StudentProgressContext` tracks lesson progress, practice rewards, flashcard progress, and star profile, persisted to `localStorage`. Skill mastery is automatically re-evaluated using the canonical `evaluateSkillMastery` service after each evidence commit. Guided Practice sets `practiceComplete` and records one procedural evidence entry per lesson-linked Skill; Independent Practice records a second, distinct procedural evidence entry and can advance a Skill to `developing` without changing lesson progression or completion state; Challenge Practice records one transfer evidence entry per lesson-linked Skill when the 80% first-attempt accuracy threshold is met, and the canonical evaluator reevaluates mastery from the complete evidence history. The 80% first-attempt accuracy requirement for Independent Practice and Challenge Practice is enforced inside the domain transaction (`applyPracticeCompletion`) using the typed `PracticeCompletionMetrics`. Retry attempts remain possible but do not rewrite the first-attempt score, and no caller can grant the reward or record evidence for a non-qualifying session. Historical sessions are not recalculated.
- **Curriculum validation**: `CurriculumSchema` enforces the canonical lesson contract and `npm run curriculum:check` validates every Grade 3 unit.
- **Target digit questions**: A structured `target_digit_value` question type and renderer exist, replacing Markdown-style digit emphasis.

## Current Architecture

The current implementation is a single-page web application built with React 19, TypeScript, Vite, and TailwindCSS. It runs entirely in the browser and persists student state to `localStorage`.

For a complete description of the architecture and its target state, see `blueprint.md`. In summary, the system currently combines a declarative curriculum layer with a runtime layer that adapts authored content into screen-ready experiences. `StudentProgressContext` is the single source of truth for student state.

The canonical target is the Generator-First Question Architecture defined in `content_architecture.md` and ADR-006. The current Grade 3 runtime only partially satisfies it: Addition/Subtraction family generators and parts of evaluation generation are generator-driven, while fixed authored Warm-Up/Try It content and the lesson-backed default Practice fallback remain migration debt.

## Active Development

The foundational documentation set is now complete and authoritative. The active effort has shifted to aligning the runtime with `blueprint.md` and `content_architecture.md` and resolving the technical debt identified in this document.

Recent implementation work completed before this maintenance effort includes:

- Canonical lesson contract enforcement for `lesson_type: "lesson"`.
- `curriculum:check` validation workflow integration.
- UI filtering to exclude incomplete instructional Lessons from availability.
- Place-value prompt migration to structured `target_digit_value` questions.
- Grade 3 Unit 1 / Unit 11 content swap to make Unit 1 the **Multiplication Foundations** entry point while preserving the place-value curriculum in Unit 11. Existing Unit 1 multiplication lesson IDs (`g3-u1-w1-l1` … `g3-u1-w1-eval`) were retained. Historical place-value progress stored under those IDs is not automatically migrated or reinterpreted.
- Interactive `/try-it/:lessonId` route, normalized Try It resolver, and idempotent `markTryItComplete` progress update, with whole-grade coverage and completion tests.
- Generalized Grade 3 evaluation question generation with review-type resolution, balanced planning, deterministic interleaving, unique stable keys, and whole-grade validation.
- Evaluation completion, persistence, and cross-unit progression foundation with 80% first-attempt accuracy threshold, typed rejection results, rapid-duplicate protection, next-unit unlock, and historical-progress grandfathering.
- Grade 3 Addition generator family covering all eight `practice_type` values in Units 4 and 5 (`addition_number_line`, `addition_expanded_form`, `addition_compensation`, `addition_no_regroup`, `addition_regroup_ones`, `addition_regroup_tens`, `addition_three_numbers`, `missing_digits_properties`). Implemented in `src/practiceTypes/addition.ts` with typed family configs (`src/practiceTypes/familyConfigs.ts`), deterministic seeded randomization (`src/practiceTypes/random.ts`), and registry wiring (`src/practiceTypes/registry.ts`). Supports Guided/Independent/Challenge/Evaluation generation with `multiple_choice` and `mistake_check` contracts, regrouping correctness, semantic `problemKey`s, and strategy-specific internal representations for number-line jumps, expanded-form place-value decomposition, and compensation transformations.
- Session-seed contract: `createPracticeSessionSeed` in `src/practiceTypes/random.ts` gives `PracticeScreen` (owned by ChatGPT) a deterministic way to create one stable seed per mounted lesson/mode session. `derivePracticeSeed` in the same file lets `generateEvaluationProblems` propagate a parent session seed into each review-type pool so evaluation questions are seeded consistently with direct practice. The generator is deterministic for a provided seed; if `options.seed` is omitted it falls back to a stable key derived from `lessonId`, `practiceType`, and `mode` with no timestamps, `Math.random`, or global mutable state. Without an explicit per-session seed, repeated sessions for the same lesson/mode are identical.

## Known Technical Debt

The following compromises and temporary implementations exist today:

- **Local-only persistence**: All progress lives in `localStorage`. Multi-device sync, multiple student profiles, and parent reports require a future persistence layer.
- **Grade 3 vertical slice**: The implementation is shaped around the first Grade 3 units. The runtime and file organization reflect this first implementation rather than the generic K–6 abstraction described in `blueprint.md`.
- **Hybrid lesson content**: Some lesson experience data still lives in TypeScript modules while curriculum metadata is in JSON. The long-term target is full content authored through the declarative content layer.
- **Generator-first question gap**: Warm-Up, authored Try It, some Quick Check paths, finite specialized banks, and the default Practice fallback can reuse fixed question instances or stable lesson-level outputs. These paths do not satisfy ADR-006 and must migrate toward seeded runtime generation from authored Skill/template/constraint specifications.
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
