import fs from 'fs-extra';
import path from 'path';
import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';
import { selectNextTask } from '../core/taskSelector';

export function registerNext(program: Command) {
  program
    .command('next')
    .description('Select the next actionable spec task and write context files')
    .action(async () => {
      const config = loadConfig();
      const specs = await loadSpecs(config);
      const task = selectNextTask(specs);
      if (!task) {
        // eslint-disable-next-line no-console
        console.log('No specs available to select a next task.');
        return;
      }

      const cwd = process.cwd();
      const specsDir = path.join(cwd, '.specs');
      const codexDir = path.join(cwd, '.codex');
      await fs.ensureDir(specsDir);
      await fs.ensureDir(codexDir);

      const content = `# Current Spec Task\n\nSpec: ${task.spec.specId}\nFeature: ${task.featureId}\nFile: ${task.spec.filePath}\n\n## Body\n${task.spec.body}`;
      const codexContent = `Spec ID: ${task.spec.specId}\nFeature: ${task.featureId}\nFile: ${task.spec.filePath}\n`;
      const currentTaskPath = path.join(specsDir, 'current-task.md');
      const codexContextPath = path.join(codexDir, 'context-spec-next.md');

      await fs.writeFile(currentTaskPath, content, 'utf8');
      await fs.writeFile(codexContextPath, codexContent, 'utf8');

      // eslint-disable-next-line no-console
      console.log(`Wrote ${currentTaskPath}`);
      // eslint-disable-next-line no-console
      console.log(`Wrote ${codexContextPath}`);
    });
}
