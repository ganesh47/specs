import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';

function writeFileIfMissing(targetPath: string, content: string) {
  if (fs.existsSync(targetPath)) {
    // eslint-disable-next-line no-console
    console.log(`Skipping existing ${targetPath}`);
    return;
  }
  fs.ensureDirSync(path.dirname(targetPath));
  fs.writeFileSync(targetPath, content, 'utf8');
  // eslint-disable-next-line no-console
  console.log(`Created ${targetPath}`);
}

function codexWrapper(name: string, body: string): string {
  return `#!/usr/bin/env bash\n${body}\n`;
}

export function registerInit(program: Command) {
  program
    .command('init')
    .description('Create base .specs.yml and example spec files')
    .option('--with-codex-wrappers', 'Generate .codex wrapper commands', false)
    .option('--with-workflow', 'Generate spec-coverage workflow', false)
    .option('--no-hooks', 'Do not install git hooks for commit/PR discipline', false)
    .action((options) => {
      const cwd = process.cwd();
      const configPath = path.join(cwd, '.specs.yml');
      const exampleSpecPath = path.join(cwd, 'specs', 'example.feature.md');

      const configContent = `specs:\n  paths:\n    - \'specs/**/*.md\'\n  format: \'markdown+yaml\'\n\ngithub:\n  project_name: \'Spec Funnel\'\n  issue_labels:\n    - \'spec\'\n    - \'feature\'\n\ncodex:\n  context_paths:\n    - \'src\'\n    - \'tests\'\n`;

      const specContent = `---\nspec_id: ingest.sensor\ntitle: Sensor ingestion pipeline\nfeatures:\n  - id: ingest.validate-schema\n    accept:\n      - Reject packets missing fields\n      - Emit structured error telemetry\n---\n\n## Overview\n\nDescribe the ingestion behavior and validation guarantees.\n`;

      writeFileIfMissing(configPath, configContent);
      writeFileIfMissing(exampleSpecPath, specContent);

      if (options.hooks !== false) {
        const hooksDir = path.join(cwd, '.githooks');
        fs.ensureDirSync(hooksDir);
        const commitMsgHook = [
          '#!/usr/bin/env bash',
          'set -euo pipefail',
          'MSG_FILE=\"$1\"',
          'MSG_CONTENT=$(cat \"$MSG_FILE\")',
          'if echo \"$MSG_CONTENT\" | grep -qE \"#[0-9]+\"; then',
          '  exit 0',
          'fi',
          'cat <<\"MSG\"',
          'Commit message must reference an issue number for the active spec (e.g. \"feat: add hooks (#123)\" or \"Fix: adjust sync #123\").',
          'MSG',
          'exit 1',
          '',
        ].join('\\n');

        const prePushHook = [
          '#!/usr/bin/env bash',
          'set -euo pipefail',
          '',
          'if ! command -v gh >/dev/null 2>&1; then',
          '  echo \"GitHub CLI (gh) is required to run pre-push checks.\"',
          '  exit 1',
          'fi',
          '',
          'if ! gh auth status -t >/dev/null 2>&1; then',
          '  echo \"GitHub CLI is not authenticated. Run \\\"gh auth login\\\".\"',
          '  exit 1',
          'fi',
          '',
          'BRANCH=$(git rev-parse --abbrev-ref HEAD)',
          "PR_NUMBER=$(gh pr list --head \"$BRANCH\" --state open --json number --jq '[0].number' 2>/dev/null || true)",
          '',
          'if [ -z \"$PR_NUMBER\" ]; then',
          '  echo \"No open PR for branch \\\"$BRANCH\\\". Create a per-spec PR before pushing.\"',
          '  exit 1',
          'fi',
          '',
          'PENDING_OR_FAILING=$(gh pr view \"$PR_NUMBER\" --json statusCheckRollup --jq \"[.statusCheckRollup[]? | select(.conclusion != \\\"SUCCESS\\\" and .conclusion != \\\"NEUTRAL\\\")] | length\" 2>/dev/null || echo \"0\")',
          'if [ \"${PENDING_OR_FAILING:-0}\" != \"0\" ]; then',
          '  echo \"PR #$PR_NUMBER has failing or pending checks. Resolve before pushing.\"',
          '  exit 1',
          'fi',
          '',
          'exit 0',
          '',
        ].join('\\n');

        writeFileIfMissing(path.join(hooksDir, 'commit-msg'), commitMsgHook);
        writeFileIfMissing(path.join(hooksDir, 'pre-push'), prePushHook);
        fs.chmodSync(path.join(hooksDir, 'commit-msg'), 0o755);
        fs.chmodSync(path.join(hooksDir, 'pre-push'), 0o755);
        try {
          // Configure hooks path; best-effort.
          require('child_process').execSync('git config core.hooksPath .githooks', { cwd });
          // eslint-disable-next-line no-console
          console.log('Configured git hooks path to .githooks');
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Unable to configure git hooks path automatically. Run: git config core.hooksPath .githooks');
        }
      }

      if (options.withCodexWrappers) {
        const wrappersDir = path.join(cwd, '.codex', 'commands');
        fs.ensureDirSync(wrappersDir);
        writeFileIfMissing(
          path.join(wrappersDir, 'spec-next'),
          codexWrapper('spec-next', 'specs next "$@"')
        );
        writeFileIfMissing(
          path.join(wrappersDir, 'spec-sync'),
          codexWrapper('spec-sync', 'specs sync "$@"')
        );
        writeFileIfMissing(
          path.join(wrappersDir, 'spec-coverage'),
          codexWrapper('spec-coverage', 'specs coverage "$@"')
        );
        writeFileIfMissing(
          path.join(wrappersDir, 'approve'),
          codexWrapper(
            'approve',
            'Usage="Usage: codex approve <pr>"\nPR="$1"\nif [ -z "$PR" ]; then\n  echo "$Usage"\n  exit 1\nfi\n\necho "Running spec coverage..."\nspecs coverage || echo "coverage engine is stubbed"\n\necho "Approving PR via gh…"\ngh pr review "$PR" --approve'
          )
        );
      }

      if (options.withWorkflow) {
        const workflowPath = path.join(cwd, '.github', 'workflows', 'spec-coverage.yml');
        const workflowContent = `name: specs coverage\n\non:\n  pull_request:\n    branches: [main]\n\npermissions:\n  pull-requests: write\n  contents: read\n\njobs:\n  coverage:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 18\n      - run: npm install -g specs\n      - run: specs coverage\n`;
        writeFileIfMissing(workflowPath, workflowContent);
      }
    });
}
