# GitHub Actions

## Coverage workflow
A starter workflow is included at `.github/workflows/spec-coverage.yml` and in `templates/basic-spec-template`.

Key steps:
- Checkout
- Setup Node 18+
- Install the specs CLI (`npm install -g specs`)
- Run `specs coverage`

## Using the packaged action
Instead of a raw command, you can use the action in `packages/specs-coverage-action`:

```yaml
- uses: ./packages/specs-coverage-action
  with:
    pr: ${{ github.event.pull_request.number }}
```

## GitHub permissions
Grant pull request write permissions if posting comments. The sample workflow sets `pull-requests: write` and `contents: read`.
