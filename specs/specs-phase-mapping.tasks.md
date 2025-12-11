# Tasks: specs.phase-mapping

**Input**: spec (`specs/specs-phase-mapping.feature.md`), plan (`specs/specs-phase-mapping.plan.md`), refreshed templates in `.specs/spec-kit/`
**Prerequisites**: ADR #31 approved; templates refreshed; guard/CI active

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)
- [ ] T001 [P] [MAP] Refresh spec-kit templates (`specs scan --refresh-spec-kit`) and note template commit/hash in PR body.
- [ ] T002 [P] [MAP] Ensure PR body uses spec template with issue #30, ADR #31, wiki link, and required checks checklist.
- [ ] T003 [P] [MAP] Confirm guard workflow enforced (issue/ADR/wiki/approval/no CHANGES_REQUESTED).

## Phase 2: Foundational Mapping
- [ ] T010 [MAP] Author plan doc (`specs/specs-phase-mapping.plan.md`) covering phase-to-template/command mapping, guardrails, CI/release requirements.
- [ ] T011 [MAP] Draft tasks doc (`specs/specs-phase-mapping.tasks.md`) aligned to phase mapping and automation checkpoints.
- [ ] T012 [MAP] Capture template references/versions used (e.g., spec-kit branch/commit) in plan/tasks or PR summary.

## Phase 3: Validation & Publication
- [ ] T020 [MAP] Update ADR #31 with summary of plan/tasks and maintain approval marker.
- [ ] T021 [MAP] Update wiki page `Specs-Phase-Mapping` with mapping overview and links (spec, ADR, issue, plan/tasks, guardrails).
- [ ] T022 [MAP] Run `specs sync` to ensure project status and links are current (Todo → In Progress).
- [ ] T023 [MAP] Ensure CI green on PR: spec-kit check/refresh, coverage, conformance (if applicable), security scans (Semgrep/OSV-Scanner/Gitleaks/Checkov).
- [ ] T024 [MAP] Confirm no pending review comments before merge (guard workflow passes).

## Phase 4: Close Preconditions
- [ ] T030 [MAP] Prepare minor version bump + changelog entry for this spec’s completion.
- [ ] T031 [MAP] Dispatch release workflow (workflow_dispatch) with new version; verify ADR/wiki/issue comments posted.
- [ ] T032 [MAP] Run `specs close specs.phase-mapping --issue 30 --pr <#>` only after release and all checks green.

## Phase N: Polish
- [ ] T040 [P] [MAP] Add downstream guidance for consumers (how to align custom phases/CI with spec-kit templates).
- [ ] T041 [P] [MAP] Document template pinning/versioning guidance for future specs.

## Dependencies & Execution Order
- Phase 1 → Phase 2 → Phase 3; Phase 4 only after ADR approved and CI green.
- Tasks marked [P] can run in parallel; others depend on prior outputs (plan/tasks/ADR/wiki).
