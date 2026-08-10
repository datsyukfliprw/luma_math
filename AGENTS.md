# LumaMath Agent Instructions

## Project

LumaMath is a homeschool-first K–6 math learning app.

Current implementation:

- React
- TypeScript
- Vite
- Tailwind CSS

Grade 3 is the current curriculum/release focus.

## Roles

- Jay is the Product Owner.
- ChatGPT is the Chief Software Architect and owns UI/UX changes.
- Coding agents implement tightly scoped engineering tasks.

Do not make product, curriculum, or architecture decisions that were not requested.

## Authoritative State

The current repository and working tree are authoritative.

Do not assume file contents from prior conversations, reports, or memory.

Before changing an existing file:

1. inspect the current version,
2. inspect nearby architecture/tests,
3. preserve unrelated uncommitted work.

Never revert or overwrite unrelated changes.

## Scope Discipline

Make the smallest change that correctly solves the requested problem.

Do not:

- broaden a task into a refactor,
- rewrite large files unnecessarily,
- clean up unrelated code,
- rename unrelated symbols,
- reformat unrelated files,
- modify files outside the requested scope unless required for correctness.

If additional files appear necessary, explain why before modifying them unless the task explicitly permits it.

## Generator-First Architecture

Every student-facing answer/solve interaction should ultimately be generated logically at runtime.

This includes:

- Warm-Up
- Quick Check
- Try It
- Practice
- Evaluations
- other student question flows

Curriculum data should define:

- skills,
- constraints,
- ranges,
- difficulty,
- templates,
- visuals,
- scaffolding,
- distractor strategies.

Do not use finite authored question banks as the final architecture.

Generated problems must be:

- mathematically correct,
- semantically aligned with the lesson objective,
- deterministic for the same attempt/seed where required,
- varied across new attempts,
- unambiguous,
- Grade-appropriate.

## Problem Keys

`problemKey` represents canonical student-facing mathematical problem identity.

A key must:

- use the actual operands/data shown to the student,
- include state required to distinguish different mathematical problems,
- include all operands for multi-step problems,
- include relevant operation/form/representation state,
- avoid hidden or unused random values,
- avoid contextual nouns when they do not change the mathematical identity unless the existing architecture intentionally requires them.

Same canonical problem should not receive different keys because of invisible RNG state.

Different canonical problems must not collapse to the same key.

## Semantic Testing

Do not test only implementation structure.

For generated student questions, tests should independently verify the mathematics and semantics.

Where applicable, test:

- correct answer derivation,
- exactly one semantically correct choice,
- valid distractors,
- deterministic same-attempt behavior,
- variation across attempts,
- duplicate-key protection,
- actual prompt operands versus key operands,
- lesson-objective alignment,
- valid intermediate values,
- inclusive/exclusive classification rules,
- exact fractions rather than accidental floating-point approximations.

A test should not simply reproduce the generator's own logic if an independent mathematical assertion is practical.

## Grade 3 Geometry

Unit 33 uses an inclusive quadrilateral hierarchy:

- square is a rectangle,
- square is a rhombus,
- rectangle and rhombus are parallelograms,
- parallelograms are trapezoids under the curriculum definition,
- trapezoid means a quadrilateral with at least one pair of parallel sides.

Do not treat these categories as mutually exclusive.

## Fractions

Use exact fraction semantics for Grade 3.

Avoid teaching fraction locations through rounded decimal approximations.

When comparing physical fractional amounts, remember that the same-whole requirement matters. Numerical fractions themselves remain mathematically comparable even when represented wholes differ in size.

## UI Ownership

ChatGPT owns intentional UI/UX design changes.

Do not redesign screens, styling, layout, visual hierarchy, or interaction patterns unless the task explicitly assigns UI work.

Engineering changes may make minimal UI-compatible changes when required for functionality, but do not introduce unsolicited visual redesign.

## Git Safety

Do not:

- commit,
- push,
- reset,
- checkout away changes,
- stash,
- clean,
- discard files,
- stage unrelated changes,

unless explicitly instructed.

Leave implementation changes uncommitted by default.

Always preserve pre-existing uncommitted work.

## Concurrent Agents

Other coding agents may be modifying unrelated files in the same working tree.

When concurrent work is possible:

- touch only assigned files,
- never revert changes you did not create,
- do not fix unrelated failing tests,
- report unrelated failures instead,
- avoid shared high-contention files unless explicitly assigned.

## Verification

Run the narrowest relevant checks first.

For TypeScript changes, commonly use:

- `npx tsc -p tsconfig.app.json --noEmit`
- focused `npx vitest run <test-file>`
- focused `npx eslint <changed-files>`

Run the full suite when requested or when the scope warrants it:

- `npm run test:run`

If unrelated tests fail because of concurrent work, report them rather than modifying unrelated files.

## Completion Report

At the end of an implementation task, report:

1. exact files changed,
2. what behavior changed,
3. important implementation decisions,
4. tests/checks run and their results,
5. any remaining concerns or unrelated failures.

Do not claim success if required tests were not run or are failing.

## Shell and Environment

Jay uses:

- Arch Linux
- fish shell
- Neovim

Commands given to Jay must be fish-compatible.

Use `nvim`, not `nano`.

Do not assume Bash-only syntax works in fish.

## Working Style

Prefer:

- inspecting before editing,
- targeted replacements,
- small focused changes,
- explicit verification,
- clear reports.

Avoid speculative architecture changes.

When uncertain about project intent, inspect repository documentation before guessing.

## Agent skills

### Issue tracker

GitHub Issues is LumaMath’s issue/task tracker. Repository documentation under `docs/` remains authoritative for architecture, product, curriculum, design, and engineering specifications. See `docs/agents/issue-tracker.md`.

### Triage labels

The recommended/default triage mapping is `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`; provisioning is not yet verified. See `docs/agents/triage-labels.md`.

### Domain docs

LumaMath’s existing authoritative documentation under `docs/` is consulted first; `CONTEXT.md` and `docs/adr/` remain optional, lazy-created supplements. See `docs/agents/domain.md`.
