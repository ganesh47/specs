---
spec_id: specs.baseline
title: Baseline specs capability
features:
  - id: specs.cli-scaffold
    accept:
      - ".specs.yml exists with GitHub project and labels configured"
      - "An example spec file lives under specs/"
  - id: specs.codex-wrappers
    accept:
      - ".codex/commands/ wraps next, sync, coverage, approve"
      - "Wrappers are executable and mirror CLI usage"
  - id: specs.github-sync
    accept:
      - "Running specs sync creates or updates GitHub issues for specs"
      - "Issues are labeled with spec and added to project 'Spec Funnel' when available"
  - id: specs.coverage-ci
    accept:
      - "Workflow .github/workflows/spec-coverage.yml runs specs coverage on push and PR"
      - "Coverage report writes to .specs/coverage-report.json"
---

## Summary
Document the baseline setup of the specs toolkit: CLI scaffold, Codex integration, GitHub sync, and CI coverage action.

## Notes
- This is the seed spec for the repo; future specs should follow this front matter and Markdown layout.
- `specs sync` requires GitHub CLI authentication (`gh auth status`).
