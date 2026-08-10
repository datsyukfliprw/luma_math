# LumaMath AI Coding Workflow

**Status:** Adopted workflow direction  
**Last revised:** August 10, 2026

This workflow adapts the strongest parts of Matt Pocock's “Full Walkthrough: Workflow for AI Coding” methodology to LumaMath without discarding the practices that are already working well.

The goal is not to copy another developer's setup. The goal is to build a reliable engineering system for LumaMath in which:

- the repository contains durable knowledge
- Jay retains product judgment and final QA authority
- ChatGPT handles product reasoning, architecture, task decomposition, and review
- Codex and Devin execute small, explicit engineering tasks
- agy is reserved for cases where alternate-model reasoning materially helps
- deterministic tests and validation provide objective feedback
- agent sessions are treated as temporary workers, not long-lived project memory

The central operating model is:

> **Repository + durable instructions + applicable skill + bounded task should be enough for a fresh coding agent to work effectively.**

Do not rely on enormous conversation histories as the primary source of truth.

---

# 1. Authoritative State Hierarchy

LumaMath must have an explicit hierarchy for deciding what is true when repository state, agent reports, ZIPs, and conversation history disagree.

Use this order:

1. **Current local working tree**
2. **Current canonical repository plans and documentation**
3. **Current tests, invariants, and executable validation**
4. **Latest approved checkpoint commit**
5. **Fresh repository snapshot or ZIP explicitly designated authoritative for external review**
6. **Agent reports**
7. **Conversation history and handoffs**

The working tree is normally the strongest authority because it reflects the implementation that actually exists now.

Canonical repository documents should define intended architecture, product rules, and release strategy. When a current plan explicitly says it supersedes prior planning, follow the repository.

Agent reports are evidence, not truth. Verify important claims through diffs, tests, or repository inspection.

Conversation history is useful context but may contain:

- superseded plans
- stale file states
- temporary debugging hypotheses
- abandoned approaches
- old architectural assumptions

Do not allow earlier conversation context to override current repository evidence.

When ChatGPT is reviewing from a fresh ZIP rather than the live repository, Jay may explicitly designate that ZIP as the authoritative review snapshot. In that case, the ZIP becomes the best repository evidence available to ChatGPT for that review.

---

# 2. Context Management

Long AI conversations gradually accumulate:

- obsolete assumptions
- debugging history
- superseded implementations
- irrelevant exploration
- contradictory decisions
- large logs and command output
- descriptions of code that no longer exists

Reasoning quality can degrade well before a model reaches its technical context limit.

For Codex, Devin, and similar implementation agents, use this hierarchy:

1. **Fresh agent session**
2. `/compact` when preserving one active coherent task is genuinely useful
3. Continue a bloated session only when necessary

A finished meaningful implementation task should normally be treated as a clean session boundary.

Preferred lifecycle:

```text
Fresh coding-agent session
↓
read repository instructions
↓
inspect relevant files
↓
complete one bounded task
↓
run tests/checks
↓
review diff
↓
report exact result
↓
session ends
```

The next meaningful task normally gets a fresh session.

Use `/compact` primarily when the agent is still in the middle of one coherent task and restarting would discard useful active reasoning.

A tiny correction to the implementation just produced in the same session does not automatically require a restart.

A distinct new engineering goal usually does.

---

# 3. ChatGPT Context Is Disposable Too

ChatGPT must not become a secret master database for LumaMath.

The preferred model is:

```text
repository = implementation truth
canonical docs = durable design truth
tests = executable truth
handoff = temporary bridge
ChatGPT conversation = reasoning workspace
```

A long-running ChatGPT project conversation is also disposable.

Start a fresh ChatGPT project chat when:

- many code states have been superseded
- several debugging branches have accumulated
- multiple ZIPs or snapshots represent different repository states
- old decisions are competing with current repository evidence
- repeated handoffs have made the conversation noisy
- the risk of reasoning from stale assumptions is becoming material

At that point ChatGPT should explicitly say:

> **This is a good point to start a new chat.**

Then provide a concise copy-ready handoff that prioritizes the current authoritative state.

The purpose of a handoff is not to preserve every detail. It is to let a fresh reasoning session re-anchor quickly to the repository.

---

# 4. Separate Product Thinking From Implementation

Do not ask implementation agents to simultaneously decide:

