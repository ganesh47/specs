# GitHub Actions

## Coverage workflow
A starter workflow is included at `.github/workflows/spec-coverage.yml` and in `templates/basic-spec-template`.

Key steps:
- Checkout
- Setup Node 18+
- Install the specs CLI (`npm install -g specs`)
- Run `specs coverage`

## Auto-review/merge workflow
`pr-auto-merge.yml` auto-approves and merges PRs when checks are green (uses `gh pr view/review/merge`). It requires repository-owned branches and permissions `pull-requests: write`, `contents: write`.

## Using the packaged action
Instead of a raw command, you can use the action in `packages/specs-coverage-action`:

```yaml
- uses: ./packages/specs-coverage-action
  with:
    pr: ${{ github.event.pull_request.number }}
```

## GitHub permissions
Grant pull request write permissions if posting comments. The sample workflow sets `pull-requests: write` and `contents: read`.

## Spec-kit availability check
`spec-kit:check` script verifies spec-kit prompts are reachable (defaults to github/spec-kit@main). Add a workflow step:
```yaml
- run: npm run spec-kit:check
```
Use env vars `SPEC_KIT_REPO` and `SPEC_KIT_REF` to override.
