---
name: canonical-problem-key
description: Define or review the stable identity of a learner-facing mathematical problem.
disable-model-invocation: true
user-invocable: true
metadata:
  internal: true
---

# canonical-problem-key

## Owns

- `problemKey` identifies the mathematical problem itself.
- Two problems share a key when they ask the learner to perform the same mathematical task on the same learner-visible mathematical state.
- Presentation-only differences do not create a new key.
- Different mathematical roles, directionality, or task types create different keys.
- Learner attempts, scores, sessions, hints, and related records use separate identities.
- The key contract must be derived from semantic state rather than formatting, presentation, or incidental generation details.

## Does not own

- The key encoding, hashing, persistence migration, or schema beyond what the authoritative repository contract specifies.
- Generator-family selection, random-seed behavior, learner presentation, or attempt identity.
- Product decisions that change the definition of mathematical equivalence.

## Invoke

- Invoke when adding, changing, or reviewing problem identity, deduplication, persistence, or identity-related tests.
- Inspect the existing mathematical model and identity implementation before proposing a key shape.

## Composes well with

- Compose with `generator-family` when generated state determines identity inputs.
- Compose with `seeded-generation` when proving that replay does not accidentally become identity.
- Compose with `semantic-tests` when testing equality, inequality, and presentation invariants.

## Authoritative sources

- `AGENTS.md` owns scope, safety, and learner-correctness rules.
- The repository's mathematical model, existing key builder, persistence schema, migrations, fixtures, and identity tests own implementation facts.
- The task instruction owns any explicitly requested compatibility or migration behavior.