- what a feature should do
- how the learner experience should behave
- how the UX should work
- what the architecture should be
- which edge cases matter
- what is in or out of scope
- how the feature should be implemented

Resolve meaningful ambiguity first.

Preferred workflow:

```text
Idea / problem
↓
Product and architecture discussion
↓
Resolved design
↓
Implementation contract
↓
Coding agent
```

For LumaMath:

- **Jay** remains Product Owner.
- **ChatGPT** remains the primary architecture, planning, decomposition, and review partner.
- **Codex A and Codex B** are equivalent primary implementation lanes.
- **Devin Desktop** is the third engineering, investigation, and review lane.
- **agy** is an escalation lane for model diversity or difficult alternative reasoning.

Implementation agents should primarily execute decisions rather than invent product policy during autonomous coding work.

---

# 5. Introduce a Grill Phase for Major Features

For meaningful product, curriculum, learning-model, persistence, or architectural changes, ChatGPT should interrogate the idea systematically before implementation begins.

The purpose is to expose decisions Jay may implicitly understand but an implementation agent would otherwise have to guess.

Examples that deserve a Grill phase:

- mastery
- adaptive practice
- evaluations
- lesson progression
- curriculum unlocking
- persistence
- parent reporting
- subscriptions
- cross-cutting learning mechanics
- major generator architecture changes
- substantial student-progress behavior

Questions may include:

```text
What exactly triggers mastery?

Is mastery lesson-level or skill-level?

What persists locally?

What happens after a failed evaluation?

Can the learner retry immediately?

Does failure affect unlocking?

What happens after completion?

What is explicitly NOT part of this feature?
```

Continue until the design is sufficiently shared that an implementation agent no longer needs to invent core behavior.

Small visual changes, obvious bugs, and tightly localized fixes do not need a Grill phase.

---

# 6. Convert Resolved Design Into a Feature Contract

After the Grill phase, create a compact feature-level implementation contract.

Suggested structure:

```text
GOAL

USER / LEARNING BEHAVIOR

ARCHITECTURAL DECISIONS

INVARIANTS

EDGE CASES

OUT OF SCOPE

ACCEPTANCE CRITERIA

TEST EXPECTATIONS
```

The **OUT OF SCOPE** section is especially important because coding agents often try to improve adjacent systems.

Example:

```text
OUT OF SCOPE

- cloud sync
- AI-generated scoring
- curriculum reordering
- streaks
- parent analytics
```

The feature contract represents the destination.

LumaMath's project-level canonical documents remain authoritative, including documents such as:

- `blueprint.md`
- `content_architecture.md`
- `learning_model.md`
- `curriculum.md`
- `implementation_status.md`
- `project_rules.md`
- `design_system.md`
- current release plans

Feature contracts complement these documents rather than duplicate them.

## When a Feature Contract Should Become a File

Do **not** automatically create a document for every medium-sized task.

A contract should become a durable repository file when one or more of the following are true:

- implementation spans several sessions or agents
- the behavior will remain important after the current release
- multiple future features depend on the decision
- Jay needs a stable product specification
- agents will repeatedly need the destination
- losing the contract between chats would create meaningful risk

A lightweight location such as:

```text
docs/features/
```

may be appropriate for those cases.

For shorter work, the contract can remain in the active planning conversation or task prompt.

Avoid documentation bureaucracy.

---

# 7. Convert the Destination Into a Journey

Do not hand a substantial feature contract wholesale to one coding agent.

Break it into the smallest independently verifiable behavioral slices.

Each slice should define:

```text
Goal

Likely files / subsystem

Dependencies

Behavior being added

Tests required

Definition of done
```

Also classify execution explicitly:

```text
PARALLEL SAFE
```

or:

```text
BLOCKED BY <task>
```

or:

```text
SERIALIZE WITH <task>
```

This lets Codex A, Codex B, and Devin work concurrently only when the work is genuinely independent.

---

# 8. Prefer the Smallest Verifiable Behavioral Slice

Do not rigidly force every task into a purely vertical or purely horizontal shape.

The real principle is:

> **Build the smallest independently verifiable behavior, and create only the shared architecture that behavior actually requires.**

Avoid speculative horizontal plans such as:

```text
Build all models
↓
Build all services
↓
Build all storage
↓
Build all UI
↓
Eventually make something usable
```

