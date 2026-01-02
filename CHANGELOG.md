# Changelog

## v0.4.0 - Codex specs UX and ADR/wiki automation
- Added `codex specs` wrapper with local/global/npx resolution and a richer `--doctor` (spec-kit check + template presence).
- Specs sync now auto-creates/fetches ADR discussions and wiki pages per spec and embeds links in issues; guard accepts links from issue or PR and still enforces ADR approval + no pending reviews.
- Wiki sync no longer hard-fails when GH_TOKEN is missing; sync continues while warning.
- Sample app docs updated for `codex specs` usage and disable/uninstall guidance.

## v0.3.0 - Phase-aware sync and auto hooks
- specs sync now preserves feature checkboxes and adds a Phases checklist (Idea/Todo → Close); specs close marks all phases/features done before closing.
- Auto-configure git hooks via npm prepare (commit-msg/pre-push enforced).
- Scan scope restricted to `specs/**/*.feature.md` to avoid duplicate issues from plan/tasks.

## v0.2.0 - Release workflow automation
- Added manual release workflow with tagging, release notes, ADR/wiki updates, and coverage artifact upload.
- Hardened guardrails (issue/ADR/wiki checks, security scans, Checkov exception for required release inputs) to keep release PRs gated.
- Policy: closing a spec now requires a minor version bump and release via the new workflow.

## 0.1.0 - Initial scaffold
- Add specs CLI skeleton and commands
- Add GitHub coverage action
- Add templates, docs, and Codex wrappers
