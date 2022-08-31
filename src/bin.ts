#!/usr/bin/env node
import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import arg from 'arg';

import { formatSchema } from '@prisma/internals';
import pkg from '../package.json';

import { fixPrismaFile } from './fixer';

dotenv.config();

const args = arg({
  // Types
  '--config': String,
  '--help': Boolean,
  '--version': Boolean,
  '--print': Boolean,
  '--deny': [String],
  // Aliases
  '-v': '--version',
});

if (args['--version']) {
  console.log(`${pkg.name} ${pkg.version}`);
  process.exit(0);
}

if (args['--help']) {
  console.log(`Usage
  $ prisma-schema-trans [options] [...args]

Specify a schema:
  $ prisma-schema-trans ./schema.prisma

Instead of saving the result to the filesystem, you can also print it
  $ prisma-schema-trans ./schema.prisma --print

Exclude some models from the output
  $ prisma-schema-trans ./schema.prisma --deny knex_migrations --deny knex_migration_lock

Options:
  --print   Do not save
  --deny    Exclude model from output
  --help    Help
  --version Version info`);
  process.exit(0);
}

if (args._.length !== 1) {
  console.log(
    'Invalid argument. Require one positional argument. Run --help for usage.',
  );
  process.exit(1);
}

const schemaPath = args._[0];
const isPrint = args['--print'] || false;
const denyList = args['--deny'] || [];
const configPath = args['--config'] || 'schema-trans.js';

(async function () {
  const schema = await fs.readFile(schemaPath, 'utf-8');
  const schemaFormatted = await formatSchema({ schema });
  const output = await formatSchema({
    schema: await fixPrismaFile(schemaFormatted, denyList, configPath),
  });
  if (isPrint) {
    console.log(output);
  } else {
    await fs.writeFile(schemaPath, output);
  }

  process.exit(0);
})();
