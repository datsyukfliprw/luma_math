# LumaMath Blueprint

## Purpose
This document is the single source of truth for the software architecture of LumaMath. It describes how the system is organized today, how it should evolve, and how each architectural layer serves the educational mission defined in `manifesto.md`, `vision.md`, `product_philosophy.md`, `learning_model.md`, `curriculum.md`, and `content_architecture.md`.

The Blueprint is not a file catalog or component inventory. It describes responsibilities, boundaries, data flows, and long-term structural decisions. It is written for senior engineers, architects, and technical leaders who need to understand why the system is built the way it is and how it will grow.

## Architectural Principles
The architecture of LumaMath is guided by a small set of principles that keep the system aligned with its purpose.

The educational model drives the software. The Learning Model, Curriculum, and Content Architecture define what the system must support. The Blueprint defines how software supports those definitions. If a technical choice conflicts with the educational model, the educational model wins.

Content is treated as data, not code. Lessons, questions, examples, and assessments are authored as declarative content. The system consumes that content through stable contracts. This allows the curriculum to grow without rebuilding the application.

Responsibilities are separated by layer. Educational intent, content structure, domain logic, application behavior, presentation, and infrastructure each have a clear role. Layers depend downward, not upward.

The current implementation is a step toward the target. The architecture should evolve incrementally. It avoids big rewrites by defining stable seams that allow the system to grow one capability at a time.

## Current Architecture
The current LumaMath implementation is a single-page web application delivered through a browser. This choice aligns with the Vision's goal of cross-platform accessibility and the Product Philosophy's emphasis on calm, beautiful, tablet-first experiences.

At the highest level, the system is organized into an educational layer, a content layer, a domain layer, an application layer, a presentation layer, and an infrastructure layer. The educational layer is the set of documents and contracts that describe what the system is for. The content layer is the authored curriculum and learning experiences. The domain layer contains the rules of learning, progress, mastery, and recommendation. The application layer orchestrates those rules into user-facing workflows. The presentation layer renders the interface. The infrastructure layer handles persistence, build, and runtime services.

The current application runs entirely on the client. Curriculum content is authored as structured data and validated against the Content Contracts defined in `content_architecture.md`. Student progress is persisted locally. Navigation, state, and rendering are handled within the browser. This keeps the system simple and offline-capable, which matches the needs of the first implementation.

The current architecture is intentionally small. It proves the educational and content models before introducing the operational complexity of a distributed system.

## Target Architecture
The target architecture preserves the current layers but allows each to evolve independently. It is not a different system. It is the same set of responsibilities scaled to support a complete K–6 platform, multiple students, parent dashboards, adaptive AI support, and optional sync across devices.

In the target architecture, the content layer remains centralized and declarative. New grades, Units, Lessons, and question types are added by extending the content model, not by changing the runtime. The domain layer becomes richer, supporting mastery tracking across grades, gap analysis, and adaptive recommendation. The application layer adds experiences for parents, reports, and teacher tools without changing the core learning flow.

The presentation layer supports multiple surfaces. The primary surface remains a web-based student experience. Over time, parent controls, reports, and optional companion apps may be added. The presentation layer consumes the same domain and content services regardless of the surface.

The infrastructure layer introduces optional cloud services for account management, progress sync, and AI tutoring. These services are optional from the learner's perspective. The core learning experience should continue to function without them.

## Architectural Layers

### Educational Layer
The Educational Layer is not code. It is the set of canonical documents that define the mission, values, learning model, curriculum, and content architecture. Every layer below it exists to implement what this layer describes. The Blueprint itself is part of the higher-level documentation system, not the Educational Layer, but it is governed by it.

### Content Layer
The Content Layer contains the authored curriculum: Concepts, Skills, Units, Missions, Lessons, Sections, questions, examples, and assessments. It is declarative, validated against Content Contracts, and independent of any runtime. This layer is described fully in `content_architecture.md`.

### Domain Layer
The Domain Layer contains the rules of the system. It knows what mastery means, how progress is calculated, how Lessons unlock, how Review is scheduled, and how recommendations are generated. It does not know how the user interface works or where data is stored.

The Domain Layer is the heart of the system. It translates authored content into personalized learning experiences. It is the layer most likely to be supported by AI in the future, but its core rules should remain explicit and inspectable.

### Application Layer
The Application Layer orchestrates the Domain Layer into workflows. It handles launching a Lesson, advancing through Sections, recording answers, updating progress, and navigating the learning path. It knows the sequence of user actions but not the details of rendering or storage.

### Presentation Layer
The Presentation Layer renders the user experience. It consumes the state produced by the Application Layer and presents it to the learner or parent. It is responsible for layout, motion, feedback, accessibility, and responsiveness. It is not responsible for educational logic.

### Infrastructure Layer
The Infrastructure Layer provides the capabilities the system needs to run. In the current implementation, this includes the build tooling, local persistence, and browser runtime. In the target architecture, it may include sync services, analytics, and AI inference. The Domain and Application Layers should not depend on the specific technology used by the Infrastructure Layer.

## Core Domains
The system is organized around a set of core domains, each with a clear responsibility.

**Curriculum** manages the structure of what is taught: Concepts, Skills, Units, Lessons, and their relationships. It is the bridge between authored content and runtime models.

**Lessons** manages the flow through a single learning session. It knows the Sections, their order, and the rules for completion and mastery within a Lesson.

**Practice** manages the different modes of practice: Guided, Independent, and Challenge. It selects problems, evaluates responses, and provides feedback.

