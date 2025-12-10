---
spec_id: release.workflow
title: Release Workflow Automation for Specs
features:
  - id: release.pipeline
    accept:
      - "Release workflow creates a git tag and GitHub Release with generated artifacts from the specs CLI"
      - "Release job fails if tag/release creation or artifact upload is missing"
  - id: release.changelog
    accept:
      - "CHANGELOG.md is auto-updated from merged PRs/issues for the release; release PR includes the changelog diff"
      - "CI blocks release if changelog entry is absent or missing linked issues/PRs"
  - id: release.discussion
    accept:
      - "A GitHub Discussion is opened/updated per release with notes linked to the Release, issues, PRs, and commits"
      - "Release notes published in the GitHub Release include the discussion link"
  - id: release.wiki
    accept:
      - "Wiki page/section per version created/updated with release notes and links to the Release and changelog"
      - "Issue/PR comments for the release include the wiki link"
  - id: release.linkage
    accept:
      - "Release PR references all included issues; release commit/tag references the release PR"
      - "Specs Board item for the release spec moves Todo → In Progress → Done via `specs sync`/`specs close`"
---

## Summary
Add a release workflow step to the specs tool that tags code, publishes GitHub Releases with artifacts, updates changelog/discussion/wiki, and links issues/PRs/commits. This keeps releases traceable and auditable for specs users.

## Workflow
- Trigger: manual dispatch or version bump workflow; runs after coverage/conformance/security checks are green.
- Steps: generate changelog from merged PRs/issues → bump version/tag → create GitHub Release → upload artifacts → post release discussion → update wiki → comment on issues/PRs with release links.
- Status: `specs sync` adds issue to Specs Board (Todo); release PR moves to In Progress; `specs close --pr` moves to Done.

## Automation details
- GH Actions:
  - Generate changelog entry from merged PRs/issues (include links) and commit it in the release PR.
  - Create tag and GitHub Release; attach artifacts (e.g., specs coverage report, spec-kit template version info, tarball).
  - Post/update release discussion; include links to release, changelog, issues/PRs/commits.
  - Update wiki page/section for the version with release notes and links.
  - Comment on related issues/PRs with Release + discussion + wiki URLs; ensure release commit/tag references the release PR.
- spec-kit: use spec/plan/tasks templates for release notes/changelog formatting; refresh via `specs templates` or `specs scan --refresh-spec-kit`; enforce availability via `npm run spec-kit:check`.
- Project tracking: Specs Board Status field updated through `specs sync` (Todo/In Progress) and `specs close` (Done).

## Release artifacts
- Git tag and GitHub Release (semver).
- CHANGELOG.md updated with referenced issues/PRs.
- Release discussion link.
- Wiki page/section for the version.
- Attachments: coverage report (`.specs/coverage-report.json`), changelog snippet, spec-kit template ref (repo/ref), release asset archive.

## Open questions/risks
- Versioning scheme (semver vs. calendar) and branch cut rules.
- Approvals required before tagging (owners/security/release managers).
- Rollback strategy for failed releases (tag/release deletion, changelog reversion).
- Permissions for GH token to create releases/discussions/wiki updates.
