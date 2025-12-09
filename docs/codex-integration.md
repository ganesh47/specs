# Codex Integration

Codex discovers commands in `.codex/commands/`. This repo ships wrappers so you can run specs actions as native Codex subcommands.

## Available wrappers
- `codex spec-next` → `specs next`
- `codex spec-sync` → `specs sync`
- `codex spec-coverage` → `specs coverage`
- `codex approve <pr>` → runs coverage then `gh pr review <pr> --approve`

Ensure wrappers are executable:
```bash
chmod +x .codex/commands/*
```

## Context files
`specs next` writes `.codex/context-spec-next.md` to supply context for Codex sessions, alongside `.specs/current-task.md`.
