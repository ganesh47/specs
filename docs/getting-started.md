# Getting Started

## Install
```bash
npm i -g specs
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

## Authenticate GitHub CLI
All GitHub actions rely on `gh`:
```bash
gh auth login
```
