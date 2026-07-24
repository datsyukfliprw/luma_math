# LumaMath Content Architecture

## Purpose

This document defines the platform-wide content model for LumaMath. It describes how educational content is structured, how the content hierarchy maps to the curriculum, and how authored content is distinguished from generated content. It is the canonical bridge between the educational model defined in `curriculum.md` and `learning_model.md` and the systems that consume that content.

## Audience

Curriculum authors, engineers, designers, and AI systems that need to understand how learning content is represented without prescribing any implementation technology or presentation method.

## Guiding Principles

The content architecture is designed to be stable across grades, independent of any runtime, and expressive enough to capture the full learning model.

First, content is declarative. It describes what is taught and how it is structured, not how it is displayed or processed. Second, content is hierarchical. A Curriculum contains Units, Units contain Lessons, Lessons contain Sections, and Sections contain learning elements. Third, content is validated against a contract. The contract ensures that any content intended for a given section provides the information required to present or evaluate it. Fourth, authored and generated content are kept distinct. Authors write the curriculum. The platform generates reports, progress, recommendations, and adaptive paths.

## Content Hierarchy

The content hierarchy mirrors the curriculum hierarchy. The top level is the Curriculum, which spans the K–6 platform. A Curriculum contains Units. A Unit contains Lessons. A Lesson contains Sections. Sections contain learning elements such as questions, teaching points, examples, problems, and review items.

This hierarchy is fixed in shape but flexible in quantity. A Unit for early grades may contain fewer Lessons. A Unit for upper grades may contain more. The hierarchy itself does not change.

## Concepts

A Concept is represented as a declarative object. It has a name, a description, and a set of prerequisite Concept references. It may also reference the Skills that demonstrate understanding of the Concept. Concepts are not tied to a single Lesson. They may be revisited across many Lessons, weeks, and grades.

The content model stores Concepts once and references them from Lessons and Skills. This supports spiral learning and makes the conceptual map explicit.

## Skills

A Skill is represented as a measurable capability. It has a name, a description, and a set of associated Concepts. It also carries tags that allow the platform to track mastery over time.

A Skill is not a Lesson. A Skill may be practiced in many Lessons and assessed in many contexts. The content model separates the definition of a Skill from the content that teaches or assesses it. This separation allows the platform to schedule Review, identify gaps, and adapt the learning path without duplicating content.

## Units

A Unit is a content container that groups related Lessons around a theme or mathematical domain. It has a title, a description, and an ordered list of Lessons. It may also reference the Concepts and Skills that are emphasized within it.

The end of a Unit may contain an Evaluation. The Evaluation is content that assesses the Skills and Concepts taught in the Unit. It is authored like any other Lesson but has a different purpose.

## Missions

A Mission is a learner-facing content object. It represents a single learning objective within a Lesson. It has a title, a brief statement, and references to the Concepts and Skills it addresses.

Missions are displayed on the learning path. They make the curriculum visible without exposing the full structure of Units and Skills. A Mission is authored alongside its Lesson but presented as an independent achievement.

## Lessons

A Lesson is the primary content container for one learning session. It has an identifier, a title, a Mission, and an ordered list of Sections. It also references the Concepts and Skills it targets.

A Lesson is authored to deliver one or two closely related Concepts. Its content follows the Lesson Flow defined in `learning_model.md`. The content model does not dictate pacing, visuals, or interaction. It declares what is available in the Lesson.

## Lesson Sections

A Lesson is divided into Sections. Each Section has a type that determines what kind of content it may contain. The instructional sections are Warm-Up, Learn, Try It, and Practice. The assessment sections are Quick Check and Evaluation. Review content may appear within Warm-Up, Practice, or as a dedicated Review section.

Each Section type has a content contract. The contract specifies the required and optional elements. For example, a Warm-Up section contains questions that activate prior knowledge. A Learn section contains teaching points, examples, and vocabulary. A Try It section contains a guided problem. A Practice section contains a sequence of problems with optional challenge extensions.

## Lesson Flow

