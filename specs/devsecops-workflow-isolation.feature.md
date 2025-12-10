---
spec_id: devsecops.workflow-isolation
title: DevSecOps Workflow Isolation for Spec Lifecycle
features:
  - id: devsecops.spec-kit-reuse
    accept:
      - "spec-kit templates (spec/plan/tasks) fetched to .specs/spec-kit and referenced in Codex context files"
      - "CI spec-kit availability check (`npm run spec-kit:check`) required in gating workflows"
  - id: devsecops.pipeline-isolation
    accept:
      - "Separate GH Actions pipelines for planning/build/release/security tied to spec_id; security scans block merge on failure"
      - "Pipelines run with least-privilege secrets and isolate spec artifacts per spec_id"
      - "Default CI uses OSS scanners (Semgrep SAST, OSV-Scanner SCA, Gitleaks secret scan, Checkov IaC) with configuration hooks to swap/extend tooling per spec consumer"
      - "Example app workflow includes the same security job (Semgrep/OSV-Scanner/Gitleaks/Checkov) as the root pipeline"
  - id: devsecops.adr-design-review
    accept:
      - "A GitHub Discussion (ADR/design review) is created per spec before implementation and linked to the spec issue"
      - "ADR approval recorded before merge; PR references the ADR/discussion link"
      - "ADR owner defaults to the repo owner (@ganesh47) unless explicitly overridden in the discussion"
      - "PR merged only after required review/approval recorded in the ADR discussion"
  - id: devsecops.gh-automation
    accept:
      - "`specs sync` creates/updates the spec issue with labels spec/feature and adds it to project 'Specs Board' with Status transitions (Todo/In Progress/Done)"
      - "CI enforces spec-kit check, specs coverage, and example conformance before merge; project item set to Done on close"
  - id: devsecops.docs-wiki
    accept:
      - "Wiki page per spec/ADR updated with decisions and linked from the issue and PR"
      - "Issue/PR comments include links to the discussion and wiki entry"
---

## Summary
Define a spec lifecycle that isolates DevSecOps workflows per spec_id while reusing spec-kit templates. Every spec flows through ADR/design review, gated CI (coverage, conformance, security), and GitHub automation (issues, projects, discussions, wiki) to keep changes traceable and compliant.

## Workflow
- Todo → In Progress → Done on project "Specs Board", driven by `specs sync` and close actions.
- On spec selection (`specs next`), Codex context references spec-kit templates and current spec details.
- ADR/design review discussion opened from the spec issue before implementation; approval required before coding/merge.
- PRs must reference the spec issue and ADR discussion; one PR per spec_id, with green checks required before merge.
- Closing via `specs close --pr <n>` moves the project item to Done and ensures the issue is closed.

## DevSecOps controls
- Planning pipeline uses spec-kit plan/tasks templates; outputs isolated per spec_id and stored under `.specs/`.
- Build/test pipeline runs with scoped secrets; SBOM and dependency scans run per spec_id artifact set.
- Release pipeline uses environment protections and requires prior ADR approval; provenance metadata tagged with spec_id.
- Security scans (SAST, SCA, secret scanning, IaC) run as separate jobs; any failure blocks merge and marks status check pending/failed.
- Default OSS scanners (extensible):
  - SAST: Semgrep OSS (`semgrep ci`); override via env/config (e.g., `SAST_CMD`) for alternative platforms.
  - SCA: OSV-Scanner (polyglot, pulls deps lockfiles); allow swapping to org-preferred SCA via workflow inputs.
  - Secrets: Gitleaks (`gitleaks detect`); allow additional providers via an aggregate script.
  - IaC: Checkov (`checkov -d .`); allow tfsec/other IaC scanners via config.
- Exception policy: track suppressions in repo (e.g., `.specs/security-exceptions.yml`) keyed by spec_id with owner, rationale, and expiry; CI fails on expired/missing approvals to keep deviations visible.

## Automation details
- Templates: fetch via `specs templates` or `specs scan --refresh-spec-kit`; CI runs `npm run spec-kit:check` to ensure upstream availability.
- GitHub Actions: coverage, example conformance, spec-kit check, and security scan jobs are required checks on PRs.
- Issues/projects: `specs sync` creates/updates the spec issue with labels `spec`/`feature` and adds to "Specs Board" (Status defaults to Todo, In Progress on sync, Done on close).
- Discussions: ADR/design review discussion created/linked from the issue; PR template/comment includes the discussion URL.
- Wiki: automation updates/creates a wiki page per spec_id/ADR with decisions, linking back to the issue and PR.

## Open questions/risks
- What level of ADR approval is required (owners vs. codeowners vs. security sign-off)?
- Which security tools are authoritative for SAST/SCA/secret scan, and how are exceptions tracked?
- How to handle private repos without wiki access—fallback to repo docs folder?
- Do we need per-environment segregation beyond GH environment protections (e.g., separate runners)?
