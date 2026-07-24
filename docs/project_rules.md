# LumaMath Project Rules

## Purpose

This document defines how contributors work on LumaMath. It is the governance handbook for the repository. It exists to ensure that the architecture, educational philosophy, and product quality remain coherent as the project grows across many years and many contributors.

This document is not a style guide. Coding conventions, formatting, and framework-specific rules live in `conventions.md`. This document governs decisions, documentation, reviews, debt, and long-term thinking.

## Core Principles

Every contribution should strengthen the platform. The following principles guide how contributors evaluate work.

Solve the root problem, not the symptom. A fix that removes an error without addressing its cause will return as debt. Contributors should understand why a problem exists before changing code or content.

Prefer improving architecture over adding complexity. New features should fit the existing structure. If a feature cannot fit, the structure should be improved first. Complexity that is added for convenience becomes a burden for the next contributor.

Avoid duplication. Duplicated logic, content, or documentation eventually diverges. Contributors should extract shared patterns, reference canonical definitions, and reuse existing abstractions.

Educational integrity comes before implementation convenience. If the easiest implementation would misrepresent a mathematical idea, undermine confidence, or violate the Learning Model, the implementation must change.

Compose, do not inherit blindly. Reusable capabilities should be combined through clear interfaces and contracts. Deep inheritance hierarchies make the system harder to understand and change.

Optimize for the next maintainer. Code and documentation should be clear enough that someone unfamiliar with the change can understand it six months later. Cleverness that requires explanation is rarely worth the cost.

## Documentation Authority

The documentation system defines what the project believes, how it learns, how it is built, and how it should feel. When two documents appear to conflict, the authority hierarchy in `docs/README.md` determines which document takes precedence.

Contributors must respect that hierarchy. A change to `learning_model.md` is more than a documentation edit. It is a change to the educational contract. A change to `blueprint.md` is more than a technical update. It is a change to the system's shape. Changes to high-authority documents require broader review and clear justification.

The authority hierarchy exists to prevent contradiction. If a contribution creates a contradiction, the contributor must resolve it. Ignoring the hierarchy is not acceptable. When in doubt, raise the conflict before merging.

## Decision Making

Architectural and product decisions must be evaluated against the foundational documents. The canonical order of authority begins with `manifesto.md`, followed by `vision.md`, `product_philosophy.md`, `learning_model.md`, `curriculum.md`, `content_architecture.md`, `blueprint.md`, `design_system.md`, and then `conventions.md`, `decisions.md`, and operational documents.

Before proposing a significant decision, a contributor should ask:

- Does this align with what LumaMath believes?
- Does this move the platform toward the vision?
- Does this respect the Learning Model and Curriculum?
- Does this fit the Content Architecture and Blueprint?
- Does this follow the Design System?

If the answer to any of these is no, the decision must be revised or the foundational documents must be updated intentionally.

Major decisions should be recorded in `decisions.md` as durable architectural decision records. Once recorded, decisions become part of the project memory and should be referenced in future discussions.

## Contribution Standards

Contributors are expected to deliver work that is correct, maintainable, and aligned with the project's goals.

A contribution should solve one problem well. Large changes that combine many concerns are harder to review, harder to test, and harder to roll back. When a change touches education, architecture, and design at once, it should be split or reviewed with extra care.

A contribution should include the minimal change necessary. Refactoring surrounding code for style preference is discouraged. Refactoring to remove duplication, clarify responsibility, or reduce complexity is encouraged.

A contribution should not break the content contract. If curriculum content or lesson experience data changes, the corresponding Content Contracts must remain satisfied. Invalid content must fail validation before it reaches the learner.

A contribution should be reversible. If a change can be reverted without losing data or breaking other systems, it is probably well-scoped. If reverting would cause cascading failure, the change is too entangled.

## Code Review Philosophy

Reviewers evaluate more than correctness. A change that runs but weakens the architecture or contradicts the educational model is not acceptable.

Reviewers should evaluate correctness, maintainability, scalability, architectural consistency, and educational alignment. A reviewer should ask whether the change fits the Blueprint, respects the Content Architecture, and preserves the Learning Model.

Style-only reviews should be avoided unless the style issue meaningfully reduces clarity. Formatting and naming conventions belong in `conventions.md` and should be enforced by tooling. Human review should focus on design, intent, and alignment.

Reviewers are responsible for the quality of the codebase, not just the correctness of the change. A reviewer who spots a deeper problem should raise it, even if it is outside the scope of the original change. The author and reviewer should then decide whether to address it in the same contribution or in a follow-up.

## Documentation Rules

Documentation is a first-class deliverable. A feature is not complete if the documents that explain it are out of date or missing.

Changes to the Blueprint require architectural review. The Blueprint defines how the system is shaped. Changes to it should be visible and intentional.

Changes to the Learning Model require curriculum review. A change in how children are expected to learn affects every document that depends on it.

Changes to the Curriculum should not contradict the Learning Model. If the curriculum evolves in a way that requires a different learning assumption, the Learning Model must be updated first.

Changes to the Design System should align with the Product Philosophy and Learning Model. Visual and interaction changes are not neutral. They carry educational consequences.

Documentation conflicts should be resolved before merging. If two documents describe the same thing differently, the contributor must update the lower-authority document to match the higher-authority one or initiate a discussion to change the higher-authority document.

## Technical Debt

Technical debt is any part of the system that makes future change harder or riskier than it should be. It includes duplicated logic, unclear ownership, violated contracts, and shortcuts that no longer match the architecture.

Debt should be identified, documented, and resolved gradually. A contributor who introduces debt to meet a deadline should record it. A contributor who encounters existing debt should prefer cleaning it up to working around it.

Large rewrites are discouraged. The preferred path is incremental improvement. A big rewrite risks losing context and breaking working systems. If a rewrite is necessary, it should be proposed as an architectural decision and planned in stages.

Debt that touches content contracts or domain boundaries is the most dangerous. It should be addressed before it spreads. Debt that is isolated to one implementation detail can be scheduled more flexibly.

## Long-Term Thinking

Contributors should optimize for a five-year codebase, not a five-minute merge. Decisions that feel convenient today but create ambiguity tomorrow are not good decisions.

This means choosing explicit over implicit. It means preferring stable contracts over clever shortcuts. It means adding new capabilities through extension rather than modification. It means preserving the separation between educational intent, content, domain logic, and presentation.

It also means respecting the contributors who will work on the project after the current change is merged. Every commit should leave the repository slightly easier to understand than it was before.

## Definition of Done

A feature or change is complete only when all of the following are true.

The implementation is correct. It does what it is supposed to do and does not break existing behavior.

The architecture remains clean. The change fits the Blueprint and the Content Architecture. It does not introduce unnecessary coupling or bypass established boundaries.

The documentation is updated. Any foundational document affected by the change is updated to reflect the new reality.

The educational intent is preserved. The Learning Model, Curriculum, and Design System are respected. No new content or interaction contradicts them.

A future contributor can understand the change. The code, content, and documentation are clear enough to be maintained without oral explanation.

Until all of these conditions are met, the change is not done.
