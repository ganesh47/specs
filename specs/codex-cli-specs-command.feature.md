---
spec_id: specs.codex-cli-command
title: Expose specs CLI inside Codex CLI
features:
  - id: codex.subcommand
    accept:
      - "`codex specs` (or `codex-cli specs`) delegates to the specs CLI with parity for core verbs: scan, templates, next, sync, close, coverage"
      - "Help output shows the specs verbs and forwards exit codes/stdout so guardrails work inside Codex sessions"
  - id: install.lifecycle
    accept:
      - "Document install/upgrade/uninstall paths (npm global, npx fallback, optional Homebrew) and how Codex resolves the binary"
      - "Provide a scripted install check that warns when specs is absent or outdated and offers a one-liner to fix"
  - id: spec-kit.context
    accept:
      - "`codex specs templates` or `codex specs scan --refresh-spec-kit` refreshes spec-kit templates and drops them into Codex context files"
      - "Spec-kit availability is validated in guard checks and surfaced in Codex CLI output before running specs verbs"
  - id: guardrails.integration
    accept:
      - "Guard workflow still enforces open issue, ADR URL + approval marker, wiki URL, and no CHANGES_REQUESTED when invoked via Codex"
      - "Example PR uses the spec-specific template and passes spec-kit refresh/check, coverage, conformance (if applicable), and security scans"
  - id: example.enablement
    accept:
      - "Example app demonstrates `codex specs …` end-to-end (scan → next → sync → close) and records results in issue/PR checklists"
      - "Docs link from the example app README shows how to toggle/disable the Codex specs command and how to uninstall specs"
---

## Summary
Expose the specs CLI as a first-class Codex CLI command (`codex specs`) so users can run scan/next/sync/close from the same interface. Include clear install/upgrade/uninstall guidance, spec-kit template refresh, and guardrails that mirror existing CI checks. Provide an example app path that proves the flow works and is easy to remove if desired.

## Meta prompt
You are drafting a specification to expose the specs CLI inside Codex CLI. Include:
- Commands: `codex specs` delegating to specs CLI verbs (scan, templates, next, sync, close, coverage) with help/exit-code parity.
- Install/upgrade/uninstall guidance (npm global, npx fallback, optional Homebrew), detection of missing/outdated specs, and a one-liner fixer.
- Spec-kit integration: refresh templates (`specs templates` or `specs scan --refresh-spec-kit`) and ensure Codex context files include refreshed templates.
- Guardrails: enforce open issue, ADR discussion URL + approval marker, wiki link, no pending review comments, required checks (spec-kit refresh/check, coverage, conformance, security scans) even when invoked via Codex.
- Example app: demonstrate the flow end-to-end with checklists updating in issues/PRs, and document how to disable/remove the Codex specs command.

## Workflow
- Entry: users run `codex specs <verb>`; Codex locates the specs binary (bundled, global npm, or npx fallback) and surfaces missing/outdated warnings with fix commands.
- Templates: `codex specs templates` or `codex specs scan --refresh-spec-kit` refreshes spec-kit templates and places them into Codex context for plan/tasks generation.
- Sync/guard: `codex specs sync` keeps project issues/board in Todo/In Progress/Done; guard checks still require ADR URL + approval, wiki link, and open issue; `codex specs close` enforces release + green checks + no pending review comments.
- Docs: README/CLI help page explains install/uninstall, supported verbs, environment needs (GH auth), and how to disable the Codex hook.

## Automation details
- Codex CLI detects specs via PATH/global npm and falls back to `npx specs`; `codex specs --doctor` reports version and install status with suggested fixes.
- GH Actions guard workflow remains in place; PRs must use the spec-specific template and stay green on spec-kit refresh/check, coverage, conformance (if applicable), and security scans (Semgrep/OSV-Scanner/Gitleaks/Checkov).
- Spec-kit refresh is validated via `specs scan --refresh-spec-kit` and `npm run spec-kit:check`; failures block sync/close.
- Example app CI runs the same guard + coverage/conformance/security checks when using `codex specs`.

## Open questions/risks
- Packaging choice for Codex bundling vs. external dependency; handling air-gapped installs.
- Permission scope for GH tokens when invoked from Codex; fallback behavior if discussions/wiki permissions are missing.
- Version skew between bundled specs and latest spec-kit templates; strategy for override/pinning.
