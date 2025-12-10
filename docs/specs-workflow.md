# Specs Workflow with Codex and spec-kit

This document visualizes the core specs CLI workflow and how it integrates with Codex wrappers and spec-kit templates.

## End-to-end flow (init → sync → close)

```mermaid
flowchart TD
  subgraph Dev[Developer]
    U[Author specs/*.md]
    U -->|Run| INIT[specs init]
    U -->|Run via Codex| CNEXT[codex spec-next]
    U -->|Run via Codex| CSYNC[codex spec-sync]
    U -->|Run| CLOSE[specs close --pr N]
  end

  subgraph SpecsCLI[specs CLI]
    INIT -->|create| S1[.specs.yml]
    INIT -->|create| S2[specs/example.feature.md]
    INIT -->|optional| S3[.codex/commands/* wrappers]
    INIT -->|optional| S4[.github/workflows/spec-coverage.yml]

    CNEXT --> NEXT[specs next]
    NEXT --> C1[.specs/current-task.md]
    NEXT --> C2[.codex/context-spec-next.md]

    CSYNC --> SYNC[specs sync]
    CLOSE --> CLOSEX[Validate/merge PR, close issue]
  end

  subgraph SpecKit[spec-kit]
    T1[Templates (prompts for specs/plans/tasks)]
    TFetch[specs templates] -->|fetch| TLoc[.specs/spec-kit]
    C2 -. reference prompts .-> TLoc
  end

  subgraph GH[GitHub]
    GH1[Issue per spec]
    GH2[Project: Spec Board]
    GHPR[PR for spec work]
  end

  SYNC -->|ensure gh auth| GHAUTH{gh auth}
  GHAUTH -->|ok| GH1
  SYNC -->|upsert| GH1
  SYNC -->|add| GH2[[Project item → In Progress]]

  CLOSEX -->|gh close issue| GH1
  CLOSEX -->|project stage: done| GH2[[Project item → Done]]
  CLOSEX -->|if --pr N: check/merge| GHPR

  %% Codex wrappers
  subgraph Codex[Codex CLI]
    CW[.codex/commands/*]
  end
  S3 --> CW
  CW -->|spec-next| CNEXT
  CW -->|spec-sync| CSYNC
```

References:
- CLI: `docs/cli-reference.md`
- Codex mapping: `docs/codex-integration.md`
- Code: `packages/specs-cli/src/commands/*.ts`
