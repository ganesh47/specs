# Sample app using specs

Minimal example project demonstrating specs-driven workflow with Codex and GitHub integration.

## What it shows
- Local `.specs.yml` and a sample spec
- Codex wrappers assumed from root specs installation
- Coverage workflow example

## Quickstart
```bash
# from repo root (uses codex wrapper with fallback to npx)
codex specs scan --refresh-spec-kit
codex specs next
```
If you prefer global CLI:
```bash
npm install -g specs
specs scan --refresh-spec-kit
specs next
```

## Conformance
This repo is validated by the root workflow `example-conformance` that runs `npm run example:conform` to ensure specs stay in sync.

## CI example
See `.github/workflows/spec-coverage.yml` for a minimal workflow that runs `specs coverage`.

## Toggle/disable Codex specs command
- The Codex hook lives at `.codex/commands/specs`. Remove or rename it to disable.
- Uninstall global CLI with `npm rm -g specs`; `codex specs` will fall back to `npx specs`.
