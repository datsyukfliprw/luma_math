---
name: semantic-tests
description: Test learner-facing mathematical meaning, invariants, identity boundaries, and deterministic behavior.
disable-model-invocation: true
user-invocable: true
metadata:
  internal: true
---

# semantic-tests

## Owns

- Tests that generated problems represent valid learner-facing mathematics.
- Tests for task type, mathematical role, directionality, constraints, answer validity, and important edge cases.
- Tests that presentation-only changes preserve canonical identity while mathematical changes do not.
- Tests for deterministic replay when composed with seeded generation.
- Clear separation between semantic failures and presentation or infrastructure failures.

## Does not own

- Production implementation, key encoding, generator-family selection, or seed plumbing.
- Broad test-suite cleanup, unrelated flaky tests, or test changes that weaken the mathematical contract.
- Product decisions about equivalence that are not already defined by the task or repository.

## Invoke

- Invoke when implementing or reviewing a generator, canonical key, seeded path, or learner-facing mathematical behavior.
- Begin with the smallest focused semantic cases and add broader coverage only when the changed contract requires it.

## Composes well with

- Compose with `generator-family` for family invariants and edge cases.
- Compose with `canonical-problem-key` for identity equality and inequality cases.
- Compose with `seeded-generation` for replay and seed-independence cases.

## Authoritative sources

- `AGENTS.md` owns learner-facing correctness, scope, and truthful validation rules.
- The repository's curriculum or mathematical specifications, generator contracts, existing semantic tests, fixtures, and expected outputs own behavior.
- The task instruction owns any explicitly narrowed acceptance criteria.
