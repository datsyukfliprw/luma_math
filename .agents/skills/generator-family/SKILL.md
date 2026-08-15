---
name: generator-family
description: Implement or review one mathematical generator family using the repository's local generator contract.
disable-model-invocation: true
user-invocable: true
metadata:
  internal: true
---

# generator-family

## Owns

- Identifying the applicable generator family from the mathematical task, role, directionality, and learner-visible state.
- Applying that family's existing input, output, invariant, and local organization conventions.
- Keeping generator-local implementation and validation coherent and independently understandable.
- Preserving the boundary between a generator family and shared orchestration.

## Does not own

- The definition or encoding of `problemKey`.
- Seed and random-state mechanics beyond consuming the repository's seeded-generation contract.
- General semantic-test policy, shared registration, exports, orchestration, or unrelated generators.
- New family design or cross-family refactoring unless explicitly requested.

## Invoke

- Invoke when implementing or reviewing a named generator family or deciding where a generator change belongs.
- Start from the task's mathematical contract and the nearest existing family rather than inventing a parallel pattern.

## Composes well with

- Compose with `canonical-problem-key` when generated mathematical state contributes to identity.
- Compose with `seeded-generation` for reproducible family output.
- Compose with `semantic-tests` for learner-facing invariants and edge cases.

## Authoritative sources

- `AGENTS.md` owns generator-first defaults, scope, and integration authority.
- The repository's generator registry, family modules, adjacent tests, fixtures, and mathematical specifications own implementation facts.
- The task instruction owns whether shared integration is included.
