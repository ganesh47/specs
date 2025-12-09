---
spec_id: specs.spec-kit-integration
title: Deep integration with spec-kit and Codex-driven tooling
features:
  - id: specs.spec-kit-reuse
    accept:
      - "Specs CLI can pull and reuse spec-kit prompt templates (e.g., specify/plan/tasks) without duplicating content"
      - "Specs documents can reference spec-kit prompts via config so updates propagate automatically"
  - id: specs.codex-first
    accept:
      - "Codex wrappers call specs which can delegate to spec-kit prompts when generating specs, plans, tasks"
      - "Current-task/context files include spec-kit prompt references for Codex sessions"
  - id: specs.github-automation
    accept:
      - "Spec sync continues to use GH issues and Specs Board; spec-kit-derived work items retain spec_id labels"
      - "PR/commit discipline enforced (issue refs, PR-per-spec, green checks) for spec-kit-driven work"
  - id: specs.ci-conformance
    accept:
      - "CI runs coverage plus example conformance, and adds a spec-kit prompt integrity check (template availability)"
      - "Main branch protected by these checks; auto-merge only when all pass"
  - id: specs.doc-alignment
    accept:
      - "Docs clearly state spec-kit as upstream source of prompts/templates and describe how specs extends it with GH/Codex glue"
      - "README/getting-started link to spec-kit docs for prompt semantics"
  - id: specs.workflow-tracking
    accept:
      - "Specs workflow is trackable via GH issues + project lanes (Todo/In Progress/Done) with spec_id labels"
      - "Per-spec PR lifecycle enforced: branch -> PR -> green checks -> auto-review/merge -> closure"
      - "Codex context files include current status and links to PR/issue for traceability"
      - "History/versioning of spec evolution captured via commits and PRs referencing the spec issue"
---

## Summary
Elevate specs by building on spec-kit instead of duplicating it: reuse spec-kit prompt templates for specification, planning, and tasking; wire Codex wrappers and GitHub automation around them; enforce PR/commit discipline and CI conformance that validates both specs coverage and spec-kit template availability.

## Conformity checklist
- Spec-kit templates fetched and available (`specs templates` or CI `spec-kit:check`)
- Issues on Specs Board set to In Progress when work starts; Done when `specs close` runs
- PR for the spec merged with all checks green (coverage, conformance, spec-kit check)
- Spec issue closed via `specs close --pr <number>` to ensure status update + Done lane
- Docs mention spec-kit as upstream prompt source and workflow expectations

## Notes
- Integration should remain git/GitHub-native: GH issues, GH Projects, GH Actions for automation; no external services.
- Keep spec-kit as the canonical prompt source; specs provides orchestration (wrappers, CI, GH sync, discipline hooks).
- CI should fail fast if spec-kit prompt templates are missing or changed incompatibly.
