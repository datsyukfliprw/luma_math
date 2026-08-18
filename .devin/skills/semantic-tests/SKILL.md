---
name: semantic-tests
description: Write independent tests that reconstruct learner-facing mathematics and verify LumaMath generator invariants.
---

# Semantic Tests

Use this skill for generator, adapter, canonical-key, or learner-facing math validation.

## Owns
- Independent reconstruction of learner-visible mathematics.
- Correct-answer invariants.
- Canonical identity boundaries.
- Duplicate prevention.
- Representation consistency.
- Seed/replay invariants when relevant.
- Edge cases and range constraints.

## Core rule
Tests must not merely call the production helper under test to compute their expected answer or canonical key.

Reconstruct expected mathematics independently from learner-visible text/data whenever practical.

## Typical invariants
Verify as applicable:
- learner-visible equation/model evaluates to the reported answer.
- model payload matches wording.
- choices contain exactly one mathematically correct answer.
- requested counts are fulfilled.
- canonical `problemKey` values are unique within a session.
- mathematically equivalent presentation variants share identity when intended.
- mathematically distinct roles/directions/tasks remain distinct.
- same seed is deterministic.
- different seeds vary meaningfully.
- explicit seed precedence and fallback behavior.
- curriculum ranges are enforced.
- no hidden RNG/presentation state leaks into canonical identity.

## Verification cadence
Prefer:
1. focused semantic/unit tests
2. relevant invariants
3. TypeScript
4. focused ESLint
5. broader/full suite only at checkpoint when requested

## Does not own
- Production implementation.
- Broad unrelated test cleanup.
- Product decisions.
