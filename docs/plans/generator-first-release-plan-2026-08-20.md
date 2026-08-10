# Generator-First Release Plan

**Release deadline:** August 20, 2026
**Current phase:** Grade 3 Generator-First release QA and migration

## Release Objective

Complete and verify the Generator-First architecture for Grade 3 student-facing solve interactions while preserving mathematical correctness, semantic integrity, deterministic attempt behavior, canonical problem identity, and release stability.

During this release push, Generator-First completion takes priority over unrelated features, UI polish, broad refactors, and speculative architectural improvements.

## Generator-First Requirements

Repeated student-facing solve interactions must generate mathematical problem instances logically at runtime from skills, constraints, ranges, representations, and generator configuration.

This applies to:

- Warm-Up
- Quick Check
- Try It
- Practice
- Evaluations
- Other repeated solve interactions

A finite authored question bank is not an acceptable final implementation for these flows.

### Canonical Problem Identity

`problemKey` represents the canonical student-facing mathematical identity.

It should include:

- displayed operands/data
- relevant multi-step state
- operation, form, or representation where necessary

It should not include:

- hidden RNG state
- unused random values
- presentation-only state
- accidental or non-semantic values

Semantic tests should independently verify the mathematics rather than simply reproduce generator implementation logic.

---

# Gate 1: Freeze the Generator Pattern

**Target:** August 10

Establish and verify the reusable Generator-First architecture before replicating it across Grade 3.

## Completed Foundation

- Try It `same_whole_fractions` semantic blocker corrected.
- Typed equation `/` and `÷` normalization corrected.
- Try It stale-attempt state behavior corrected using router attempt identity.
- Shared Unit 11 `digit_value` mathematical core established.
- Shared domain-specific distractor candidate pattern established.
- Thin Try It adapter established.
- Thin Practice adapter established.
- Practice registration enables generator reuse by Evaluation.
- Independent architecture reviews completed.
- Full automated suite and TypeScript verification green.

## Approved Architecture

```text
shared canonical mathematical generator
        ↓
shared domain misconception candidates
        ↓
thin flow-specific adapters
        ↓
Try It / Practice / Quick Check / Warm-Up / Evaluation
```

### Shared Mathematical Layers Own

- mathematical operands/state
- form/representation
- correct answer
- canonical `problemKey`

### Flow Adapters Own

- prompt wording
- choice count
- candidate selection
- shuffle/order
- hints and feedback
- flow-specific IDs
- interaction/presentation contracts

Before broadly replicating this pattern, fix only small correctness or robustness issues identified by review.

Once this gate closes, do not redesign the architecture during the release sprint unless repository evidence reveals a genuine correctness problem.

---

# Gate 2: Eliminate Grade 3 Practice Fallback

**Target:** August 11–15

Practice is the primary migration critical path.

## Audited Starting State

- 144 Grade 3 regular lessons
- 143 unique regular `practice_type` values
- 22 regular lessons family-backed after the first Unit 11 migration
- 122 regular lessons still using the authored default fallback

The remaining practice types collapse into roughly 12–14 reusable mathematical generator families rather than requiring one generator per lesson.

## Implementation Order

1. Place Value and Rounding / Estimation
2. Multiplication Foundations and Facts
3. Division Foundations and Facts
4. Fraction Concepts and Number Lines
5. Equivalent Fractions and Comparing Fractions
6. Area and Perimeter
7. Measurement and Time
8. Data and Graphs
9. Geometry and Quadrilateral Classification
10. Remaining word-problem and cross-domain families

Use shared mathematical generators whenever the same underlying mathematics is required by multiple student-facing flows.

## Exit Criteria

- Every Grade 3 regular `practice_type` resolves to a runtime generator.
- `fallbackBacked === 0`.
- No regular Practice lesson depends on finite authored learner-facing question instances.
- Requested problem counts are satisfied.
- Duplicate semantic problems are prevented.
- Deterministic same-seed generation is preserved.
- Semantic/invariant tests independently prove the mathematics.
- Evaluation review types resolve through generated families where applicable.
- Full automated suite remains green.

---

# Gate 3: Warm-Up and Quick Check Migration

**Target:** August 15–18

Reuse the shared mathematical cores created during the Practice migration rather than building independent mathematical engines for each flow.

## Warm-Up

### Audited Starting State

- 180 Grade 3 lessons
- 540 concrete authored Warm-Up question objects
- no runtime Warm-Up generator
- no Generator-First attempt seed
- no canonical mathematical `problemKey`

### Required Work

- reuse router/history-entry attempt identity
- create thin Warm-Up adapters over shared mathematical generators
- replace finite authored question instances with declarative specifications
- preserve stable questions during an active attempt
- produce fresh deterministic questions for a fresh navigation attempt
- add canonical problem identity
- add independent semantic tests

## Quick Check

### Audited Starting State

- partial seeded generator infrastructure already exists
- four authored Unit 1 Week 1 lesson experiences bypass runtime generation
- generated Quick Check content still derives underlying mathematics from authored Warm-Up, Learn, or Try It instances
- lesson-experience caching by lesson ID prevents per-attempt freshness
- the UI does not currently supply a per-attempt seed

### Required Work

- add attempt-aware Quick Check resolution using router `location.key`
- avoid lesson-only caching for attempt-specific generated questions
- reuse shared mathematical cores
- remove authored Unit 1 Week 1 Quick Check bypasses
- stop deriving underlying problem mathematics from fixed authored question instances
- independently verify answers and distractors