The Lesson Flow is the ordered sequence of Sections within a Lesson: Warm-Up, Learn, Try It, Practice. This flow is defined by the Learning Model. The content architecture enforces the structure but does not define the teaching method.

A Lesson may also include a Quick Check within the flow to verify understanding before Practice. It may include an Evaluation at the end of a Unit or week. The content model represents these variations by allowing optional Sections and by tagging Sections with their pedagogical role.

## Assessments

Assessment content is content designed to measure or check understanding. There are two primary forms.

A Quick Check is a short set of questions embedded within a Lesson. It is formative. Its content is authored alongside the Lesson and is used to decide whether the learner is ready to continue.

An Evaluation is a more comprehensive set of questions at the end of a Unit or week. It is summative in context. Its content is authored separately or pulled from a pool of items that assess the Unit's Skills.

Both forms of assessment are represented as content objects with questions, correct responses, hints, and explanations. The content model does not define how the platform displays results.

## Review Content

Review content is content that reactivates previously learned Skills or Concepts. It may appear in a Warm-Up, in a Practice section, or in a dedicated Review Section.

Review items are not copies of original questions. They are new questions that target the same Skill in a different context. This variation is essential for effective reinforcement. The content model tracks which Skills are targeted by each Review item so that the platform can schedule Review based on mastery data.

## Flashcards

Flashcards are a special kind of Review content. They are focused on rapid retrieval and fluency. A flashcard item has a prompt, a response, and a Skill reference. It is designed for short, spaced sessions rather than full Lessons.

Flashcard decks are authored as collections of items. The platform may present them independently of the Lesson flow. The content model treats flashcard decks as reusable Review resources tied to Skills.

## Practice Content

Practice content is the set of problems a learner works through to develop fluency and independence. It is organized into modes that align with the Learning Model.

Guided Practice problems include scaffolding such as hints or partial worked examples. Independent Practice problems remove scaffolding. Challenge problems combine Skills or apply them in less familiar contexts.

Each practice problem is an authored content object. It has a prompt, a correct response, an explanation, and references to the Skills and Concepts it practices. The content model allows the same Skill to be practiced in many different problem forms.

## Generated vs Authored Content

Authored content is created by curriculum authors. It includes Concepts, Skills, Units, Lessons, Sections, questions, examples, and flashcard decks. It is declarative and stable.

Generated content is produced by the platform from authored content and learner data. It includes progress reports, mastery calculations, recommended next Lessons, adaptive practice sequences, and personalized Review schedules. Generated content is not authored directly. It is derived.

The content architecture keeps these two categories separate so that authors can focus on educational quality while the platform handles personalization.

## Content Contracts

A Content Contract is the agreement between an authored content shape and the system that consumes it. It defines what a given Section type must contain, what it may contain, and what behaviors the platform can assume.

For example, the contract for a Try It section requires a prompt, a correct response, and a hint. It may also include a visual model or worked example. If authored content does not satisfy the contract, it is invalid and cannot be presented.

Contracts are defined at the content-architecture level. They are technology-neutral. A specific runtime may implement the contract in any way it chooses.

## Content Reuse

Content is authored once and referenced many times. A Concept may be referenced by many Lessons. A Skill may be referenced by many practice problems. A flashcard deck may be reused across grades.

The content model supports reuse through stable identifiers and explicit references. This prevents duplication and makes the curriculum easier to maintain as it grows.

## Extensibility

The content architecture is designed to scale from Kindergarten through Grade 6 without changing its shape. New grades are added by adding new Units, Lessons, and content objects that fit the existing hierarchy.

New Section types are added by defining new Content Contracts. New question formats are added by defining new prompt and response structures. The hierarchy itself remains stable.

## Future Evolution

As LumaMath grows, the content architecture may need to support additional content types such as video explanations, interactive manipulatives, or parent-facing lesson summaries. These additions should extend the existing hierarchy rather than replace it.

Any change to the core hierarchy, the Lesson Flow, or the Content Contracts should be treated as a major platform decision. It should be reflected in `curriculum.md`, `learning_model.md`, and the glossary before it is implemented.