Also avoid premature abstraction such as:

```text
Invent every possible shared place-value primitive
↓
Create config for future consumers
↓
Build generic APIs
↓
Later discover what the actual feature needed
```

A healthy slice may look like:

```text
one mathematical behavior
↓
shared canonical generator
↓
semantic tests
↓
one or two adapters that genuinely share it
↓
registry/integration
↓
usable result
```

It is fine for a slice to begin with a shared domain module when the current behavior requires that module.

The important distinction is:

```text
required shared core
≠
speculative abstraction
```

---

# 9. Use Agents in Two Distinct Modes

## Human-in-the-loop mode

Use for:

- product behavior
- learning design
- architecture
- ambiguous bugs
- UX decisions
- tradeoffs
- curriculum interpretation
- scope decisions

Typical flow:

```text
Jay
+
ChatGPT
↓
reasoning
↓
decision
```

## Autonomous implementation mode

Use for:

- well-defined implementation
- tests
- generator families
- migrations
- mechanical refactors
- isolated bug fixes
- bounded validation
- repository audits with clear questions

Typical flow:

```text
Coding agent
↓
inspect
↓
test
↓
implement
↓
verify
↓
review diff
↓
report
```

Do not send unresolved product decisions into autonomous implementation mode.

---

# 10. Strengthen Test-First Behavior

LumaMath already has strong deterministic validation through:

- unit tests
- semantic tests
- usability tests
- TypeScript checks
- ESLint
- `git diff --check`
- full-suite verification

Keep this.

For new domain logic, prefer:

```text
RED
write or identify failing behavioral test
↓
GREEN
implement minimum correct behavior
↓
REFACTOR
clean implementation
↓
VALIDATE
focused checks + relevant integration checks
```

The reason matters especially with AI coding agents.

If an agent writes implementation first and then writes tests that mirror the implementation, passing tests may prove very little.

## Independent Semantic Testing Rule

Whenever practical, semantic tests should derive expected behavior independently from the production implementation.

For mathematical generators:

> **Tests should independently derive the expected answer from the generated or displayed mathematical state.**

Do not merely call the same production helper the generator uses and assert that the generator agrees with it.

Tests should also verify the learner-facing operands or state when possible, not only internal return values.

---

# 11. Engineering Checkpoints Are Separate From Product Acceptance

Implementation completion and product completion are different things.

Use explicit **engineering checkpoints** during a larger release or migration.

Typical engineering checkpoint:

```text
one or more bounded slices complete
↓
focused semantic/unit tests
↓
relevant integration tests
↓
TypeScript
↓
focused ESLint
↓
git diff --check
↓
combined-tree verification
↓
ChatGPT architect diff review
↓
checkpoint commit
```

A checkpoint commit does not necessarily mean Jay has manually accepted every UX detail.

This prevents huge uncommitted working trees and creates reliable recovery points.

Manual QA can occur after one or several engineering checkpoints depending on the type of work.

---

# 12. Manual QA Remains a Separate Phase

Automated correctness does not replace product judgment.

Use:

```text
implementation
↓
automated checks
↓
architecture/code review
↓
engineering checkpoint
↓
Jay manual QA
↓
new issues discovered
↓
bounded follow-up tasks
↓
product acceptance
```

Continue the current LumaMath manual QA pattern:

- Jay walks through the product
- screenshots and notes are collected
- issues are tracked
- do not necessarily interrupt the walkthrough to fix every problem
- batch related fixes when appropriate

Manual QA findings become new bounded implementation tasks rather than chaotic edits during the walkthrough.

---

# 13. Prefer Agent-Friendly Deep Modules

Architecture should expose relatively small, understandable public interfaces while hiding substantial implementation complexity behind them.

Prefer:

```text
small public interface
↓
substantial internal capability
↓
clear semantic tests
```

Avoid unnecessary forests of tiny abstractions that force an agent to traverse many files merely to understand one behavior.

LumaMath's reusable generator-family architecture is aligned with this idea.

Instead of hundreds of unrelated bespoke implementations, prefer a smaller number of strong reusable mathematical families configured by practice type when the learning behavior is genuinely shared.

This improves:

- consistency
- testability
- semantic auditing
- agent comprehension
- maintenance
- curriculum expansion

