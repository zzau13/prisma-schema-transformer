#!/usr/bin/env node
import fs from 'node:fs/promises';
import { join } from 'node:path';

import { formatSchema } from '@prisma/internals';
import dotenv from 'dotenv';
import { Argument, program } from 'commander';

import { fixPrismaFile } from './fixer';
import { FILE } from './config';

import pkg from '../package.json';

dotenv.config();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'output the current version')
  .option(
    '-c, --config <path>',
    'path to config file',
    join(process.cwd(), FILE),
  )
  .option('-p, --print', 'dry run and print result for stdout', false)
  // TODO:
  .option('-d, --deny <list>', 'deny model names', [])
  .addArgument(new Argument('<path>', 'prisma schema to modify').argRequired())
  .parse();

const options = program.opts<{
  config?: string;
  print: boolean;
  deny: string[];
}>();
const schemaPath = program.args[0];
const config = options.config
  ? join(process.cwd(), options.config)
  : options.config;

(async function () {
  const schema = await fs.readFile(schemaPath, 'utf-8');
  const schemaFormatted = await formatSchema({ schema });
  const output = await formatSchema({
    schema: await fixPrismaFile(schemaFormatted, options.deny, config),
  });
  if (options.print) console.log(output);
  else await fs.writeFile(schemaPath, output);
})();
