# LumaMath — August 20 Release Checklist

**Release target:** August 20, 2026
**Current checkpoint:** `a0c3b2f` — `feat: expand place value generator coverage`
**Branch:** `main`

---

## Purpose

This file is the operational checklist for the August 20 LumaMath Grade 3 release push.

It is the source of truth for:

- what remains before release;
- what is scheduled each day;
- what has been completed;
- what is intentionally deferred;
- what must be verified before the release candidate is considered ready.

The goal is not to add every possible feature before August 20.

The goal is to ship a stable, complete Grade 3 learning experience with strong generator coverage, reliable progression, persistent student progress, and a polished end-to-end learner flow.

---

# Current Release State

As of **August 11, 2026**:

- **August 10 — Place Value migration:** complete at `a0c3b2f`.
- **August 11 — Multiplication:** not started; this is the next implementation slice.

## Grade 3 Practice Coverage

- Total regular Grade 3 lessons: **144**
- Family-backed: **33**
- Fallback-backed: **111**

Current automated checkpoint:

- **57 test files passed**
- **659 tests passed**
- **0 failed**
- TypeScript passed
- ESLint passed
- `git diff --check` passed

Current authoritative commit:

```text
a0c3b2f feat: expand place value generator coverage
```

---

# Release Rules

## Repository First

The repository and this checklist are authoritative.

ChatGPT, Codex, Devin, and conversation history are working tools, not the source of truth.

When a task is completed:

1. tests must pass;
2. ChatGPT performs architecture/code review;
3. the work is committed and pushed;
4. the relevant checkbox in this file is checked.

---

## Generator-First Pattern

New curriculum generators should follow:

```text
shared canonical mathematical generator
        ↓
shared domain misconception candidates
        ↓
thin flow-specific adapters
        ↓
Try It / Practice / Quick Check / Warm-Up / Evaluation
```

Shared layers own:

- mathematical state;
- mathematically correct answers;
- canonical `problemKey`;
- reusable domain misconception logic where appropriate.

Adapters own:

- learner-facing wording;
- choice count;
- distractor selection;
- shuffling;
- hints and feedback;
- IDs;
- presentation contracts.

---

## Agent Workflow

Use fresh coding-agent sessions at meaningful task boundaries.

Model selection:

- **gpt-5.6-luna** — small, tightly scoped implementation and test work;
- **gpt-5.6-terra** — normal feature implementation and integration work;
- **gpt-5.6-sol** — high-risk architecture, complex cross-cutting changes, and deep final review;
- **gpt-5.5** — special reasoning-heavy or research-heavy tasks.

Do not use models below Luna for normal LumaMath work.

Prefer tasks small enough to stay well below very large context windows.

A task reaching approximately 80K+ tokens should be treated as a warning sign to finish the current slice and start a fresh session.

Do not reuse giant coding-agent sessions.

---

# August 11 — Multiplication

## Remaining Multiplication Foundations

- [ ] Audit remaining Multiplication Foundations fallback-backed lessons
- [ ] Map remaining practice types to mathematical families
- [ ] Implement shared canonical generators
- [ ] Implement misconception candidate helpers where appropriate
- [ ] Add Practice adapters
- [ ] Migrate Try It adapters
- [ ] Verify Evaluation reuse through the normal registry path
- [ ] Add independent semantic tests
- [ ] Verify deterministic generation
- [ ] Verify duplicate canonical problems are rejected correctly
- [ ] Verify no repeated learner-facing questions

Target: **7 lessons**

## Multiplication Facts & Properties

- [ ] Audit remaining Multiplication Facts & Properties lessons
- [ ] Group types into reusable generator families
- [ ] Implement shared mathematical cores
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation integration
- [ ] Add semantic tests
- [ ] Verify curriculum ranges and supported facts

Target: **15 lessons**

## August 11 Checkpoint

- [ ] Focused tests pass
- [ ] Whole-grade relevant invariants pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] ChatGPT architecture review completed
- [ ] Commit created
- [ ] Push completed
- [ ] Working tree clean

---

# August 12 — Division

## Division Foundations

- [ ] Audit remaining Division Foundations lessons
- [ ] Identify reusable generator families
- [ ] Implement canonical division mathematical generators
- [ ] Add domain misconception candidates
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add independent semantic tests
- [ ] Verify quotient/remainder behavior where applicable
- [ ] Verify no repeated canonical problems

Target: **13 lessons**

## Multiplication / Division Word Problems & Equations

- [ ] Audit remaining types
- [ ] Implement reusable reasoning generators
- [ ] Add Practice integration
- [ ] Add Try It integration
- [ ] Verify Evaluation integration
- [ ] Add semantic tests

Target: **4 lessons**

