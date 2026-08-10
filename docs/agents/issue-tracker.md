# Issue tracker: GitHub

GitHub Issues is LumaMath’s issue/task tracker. Use the `gh` CLI for issue and pull-request operations.

Repository documentation under `docs/` remains the authoritative home for architecture, product, curriculum, design, and engineering specifications. Do not duplicate existing `docs/` documentation into GitHub Issues unless the user explicitly requests an issue/spec workflow.

## Read/write safety

- Reading and listing issues and pull requests is allowed during investigation.
- Do not create, edit, comment on, label, assign, close, or otherwise mutate GitHub issues or pull requests unless the user explicitly requests an issue-tracker workflow or explicitly authorizes that write.
- Explicitly invoking a skill whose purpose inherently requires issue-tracker writes authorizes only the writes required by that skill and only within that skill’s scope.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body-file <file>`. For multiline bodies, write the Markdown to a temporary file using a fish-compatible method, then pass it with `--body-file`.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the `gh pr` equivalents:

- **Read a PR**: `gh pr view <number> --comments` and `gh pr diff <number>` for the diff.
- **List external PRs for triage**: `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments` then keep only `authorAssociation` of `CONTRIBUTOR`, `FIRST_TIME_CONTRIBUTOR`, or `NONE` (drop `OWNER`/`MEMBER`/`COLLABORATOR`).
- **Comment / label / close**: `gh pr comment`, `gh pr edit --add-label`/`--remove-label`, `gh pr close`.

GitHub shares one number space across issues and PRs, so a bare `#42` may be either — resolve with `gh pr view 42` and fall back to `gh issue view 42`.

## When a skill says "publish to the issue tracker"

Create a GitHub issue only when that skill invocation authorizes the write.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body. Creation and all subsequent issue operations require the authorization rules above.

- **Child ticket**: an issue linked to the map as a GitHub sub-issue (`gh api` on the sub-issues endpoint). Where sub-issues aren't enabled, add the child to a task list in the map body and put `Part of #<map>` at the top of the child body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: GitHub’s native issue dependencies are the canonical, UI-visible representation. Adding or changing dependencies requires authorization under the rules above.
- **Frontier query**: list the map’s open children, drop any with an open blocker or assignee, and choose the first in map order.
- **Claim**: `gh issue edit <n> --add-assignee @me` — a write requiring authorization.
- **Resolve**: comment, close, and append a context pointer to the map’s Decisions-so-far — all require authorization.
