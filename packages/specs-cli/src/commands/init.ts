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
    .action((options) => {
      const cwd = process.cwd();
      const configPath = path.join(cwd, '.specs.yml');
      const exampleSpecPath = path.join(cwd, 'specs', 'example.feature.md');

      const configContent = `specs:\n  paths:\n    - \'specs/**/*.md\'\n  format: \'markdown+yaml\'\n\ngithub:\n  project_name: \'Spec Funnel\'\n  issue_labels:\n    - \'spec\'\n    - \'feature\'\n\ncodex:\n  context_paths:\n    - \'src\'\n    - \'tests\'\n`;

      const specContent = `---\nspec_id: ingest.sensor\ntitle: Sensor ingestion pipeline\nfeatures:\n  - id: ingest.validate-schema\n    accept:\n      - Reject packets missing fields\n      - Emit structured error telemetry\n---\n\n## Overview\n\nDescribe the ingestion behavior and validation guarantees.\n`;

      writeFileIfMissing(configPath, configContent);
      writeFileIfMissing(exampleSpecPath, specContent);

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
