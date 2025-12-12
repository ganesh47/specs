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
Place executable scripts in `.codex/commands/` (provided in this repo) so Codex can invoke `specs` commands as native subcommands:
- `codex specs` (new): delegates to `specs` or `npx specs` and supports `--doctor` to report install status/version.
- `codex spec-next`, `codex spec-sync`, `codex spec-coverage`, `codex approve`: wrappers that call specs CLI/gh helpers directly.

Install/upgrade/uninstall:
- Global: `npm i -g specs` (upgrade with `npm i -g specs@latest`, uninstall with `npm rm -g specs`).
- Local fallback: `npx specs <verb>` (used automatically by `codex specs` if global is missing).
- Optional: set `PATH` to the repo-built binary (`packages/specs-cli/bin/specs.js`) for development.

## Repository layout
- `packages/specs-cli`: the main CLI
- `packages/specs-coverage-action`: GitHub Action runner for coverage
- `templates/`: starter `.specs.yml`, spec example, and workflow
- `docs/`: guides and reference
- `.codex/commands/`: Codex wrapper scripts
- `examples/sample-app`: example project showing specs usage and coverage workflow

## Install locally (repo)
```bash
npm install
npm run build --workspaces
# specs init now installs git hooks by default. If you need to reapply:
# git config core.hooksPath .githooks
```

## Example project conformance
- A sample app lives in `examples/sample-app` with its own `.specs.yml`, sample spec, and coverage workflow example.
- CI workflow `.github/workflows/example-conformance.yml` runs `npm run example:conform` to ensure the example stays in sync with specs.

## License
MIT

## Spec-kit integration
- Specs can reuse upstream prompt templates from `github/spec-kit`. Use `specs templates` or `specs scan --refresh-spec-kit` to pull prompts locally into `.specs/spec-kit`.
- CI includes `npm run spec-kit:check` to verify spec-kit templates are reachable.
- Codex wrappers continue to work; specs provides GH issues/project automation while spec-kit remains the canonical prompt source.
