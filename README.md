# prisma-schema-trans [![npm version](https://badge.fury.io/js/prisma-schema-trans.svg)](https://www.npmjs.com/package/prisma-schema-trans) [![codecov](https://codecov.io/gh/botika/prisma-schema-transformer/branch/master/graph/badge.svg?token=5AQGYN30DL)](https://codecov.io/gh/botika/prisma-schema-transformer)

## Install

```bash
$ pnpm i -g prism-schema-trans
```

## Usage

```bash
$ prisma-schema-trans prisma/schema.prisma
```

```bash
Usage
  $ prisma-schema-trans [options] [...args]

Specify a schema:
  $ prisma-schema-trans ./schema.prisma

Instead of saving the result to the filesystem, you can also print it
  $ prisma-schema-trans ./schema.prisma --print

Exclude some models from the output
  $ prisma-schema-trans ./schema.prisma --deny knex_migrations --deny knex_migration_lock

Options:
  --print   Do not save
  --deny    Exlucde model from output
  --help    Help
  --version Version info
```

## Config file

In the root file `schema-trans.js`

```javascript
import { defConfig } from 'prisma-schema-trans';

// Default options
export default defConfig({
  omitPluralFields: [],
  pluralFields: true,
  updatedAtByTrigger: false,
});
```

## License

This project is [MIT licensed](./LICENSE).
This is a fork from [https://github.com/IBM/prisma-schema-transformer](https://github.com/IBM/prisma-schema-transformer)