## August 12 Checkpoint

- [ ] Focused tests pass
- [ ] Relevant whole-grade invariants pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 13 — Add/Sub Reasoning + Fractions I

## Addition & Subtraction Word Problems / Reasoning

- [ ] Audit remaining fallback-backed lessons
- [ ] Implement reusable reasoning generators
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests

Target: **5 lessons**

## Fraction Foundations

- [ ] Audit Fraction Foundations practice types
- [ ] Identify canonical fraction representation contracts
- [ ] Verify visual/presentation requirements before implementation
- [ ] Implement shared fraction generators
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests
- [ ] Verify equivalent learner-facing representations are handled correctly
- [ ] Verify canonical problem identity

Target: **8 lessons**

## August 13 Checkpoint

- [ ] Focused tests pass
- [ ] Fraction representation semantics reviewed
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 14 — Fractions II

## Fraction Equivalence & Number Line

- [ ] Audit remaining types
- [ ] Implement reusable equivalence generators
- [ ] Implement number-line mathematical state where required
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add independent semantic tests
- [ ] Verify equivalent fraction handling
- [ ] Verify number-line representations match mathematical state

Target: **12 lessons**

## Comparing Fractions

- [ ] Audit remaining types
- [ ] Implement shared comparison generators
- [ ] Add misconception candidates
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests
- [ ] Verify comparison symbols and learner-facing wording

Target: **8 lessons**

## August 14 Checkpoint

- [ ] Focused fraction suites pass
- [ ] Whole-grade relevant invariants pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 15 — Area & Perimeter

## Area & Perimeter Generator Families

- [ ] Audit remaining Area & Perimeter fallback-backed lessons
- [ ] Group types into reusable mathematical families
- [ ] Implement canonical area generators
- [ ] Implement canonical perimeter generators
- [ ] Implement missing-side / reasoning generators where needed
- [ ] Implement appropriate misconception candidates
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add independent semantic tests
- [ ] Verify units
- [ ] Verify formulas remain curriculum-aligned
- [ ] Verify learner-facing models reconstruct correct values

Target: **20 lessons**

## August 15 Checkpoint

- [ ] Focused tests pass
- [ ] Relevant invariants pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 16 — Geometry, Data, Measurement & Time

## Geometry & Attributes

- [ ] Audit remaining geometry types
- [ ] Implement reusable generator families
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests

Target: **4 lessons**

## Data & Graphs

- [ ] Audit remaining data/graph types
- [ ] Define reusable data-state contracts
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests
- [ ] Verify generated chart/data questions are internally consistent

Target: **5 lessons**

## Measurement & Time

- [ ] Audit remaining measurement/time types
- [ ] Implement reusable generator families
- [ ] Add Practice adapters
- [ ] Add Try It adapters
- [ ] Verify Evaluation reuse
- [ ] Add semantic tests
- [ ] Verify unit conversions where applicable
- [ ] Verify clock/time representations where applicable

Target: **10 lessons**

## Practice Coverage Milestone

- [ ] **144 / 144 Grade 3 regular lessons family-backed**
- [ ] **0 fallback-backed Grade 3 regular lessons**

## August 16 Checkpoint

- [ ] Full Practice coverage test passes
- [ ] Evaluation stress tests pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] Full Vitest suite passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 17 — Generator-First Flow Audit

Practice coverage being complete does not automatically mean every learning flow follows Generator-First architecture.

## Warm-Up

- [ ] Audit Grade 3 Warm-Up generation
- [ ] Identify duplicated mathematical logic
- [ ] Reuse canonical generator-family cores where appropriate
- [ ] Verify deterministic attempt behavior
- [ ] Verify cross-attempt variation
- [ ] Verify no repeated canonical questions

## Quick Check

- [ ] Audit Grade 3 Quick Check generation
- [ ] Verify canonical mathematical generators are reused
- [ ] Verify attempt seeding
- [ ] Verify same-seed determinism
- [ ] Verify different-seed variation
- [ ] Verify duplicate prevention

## Cross-Flow Consistency

- [ ] Warm-Up mathematics aligned with curriculum
- [ ] Try It mathematics aligned with curriculum
- [ ] Practice mathematics aligned with curriculum
- [ ] Quick Check mathematics aligned with curriculum
- [ ] Evaluation mathematics aligned with curriculum
- [ ] Shared canonical keys used where mathematical identity is shared
- [ ] No unnecessary duplicate mathematical implementations

## August 17 Checkpoint

- [ ] Focused cross-flow semantic tests pass
- [ ] Whole-grade invariants pass
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] Full Vitest suite passes
- [ ] ChatGPT architecture review completed
- [ ] Commit and push
- [ ] Working tree clean

