# LumaMath Documentation

## Purpose

This directory contains the durable, canonical documentation for the LumaMath K–6 homeschool math platform. The docs are written to guide contributors as the project grows beyond its first implementation, not to record a single grade or moment in time.

## How to Use These Documents

Start at the top of the recommended reading order and stop when you have enough context for your task. Product and curriculum work should begin with the manifesto and vision; engineering work should begin with the manifesto and then move to the blueprint.

## Authority Hierarchy

When two documents appear to disagree, use the following rules:

- **Values and beliefs** → `manifesto.md` wins.
- **Long-term direction** → `vision.md` wins over `roadmap.md`.
- **Near-term execution** → `roadmap.md` wins over `vision.md`.
- **How children learn** → `learning_model.md` wins over `curriculum.md` and `content_architecture.md`.
- **What to teach and when** → `curriculum.md` wins over `content_architecture.md`.
- **How content is represented in code** → `content_architecture.md` wins.
- **Look, feel, and interaction** → `design_system.md` wins over `product_philosophy.md`.
- **Product principles** → `product_philosophy.md` wins over `design_system.md`.
- **Target architecture** → `blueprint.md` wins over `implementation_status.md`.
- **Current implementation reality** → `implementation_status.md` wins over `blueprint.md`.
- **Engineering governance** → `project_rules.md` wins over `conventions.md`.
- **Code-level conventions** → `conventions.md` wins over `project_rules.md`.
- **Durable decisions** → `decisions.md` records the decision and wins for historical context.

## Recommended Reading Order

1. **README** — this file
2. **Manifesto** — what we believe
3. **Vision** — the future if we succeed
4. **Product Philosophy** — how we make product decisions
5. **Learning Model** — how children learn in the platform
6. **Curriculum** — the K–6 scope, sequence, and standards
7. **Design System** — visual and interaction language
8. **Content Architecture** — how educational content is represented in code
9. **Blueprint** — current and target software architecture
10. **Project Rules** — governance, review, and validation gates
11. **Conventions** — lower-level code conventions
12. **Decisions** — durable architectural decision records
13. **Implementation Status** — what is built right now
14. **Roadmap** — planned work and milestones

## Document Responsibilities

| Document                   | Responsibility                                                              |
| -------------------------- | --------------------------------------------------------------------------- |
| `manifesto.md`             | Core values, beliefs, commitments, and anti-goals.                          |
| `vision.md`                | Long-term future of the platform over one, three, five, and ten years.      |
| `product_philosophy.md`    | Product-thinking principles and feature-decision framework.                 |
| `learning_model.md`        | Pedagogical model: how students encounter, practice, and master concepts.   |
| `curriculum.md`            | K–6 scope, sequence, standards alignment, and review workflow.              |
| `design_system.md`         | Visual and interaction design language.                                     |
| `content_architecture.md`  | Content data shapes, authoring formats, validation, and rendering contract. |
| `blueprint.md`             | Single source of truth for current, target, and evolving architecture.      |
| `project_rules.md`         | Governance, contribution workflow, validation gates, and onboarding.        |
| `conventions.md`           | Code conventions: TypeScript, React, Tailwind, imports, tests.              |
| `decisions.md`             | Durable architectural decision records (ADRs).                              |
| `implementation_status.md` | Living snapshot of completed, current, and next milestones.                 |
| `roadmap.md`               | Time-bound execution plan and near-to-mid-term milestones.                  |
| `glossary.md`              | Canonical vocabulary for the project.                                       |
| `scope-and-sequence/`      | Grade-specific scope and sequence documents.                                |
| `audits/`                  | Historical and current audit findings.                                      |

## Status

The foundational canonical documents are now complete and authoritative. `implementation_status.md` is the canonical snapshot of the current implementation, and `glossary.md` is the canonical terminology reference. Operational documents such as `roadmap.md`, `implementation_status.md`, and the `audits/` directory will continue to change as the project evolves.
