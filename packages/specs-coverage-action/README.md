# specs-coverage-action

GitHub Action that runs `specs coverage` inside a workflow. It can be used on pull requests to emit a coverage report and (TODO) comment back on the PR.

## Usage

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 18
- run: npm install -g specs
- uses: ./packages/specs-coverage-action
```

Inputs/outputs are currently minimal; the action simply runs `specs coverage` and prints output. Future iterations will add PR comments using `gh pr comment`.