---

# August 18 — Release Hardening

No major new curriculum features after this point unless they fix a release blocker.

## Whole-Grade Automated Validation

- [ ] Run full Vitest suite
- [ ] Run TypeScript no-emit
- [ ] Run ESLint
- [ ] Run `git diff --check`
- [ ] Run curriculum validation
- [ ] Run production build

## Generator-First Audit

- [ ] Practice coverage confirmed at 144 / 144
- [ ] Warm-Up audited
- [ ] Learn flow reviewed for release blockers
- [ ] Try It audited
- [ ] Quick Check audited
- [ ] Practice audited
- [ ] Evaluation audited

## Evaluation Stress

- [ ] Review pools contain sufficient problem depth
- [ ] No repeated evaluation questions
- [ ] Balanced review types behave correctly
- [ ] Evaluation scoring is correct
- [ ] Evaluation pass/fail behavior is correct
- [ ] Evaluation retry behavior is correct

## Progress / Persistence

- [ ] Lesson completion persists
- [ ] Evaluation completion persists
- [ ] Unit completion persists
- [ ] Unit unlocks persist
- [ ] Student progress survives reload
- [ ] First-attempt scoring behaves correctly
- [ ] Reward/progress evidence remains internally consistent

## Release Blockers

- [ ] Fix all P0 release blockers discovered during hardening
- [ ] Fix P1 issues that materially affect learner completion
- [ ] Defer cosmetic/non-release issues

## August 18 Checkpoint

- [ ] Full automated suite green
- [ ] Production build green
- [ ] ChatGPT final architecture review of hardening work
- [ ] Commit and push
- [ ] Working tree clean

---

# August 19 — Manual Product QA

This is a learner-facing walkthrough day.

Do not interrupt the walkthrough to fix every small issue immediately.

Collect screenshots and notes during the walkthrough, then batch fixes afterward unless an issue blocks continued testing.

## Learning Path

- [ ] Student opens Grade 3 Learning Path successfully
- [ ] Lesson cards display correctly
- [ ] Locked/unlocked states are correct
- [ ] Completed lessons display completion state
- [ ] Current lesson positioning is correct
- [ ] Evaluation cards behave correctly

## Lesson Flow

For representative lessons across all major domains:

- [ ] Lesson opens successfully
- [ ] Today’s Goal displays correctly
- [ ] Warm-Up works
- [ ] Learn content works
- [ ] Try It works
- [ ] Guided Practice works
- [ ] Independent Practice works
- [ ] Challenge works where applicable
- [ ] Results screen works
- [ ] Completion state updates
- [ ] Next Lesson flow works

## Generator QA

- [ ] No obviously repeated questions
- [ ] Answer choices make sense
- [ ] Exactly one correct answer where required
- [ ] Visuals match mathematical state
- [ ] Internal zeros / edge cases display correctly
- [ ] Large-number formatting is correct
- [ ] Fraction representations are correct
- [ ] Area/perimeter models are correct
- [ ] Graph/data questions match their source data
- [ ] Measurement/time questions are sensible

## Evaluation QA

- [ ] Evaluation launches
- [ ] Review types are balanced
- [ ] Evaluation questions do not repeat
- [ ] Score is correct
- [ ] Pass path works
- [ ] Fail/retry path works
- [ ] Completion persists
- [ ] Next unit unlocks correctly

## Progress Persistence QA

- [ ] Complete a lesson
- [ ] Reload app
- [ ] Lesson remains complete
- [ ] Complete evaluation
- [ ] Reload app
- [ ] Evaluation remains complete
- [ ] Unlock state survives reload
- [ ] Student-specific progress behaves correctly

## Results UX

- [ ] Correct answer count is clear
- [ ] Incorrect answers are useful to review
- [ ] Completion state is understandable
- [ ] Next action is obvious
- [ ] Next Lesson navigation works

## Flashcards

- [ ] Flashcards open where expected
- [ ] Cards advance correctly
- [ ] No obvious repetition defects
- [ ] Completion/progress behavior works

## QA Issue Collection

- [ ] Collect screenshots
- [ ] Record reproduction steps
- [ ] Assign severity
- [ ] Separate blockers from polish
- [ ] Finish walkthrough before broad repair work

## Batched Fix Pass

- [ ] Fix P0 blockers
- [ ] Fix important P1 issues
- [ ] Re-run affected tests
- [ ] Re-test affected learner flows
- [ ] Commit and push QA fixes
- [ ] Working tree clean

---

# August 20 — Release Candidate

No new feature work.

Only regression fixes for actual release blockers.

## Automated Release Gate

