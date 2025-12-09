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

## Enable commit/PR discipline hooks
```bash
npm run setup-hooks
```
This configures Git hooks that enforce issue references in commit messages and require an open PR with green checks before pushing.

## Authenticate GitHub CLI
All GitHub actions rely on `gh`:
```bash
gh auth login
```
