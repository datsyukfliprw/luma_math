---
name: generator-family
description: Implement an isolated curriculum-backed LumaMath generator family using the generator-first architecture.
---

# Generator Family

Use this skill for a new or expanded LumaMath generator family.

## Default architecture
canonical mathematical state
→ domain misconception candidates
→ thin flow-specific adapter

## Owns
- Family selection and local generator conventions.
- Curriculum-backed mathematical state.
- Correct answer derivation.
- Domain misconception candidates.
- Thin family-local adapters.
- Family-local tests and fixtures.

## Default scope
Implement and validate only the named family.

Do not modify shared registries, routing, PracticeScreen, Evaluation, Try It integration, curriculum JSON, or unrelated families unless the task explicitly authorizes shared integration.

If integration is not explicitly in scope, report it as deferred.

## Process
1. Read only the authoritative curriculum/audit sections needed for this family.
2. Define learner-visible mathematical state.
3. Define correct-answer logic.
4. Define canonical identity, using the canonical-problem-key skill when applicable.
5. Build misconception candidates from real domain errors.
6. Keep adapters thin: wording, choices, shuffling, feedback, presentation contract.
7. Fulfill requested counts with unique canonical problems.
8. Add focused semantic tests.
9. Run focused tests, TypeScript, and focused linting.

## Does not own
- Shared integration by default.
- Product behavior outside the assigned family.
- Broad refactors.
- Unrelated cleanup.

Prefer the smallest independently verifiable behavioral slice.
