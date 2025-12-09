# specs

Spec-Driven Development Kit & Codex CLI Addon. **specs** brings YAML+Markdown specs, GitHub issue syncing, CI coverage, and Codex wrapper commands to any repository.

## Quickstart

```bash
npm i -g specs
specs init
codex spec-next
```

## What you get
- Structured `specs/` folder with YAML+Markdown specs
- CLI commands: `specs init`, `specs scan`, `specs sync`, `specs next`, `specs coverage`
- Codex wrappers in `.codex/commands/` for `codex spec-next`, `codex spec-sync`, `codex spec-coverage`, `codex approve`
- GitHub Action for spec coverage

## Requirements
- Node.js 18+
- GitHub CLI (`gh`) installed and authenticated for sync/approval/PR actions

## Using with Codex CLI
Place executable scripts in `.codex/commands/` (provided in this repo) so Codex can invoke `specs` commands as native subcommands.

## Repository layout
- `packages/specs-cli`: the main CLI
- `packages/specs-coverage-action`: GitHub Action runner for coverage
- `templates/`: starter `.specs.yml`, spec example, and workflow
- `docs/`: guides and reference
- `.codex/commands/`: Codex wrapper scripts

## Install locally (repo)
```bash
npm install
npm run build --workspaces
# specs init now installs git hooks by default. If you need to reapply:
# git config core.hooksPath .githooks
```

## License
MIT
