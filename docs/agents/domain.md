# Domain Docs

How the engineering skills should consume LumaMath’s domain documentation when exploring the codebase.

## Before exploring, read these

First consult the relevant authoritative documentation under `docs/`, especially:

- `docs/glossary.md` — canonical terminology
- `docs/decisions.md` — recorded decisions
- `docs/blueprint.md` — architecture
- `docs/content_architecture.md` — content architecture
- `docs/curriculum.md` — curriculum rules
- `docs/project_rules.md` — project rules
- `docs/implementation_status.md` — current implementation state

Read other relevant files under `docs/` as appropriate to the task.

`CONTEXT.md` and `docs/adr/` may be created lazily by domain-modeling skills when they become genuinely useful. They must not duplicate or supersede LumaMath’s existing authoritative documentation.

If a future `CONTEXT.md` or ADR conflicts with existing authoritative documentation under `docs/`, surface the conflict explicitly rather than silently choosing one.

## Use the glossary’s vocabulary

When your output names a domain concept, use the term as defined in `docs/glossary.md`. Don’t drift to synonyms the glossary explicitly avoids.

If the concept you need isn’t documented yet, note the gap for `/domain-modeling`.

## Flag decision conflicts

If your output contradicts `docs/decisions.md` or another authoritative project document, surface the conflict explicitly rather than silently overriding it.
