import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';

export function registerScan(program: Command) {
  program
    .command('scan')
    .description('Parse specs and print a summary')
    .action(async () => {
      const config = loadConfig();
      const specs = await loadSpecs(config);
      // eslint-disable-next-line no-console
      console.log(`Found ${specs.length} spec file(s).`);
      specs.forEach((spec) => {
        // eslint-disable-next-line no-console
        console.log(`- ${spec.specId} (${spec.features.length} feature(s))`);
      });
    });
}
