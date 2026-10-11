# prisma-schema-trans [![Versión de npm](https://badge.fury.io/js/prisma-schema-trans.svg)](https://www.npmjs.com/package/prisma-schema-trans) [![codecov](https://codecov.io/gh/botika/prisma-schema-transformer/branch/master/graph/badge.svg?token=5AQGYN30DL)](https://codecov.io/gh/botika/prisma-schema-transformer)

## Descripción

Este postprocesador de esquemas de Prisma permite transformar nombres y campos a camelCase y pluralizarlos, lo que facilita la sincronización de una base de datos con un esquema de Prisma.

## Uso

```bash
$ prisma-schema-trans -h
```

## Archivo de configuración ESModule

> schema-trans.mjs

```javascript
import { defConfig } from 'prisma-schema-trans';

// Configuración predeterminada
export default defConfig({
  deny: [],
  omitPluralFields: [],
  pluralFields: true,
  updatedAtByTrigger: false,
});
```

## Objetivo

Simplificar las migraciones desde otros frameworks o lenguajes de programación, permitiendo crear un esquema de Prisma a partir de una base de datos existente.

Ejecuta `prisma-db-pull` con una configuración mínima en un archivo `prisma/back.prisma`. La documentación no se verá afectada.

## Licencia

El proyecto está bajo licencia MIT. Consulta el archivo LICENSE para más detalles.

Fork de [https://github.com/IBM/prisma-schema-transformer](https://github.com/IBM/prisma-schema-transformer).