- [ ] Full Vitest suite passes
- [ ] TypeScript passes
- [ ] ESLint passes
- [ ] `git diff --check` passes
- [ ] Curriculum validation passes
- [ ] Production build passes
- [ ] Working tree is clean

## Regression QA

- [ ] Re-test all August 19 blocker fixes
- [ ] Learning Path smoke test
- [ ] Lesson flow smoke test
- [ ] Practice smoke test
- [ ] Try It smoke test
- [ ] Evaluation smoke test
- [ ] Results smoke test
- [ ] Progress persistence smoke test
- [ ] Unit unlock smoke test
- [ ] Reload/relaunch smoke test

## Final Release Review

- [ ] Grade 3 has 144 / 144 family-backed Practice lessons
- [ ] No known P0 defects
- [ ] No known learner-blocking P1 defects
- [ ] Full automated suite green
- [ ] Production build green
- [ ] Final ChatGPT architecture/release review complete
- [ ] Final checkpoint committed
- [ ] Final checkpoint pushed
- [ ] `origin/main` matches local `main`
- [ ] Working tree clean

---

# Release Definition of Done

The August 20 Grade 3 release is ready when:

- [ ] every Grade 3 lesson opens;
- [ ] every Grade 3 lesson can be completed;
- [ ] Practice is family-backed across all 144 regular lessons;
- [ ] learner-facing generated questions are mathematically correct;
- [ ] generated sessions avoid duplicate canonical problems;
- [ ] Try It works across the curriculum;
- [ ] Practice works across the curriculum;
- [ ] Evaluations work and balance review types;
- [ ] scoring is correct;
- [ ] results are useful;
- [ ] lesson completion persists;
- [ ] evaluation completion persists;
- [ ] unit unlocks persist;
- [ ] student progress survives reload;
- [ ] Learning Path reflects completion/progression;
- [ ] automated validation is green;
- [ ] production build succeeds;
- [ ] manual learner QA is complete;
- [ ] no known release-blocking defect remains.

---

# Explicitly Out of Scope for August 20

Do not pull these into the release unless they become necessary to fix a release blocker.

- [ ] Parent dashboard
- [ ] Cloud sync
- [ ] Authentication
- [ ] Subscriptions / billing
- [ ] Advanced analytics
- [ ] Full multi-student cloud profile system
- [ ] Grades other than Grade 3
- [ ] Major visual redesign
- [ ] Large architecture rewrites
- [ ] Nonessential animation/polish
- [ ] Broad refactors with no release impact

These belong after the Grade 3 release foundation is stable.

---

# Deferred Engineering Cleanup

These are known improvements but are not release blockers.

- [ ] Review duplicated Practice/Try It presentation formatting helpers
- [ ] Decide whether stable generator-family implementation should become an agent skill
- [ ] Post-release AI workflow hardening
- [ ] Review generator-family architecture after all Grade 3 families exist
- [ ] Identify opportunities for safe adapter-level reuse
- [ ] Review test runtime and optimize expensive semantic sweeps without weakening coverage

---

# Daily Stop Rule

At the end of each day:

- [ ] intended work is committed;
- [ ] intended work is pushed;
- [ ] local `main` and `origin/main` match;
- [ ] working tree is clean;
- [ ] this checklist is updated;
- [ ] unfinished work is explicitly moved to the next day rather than left ambiguous.

Do not start another major family after the day's checkpoint simply because there is still time.

A clean stopping point is preferred over an extra half-finished feature.

---

# Release Progress

| Date   | Goal                            | Status         | Checkpoint |
| ------ | ------------------------------- | -------------- | ---------- |
| Aug 10 | Place Value migration           | ✅ Complete    | `a0c3b2f`  |
| Aug 11 | Multiplication                  | ⬜ Not started |            |
| Aug 12 | Division                        | ⬜ Not started |            |
| Aug 13 | Add/Sub Reasoning + Fractions I | ⬜ Not started |            |
| Aug 14 | Fractions II                    | ⬜ Not started |            |
| Aug 15 | Area & Perimeter                | ⬜ Not started |            |
| Aug 16 | Geometry + Data + Measurement   | ⬜ Not started |            |
| Aug 17 | Generator-First flow audit      | ⬜ Not started |            |
| Aug 18 | Release hardening               | ⬜ Not started |            |
| Aug 19 | Manual product QA               | ⬜ Not started |            |
| Aug 20 | Release candidate               | ⬜ Not started |            |

---

## Next Task

**August 11: Multiplication**

Start from:

```text
a0c3b2f
```

Before implementation:

1. verify the working tree is clean;
2. audit the remaining Multiplication Foundations and Multiplication Facts practice types;
3. map them into reusable mathematical generator families;
4. create small, independently verifiable implementation slices;
5. use fresh coding-agent sessions for each meaningful boundary.
