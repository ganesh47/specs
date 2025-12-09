import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';
import { GhClient } from '../core/ghClient';

export function registerSync(program: Command) {
  program
    .command('sync')
    .description('Sync specs to GitHub issues and project board via gh CLI')
    .action(async () => {
      const config = loadConfig();
      const specs = await loadSpecs(config);
      const gh = new GhClient();

      try {
        await gh.ensureAuth();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(String(error));
        process.exit(1);
      }

      if (!specs.length) {
        // eslint-disable-next-line no-console
        console.log('No specs found to sync.');
        return;
      }

      const labels = config.github?.issue_labels || ['spec'];
      for (const spec of specs) {
        try {
          const issueNumber = await gh.upsertIssue(spec, labels);
          // eslint-disable-next-line no-console
          console.log(`Synced spec ${spec.specId} -> issue #${issueNumber || '?'} `);
          if (issueNumber) {
            await gh.addToProject(config.github || {}, issueNumber);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(`Failed to sync spec ${spec.specId}: ${String(error)}`);
        }
      }
    });
}
