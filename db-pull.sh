#!/usr/bin/env sh

set -xe

prisma db pull --schema prisma/back.prisma
cp -f prisma/back.prisma prisma/transformer.prisma
prisma-schema-transformer prisma/transformer.prisma

cat > prisma/schema.prisma <<- EOM
generator nestjsDto {
  provider                        = "prisma-generator-nestjs-dto"
  output                          = "../src/model-db"
  outputToNestJsResourceStructure = "true"
  reExport                        = "true"
}

EOM

BASEDIR=$(dirname "$0")

$BASEDIR/schema.awk prisma/back.prisma \
| paste prisma/transformer.prisma - >> prisma/schema.prisma

unset BASEDIR;

prettier --write prisma/*
prisma generate
