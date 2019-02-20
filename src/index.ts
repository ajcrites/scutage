import { scutage } from './scutage';

import * as yargs from 'yargs';

export function run() {
  const argv = yargs
    .version('0.0.7')
    .command('$0 [source]', '', yargs => {
      return yargs
        .positional('source', {
          describe: 'list of source files to build',
          type: 'string',
          default: '**/*.html',
        })
        .demandCommand(
          0,
          0,
          '',
          `You should only provide at most one argument:
      a glob-compatible string of files to build (defaults to "**/*.html")`,
        );
    })
    .option('output', {
      alias: 'o',
      describe: 'Output directory to copy files.',
      default: 'dist',
    })
    .option('keep-existing', {
      alias: 'k',
      describe: 'Keep existing output directory. If not set, it is cleared.',
      type: 'boolean',
      default: false,
    })
    .option('override', {
      describe: 'Replace existing matched files in the output directory.',
      type: 'boolean',
      default: true,
    }).argv;

  scutage(argv as any);
}

export { scutage };
