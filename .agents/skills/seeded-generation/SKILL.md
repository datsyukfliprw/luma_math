---
name: seeded-generation
description: Make mathematical generation reproducible under an explicit seed without confusing replay with problem identity.
disable-model-invocation: true
user-invocable: true
metadata:
  internal: true
---

# seeded-generation

## Owns

- Explicit seed inputs and deterministic replay for generated mathematical content.
- Removal of ambient randomness, time, process state, or hidden global state from reproducible generation paths.
- Stable seed propagation through the generator boundary.
- The distinction between a replay seed and the semantic identity represented by `problemKey`.

## Does not own

- Deciding when two mathematical problems are the same.
- Choosing a generator family, changing learner-visible mathematics, or defining presentation behavior.
- Semantic validity criteria or broad test-suite policy.

## Invoke

- Invoke when adding, changing, or reviewing deterministic generation, seed plumbing, replay, or generated fixtures.
- Treat a seed as a reproducibility input, not as a substitute for canonical identity.

## Composes well with

- Compose with `generator-family` to thread seeds through the correct local generator boundary.
- Compose with `canonical-problem-key` to verify that replay and identity remain separate.
- Compose with `semantic-tests` to test replay, edge cases, and mathematical validity.

## Authoritative sources

- `AGENTS.md` owns scope, generator-first defaults, and evidence requirements.
- The repository's RNG utilities, seed types, serialization rules, generator entry points, fixtures, and determinism tests own implementation facts.
- The task instruction owns any requested seed-format or compatibility change.
