"""Tests for the authoritative Markdown-to-GitHub Project projection."""

from __future__ import annotations

import sys
import unittest
import json
from pathlib import Path
from tempfile import TemporaryDirectory


TOOLS_DIR = Path(__file__).resolve().parents[1]
if str(TOOLS_DIR) not in sys.path:
    sys.path.insert(0, str(TOOLS_DIR))

from sync_release_project import (
    ExistingProjectItem,
    PROJECT_NODE_ID,
    SyncError,
    WorkPackage,
    build_draft_body,
    desired_items_for,
    existing_items_from_graphql_json,
    parse_release_plan,
    plan_sync,
    priority_for,
    synchronize,
    status_for,
    sync_id_for,
)


class ReleasePlanParsingTests(unittest.TestCase):
    def test_parses_one_days_work_packages_and_their_target(self) -> None:
        plan = """# August 11 — Multiplication

## Remaining Multiplication Foundations

- [ ] Audit lessons
- [x] Map practice types

Target: **7 lessons**

## August 11 Checkpoint

- [ ] Focused tests pass
"""

        packages = parse_release_plan(plan)

        self.assertEqual(len(packages), 2)
        self.assertEqual(packages[0].scheduled_date, "2026-08-11")
        self.assertEqual(
            packages[0].title, "Aug 11 — Remaining Multiplication Foundations"
        )
        self.assertEqual(packages[0].checkboxes, (False, True))
        self.assertIn("Target: **7 lessons**", packages[0].body)
        self.assertEqual(packages[1].title, "Aug 11 — Checkpoint")

    def test_sync_id_is_stable_and_draft_body_contains_its_marker(self) -> None:
        sync_id = sync_id_for("2026-08-11", "Remaining Multiplication Foundations")

        body = build_draft_body("- [ ] Audit lessons", sync_id)

        self.assertEqual(
            sync_id, "aug11:remaining-multiplication-foundations"
        )
        self.assertEqual(
            body,
            "- [ ] Audit lessons\n\n"
            "<!-- lumamath-release-sync:aug11:remaining-multiplication-foundations -->",
        )

    def test_status_uses_checkbox_state_and_preserves_partial_in_review(self) -> None:
        self.assertEqual(
            status_for((False, False), "2026-08-11", "2026-08-11"), "Ready"
        )
        self.assertEqual(
            status_for((False, False), "2026-08-12", "2026-08-11"), "Backlog"
        )
        self.assertEqual(
            status_for((True, False), "2026-08-11", "2026-08-11"), "In progress"
        )
        self.assertEqual(
            status_for(
                (True, False), "2026-08-11", "2026-08-11", existing_status="In review"
            ),
            "In review",
        )
        self.assertEqual(
            status_for((True, True), "2026-08-11", "2026-08-11"), "Done"
        )

    def test_priority_is_p0_for_release_hardening_days_and_p1_otherwise(self) -> None:
        self.assertEqual(priority_for("2026-08-17"), "P1")
        self.assertEqual(priority_for("2026-08-18"), "P0")
        self.assertEqual(priority_for("2026-08-19"), "P0")
        self.assertEqual(priority_for("2026-08-20"), "P0")

    def test_excludes_structural_sections_outside_scheduled_days(self) -> None:
        plan = """# Purpose

## Not a work package

- [ ] Do not sync

# August 20 — Release Candidate

## Final Release Review

- [ ] Complete review

# Release Definition of Done

## Not a work package

- [ ] Do not sync
"""

        packages = parse_release_plan(plan)

        self.assertEqual([package.title for package in packages], ["Aug 20 — Final Release Review"])

    def test_planner_creates_updates_and_skips_unchanged_synchronized_items(self) -> None:
        package = WorkPackage(
            scheduled_date="2026-08-18",
            title="Aug 18 — Release Blockers",
            body="- [x] Fix P0 blockers\n- [ ] Fix P1 issues",
            checkboxes=(True, False),
        )
        sync_id = sync_id_for(package.scheduled_date, "Release Blockers")
        existing = [
            ExistingProjectItem(
                item_id="existing-unchanged",
                sync_id=sync_id,
                title=package.title,
                body=build_draft_body(package.body, sync_id),
                status="In review",
                priority="P0",
                start_date="2026-08-18",
                target_date="2026-08-18",
            ),
            ExistingProjectItem(
                item_id="existing-needs-update",
                sync_id="aug19:learning-path",
                title="Old title",
                body="old body\n\n<!-- lumamath-release-sync:aug19:learning-path -->",
                status="Backlog",
                priority="P1",
                start_date=None,
                target_date=None,
            ),
        ]
        desired = desired_items_for(
            [
                package,
                WorkPackage(
                    scheduled_date="2026-08-19",
                    title="Aug 19 — Learning Path",
                    body="- [ ] Walk through learning path",
                    checkboxes=(False,),
                ),
                WorkPackage(
                    scheduled_date="2026-08-20",
                    title="Aug 20 — Regression QA",
                    body="- [ ] Smoke test",
                    checkboxes=(False,),
                ),
            ],
            today="2026-08-19",
            existing_items=existing,
        )

        operations = plan_sync(desired, existing)

        self.assertEqual([operation.kind for operation in operations], ["noop", "update", "create"])
        self.assertEqual(operations[0].desired.status, "In review")
        self.assertEqual(operations[1].existing.item_id, "existing-needs-update")
        self.assertIsNone(operations[2].existing)

    def test_dry_run_reads_project_but_never_invokes_mutating_gh_commands(self) -> None:
        fields = {
            "fields": [
                {
                    "id": "status-field",
                    "name": "Status",
                    "options": [
                        {"id": "backlog", "name": "Backlog"},
                        {"id": "ready", "name": "Ready"},
                        {"id": "progress", "name": "In progress"},
                        {"id": "review", "name": "In review"},
                        {"id": "done", "name": "Done"},
                    ],
                },
                {
                    "id": "priority-field",
                    "name": "Priority",
                    "options": [
                        {"id": "p0", "name": "P0"},
                        {"id": "p1", "name": "P1"},
                        {"id": "p2", "name": "P2"},
                    ],
                },
                {"id": "start-field", "name": "Start date"},
                {"id": "target-field", "name": "Target date"},
            ]
        }
        calls: list[list[str]] = []

        def fake_runner(args: list[str]) -> str:
            calls.append(args)
            if args[:2] == ["api", "graphql"]:
                return json.dumps(
                    {
                        "data": {
                            "node": {
                                "items": {
                                    "nodes": [],
                                    "pageInfo": {"hasNextPage": False},
                                }
                            }
                        }
                    }
                )
            if args[:2] == ["project", "field-list"]:
                return json.dumps(fields)
            self.fail(f"Unexpected GitHub command: {args}")

        with TemporaryDirectory() as temporary_directory:
            checklist = Path(temporary_directory) / "checklist.md"
            checklist.write_text(
                "# August 11 — Multiplication\n\n## Foundations\n\n- [ ] Audit\n",
                encoding="utf-8",
            )
            result = synchronize(
                checklist_path=checklist,
                dry_run=True,
                runner=fake_runner,
                today="2026-08-10",
            )

        self.assertEqual([operation.kind for operation in result.operations], ["create"])
        self.assertEqual(
            [args[:2] for args in calls],
            [["api", "graphql"], ["project", "field-list"]],
        )
        self.assertNotIn("--field", calls[0])
        self.assertIn(f"projectId={PROJECT_NODE_ID}", calls[0])
        self.assertIn('fieldValueByName(name: "Status")', "\n".join(calls[0]))
        self.assertNotIn("--field", calls[1])
        self.assertFalse(
            any(args[:2] == ["project", command] for args in calls for command in {"item-create", "item-edit"})
        )

    def test_existing_marked_draft_issue_parses_graphql_field_values(self) -> None:
        body = build_draft_body("- [x] Complete", "aug18:release-blockers")

        items = existing_items_from_graphql_json(
            {
                "data": {
                    "node": {
                        "items": {
                            "nodes": [
                                {
                                    "id": "PVTI_existing",
                                    "content": {
                                        "__typename": "DraftIssue",
                                        "title": "Aug 18 — Release Blockers",
                                        "body": body,
                                    },
                                    "status": {"name": "In progress"},
                                    "priority": {"name": "P0"},
                                    "startDate": {"date": "2026-08-18"},
                                    "targetDate": {"date": "2026-08-18"},
                                }
                            ],
                            "pageInfo": {"hasNextPage": False},
                        }
                    }
                }
            }
        )

        self.assertEqual(
            items,
            [
                ExistingProjectItem(
                    item_id="PVTI_existing",
                    sync_id="aug18:release-blockers",
                    title="Aug 18 — Release Blockers",
                    body=body,
                    status="In progress",
                    priority="P0",
                    start_date="2026-08-18",
                    target_date="2026-08-18",
                )
            ],
        )

    def test_unmarked_draft_issue_is_ignored(self) -> None:
        items = existing_items_from_graphql_json(
            {
                "data": {
                    "node": {
                        "items": {
                            "nodes": [
                                {
                                    "id": "PVTI_unmarked",
                                    "content": {
                                        "__typename": "DraftIssue",
                                        "title": "Unrelated card",
                                        "body": "Leave this card alone.",
                                    },
                                    "status": {"name": "Ready"},
                                    "priority": {"name": "P1"},
                                    "startDate": {"date": "2026-08-18"},
                                    "targetDate": {"date": "2026-08-18"},
                                }
                            ],
                            "pageInfo": {"hasNextPage": False},
                        }
                    }
                }
            }
        )

        self.assertEqual(items, [])

    def test_marked_non_draft_issue_fails_safely(self) -> None:
        body = build_draft_body("- [x] Complete", "aug18:release-blockers")

        with self.assertRaisesRegex(SyncError, "not a draft item"):
            existing_items_from_graphql_json(
                {
                    "data": {
                        "node": {
                            "items": {
                                "nodes": [
                                    {
                                        "id": "PVTI_issue",
                                        "content": {
                                            "__typename": "Issue",
                                            "title": "Wrong content type",
                                            "body": body,
                                        },
                                    }
                                ],
                                "pageInfo": {"hasNextPage": False},
                            }
                        }
                    }
                }
            )

    def test_graphql_project_item_pagination_fails_before_planning(self) -> None:
        with self.assertRaisesRegex(SyncError, "pagination"):
            existing_items_from_graphql_json(
                {
                    "data": {
                        "node": {
                            "items": {
                                "nodes": [],
                                "pageInfo": {"hasNextPage": True},
                            }
                        }
                    }
                }
            )

    def test_matching_existing_item_is_a_no_op_on_a_second_planning_pass(self) -> None:
        package = WorkPackage(
            scheduled_date="2026-08-18",
            title="Aug 18 — Release Blockers",
            body="- [x] Fix P0 blockers\n- [ ] Fix P1 issues",
            checkboxes=(True, False),
        )
        sync_id = sync_id_for(package.scheduled_date, "Release Blockers")
        existing = ExistingProjectItem(
            item_id="PVTI_existing",
            sync_id=sync_id,
            title=package.title,
            body=build_draft_body(package.body, sync_id),
            status="In progress",
            priority="P0",
            start_date="2026-08-18",
            target_date="2026-08-18",
        )

        desired = desired_items_for(
            [package], today="2026-08-18", existing_items=[existing]
        )

        self.assertEqual(plan_sync(desired, [existing])[0].kind, "noop")

    def test_duplicate_desired_sync_ids_fail_clearly(self) -> None:
        duplicate = WorkPackage(
            scheduled_date="2026-08-18",
            title="Aug 18 — Release Blockers",
            body="- [ ] Fix blockers",
            checkboxes=(False,),
        )

        with self.assertRaisesRegex(SyncError, "Duplicate desired sync ID"):
            desired_items_for([duplicate, duplicate], today="2026-08-10", existing_items=[])


if __name__ == "__main__":
    unittest.main()
