# CLI Reference

## specs init
Scaffold `.specs.yml`, `specs/example.feature.md`, optional Codex wrappers, and optional workflow.

```
specs init --with-codex-wrappers --with-workflow
```

## specs scan
Parse configured spec files and print a summary.

```
specs scan
```

## specs sync
Sync specs to GitHub issues and optionally a project board using `gh`.

```
specs sync
```

## specs next
Select the next actionable spec feature and write `.specs/current-task.md` plus `.codex/context-spec-next.md` for Codex context.

```
specs next
```

## specs coverage
Run the stubbed coverage engine, emit `.specs/coverage-report.json`, and print a summary. Accepts optional PR number.

```
specs coverage --pr 15
```

## specs templates
Fetch spec-kit prompt templates locally (defaults to `.specs/spec-kit`).

```
specs templates --dest .specs/spec-kit
```

## specs close
Close a spec issue and mark the project item Done. Supply `spec_id` or `--issue` for the issue number.

```
specs close specs.spec-kit-integration
specs close --issue 7
```
