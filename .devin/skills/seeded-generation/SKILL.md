---
name: seeded-generation
description: Enforce deterministic seeded generation and clean separation between replay state and mathematical identity.
---

# Seeded Generation

Use this skill when generator output depends on deterministic randomness.

## Owns
- Explicit seed precedence.
- Stable deterministic replay.
- Meaningful cross-seed variation.
- Isolation from global randomness.
- Keeping seed/RNG state out of canonical problem identity.

## LumaMath convention
Explicit `options.seed` wins.

Otherwise use the repository convention based on:
- `options?.lesson?.lesson_id ?? practiceType`
- `practiceType`
- mode

Use the repository's existing session-seed helper rather than inventing a new scheme.

## Process
1. Identify every random decision.
2. Route all randomness through the seeded generator.
3. Keep canonical mathematical state independent of random presentation choices.
4. Dedupe/select canonical states before presentation-only RNG when practical.
5. Verify identical seeds replay exactly.
6. Verify different seeds produce meaningful variation.
7. Verify explicit seed precedence.
8. Verify lesson fallback and practice-type fallback.
9. Verify no seed or hidden RNG state appears in `problemKey`.

## Does not own
- Mathematical identity.
- Curriculum semantics.
- Generator-family selection.
