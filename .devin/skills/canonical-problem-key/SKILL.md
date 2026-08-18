---
name: canonical-problem-key
description: Design and review stable mathematical problem identity for LumaMath generators.
---

# Canonical Problem Key

Use this skill when implementing or reviewing `problemKey` behavior.

## Owns
- Semantic problem identity.
- Mathematical-role and directionality decisions.
- Normalization and collision prevention.
- Distinguishing task identity from presentation identity.

## Core rule
Two problems share a canonical identity when they ask the learner to perform the same mathematical task on the same learner-visible mathematical state.

Presentation-only variation must not create a new identity.

Different mathematical roles, model directionality, or task types must create different identities.

## Never key
Do not include:
- RNG state or seed.
- Choice order.
- Wording/template choice.
- Cosmetic nouns or object flavor.
- Lesson IDs or implementation labels.
- Visual layout that does not change learner-visible mathematics.

## Process
1. Reconstruct the exact learner-visible mathematical state.
2. Identify which roles/directions are mathematically meaningful.
3. Identify the task being assessed.
4. Define the smallest stable canonical representation.
5. Prove equivalent presentation variants collide intentionally.
6. Prove mathematically distinct tasks remain distinct.
7. Add independent semantic tests for both boundaries.

## Does not own
- Learner presentation.
- Seed/replay behavior.
- Attempt/session identity.
- Shared integration unless explicitly tasked.

`problemKey` identifies the mathematical problem. Learner attempts, scores, hints, timestamps, and sessions need separate identities.
