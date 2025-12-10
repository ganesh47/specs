# Changelog

## v0.2.0 - Release workflow automation
- Added manual release workflow with tagging, release notes, ADR/wiki updates, and coverage artifact upload.
- Hardened guardrails (issue/ADR/wiki checks, security scans, Checkov exception for required release inputs) to keep release PRs gated.
- Policy: closing a spec now requires a minor version bump and release via the new workflow.

## 0.1.0 - Initial scaffold
- Add specs CLI skeleton and commands
- Add GitHub coverage action
- Add templates, docs, and Codex wrappers
