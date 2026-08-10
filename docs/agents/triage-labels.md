# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the recommended/default label strings for this repo’s GitHub issue tracker.

Provisioning status: not yet verified. A read-only `gh label list` check could not reach GitHub, and this setup does not create labels.

| Label in mattpocock/skills | Recommended label | Meaning                                  |
| -------------------------- | ----------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`    | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`      | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent` | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human` | Requires human implementation            |
| `wontfix`                  | `wontfix`         | Will not be actioned                      |

When a skill mentions a role, use the recommended label string when it exists. Verify provisioning before relying on a label for a write workflow.
