#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import { Argument, program } from 'commander';

import { formatSchema } from '@prisma/internals';
import pkg from '../package.json';

import { fixPrismaFile } from './fixer';

dotenv.config();

program
  .name(pkg.name)
  .description(pkg.description)
  .version(pkg.version, '-v, --version', 'output the current version');

program
  .option('-c, --config <path>', 'path to config file')
  .option('-p, --print', 'dry run and print result for stdout', false)
  .option('-d, --deny <list>', 'deny model names', [])
  .addArgument(new Argument('<path>', 'prisma schema to modify').argRequired());
program.parse();

const options = program.opts();
const schemaPath = program.args[0];

(async function () {
  const schema = await fs.readFile(schemaPath, 'utf-8');
  const schemaFormatted = await formatSchema({ schema });
  const output = await formatSchema({
    schema: await fixPrismaFile(schemaFormatted, options.deny, options.config),
  });
  if (options.print) {
    console.log(output);
  } else {
    await fs.writeFile(schemaPath, output);
  }

  process.exit(0);
})();
