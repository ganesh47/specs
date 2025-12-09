---
spec_id: specs.example-project
title: Example project end-to-end validation
features:
  - id: specs.example-repo
    accept:
      - "Example project lives in examples/sample-app with its own .specs.yml and spec"
      - "Coverage workflow example provided for the sample app"
  - id: specs.conformance-check
    accept:
      - "Root CI runs example conformance (spec scan) to guard new specs/features"
      - "Adding a new spec requires updating example conformance"
  - id: specs.issue-discipline
    accept:
      - "Old spec issues closed as done; new work tracked via dedicated issue for this spec"
      - "Synced issue added to Specs Board with Status=Todo"
---

## Summary
Stand up a sample project that exercises specs end-to-end (CLI, GitHub workflows, Codex wrappers). Ensure ongoing changes include a conformance check so new specs/features are validated in the example project.

## Notes
- Example lives in `examples/sample-app`.
- Conformance is run via CI to keep the sample aligned with the specs toolkit.
