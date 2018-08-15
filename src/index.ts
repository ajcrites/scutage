#!/usr/bin/env node

import * as yargs from 'yargs';

const argv = yargs
  .command('$0 [source]', '', yargs => {
    return yargs
      .positional('source', {
        describe: 'List of source files to build',
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

argv;
