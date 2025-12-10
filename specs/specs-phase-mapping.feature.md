---
spec_id: specs.phase-mapping
title: Map Specs Phases to spec-kit Templates
features:
  - id: phase.mapping
    accept:
      - "Idea/ADR/plan/tasks/implementation/sync/close are each mapped to a spec-kit template and a specs CLI command with required artifacts noted."
      - "Phase outputs include stored context (from spec-kit templates) and links to issue/ADR/wiki/PR."
  - id: adr.gate
    accept:
      - "ADR discussion is created before plan/tasks; an approval marker exists before implementation/sync."
      - "Guard workflow fails PRs missing ADR URL, approval marker, wiki URL, or open issue."
  - id: templates.layering
    accept:
      - "spec-kit templates (spec/plan/tasks) are fetched via `specs templates` or `specs scan --refresh-spec-kit` before plan/tasks."
      - "specs next writes phase context using the refreshed templates and is referenced in Codex context."
  - id: github.automation
    accept:
      - "PRs use spec-specific template; guard workflow checks issue/ADR/wiki/approval and no CHANGES_REQUESTED review."
      - "CI runs spec-kit refresh/check, coverage, conformance (if applicable), and security scans (Semgrep/OSV-Scanner/Gitleaks/Checkov) on PRs and main."
  - id: sync.close.policy
    accept:
      - "`specs sync` updates project status (Todo/In Progress/Done) and links to issue/project/discussion/wiki."
      - "`specs close` requires minor version bump + release workflow run, green checks, and no pending review comments before merge/close."
---

## Summary
Align the specs lifecycle to spec-kit’s templated phases so idea → ADR → plan → tasks → implementation → sync → close all produce consistent, verifiable outputs. Using spec-kit templates with specs CLI keeps ADR gates, PR guardrails, and release-before-close enforced.

## Workflow
- Idea → Todo: open spec issue, fetch templates (`specs templates` or `specs scan --refresh-spec-kit`), start spec doc with spec-kit spec template; add issue/ADR/wiki placeholders.
- ADR gate: create discussion; approval required before plan/tasks. Guard workflow blocks PRs without issue/ADR/wiki links, approval marker, and no pending review comments.
- Plan/Tasks: run `specs next` with plan/tasks templates; commit generated context; PR uses spec-specific template and keeps CI green (spec-kit check/refresh, coverage, conformance if applicable, security scans).
- Implementation: build against plan/tasks context; `specs sync` moves project to In Progress; guard workflow continues enforcing links/approvals.
- Release before close: bump minor version, update changelog, run release workflow (tag + release + ADR comment + wiki update + issue comment) with all checks green.
- Close: ensure no pending review comments, ADR approved, release done; `specs sync` then `specs close specs.phase-mapping --issue <#> --pr <#>` to move project to Done.

## Template layering
- Fetch/refresh spec-kit templates at Todo/ADR and before plan/tasks (`specs scan --refresh-spec-kit` or `specs templates`).
- Use spec-kit spec template for the spec doc; plan/tasks templates for `specs next` outputs; include those context files in Codex reference.
- Re-run refresh when templates change or before major edits; document the template versions used in PR body.

## Automation
- GH Actions: guard workflow (issue/ADR/wiki/approval/no CHANGES_REQUESTED), coverage, conformance (example app), security (Semgrep/OSV-Scanner/Gitleaks/Checkov), spec-kit refresh/check.
- PR templates require issue/ADR/wiki links and checklist of required checks. Project “Specs Board” statuses updated via `specs sync`.
- Release workflow must be green before close; comments ADR/wiki/issue with release links.

## Open questions/risks
- How to pin template versions across specs; handling template changes mid-cycle.
- Governance: who can approve ADR; exceptions for downstream repos with different CI stacks.
- Custom phases or additional gates needed for consumers; how to surface them in spec-kit prompts.
