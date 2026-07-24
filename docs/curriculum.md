# LumaMath Curriculum

## Purpose

This document defines the educational structure of LumaMath at the platform level. It describes how mathematical knowledge is organized, how Concepts and Skills relate to Lessons and Units, and how mastery governs progression across the K–6 platform. It is not a grade-specific scope-and-sequence document, nor is it a software architecture document. It is the canonical reference for curriculum authors who need to understand how every future grade fits into a single coherent system.

## Audience

Curriculum authors, subject-matter experts, product managers, and engineers who need to understand the platform-wide organization of mathematical content.

## Curriculum Philosophy

A curriculum is more than a list of topics. It is a designed path through an intellectual landscape. LumaMath is built around the belief that mathematical understanding develops when ideas are introduced carefully, connected to prior knowledge, practiced with purpose, and revisited over time.

The curriculum is structured so that each new idea emerges naturally from what came before. Concepts are not taught in isolation. Skills are not collected as disconnected facts. Every Lesson, Mission, and Unit exists to help the learner build a coherent mental model of mathematics.

This philosophy aligns directly with the LumaMath Learning Model. Where the Learning Model explains how children learn, this document explains what they learn and how that knowledge is organized.

## Principles of Mathematical Progression

Mathematics is cumulative. A child cannot reason about fractions without understanding the whole. A child cannot multiply without understanding repeated groups. Progression in the curriculum follows a few simple principles.

First, concrete understanding precedes abstract representation. Children work with models, diagrams, and real situations before they encounter symbolic notation. Second, simpler ideas build toward more complex ones. Each new Concept is introduced as an extension or combination of earlier Concepts. Third, related ideas are taught together when possible. Place value, addition, and estimation share a foundation and reinforce one another when studied in proximity. Fourth, old ideas are revisited in new contexts. This spiral approach strengthens memory and deepens understanding.

## Concepts vs Skills

A Concept is a mathematical idea. It is something a child can understand, explain, and connect to other ideas. A Skill is a specific capability that demonstrates understanding of one or more Concepts. A child can understand the Concept of place value and still need to develop the Skill of reading large numbers quickly and accurately.

Concepts and Skills are not one-to-one. One Concept may support many Skills. One Skill may draw on several Concepts. The curriculum tags Skills to Lessons so that progress can be measured precisely, but the goal is always conceptual understanding, not isolated skill performance.

A Mission is a student-facing learning objective. It is typically tied to one Lesson and framed around a Concept or a small set of Skills. Missions make the learning path visible to the learner without exposing the entire curriculum structure.

## Units

A Unit is a curriculum grouping focused on a connected set of Concepts and Skills. A Unit may last several weeks. It is large enough to contain meaningful progress and small enough to feel achievable.

Units are organized around mathematical themes such as number sense, operations, fractions, geometry, measurement, and data. Within a Unit, individual weeks group related ideas. The end of a Unit typically includes an Evaluation that measures mastery of the Unit's core Skills and Concepts.

Units are visible to parents and curriculum authors. Children experience them as a sequence of Missions and Lessons with clear names and purposes.

## Missions

A Mission is the smallest visible objective on the learning path. It tells the child what they are working toward in a given Lesson. A Mission is not a standard. It is a learner-facing statement of purpose.

Missions help children see why the day's work matters. They connect the Lesson to a larger Concept without requiring the child to understand the full curriculum map. A Mission might frame the Lesson as learning to compare fractions with the same denominator, or as discovering how area relates to multiplication.

A Mission is completed by working through the Lesson sections. Completion is not the same as mastery. A child may complete a Mission and still need additional practice before the underlying Skills are mastered.

## Lessons

A Lesson is a single day's learning experience. It is the container for the instructional cycle described in the Learning Model. A Lesson focuses on one or two closely related Concepts and the Skills that depend on them.

Lessons are organized into weeks and units. The sequence of Lessons within a week is intentional. Earlier Lessons in the week introduce and develop a Concept. Later Lessons provide practice, application, and connection to prior knowledge. The final Lesson in a week may be an Evaluation or a Review Lesson.

The curriculum does not prescribe a fixed number of problems or minutes for a Lesson. It defines the learning purpose and the expected progression toward mastery. The Learning Model defines how that progression is experienced.

## Lesson Flow

The flow of a LumaMath Lesson follows the instructional cycle defined in `learning_model.md`: Warm-Up, Learn, Try It, Practice.

The Warm-Up connects the child to prior knowledge relevant to the day's Mission. The Learn section introduces the new Concept through the concrete-to-abstract progression. The Try It section gives the child a first supported opportunity to apply the idea. The Practice section develops fluency and independence.

The curriculum assigns specific content to each section. Warm-Up items come from prior Skills that support the new idea. Learn items introduce the Concept and vocabulary. Try It items are scaffolded application problems. Practice items are carefully sequenced problems that build in complexity.