Do not force consolidation when concepts genuinely differ.

---

# 14. Parallel Agent Strategy

Available lanes:

```text
ChatGPT
Codex A
Codex B
Devin Desktop
agy
```

Use them intentionally.

## ChatGPT

Primary responsibilities:

- product reasoning
- Grill phase
- feature contracts
- architecture
- task decomposition
- dependency analysis
- prompt design
- diff and report review
- QA interpretation
- checkpoint decisions
- deciding when to use `/compact`
- deciding when a new agent session or ChatGPT handoff is needed

## Codex A

Primary implementation lane for clearly scoped coding work.

## Codex B

Equivalent primary implementation lane for independent clearly scoped coding work.

Do not treat Codex B as inherently secondary to Codex A.

Assign A and B based on scope, dependencies, and ownership boundaries.

## Devin Desktop

Third engineering lane for:

- repository investigation
- bounded implementation
- isolated audits
- independent review
- mapping future work

Keep Devin tasks small and non-overlapping.

## agy

Reserve primarily for cases where alternate-model reasoning or model diversity provides meaningful value.

Do not spend limited agy quota on routine implementation if Codex or Devin can perform it adequately.

---

# 15. Parallelism Requires Both File and Semantic Independence

Do not parallelize merely because multiple agents exist.

Before parallel execution, define ownership:

```text
Task A owns files/subsystem X.

Task B owns files/subsystem Y.

Task C depends on A and cannot start yet.
```

But file independence alone is not enough.

Parallel tasks should also be **semantically independent**.

Bad example:

```text
Agent A invents a new shared number-form API.

Agent B simultaneously builds an adapter against what it guesses that API will become.
```

The agents may edit different files, but the work is still coupled.

Parallel work is appropriate when both of these are true:

```text
file independence
+
semantic independence
```

Do not parallelize when tasks:

- edit the same registry or architectural seam
- modify the same canonical shared types
- depend on an unsettled mathematical model
- require both agents to change the same semantic tests
- require one agent to guess an API another agent is still designing
- depend on uncommitted behavior that may still change

When overlap is likely, serialize.

---

# 16. Git Safety for Parallel Agents

Agents must not:

- reset or discard unrelated work
- stash concurrent work
- run `git clean`
- overwrite another agent's changes
- stage, commit, or push unless explicitly authorized

When multiple lanes are active:

- assign explicit write scopes
- tell agents which concurrent files must remain untouched
- use combined-tree validation before checkpoint approval
- inspect `git status --short` before and after significant work

Concurrent uncommitted work is allowed only when ownership boundaries are explicit and integration risk is controlled.

---

# 17. AGENTS.md Should Hold Durable Rules

The repository should increasingly become the source of durable agent knowledge.

Use `AGENTS.md` for stable instructions such as:

- architectural invariants
- repository conventions
- testing expectations
- semantic-testing rules
- git safety
- scope restrictions
- required validation
- skill routing
- workflow rules that should survive fresh sessions

Do not put temporary feature requirements into `AGENTS.md`.

Use this distinction:

```text
AGENTS.md
=
durable rules and invariants

.agents/skills/
=
repeatable procedures

task prompt
=
what to do now
```

The long-term goal is that a fresh agent can become useful from:

```text
repository
+
AGENTS.md
+
applicable skill
+
bounded task
```

without needing hours of conversation history.

---

# 18. Use `.agents/skills/` for Repeated Procedures

Repeated workflows should become reusable skills rather than being copied into giant prompts forever.

Possible future LumaMath skills:

```text
.agents/skills/

implement-generator-family/
    SKILL.md

release-verification/
    SKILL.md

semantic-audit/
    SKILL.md

practice-family-review/
    SKILL.md

feature-implementation/
    SKILL.md

diff-review/
    SKILL.md
```

A skill describes the **procedure**.

A task prompt describes the **instance**.

Example:

```text
Use the implement-generator-family skill.

Implement the <family> slice defined below.
```

Do not create skills prematurely.

Promote a workflow into a skill when:

- the same sequence has been used successfully several times
- the architecture is stable enough that the procedure is durable
- prompt duplication is becoming significant
- encoding the procedure would reduce omissions or mistakes

For the current Generator-First work, `implement-generator-family` should be considered after several more families confirm the same stable pattern.

---

# 19. Revised Coding-Agent Session Lifecycle

