#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

import dotenv from 'dotenv';
import { Argument, program } from 'commander';

import { fixSchema } from './fixer.mjs';
import { FILE } from './config.mjs';

import pkg from '../package.json' assert { type: 'json' };

dotenv.config();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'output the current version')
  .option('-c, --config <path>', 'path to config file', FILE)
  .option('-p, --print', 'dry run and print result for stdout', false)
  .addArgument(new Argument('<path>', 'prisma schema to modify').argRequired())
  .parse();

const options = program.opts<{
  config: string;
  print: boolean;
}>();
const schemaPath = program.args[0];

const output = await fixSchema(
  schemaPath,
  await readFile(schemaPath, 'utf-8'),
  options.config,
);

if (options.print) console.log(output);
else await writeFile(schemaPath, output);