The relationship between curriculum content and learning experience is governed by the Content Contract. Curriculum content declares what is taught. The Learning Model and Content Architecture describe how that content is experienced and represented.

## Mastery

Mastery is the standard that governs progression. A child masters a Skill when they can apply it flexibly, explain their reasoning, and retain it over time. A child masters a Concept when they can connect it to other ideas and use it in unfamiliar situations.

Mastery is not the same as completion. A child can complete every problem in a Lesson without mastering the underlying Skill. The curriculum therefore separates completion from mastery. Completion is a record of exposure. Mastery is a record of durable understanding.

Progression through the curriculum is driven by mastery. A child may move to the next Lesson or Mission only when the platform has sufficient evidence that the necessary Skills are secure. This may happen quickly for some children and more slowly for others. The curriculum is designed to support both paths.

## Review and Reinforcement

Review is not repetition. It is the deliberate reactivation of prior learning at the moment it will strengthen memory. The curriculum embeds Review in Warm-Up questions, spiral problems in Practice, and cumulative Review at the end of units.

Reinforcement is the practice of a Skill or Concept in a slightly new context. It helps the learner recognize that a mathematical idea applies more broadly than the original Lesson. The curriculum designs Reinforcement by varying problem types while keeping the target Skill constant.

Review and Reinforcement are not afterthoughts. They are planned parts of the curriculum map. Each Skill is tracked over time so that Review can be scheduled when it will be most effective.

## Spiral Learning

Spiral learning means that ideas are introduced, developed, and then revisited at increasing depth. A Concept may first appear in a simple form, later be applied in a new domain, and eventually be combined with other Concepts to solve complex problems.

For example, the idea of grouping may first appear in counting, later in multiplication, and still later in division and fractions. Each revisit assumes the prior exposure and builds on it. The curriculum records these relationships so that each Lesson knows which earlier Concepts support it.

Spiral learning also means that no single Lesson or Unit is the final word on a Concept. Mastery develops over time. The curriculum is organized to make that development visible and intentional.

## Assessments

Assessments in the curriculum serve two purposes. They measure mastery, and they inform future learning. LumaMath uses two primary forms of assessment.

A Quick Check is a short, in-the-moment check for understanding. It helps the platform respond to the child during a Lesson. Quick Checks are formative. They do not determine final mastery, but they reveal whether the child is ready to continue.

An Evaluation is a more comprehensive assessment at the end of a Unit or week. It measures whether the child has mastered the core Skills and Concepts of that section. Evaluations are summative in their context, but they are also sources of information for the learning path.

Both forms of assessment follow the learning model's principle of assessment without anxiety. They should feel like opportunities to show understanding, not tests to fear.

## Grade-Level Organization

The curriculum is organized by grade for administrative clarity, but the learner's experience is organized by growth. Grade-level boundaries exist so that parents and curriculum authors can plan. They do not imply that every child of a given age should move at the same pace.

Each grade has a concrete scope and sequence documented in `docs/scope-and-sequence/`. These grade-specific documents are derived from the platform-wide curriculum described here. The scope and sequence for a grade lists the Units, weeks, and Missions for that year. It remains tied to the same Concepts and Skills defined at the platform level.

The platform's grade-level organization is flexible. A child who has mastered earlier Skills may move ahead in one area while continuing to work at grade level in another. The curriculum supports this flexibility because it is built on Skills and Concepts rather than a fixed sequence of lessons.

## Scope and Sequence

Scope and sequence is the detailed plan for a single grade. It lists the Units, weeks, Lessons, and Evaluations that make up a year of study. It also maps grade-level standards to the corresponding Concepts and Skills.

The platform-wide curriculum defines the organization and philosophy. The grade-level scope and sequence is a concrete instance. A new grade is added by creating a scope-and-sequence document that fits within the platform's structure.

A scope and sequence should not invent new curriculum structure. It should select and sequence existing Concepts and Skills in a way that is appropriate for the grade. It should ensure that prerequisites are taught before dependent ideas and that Review is planned across the year.

## Curriculum Evolution

The curriculum will grow as new grades and content are added. Growth should extend the existing structure rather than duplicate it. New Units should relate to existing Concepts. New Skills should fit into the existing skill map. New Missions should follow the same Lesson Flow.

Curriculum changes are validated against the platform's organizing principles. A proposed addition is evaluated by asking whether it strengthens conceptual coherence, respects the learning model, and can be expressed using the existing content types.

As the curriculum evolves, older content may be updated to maintain consistency. Changes to core definitions, such as the relationship between Concepts and Skills or the Lesson Flow, should be rare. When they do occur, they must be reflected across all grade-level scope and sequence documents.