## Attempt Identity Pattern

Reuse the Try It router-history mechanism where appropriate:

```ts
const attemptKey = `${flow}:${lessonId}:${location.key}`;
```

Desired behavior:

- same history entry → stable generated questions
- fresh navigation → fresh deterministic questions
- browser back/forward → restores the prior attempt identity
- no additional persistence system required solely for generation identity

## Exit Criteria

- Warm-Up and Quick Check no longer rely on finite authored problem banks.
- Both flows have deterministic attempt identity.
- Fresh attempts generate fresh valid problems.
- Shared mathematical generators are reused where appropriate.
- Semantic tests prove mathematical correctness independently.

---

# Gate 4: Release-Wide Generator-First Verification

**Target:** August 18–19

Feature implementation stops here.

Perform a release-wide audit of every Grade 3 student-facing solve flow.

## Verify

- Warm-Up
- Quick Check
- Try It
- Practice
- Evaluations
- any other repeated solve interactions

## Required Checks

- no prohibited finite authored question-bank paths remain
- canonical `problemKey` semantics are correct
- no duplicate-key collisions
- deterministic same-attempt behavior
- fresh-attempt behavior
- independently verified mathematics
- valid distractor semantics
- requested question counts
- generator-family coverage
- full Vitest suite
- TypeScript no-emit
- ESLint
- iPad manual QA

At this gate, create and review a fresh authoritative repository ZIP.

---

# Gate 5: Release Stabilization

**Target:** August 19–20

Only release-blocking work is allowed.

## Allowed

- mathematical or semantic defects
- broken student interactions
- generator failures
- invalid problem identity
- duplicate/repetition bugs
- severe iPad usability failures
- release-breaking regressions

## Deferred Until After Release

- cosmetic polish
- broad refactors
- architecture cleanup that does not affect correctness
- speculative improvements
- unrelated features
- unnecessary abstraction work

The goal is a stable release, not architectural perfection.

---

# Agent Workflow

## Codex A

Primary surgical implementation lane.

Use for:

- small generator cores
- adapters
- semantic tests
- tightly scoped bug fixes

## Codex B

Parallel surgical implementation or focused investigation lane.

Use only when its file scope does not overlap Codex A.

## Devin Desktop / CLI

Use for:

- larger autonomous investigations
- migration mapping
- broader independent review
- cross-flow verification where larger context is useful
- tasks that would be unnecessarily fragmented in Codex

Before every Devin task, explicitly state whether **Accept All** should be clicked.

Meaningful work should use a fresh Devin session once context becomes too large.

## Google Antigravity

Reserve limited quota for cases where additional model-family diversity materially improves confidence.

It is not a default release implementation lane.

---

# Task Sizing

Keep coding-agent tasks small and surgical.

Prefer:

- one concern per task
- narrow file scopes
- independent parallel work only when files do not overlap
- fresh sessions before context approaches 100k
- focused semantic tests

Do not run multiple agents that intentionally edit the same files concurrently.

---

# Session Management

- ChatGPT decides when a handoff is required.
- If ChatGPT does not explicitly request a handoff, do not create one.
- ChatGPT decides when `/compact` should be used.
- Do not use `/compact` unless explicitly requested.
- Keep Codex context comfortably below 100k tokens.
- Completed tasks generally move to a fresh session rather than carrying old context forward.

---

# Git Safety

Do not:

- discard unrelated changes
- reset unrelated changes
- stash concurrent work
- run `git clean`
- overwrite another agent's work
- stage, commit, or push from coding agents unless explicitly authorized

The current local working tree is always authoritative.

---

# Verification Cadence

## Surgical Changes

1. focused semantic/unit tests
2. TypeScript where relevant
3. focused ESLint
4. `git diff --check`
5. architect diff review

## Checkpoints

1. full Vitest suite
2. TypeScript no-emit
3. repository status review
4. independent review where warranted
5. commit/push
6. fresh ZIP only when repository-wide architectural verification is required

---

# Release QA and iPad Verification

Keep the local development server available during release QA:

```text
npm run dev -- --host
```

Use the iPad for student-facing smoke testing as changes land.

Manual QA should focus on:

- correct problem rendering
- answer input behavior
- attempt stability
- fresh-attempt behavior
- navigation
- duplicate/repeated problems
- feedback state
- responsive/tablet behavior

Do not interrupt systematic QA to fix every cosmetic issue immediately unless it blocks the walkthrough. Track non-blocking findings and batch them appropriately.

---

# Release Rule

When deadline pressure forces a tradeoff, prioritize in this order:

1. mathematical correctness
2. semantic integrity
3. student-facing reliability
4. Generator-First compliance
5. deterministic/reproducible behavior
6. test coverage
7. maintainability
8. polish

Do not trade correctness for speed.

---

# Definition of Done for August 20

The Grade 3 Generator-First release is ready when:

- required repeated solve flows generate problems logically at runtime
- Practice authored fallback is eliminated
- Warm-Up and Quick Check no longer depend on finite authored problem banks
- Try It remains Generator-First and semantically verified
- Evaluations use generated review families
- canonical problem identities are correct
- repeated-question protection works
- same-attempt generation is stable
- fresh attempts can generate fresh problems
- semantic tests independently verify mathematics
- full automated verification is green
- final iPad QA has no release-blocking defects
- final repository-wide architecture review passes
