# prisma-schema-trans [![npm version](https://badge.fury.io/js/prisma-schema-trans.svg)](https://www.npmjs.com/package/prisma-schema-trans) [![codecov](https://codecov.io/gh/botika/prisma-schema-transformer/branch/master/graph/badge.svg?token=5AQGYN30DL)](https://codecov.io/gh/botika/prisma-schema-transformer)

## Usage

```bash
$ prisma-schema-trans -h
```

## ESModule config file

> schema-trans.mjs

```javascript
import { defConfig } from 'prisma-schema-trans';

// Default options
export default defConfig({
  omitPluralFields: [],
  pluralFields: true,
  updatedAtByTrigger: false,
});
```

## Purpose

Facilitate migrations from other frameworks or programming languages.
Creating a prisma schema from an existing database.

Call `prisma-db-pull` with a minimal configuration in a `prisma/back.prisma` file, documentation is not override.

## License

Project is [MIT licensed](./LICENSE).

Fork from [https://github.com/IBM/prisma-schema-transformer](https://github.com/IBM/prisma-schema-transformer)
