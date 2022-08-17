#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires */

require('dotenv').config();
const fs = require('fs');
const arg = require('arg');
const { formatSchema } = require('@prisma/internals');
const pkg = require('./package.json');
const { fixPrismaFile } = require('./dist');

const args = arg({
  // Types
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

(async function () {
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const schemaFormatted = await formatSchema({ schema });
  const output = await formatSchema({
    schema: await fixPrismaFile(schemaFormatted, denyList),
  });
  if (isPrint) {
    console.log(output);
  } else {
    fs.writeFileSync(schemaPath, output);
  }

  process.exit(0);
})();
