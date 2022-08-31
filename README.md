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

## License

Project is [MIT licensed](./LICENSE).

Fork from [https://github.com/IBM/prisma-schema-transformer](https://github.com/IBM/prisma-schema-transformer)
