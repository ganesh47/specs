import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';
import { runCoverage } from '../core/coverageEngine';

export function registerCoverage(program: Command) {
  program
    .command('coverage')
    .description('Run stubbed LLM spec coverage and emit report')
    .option('-p, --pr <number>', 'Pull request number for context')
    .action(async (options) => {
      const config = loadConfig();
      const specs = await loadSpecs(config);
      await runCoverage(specs, { prNumber: options.pr ? Number(options.pr) : undefined });
    });
}
