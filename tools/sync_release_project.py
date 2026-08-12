#!/usr/bin/env python3
"""Synchronize the August 20 release checklist into GitHub Project items."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date
import json
from pathlib import Path
import re
import subprocess
import sys
from typing import Any, Callable


RELEASE_YEAR = 2026
GITHUB_OWNER = "@me"
PROJECT_NUMBER = "1"
PROJECT_NODE_ID = "PVT_kwHOB0uq6M4Bf-VY"
DEFAULT_CHECKLIST_PATH = Path(__file__).resolve().parents[1] / "docs/plans/aug-20-release-checklist.md"
DAY_HEADING_PATTERN = re.compile(r"^# August (\d{1,2}) — .+$")
PACKAGE_HEADING_PATTERN = re.compile(r"^## (.+)$")
CHECKBOX_PATTERN = re.compile(r"^- \[([ xX])\] ")
MARKER_PATTERN = re.compile(r"<!--\s*lumamath-release-sync:([a-z0-9]+:[a-z0-9-]+)\s*-->")
CommandRunner = Callable[[list[str]], str]
PROJECT_ITEMS_QUERY = """
query ProjectItems($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      items(first: 100) {
        nodes {
          id
          content {
            __typename
            ... on DraftIssue {
              title
              body
            }
          }
          status: fieldValueByName(name: "Status") {
            ... on ProjectV2ItemFieldSingleSelectValue {
              name
            }
          }
          priority: fieldValueByName(name: "Priority") {
            ... on ProjectV2ItemFieldSingleSelectValue {
              name
            }
          }
          startDate: fieldValueByName(name: "Start date") {
            ... on ProjectV2ItemFieldDateValue {
              date
            }
          }
          targetDate: fieldValueByName(name: "Target date") {
            ... on ProjectV2ItemFieldDateValue {
              date
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
}
"""


@dataclass(frozen=True)
class WorkPackage:
    """A synchronizable subsection from the authoritative release checklist."""

    scheduled_date: str
    title: str
    body: str
    checkboxes: tuple[bool, ...]


@dataclass(frozen=True)
class ExistingProjectItem:
    """The mutable state of a draft Project item owned by this synchronizer."""

    item_id: str
    sync_id: str
    title: str
    body: str
    status: str | None
    priority: str | None
    start_date: str | None
    target_date: str | None


@dataclass(frozen=True)
class DesiredProjectItem:
    """The Project representation derived solely from the Markdown checklist."""

    sync_id: str
    title: str
    body: str
    status: str
    priority: str
    start_date: str
    target_date: str


@dataclass(frozen=True)
class SyncOperation:
    """One create, update, or no-op action from the pure synchronization plan."""

    kind: str
    desired: DesiredProjectItem
    existing: ExistingProjectItem | None


@dataclass(frozen=True)
class ProjectFields:
    """IDs required to write the Project's existing fields."""

    status_field_id: str
    priority_field_id: str
    start_date_field_id: str
    target_date_field_id: str
    status_option_ids: dict[str, str]
    priority_option_ids: dict[str, str]


@dataclass(frozen=True)
class SyncResult:
    """The operations derived and, unless dry-run, applied by a synchronization."""

    operations: list[SyncOperation]


class SyncError(RuntimeError):
    """An actionable synchronization failure suitable for CLI output."""


class GitHubCommandError(SyncError):
    """A GitHub CLI command failed without exposing its credentials."""


def sync_id_for(scheduled_date: str, heading: str) -> str:
    """Return the durable marker identity for a scheduled work package."""
    date_part = f"aug{int(scheduled_date[-2:])}"
    slug = re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")
    return f"{date_part}:{slug}"


def build_draft_body(package_body: str, sync_id: str) -> str:
    """Attach this tool's ownership marker to the authoritative package body."""
    return f"{package_body.rstrip()}\n\n<!-- lumamath-release-sync:{sync_id} -->"


def status_for(
    checkboxes: tuple[bool, ...],
    scheduled_date: str,
    today: str,
    *,
    existing_status: str | None = None,
) -> str:
    """Map authoritative checkbox progress to the corresponding Project Status."""
    if all(checkboxes):
        return "Done"
    if any(checkboxes):
        return "In review" if existing_status == "In review" else "In progress"
    return "Ready" if scheduled_date <= today else "Backlog"


def priority_for(scheduled_date: str) -> str:
    """Give the release hardening, QA, and release candidate days P0 priority."""
    return "P0" if "2026-08-18" <= scheduled_date <= "2026-08-20" else "P1"


def desired_items_for(
    packages: list[WorkPackage],
    *,
    today: str,
    existing_items: list[ExistingProjectItem],
) -> list[DesiredProjectItem]:
    """Project desired state derived from packages and their owned existing items."""
    existing_by_sync_id = {item.sync_id: item for item in existing_items}
    desired_items: list[DesiredProjectItem] = []
    seen_sync_ids: set[str] = set()
    for package in packages:
        heading = re.sub(r"^Aug \d{1,2} — ", "", package.title)
        sync_id = sync_id_for(package.scheduled_date, heading)
        if sync_id in seen_sync_ids:
            raise SyncError(f"Duplicate desired sync ID {sync_id!r} from release work packages.")
        seen_sync_ids.add(sync_id)
        existing = existing_by_sync_id.get(sync_id)
        desired_items.append(
            DesiredProjectItem(
                sync_id=sync_id,
                title=package.title,
                body=build_draft_body(package.body, sync_id),
                status=status_for(
                    package.checkboxes,
                    package.scheduled_date,
                    today,
                    existing_status=existing.status if existing else None,
                ),
                priority=priority_for(package.scheduled_date),
                start_date=package.scheduled_date,
                target_date=package.scheduled_date,
            )
        )
    return desired_items


def plan_sync(
    desired_items: list[DesiredProjectItem],
    existing_items: list[ExistingProjectItem],
) -> list[SyncOperation]:
    """Diff desired state against owned draft items without mutating GitHub."""
    existing_by_sync_id = {item.sync_id: item for item in existing_items}
    operations: list[SyncOperation] = []
    for desired in desired_items:
        existing = existing_by_sync_id.get(desired.sync_id)
        if existing is None:
            kind = "create"
        elif (
            existing.title == desired.title
            and existing.body == desired.body
            and existing.status == desired.status
            and existing.priority == desired.priority
            and existing.start_date == desired.start_date
            and existing.target_date == desired.target_date
        ):
            kind = "noop"
        else:
            kind = "update"
        operations.append(SyncOperation(kind=kind, desired=desired, existing=existing))
    return operations


def _graphql_field_value(item: dict[str, Any], alias: str, key: str) -> str | None:
    value = item.get(alias)
    if not isinstance(value, dict):
        return None
    result = value.get(key)
    return result if isinstance(result, str) else None


def existing_items_from_graphql_json(response: dict[str, Any]) -> list[ExistingProjectItem]:
    """Normalize owned DraftIssue items from the ProjectV2 GraphQL response."""
    data = response.get("data")
    node = data.get("node") if isinstance(data, dict) else None
    project_items = node.get("items") if isinstance(node, dict) else None
    if not isinstance(project_items, dict):
        raise SyncError("GitHub GraphQL response did not contain ProjectV2 items.")
    raw_items = project_items.get("nodes")
    page_info = project_items.get("pageInfo")
    if not isinstance(raw_items, list) or not isinstance(page_info, dict):
        raise SyncError("GitHub GraphQL Project item response was incomplete.")
    has_next_page = page_info.get("hasNextPage")
    if not isinstance(has_next_page, bool):
        raise SyncError("GitHub GraphQL Project item response omitted pageInfo.hasNextPage.")
    if has_next_page:
        raise SyncError(
            "GitHub GraphQL Project item pagination is required; refusing to sync against an incomplete item list."
        )

    items: list[ExistingProjectItem] = []
    seen_sync_ids: set[str] = set()
    for raw_item in raw_items:
        if not isinstance(raw_item, dict):
            continue
        content = raw_item.get("content")
        if not isinstance(content, dict):
            continue
        body = content.get("body")
        if not isinstance(body, str):
            continue
        marker = MARKER_PATTERN.search(body)
        if marker is None:
            continue
        item_type = content.get("__typename")
        if item_type != "DraftIssue":
            raise SyncError(
                f"Project item {raw_item.get('id', '<unknown>')} has a release sync marker "
                "but is not a draft item; refusing to edit it."
            )
        sync_id = marker.group(1)
        if sync_id in seen_sync_ids:
            raise SyncError(f"Multiple draft items have the sync marker {sync_id!r}.")
        item_id = raw_item.get("id")
        title = content.get("title")
        if not isinstance(item_id, str) or not isinstance(title, str):
            raise SyncError("A marked draft item is missing its GitHub Project ID or title.")
        seen_sync_ids.add(sync_id)
        items.append(
            ExistingProjectItem(
                item_id=item_id,
                sync_id=sync_id,
                title=title,
                body=body,
                status=_graphql_field_value(raw_item, "status", "name"),
                priority=_graphql_field_value(raw_item, "priority", "name"),
                start_date=_graphql_field_value(raw_item, "startDate", "date"),
                target_date=_graphql_field_value(raw_item, "targetDate", "date"),
            )
        )
    return items


def project_fields_from_json(response: dict[str, Any]) -> ProjectFields:
    """Validate that the existing Project fields and options support this sync."""
    raw_fields = response.get("fields")
    if not isinstance(raw_fields, list):
        raise SyncError("GitHub Project field-list response did not contain a fields list.")
    fields_by_name = {
        field.get("name"): field
        for field in raw_fields
        if isinstance(field, dict) and isinstance(field.get("name"), str)
    }

    def required_field(name: str) -> dict[str, Any]:
        field = fields_by_name.get(name)
        if not isinstance(field, dict) or not isinstance(field.get("id"), str):
            raise SyncError(f"Expected GitHub Project field {name!r} was not found.")
        return field

    def required_options(field: dict[str, Any], names: tuple[str, ...]) -> dict[str, str]:
        options = field.get("options")
        if not isinstance(options, list):
            raise SyncError(f"Project field {field['name']!r} has no selectable options.")
        option_ids = {
            option.get("name"): option.get("id")
            for option in options
            if isinstance(option, dict)
            and isinstance(option.get("name"), str)
            and isinstance(option.get("id"), str)
        }
        missing = [name for name in names if name not in option_ids]
        if missing:
            raise SyncError(
                f"Project field {field['name']!r} is missing option(s): {', '.join(missing)}."
            )
        return {name: option_ids[name] for name in names}

    status = required_field("Status")
    priority = required_field("Priority")
    start_date = required_field("Start date")
    target_date = required_field("Target date")
    return ProjectFields(
        status_field_id=status["id"],
        priority_field_id=priority["id"],
        start_date_field_id=start_date["id"],
        target_date_field_id=target_date["id"],
        status_option_ids=required_options(
            status, ("Backlog", "Ready", "In progress", "In review", "Done")
        ),
        priority_option_ids=required_options(priority, ("P0", "P1", "P2")),
    )


def run_gh(arguments: list[str]) -> str:
    """Run gh with an argument array and make command failures readable."""
    command = ["gh", *arguments]
    completed = subprocess.run(command, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip() or "no output"
        raise GitHubCommandError(
            f"GitHub CLI failed while running {' '.join(command[:3])} "
            f"(exit {completed.returncode}): {detail}"
        )
    return completed.stdout


def _json_from_gh(output: str, context: str) -> dict[str, Any]:
    try:
        parsed = json.loads(output)
    except json.JSONDecodeError as error:
        raise SyncError(f"GitHub CLI returned invalid JSON while {context}: {error}") from error
    if not isinstance(parsed, dict):
        raise SyncError(f"GitHub CLI returned unexpected JSON while {context}.")
    return parsed


def _project_items_read_arguments() -> list[str]:
    return [
        "api",
        "graphql",
        "-f",
        f"query={PROJECT_ITEMS_QUERY}",
        "-F",
        f"projectId={PROJECT_NODE_ID}",
    ]


def _project_field_read_arguments() -> list[str]:
    return [
        "project",
        "field-list",
        PROJECT_NUMBER,
        "--owner",
        GITHUB_OWNER,
        "--format",
        "json",
    ]


def _set_single_select(
    runner: CommandRunner, item_id: str, field_id: str, option_id: str
) -> None:
    runner(
        [
            "project",
            "item-edit",
            "--id",
            item_id,
            "--project-id",
            PROJECT_NODE_ID,
            "--field-id",
            field_id,
            "--single-select-option-id",
            option_id,
        ]
    )


def _set_date(runner: CommandRunner, item_id: str, field_id: str, value: str) -> None:
    runner(
        [
            "project",
            "item-edit",
            "--id",
            item_id,
            "--project-id",
            PROJECT_NODE_ID,
            "--field-id",
            field_id,
            "--date",
            value,
        ]
    )


def _apply_operation(
    operation: SyncOperation, fields: ProjectFields, runner: CommandRunner
) -> None:
    """Apply one owned draft-item operation after a non-dry-run plan is approved."""
    desired = operation.desired
    existing = operation.existing
    if operation.kind == "create":
        created = _json_from_gh(
            runner(
                [
                    "project",
                    "item-create",
                    PROJECT_NUMBER,
                    "--owner",
                    GITHUB_OWNER,
                    "--title",
                    desired.title,
                    "--body",
                    desired.body,
                    "--format",
                    "json",
                ]
            ),
            f"creating {desired.title!r}",
        )
        item_id = created.get("id")
        if not isinstance(item_id, str):
            raise SyncError(f"GitHub did not return a Project item ID for {desired.title!r}.")
        existing = None
    elif operation.kind == "update":
        if existing is None:
            raise SyncError(f"Cannot update {desired.title!r}: missing owned item.")
        item_id = existing.item_id
        if existing.title != desired.title or existing.body != desired.body:
            runner(
                [
                    "project",
                    "item-edit",
                    "--id",
                    item_id,
                    "--title",
                    desired.title,
                    "--body",
                    desired.body,
                ]
            )
    else:
        return

    if existing is None or existing.status != desired.status:
        _set_single_select(runner, item_id, fields.status_field_id, fields.status_option_ids[desired.status])
    if existing is None or existing.priority != desired.priority:
        _set_single_select(runner, item_id, fields.priority_field_id, fields.priority_option_ids[desired.priority])
    if existing is None or existing.start_date != desired.start_date:
        _set_date(runner, item_id, fields.start_date_field_id, desired.start_date)
    if existing is None or existing.target_date != desired.target_date:
        _set_date(runner, item_id, fields.target_date_field_id, desired.target_date)


def synchronize(
    *,
    checklist_path: Path,
    dry_run: bool,
    runner: CommandRunner = run_gh,
    today: str | None = None,
) -> SyncResult:
    """Plan or apply the one-way Markdown-to-Project synchronization."""
    markdown = checklist_path.read_text(encoding="utf-8")
    packages = parse_release_plan(markdown)
    if not packages:
        raise SyncError(f"No synchronizable work packages were found in {checklist_path}.")
    project_items = _json_from_gh(runner(_project_items_read_arguments()), "querying Project items")
    fields = project_fields_from_json(
        _json_from_gh(runner(_project_field_read_arguments()), "listing Project fields")
    )
    existing_items = existing_items_from_graphql_json(project_items)
    desired_items = desired_items_for(
        packages,
        today=today or date.today().isoformat(),
        existing_items=existing_items,
    )
    operations = plan_sync(desired_items, existing_items)
    if not dry_run:
        for operation in operations:
            if operation.kind != "noop":
                _apply_operation(operation, fields, runner)
    return SyncResult(operations=operations)


def _print_plan(result: SyncResult, dry_run: bool) -> None:
    creates = sum(operation.kind == "create" for operation in result.operations)
    updates = sum(operation.kind == "update" for operation in result.operations)
    noops = sum(operation.kind == "noop" for operation in result.operations)
    label = "Dry run" if dry_run else "Sync"
    print(f"{label}: {creates} create(s), {updates} update(s), {noops} unchanged.")
    for operation in result.operations:
        desired = operation.desired
        print(f"{operation.kind.upper():6} {desired.title}")
        print(
            f"       Status: {desired.status} | Priority: {desired.priority} | "
            f"Start/Target: {desired.start_date} / {desired.target_date}"
        )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", help="Plan without mutating GitHub.")
    arguments = parser.parse_args(argv)
    try:
        result = synchronize(
            checklist_path=DEFAULT_CHECKLIST_PATH,
            dry_run=arguments.dry_run,
        )
    except (OSError, SyncError) as error:
        print(f"sync_release_project: {error}", file=sys.stderr)
        return 1
    _print_plan(result, arguments.dry_run)
    return 0


def parse_release_plan(markdown: str) -> list[WorkPackage]:
    """Return scheduled day subsections, retaining their Markdown body."""
    packages: list[WorkPackage] = []
    current_day: int | None = None
    current_heading: str | None = None
    current_lines: list[str] = []

    def finish_package() -> None:
        if current_day is None or current_heading is None:
            return
        body = "\n".join(current_lines).strip()
        checkboxes = tuple(
            match.group(1).lower() == "x"
            for line in current_lines
            if (match := CHECKBOX_PATTERN.match(line))
        )
        if not checkboxes:
            return
        heading = re.sub(r"^August \d{1,2} ", "", current_heading)
        packages.append(
            WorkPackage(
                scheduled_date=f"{RELEASE_YEAR}-08-{current_day:02d}",
                title=f"Aug {current_day} — {heading}",
                body=body,
                checkboxes=checkboxes,
            )
        )

    for line in markdown.splitlines():
        if line.startswith("# "):
            finish_package()
            day_match = DAY_HEADING_PATTERN.match(line)
            current_day = int(day_match.group(1)) if day_match else None
            current_heading = None
            current_lines = []
        elif current_day is not None and (package_match := PACKAGE_HEADING_PATTERN.match(line)):
            finish_package()
            current_heading = package_match.group(1)
            current_lines = []
        elif current_heading is not None:
            current_lines.append(line)
    finish_package()
    return packages


if __name__ == "__main__":
    raise SystemExit(main())
