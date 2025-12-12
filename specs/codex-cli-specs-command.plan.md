# Implementation Plan: specs.codex-cli-command

**Branch**: `specs-codex-cli-command-plan` | **Date**: 2025-12-12 | **Spec**: specs/codex-cli-specs-command.feature.md  
**Input**: Refreshed spec-kit templates (`specs scan --refresh-spec-kit`) and current context (`.specs/current-task.md`, `.codex/context-spec-next.md`)

## Summary
Add a Codex CLI subcommand (`codex specs`) that delegates to the specs CLI (scan/templates/next/sync/close/coverage) with exit-code parity, install/upgrade/uninstall guidance, spec-kit refresh surfacing in Codex context, and guardrail parity (issue/ADR/wiki/approval/no pending reviews, required checks). Include an example app path that demonstrates end-to-end usage and how to disable/remove the hook.

## Technical Context
**Language/Version**: Node.js/TypeScript (Codex CLI + specs CLI)  
**Primary Dependencies**: specs CLI, spec-kit templates, GitHub CLI (auth), GitHub Actions (guard, coverage, conformance, security, release)  
**Storage**: Documentation under `specs/` + example app README; no DB changes  
**Testing**: Guard workflow + CI (spec-kit check/refresh, coverage, conformance if applicable, security scans), manual `codex specs --doctor` sanity  
**Target Platform**: Codex CLI users in this repo and downstream consumers  
**Constraints**: ADR #42 approval required before implementation; PRs must use spec-specific template; required checks must be green; release-before-close rule applies

## Project Structure
Documentation for this spec lives in `specs/`:
```
specs/
├── codex-cli-specs-command.feature.md   # spec
├── codex-cli-specs-command.plan.md      # this plan
└── codex-cli-specs-command.tasks.md     # tasks derived from plan
```
Context files and templates:
```
.specs/current-task.md
.codex/context-spec-next.md
.specs/spec-kit/*.md   # refreshed spec-kit templates (spec/plan/tasks)
```

## Implementation Strategy
1) Command surface: add `codex specs` wrapper that discovers the specs binary (bundled/global/npx fallback) and forwards args/help/exit codes.  
2) Install lifecycle: document install/upgrade/uninstall paths; add `codex specs --doctor` to report version and suggest one-line fixes.  
3) Spec-kit context: ensure `codex specs templates` / `codex specs scan --refresh-spec-kit` refresh templates and drop them into Codex context files.  
4) Guardrails parity: keep guard workflow enforcing issue/ADR/wiki/approval/no pending reviews and required checks when invoked via Codex; ensure PR uses spec-specific template.  
5) Example enablement: update example app docs to show `codex specs` end-to-end, with toggle/disable instructions.  
6) Governance & close: maintain ADR/wiki links, run `specs sync`, bump version + release before `specs close`, and ensure no pending review comments before merge.

## Dependencies & Execution Order
- Prereqs: ADR discussion #42 (approved); templates refreshed.  
- Sequence: Plan/tasks → ADR/wikilink updates → command + doctor → docs + example enablement → guard validation → release + close.  
- Testing: CI guard + coverage/conformance/security + spec-kit refresh/check on PRs and main.

## Notes
- Record spec-kit template source/commit in PR body when refreshed.  
- Keep Codex command optional/disable-able; document how to remove global install if undesired.  
- Ensure GH token scopes permit discussions/wiki/comments when running guard via Codex.