Treat Codex, Devin, and similar sessions as disposable.

Preferred lifecycle:

```text
Fresh session
↓
read AGENTS.md / applicable skill
↓
read current authoritative plan if relevant
↓
inspect only relevant architecture
↓
execute bounded task
↓
run required checks
↓
inspect diff
↓
report exact changed files / validation
↓
stop
```

Then start a new session for the next substantial slice.

This reduces:

- context drift
- stale assumptions
- accidental scope creep
- agents reasoning from superseded code
- degradation from giant session histories

---

# 20. When to Use `/compact`

Do not use `/compact` merely because context is getting large.

Use it when:

- the agent is still solving one coherent task
- valuable active reasoning would be costly to reconstruct
- implementation is not yet at a clean checkpoint
- restarting would create more risk than continuing
- only a small continuation or correction remains within the same task

Prefer a fresh session when:

- a meaningful slice is complete
- the next task has a distinct goal
- implementation scope changes substantially
- debugging history has become noisy
- several superseded approaches accumulated
- the agent appears to reason from stale assumptions

ChatGPT should explicitly tell Jay when `/compact` is appropriate.

Otherwise, default to a fresh session at clean task boundaries.

---

# 21. End-to-End LumaMath Workflow

Use this as the default for substantial work:

```text
                 IDEA / PROBLEM
                       │
                       ▼
              JAY + CHATGPT GRILL
                       │
                       ▼
                SHARED DESIGN
                       │
                       ▼
               FEATURE CONTRACT
                  destination
                       │
                       ▼
        SMALLEST VERIFIABLE SLICES
                    journey
                       │
                       ▼
               DEPENDENCY ANALYSIS
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       CODEX A       CODEX B      DEVIN
       fresh         fresh        fresh
       session       session      session
          │            │            │
          └────────────┼────────────┘
                       ▼
            COMBINED-TREE VALIDATION
                       │
                       ▼
                CHATGPT REVIEW
                       │
                       ▼
              ENGINEERING CHECKPOINT
                       │
                       ▼
                  JAY MANUAL QA
                       │
                ┌──────┴──────┐
                ▼             ▼
            new issues       accepted
                │             │
                ▼             ▼
           new slices      continue /
                           release
```

Not every task needs every stage.

Scale the workflow to the size, ambiguity, and risk of the work.

---

# 22. Workflow Scaling

## Tiny change

Example:

```text
Fix spacing or an obvious typo.
```

Flow:

```text
bounded implementation
→ checks
→ review
```

No Grill or feature contract needed.

## Small engineering change

Example:

```text
Localized bug with understood behavior.
```

Flow:

```text
ChatGPT defines expected behavior
→ bounded task
→ behavioral test
→ implementation
→ checks
→ review
```

## Medium feature

Flow:

```text
short Grill
→ compact contract
→ 1–3 behavioral slices
→ fresh agents
→ engineering checkpoint
→ QA
```

## Large / architectural feature

Flow:

```text
full Grill
→ explicit durable contract
→ dependency graph
→ several behavioral slices
→ intentional parallelization
→ repeated fresh sessions
→ integration checkpoints
→ manual QA
```

---

# 23. Immediate Changes to Adopt

Do not redesign the entire development process during the August 20 release sprint.

Adopt the behavioral improvements immediately.

## Rule 1: Repository First

Current working tree and canonical repository documents outrank conversation memory and agent summaries.

## Rule 2: Fresh Sessions by Default

Finished meaningful task = new Codex/Devin session for the next meaningful task.

Use `/compact` only when continuing the same coherent task is specifically advantageous.

## Rule 3: Grill → Contract → Slice for Major Features

Do not send major ambiguous product ideas directly to implementation agents.

Resolve the design first.

## Rule 4: Smallest Verifiable Behavioral Slice

Create only the shared architecture the current behavior genuinely needs.

Do not build speculative abstractions merely because they might be reusable later.

## Rule 5: Parallelize Only Independent Work

Require both file independence and semantic independence.

## Rule 6: Tests Must Provide External Feedback

Whenever practical, derive semantic expectations independently of production implementation.

## Rule 7: Promote Repetition Into Durable Infrastructure

Stable rule → `AGENTS.md`

Stable repeated procedure → `.agents/skills/`

