# Specs workflow overview

The diagram below traces the current end-to-end workflow implemented by the completed specs. It highlights how the specs CLI, Codex wrappers, GitHub automation, and DevSecOps controls combine to move a spec from intake through release.

```mermaid
flowchart TD
    A[Spec created or selected<br/>(specs.sync/specs.next)] --> B[Issue on Specs Board<br/>Status: Todo]
    B --> C[ADR/Design discussion opened<br/>and approved]
    C --> D[Branch + PR per spec<br/>(commit messages reference issue)]
    D --> E[Codex wrappers use spec-kit templates<br/>for planning and tasks]
    E --> F[CI runs coverage + example conformance<br/>+ spec-kit availability check]
    F --> G[Security scans: Semgrep, OSV-Scanner,<br/>Gitleaks, Checkov]
    G --> H[PR checks green<br/>(Status: In Progress)]
    H --> I[Release workflow (tag + GitHub Release)<br/>changelog/wiki/discussion updated]
    I --> J[specs close --pr <n><br/>Issue closed, Specs Board → Done]
```

## How the workflow is enabled
- **Baseline scaffolding** ensures repositories start with `.specs.yml`, example specs, Codex wrappers, GitHub sync, and CI coverage so specs can be tracked and validated from day one. (`specs.baseline`)
- **Spec-kit integration** routes specification, planning, and task prompts through upstream templates while keeping GitHub issue/PR discipline, CI conformance, and Codex context files aligned with the current spec. (`specs.spec-kit-integration`)
- **DevSecOps isolation** gates each spec with dedicated pipelines, ADR approval, OSS security scanning, spec-kit availability checks, and automatic project/issue/wiki updates to maintain traceability and compliance. (`devsecops.workflow-isolation`)
- **Commit/PR discipline** enforces issue-referenced commits, one PR per spec, and green checks before pushing, keeping the workflow orderly and auditable. (`workflow.commit-pr`)
- **Example project conformance** keeps the sample app in `examples/sample-app` exercising the full workflow and ensures new specs stay aligned via CI conformance checks. (`specs.example-project`)
- **Release automation** tags versions, publishes GitHub Releases with artifacts, updates changelog/discussion/wiki, and links all related issues/PRs/commits so releases remain traceable. (`release.workflow`)
