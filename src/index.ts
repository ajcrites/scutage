#!/usr/bin/env node
import { scutate } from './scutate';

import * as yargs from 'yargs';

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

scutate(argv as any);
