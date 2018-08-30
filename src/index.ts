#!/usr/bin/env node
import { scutage } from './scutage';

import * as yargs from 'yargs';

function run() {
  const argv = yargs
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
    }).argv;

  scutage(argv as any);
}

export { scutage };

if (require.main === module) {
  run();
}