Temporary feature requirement → task prompt or feature contract

---

# 24. Relationship to the Current Generator-First Work

The current Grade 3 Generator-First work already fits this methodology well.

A generator-family slice can include:

```text
curriculum behavior
↓
canonical mathematical state
↓
canonical problemKey
↓
shared seeded generator
↓
independent semantic tests
↓
thin flow adapter
↓
registry / integration
↓
usability validation
↓
combined-tree verification
```

Continue implementing one coherent mathematical behavior at a time.

Do not build every possible family abstraction before its first real consumer exists.

A shared generator should own:

- mathematical state
- mathematically correct answer
- canonical problem identity

Flow-specific adapters should own:

- prompt wording
- choice count
- distractor selection
- shuffling
- feedback
- hints
- IDs
- presentation contracts

The current architecture:

```text
shared canonical mathematical generator
        ↓
shared domain misconception candidates
        ↓
thin flow-specific adapters
        ↓
Try It / Practice / Quick Check / Warm-Up / Evaluation
```

is a good example of an agent-friendly deep-module design.

## Potential Future Skill

After several additional families successfully repeat the same stable procedure, consider creating:

```text
.agents/skills/implement-generator-family/SKILL.md
```

Do not create it until the workflow is demonstrably stable enough to encode durable procedure rather than a temporary release implementation pattern.

---

# 25. Post-Release Workflow Hardening

Do not interrupt the August 20 release to restructure the workflow repository.

After the release, perform a short workflow-hardening pass:

1. Review `AGENTS.md`.
2. Move genuinely durable rules into it.
3. Remove stale or redundant instructions.
4. Identify the first repeated procedure worth turning into a skill.
5. Consider `implement-generator-family` or `release-verification`.
6. Decide whether a lightweight feature-contract template is actually needed.
7. Verify that canonical docs clearly identify current plans and superseded material.
8. Keep the system small enough that fresh agents can understand it quickly.

The goal is not process for process's sake.

The goal is lower ambiguity, lower context dependence, and more reliable engineering.

---

# 26. Important Existing LumaMath Rules Still Apply

Continue to:

- keep implementation scopes small
- use Codex A and Codex B as equivalent primary engineering lanes
- use Devin Desktop as the third engineering/review lane when practical
- conserve agy for cases where model diversity provides meaningful value
- keep parallel work both file-independent and semantically independent
- perform architecture/code review from diffs, tests, reports, and repository evidence
- avoid Devin Review as a required workflow step
- use deterministic validation before declaring engineering work complete
- keep Jay in control of final product, curriculum, and UX decisions
- explicitly tell Jay when a fresh agent session or handoff is needed
- explicitly tell Jay when `/compact` is appropriate
- proactively recommend a fresh ChatGPT project chat when conversation history becomes unreliable
- preserve git safety around concurrent uncommitted work
- avoid broad refactors during release QA unless they are necessary for correctness

---

# 27. Seven Durable Operating Principles

The workflow can be summarized by seven rules:

1. **Repository first.**  
   Current working tree and canonical repo docs outrank conversation memory.

2. **Fresh sessions by default.**  
   A completed meaningful task normally ends the coding-agent session.

3. **Resolve ambiguity before coding.**  
   Major or unclear work goes through Grill → contract → implementation slices.

4. **Build the smallest verifiable behavior.**  
   Create only the shared architecture the current slice actually requires.

5. **Parallelize only independent work.**  
   Both file ownership and semantic dependencies must be independent.

6. **Tests are external feedback, not implementation mirrors.**  
   Semantic expectations should be independently derived whenever practical.

7. **Promote repetition into durable infrastructure.**  
   Stable rules belong in `AGENTS.md`, stable procedures become skills, and temporary requirements stay in task prompts or feature contracts.

---

# 28. Mental Model

Do not think:

```text
“We have an AI developer working on LumaMath.”
```

Think:

```text
“We have an engineering system that repeatedly creates
small, well-defined jobs for fresh AI workers.”
```

The durable intelligence belongs in:

```text
architecture
canonical documentation
tests
AGENTS.md
skills
repository state
```

The individual agent session is temporary.

ChatGPT reasoning sessions are temporary too.

The repository and its executable evidence are what allow the whole system to keep moving forward reliably.

That is the foundation of the LumaMath AI coding workflow going forward.
