# Sample app using specs

Minimal example project demonstrating specs-driven workflow with Codex and GitHub integration.

## What it shows
- Local `.specs.yml` and a sample spec
- Codex wrappers assumed from root specs installation
- Coverage workflow example

## Quickstart
```bash
npm install -g specs
specs scan
specs next
```

## Conformance
This repo is validated by the root workflow `example-conformance` that runs `npm run example:conform` to ensure specs stay in sync.

## CI example
See `.github/workflows/spec-coverage.yml` for a minimal workflow that runs `specs coverage`.
