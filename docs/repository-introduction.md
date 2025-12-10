# Repository Introduction and Intent

## Purpose and positioning
Specs is a spec-driven development toolkit that combines YAML+Markdown specifications, GitHub issue/project automation, and Codex wrappers to keep engineering work aligned with explicit requirements. It provides a structured way to author specs, sync them to GitHub for tracking, and enforce delivery discipline through hooks and CI checks.

## Core components
- **CLI (`packages/specs-cli`)** – Scaffolds `.specs.yml`, parses and syncs specs to GitHub, picks the next actionable feature, and runs a stubbed coverage engine. The CLI shells out to the GitHub CLI for all GitHub interactions.
- **Coverage action (`packages/specs-coverage-action`)** – GitHub Action wrapper that runs `specs coverage` inside workflows, intended for PR coverage reporting.
- **Templates and wrappers** – Starter templates for specs and workflows plus Codex wrapper scripts under `.codex/commands/` that expose specs commands as native Codex subcommands.
- **Example project (`examples/sample-app`)** – Demonstrates end-to-end usage with its own `.specs.yml`, sample spec, and coverage workflow, kept in sync via the root CI conformance job.

## Workflows and automation
- **GitHub Actions** – Provided workflows cover spec coverage, auto-review/merge when checks are green, and spec-kit template availability checks. Workflows expect Node 18 and GitHub permissions for PR interactions.
- **Discipline hooks** – Git hooks enforce that commits reference issues, branches have open PRs per spec, and pushes only proceed when PR checks are successful.
- **Spec-kit integration** – Specs can fetch prompt templates from the upstream `spec-kit`, and CI includes a `spec-kit:check` script to ensure templates remain available.

## Spec library inside this repo
- **Baseline capability** – Seeds the repo with CLI scaffold expectations, Codex wrappers, GitHub sync, and coverage workflow.
- **Commit/PR discipline** – Defines acceptance for issue-referenced commits, per-spec PRs, and green-check gating on pushes.
- **Example project E2E** – Ensures the sample app and conformance checks stay aligned with new specs and features.
- **Spec-kit integration** – Captures expectations for reusing spec-kit prompts, Codex-first workflows, GitHub automation, CI conformance, documentation alignment, and workflow tracking.

## Getting started highlights
- Install via `npm i -g specs` (or directly from `main`), then run `specs init` with optional Codex wrappers and coverage workflow scaffolding.
- Ensure `.codex/commands/*` are executable, authenticate `gh`, and use `specs templates` or `specs scan --refresh-spec-kit` to pull spec-kit prompts locally.
- The sample workflows and actions expect Node 18+ and GitHub permissions (`pull-requests: write`, `contents: read`) for commenting/merging.

## Notes on project information sources
This overview synthesizes information from the repository README, docs, packaged READMEs, and in-repo specs. No additional wiki or tracked issue data is present in the checked-in files.
