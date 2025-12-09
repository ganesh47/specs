import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';
import { GhClient } from '../core/ghClient';

export function registerClose(program: Command) {
  program
    .command('close')
    .description('Close a spec issue and mark it Done in the project')
    .argument('<specId>', 'Spec ID to close (matches spec_id)')
    .option('-n, --issue <number>', 'Issue number override')
    .action(async (specId: string, options) => {
      const config = loadConfig();
      const specs = await loadSpecs(config);
      const spec = specs.find((s) => s.specId === specId);
      if (!spec && !options.issue) {
        // eslint-disable-next-line no-console
        console.error(`Spec ${specId} not found and no issue number provided.`);
        process.exit(1);
      }

      const gh = new GhClient();
      let issueNumber = options.issue ? Number(options.issue) : 0;
      if (!issueNumber) {
        // Attempt to find issue by title search
        try {
          const search = await (gh as any).searchIssuesByTitle
            ? await (gh as any).searchIssuesByTitle(`Spec: ${spec?.title || specId}`)
            : [];
          issueNumber = search[0]?.number;
        } catch {
          issueNumber = 0;
        }
      }
      if (!issueNumber) {
        // eslint-disable-next-line no-console
        console.error('Unable to determine issue number for closing. Provide --issue.');
        process.exit(1);
      }

      try {
        await gh.closeIssue(issueNumber);
        await gh.addToProject(config.github || {}, issueNumber, { stage: 'done' });
        // eslint-disable-next-line no-console
        console.log(`Closed issue #${issueNumber} for spec ${specId} and marked Done.`);
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(`Failed to close issue #${issueNumber}: ${error?.message || error}`);
        process.exit(1);
      }
    });
}