**Assessments** manages Quick Checks and Evaluations. It records results and reports them to the progress domain.

**Flashcards** manages spaced retrieval practice. It tracks which items have been mastered and schedules review.

**Student Progress** records what the learner has completed, mastered, and practiced. It is the system's memory of the learning journey.

**Mastery** analyzes progress and practice data to determine whether a Skill or Concept is mastered. It governs whether new content unlocks.

**AI Tutor** supports personalization within the rules of the Learning Model. It may recommend next steps, generate alternate explanations, or identify gaps. It is a domain consumer, not a domain owner.

**Rewards** manages celebration, recognition, and motivation. It is subordinate to learning. Rewards are triggered by genuine progress, not by time spent or taps.

**Parent Experience** provides reports, controls, and insights for parents. It reads from the same progress and mastery domains but does not modify learning logic.

## Data Flow
The data flow begins with authored content. Curriculum authors write Units, Lessons, Sections, and questions according to the Content Contracts. This content is validated and loaded into the Content Layer.

When a learner opens the application, the Application Layer requests the appropriate content from the Content Layer and current state from the Student Progress domain. It uses the Domain Layer to determine which Lessons are available, which are locked, and which Review is due.

During a Lesson, the Application Layer advances through Sections. It sends learner responses to the Practice and Assessment domains. Those domains evaluate responses, update mastery indicators, and return feedback. The Presentation Layer renders the result.

After a session, the Application Layer persists the updated state through the Infrastructure Layer. The Mastery domain may then update recommendations. The Parent Experience can read the updated state to generate reports.

Generated data, such as progress, mastery, and recommendations, flows back to the learner and parent but does not become part of the authored content. This separation keeps the curriculum clean and the platform adaptive.

## Extensibility
The architecture is designed to grow without structural rewrites.

New grades are added by authoring new content that fits the existing hierarchy. The runtime does not need to change. New Lesson types are added by defining new Section types or Content Contracts. The Domain Layer learns how to handle them through the contract, not through hardcoded logic.

New practice engines are added behind the Practice domain's interface. New assessment types are added behind the Assessments domain's interface. Additional AI capabilities are added within the AI Tutor domain without changing the core learning flow. Future platforms, such as native companion apps, consume the same Content and Domain services through a different Presentation Layer.

The key to extensibility is stable interfaces. The Content Contracts, domain boundaries, and application workflows define those interfaces. As long as new capabilities respect them, the system grows incrementally.

## Evolution Strategy
The current implementation is the first expression of the architecture. It proves the educational model and content contracts in a single-page application. The evolution strategy is to replace or extend pieces of the system from the outside in, never by rewriting the core.

First, the Content Layer and Content Contracts should stabilize. Then the Domain Layer should mature to support richer mastery and recommendation logic. Then the Application Layer can add parent and reporting workflows. The Presentation Layer can add new surfaces. The Infrastructure Layer can add optional cloud services last.

At each step, the existing system continues to work. New capabilities are added alongside old ones. When an older approach is no longer needed, it is deprecated and removed after a transition period. This avoids the risk and disruption of a big rewrite.

## Architectural Decisions

**Separation of concerns.** Educational intent, content, domain logic, application flow, presentation, and infrastructure each have a single responsibility. They are not mixed.

**Single source of truth.** The authored content is the source of truth for what is taught. Student progress is the source of truth for what the learner has done. Mastery is derived from those two sources. Nothing else claims authority over them.

**Educational architecture drives software architecture.** The Learning Model, Curriculum, and Content Architecture are the primary inputs. Technical choices are made to support them.

**Content contracts over hardcoding.** The system does not contain special cases for individual Lessons or question types. It enforces contracts that all content must satisfy.

**Composition over duplication.** Content is authored once and referenced many times. Domains are composed of small, focused capabilities rather than duplicated logic.

**Stable interfaces.** The seams between layers and domains change slowly. This protects downstream consumers from churn in upstream implementation details.

**Backward compatibility where practical.** Existing content and progress data should continue to work as the system evolves. When a contract changes, migration is preferred over breaking change.

## Architectural Risks and Technical Debt
The current local-only persistence model is appropriate for the first implementation but will become a limitation when sync, multiple student profiles, or parent dashboards are needed. The transition should be planned before adding those features.

The current single-page application loads the entire curriculum client-side. As the platform expands to K–6, this will require lazy loading, content splitting, or a richer loading strategy. The architecture supports this through the Content Layer's hierarchical identifiers, but the current implementation may need gradual refactoring to realize it.

The boundary between Application and Domain Layers is still forming. As more adaptive features are added, care must be taken to keep educational rules in the Domain Layer and workflows in the Application Layer. If this boundary blurs, the system will become harder to test and extend.

The first implementation contains some grade-specific content paths. These should be treated as data, not architecture. The Target Architecture assumes a generic grade abstraction. If grade-specific paths leak into the Domain or Application Layers, they will create technical debt as new grades are added.

## Recommended Updates to Adjacent Documentation
1. **`content_architecture.md`** — The Content Contract section should eventually be expanded with concrete contract examples for each Section type. This will make the Blueprint's contract-driven architecture operational.
2. **`design_system.md`** — When authored, it should describe how the Presentation Layer supports the Section types and feedback patterns defined in the Learning Model and Content Architecture.
3. **`project_rules.md`** — It should require that any change to the Content Contracts, Domain Layer boundaries, or layer responsibilities be reviewed against this Blueprint.
4. **`roadmap.md`** — It should reflect the Evolution Strategy here: stabilize content contracts, then domain logic, then application surfaces, then infrastructure services.
