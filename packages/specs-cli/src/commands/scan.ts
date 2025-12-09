import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { loadSpecs } from '../core/specParser';
import { fetchSpecKitTemplates, getSpecKitConfig } from '../core/specKit';

export function registerScan(program: Command) {
  program
    .command('scan')
    .description('Parse specs and print a summary')
    .option('--refresh-spec-kit', 'Refresh spec-kit templates before scanning', false)
    .action(async (options) => {
      const config = loadConfig();
      if (options.refreshSpecKit) {
        const skCfg = getSpecKitConfig(config);
        const dest = '.specs/spec-kit';
        try {
          await fetchSpecKitTemplates(config, dest);
          // eslint-disable-next-line no-console
          console.log(`spec-kit templates refreshed from ${skCfg.repo}@${skCfg.ref}`);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.warn('Skipping spec-kit refresh due to error. Scan will continue.');
        }
      }
      const specs = await loadSpecs(config);
      // eslint-disable-next-line no-console
      console.log(`Found ${specs.length} spec file(s).`);
      specs.forEach((spec) => {
        // eslint-disable-next-line no-console
        console.log(`- ${spec.specId} (${spec.features.length} feature(s))`);
      });
    });
}
