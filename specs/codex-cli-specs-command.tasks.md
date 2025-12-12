# Tasks: specs.codex-cli-command

**Input**: spec (`specs/codex-cli-specs-command.feature.md`), plan (`specs/codex-cli-specs-command.plan.md`), refreshed spec-kit templates  
**Prerequisites**: ADR #42 approved; templates refreshed; guard/CI active

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup & Guard (Shared)
- [ ] T001 [P] [COD] Refresh spec-kit templates (`specs scan --refresh-spec-kit`) and note template source/commit in PR body.
- [ ] T002 [P] [COD] Ensure PR body uses spec-specific template with issue #41, ADR #42, wiki link, and required checks checklist.
- [ ] T003 [P] [COD] Verify guard workflow enforces issue/ADR/wiki/approval/no CHANGES_REQUESTED for Codex-triggered runs.

## Phase 2: Command Surface
- [ ] T010 [COD] Add `codex specs` subcommand that delegates to specs CLI verbs (scan/templates/next/sync/close/coverage) with help/exit-code parity.
- [ ] T011 [COD] Implement binary resolution (bundled -> PATH/global npm -> `npx specs`) and bubble missing/outdated warnings.
- [ ] T012 [COD] Add `codex specs --doctor` to report detected specs version, install path, and a one-line fix if missing/outdated.

## Phase 3: Spec-kit Context & Guardrails
- [ ] T020 [COD] Wire `codex specs templates` / `codex specs scan --refresh-spec-kit` to drop refreshed templates into Codex context files.
- [ ] T021 [COD] Surface spec-kit availability/refresh status in Codex output; fail early if unavailable.
- [ ] T022 [COD] Keep guard workflow parity for Codex invocation (issue open, ADR URL + approval marker, wiki URL, no pending review comments, required checks list).

## Phase 4: Docs & Example
- [ ] T030 [P] [COD] Document install/upgrade/uninstall paths (npm global, npx fallback, optional Homebrew) and how Codex resolves the binary.
- [ ] T031 [P] [COD] Update example app README to demonstrate `codex specs` flow (scan → next → sync → close) and how to disable/remove the hook.
- [ ] T032 [P] [COD] Add note on toggling Codex specs command and uninstalling specs for consumers who opt out.

## Phase 5: Release & Close Preconditions
- [ ] T040 [COD] Bump minor version + changelog entry once feature is ready; include issue/ADR/wiki links.
- [ ] T041 [COD] Dispatch release workflow (workflow_dispatch) with new version; verify ADR/wiki/issue comments posted.
- [ ] T042 [COD] Run `specs close specs.codex-cli-command --issue 41 --pr <#>` only after release and all checks green; ensure no pending review comments.

## Dependencies & Execution Order
- Phase 1 sets guardrails; Phase 2/3 build the command + guard parity; Phase 4 documents/example; Phase 5 release/close.  
- Tasks marked [P] can run in parallel; others depend on command/guard readiness.
