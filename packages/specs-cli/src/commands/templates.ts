import { Command } from 'commander';
import { loadConfig } from '../core/config';
import { fetchSpecKitTemplates, getSpecKitConfig } from '../core/specKit';

export function registerTemplates(program: Command) {
  program
    .command('templates')
    .description('Fetch spec-kit templates for specs/Codex usage')
    .option('-d, --dest <path>', 'Destination directory', '.specs/spec-kit')
    .action(async (options) => {
      const config = loadConfig();
      const dest = options.dest as string;
      const skCfg = getSpecKitConfig(config);
      try {
        await fetchSpecKitTemplates(config, dest);
        // eslint-disable-next-line no-console
        console.log(`Downloaded spec-kit templates from ${skCfg.repo}@${skCfg.ref} to ${dest}`);
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error(`Failed to download spec-kit templates: ${error?.message || error}`);
        process.exit(1);
      }
    });
}
