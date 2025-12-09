# specs CLI

Spec-Driven Development Kit CLI. Provides commands to scaffold specs, parse them, sync to GitHub issues/project boards, fetch the next task, and run a stubbed spec coverage engine.

## Commands
- `specs init` – scaffold `.specs.yml`, example spec, optional Codex wrappers and workflow
- `specs scan` – parse configured specs and print a summary
- `specs sync` – sync specs to GitHub issues/project board via `gh`
- `specs next` – pick the next actionable spec and write context files
- `specs coverage` – run the stub LLM coverage engine and emit a report

## Development
```bash
npm install
npm run build
npm run dev -- init
```

The CLI shells out to the GitHub CLI for all GitHub interactions.
