#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';

import p from '@prisma/internals';
const { formatSchema } = p;
import dotenv from 'dotenv';
import { Argument, program } from 'commander';

import { fixPrismaFile } from './fixer.mjs';
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
  config?: string;
  print: boolean;
}>();
const schemaPath = program.args[0];

(async function () {
  const schema = await readFile(schemaPath, 'utf-8');
  const schemaFormatted = await formatSchema({ schema });
  const output = await formatSchema({
    schema: await fixPrismaFile(schemaFormatted, options.config),
  });
  if (options.print) console.log(output);
  else await writeFile(schemaPath, output);
})();
