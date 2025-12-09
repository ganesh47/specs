# Getting Started

## Install (from this repo)
Install directly from `main` so you always get the latest CLI:
```bash
npm i -g git+https://github.com/ganesh47/specs.git#main
```

## Initialize a repo
```bash
specs init --with-codex-wrappers --with-workflow
```
This creates `.specs.yml`, an example spec file, Codex wrapper commands, and an optional coverage workflow.

## Run Codex wrapper commands
Ensure scripts in `.codex/commands/` are executable:
```bash
chmod +x .codex/commands/*
```
Then run:
```bash
codex spec-next
codex spec-sync
codex spec-coverage
codex approve 15
```

## Example project
An example lives in `examples/sample-app` with its own `.specs.yml`, sample spec, and a coverage workflow. CI runs `npm run example:conform` to keep the example aligned.

## Git hooks for discipline
`specs init` installs Git hooks by default to enforce issue references in commit messages and require an open PR with green checks before pushing. If you need to reconfigure manually:
```bash
git config core.hooksPath .githooks
```

## Authenticate GitHub CLI
All GitHub actions rely on `gh`:
```bash
gh auth login
```

## Using spec-kit templates
Specs builds on spec-kit prompts. To refresh templates locally:
```bash
specs templates
# or
specs scan --refresh-spec-kit
```
Templates land in `.specs/spec-kit`. CI runs `npm run spec-kit:check` to ensure upstream templates are reachable.
