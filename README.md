# prisma-schema-trans

## Install

```bash
$ pnpm i -g prism-schema-trans
```

## Usage

```bash
$ prisma-schema-trans prisma/schema.prisma
```

```
Usage
  $ prisma-schema-transformer [options] [...args]

Specify a schema:
  $ prisma-schema-transformer ./schema.prisma

Instead of saving the result to the filesystem, you can also print it
  $ prisma-schema-transformer ./schema.prisma --print

Exclude some models from the output
  $ prisma-schema-transformer ./schema.prisma --deny knex_migrations --deny knex_migration_lock

Options:
  --print   Do not save
  --deny    Exlucde model from output
  --help    Help
  --version Version info
```

## License

This project is [MIT licensed](./LICENSE).
This is a fork from [https://github.com/IBM/prisma-schema-transformer](https://github.com/IBM/prisma-schema-transformer)
