---
spec_id: workflow.commit-pr
title: Commit and PR discipline for spec work
features:
  - id: workflow.commit-has-issue
    accept:
      - "Commit message includes referenced issue number (e.g., #123) for the active spec"
      - "Hook blocks commits lacking an issue reference"
  - id: workflow.pr-per-spec
    accept:
      - "Branch work has an open PR per spec; pushing without an open PR fails"
      - "PR remains linked to spec issue"
  - id: workflow.ci-green-before-push
    accept:
      - "Pre-push hook blocks pushes when PR checks are failing or pending"
      - "Push only allowed when PR checks are success/neutral"
---

## Summary
Enforce disciplined spec delivery: every commit references its spec issue, work is done via a per-spec PR, and pushes only occur when PR checks are green.

## Notes
- Requires GitHub CLI authentication.
- Hooks live in `.githooks/`; enable with `git config core.hooksPath .githooks`.
