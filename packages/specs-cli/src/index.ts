import { Command } from 'commander';
import path from 'path';
import { registerInit } from './commands/init';
import { registerScan } from './commands/scan';
import { registerSync } from './commands/sync';
import { registerNext } from './commands/next';
import { registerCoverage } from './commands/coverage';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../package.json');

const program = new Command();

program
  .name('specs')
  .description('Spec-Driven Development Kit CLI')
  .version(pkg.version || '0.0.0');

registerInit(program);
registerScan(program);
registerSync(program);
registerNext(program);
registerCoverage(program);

program.parse(process.argv);
