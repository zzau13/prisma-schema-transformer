import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from 'vitest';
import { getDMMF } from '@prisma/internals';

import {
  dmmfModelsDeserializer,
  Model,
  dmmfEnumsDeserializer,
} from '../src/deserializer.mjs';

const readSchema = (path: string) =>
  getDMMF({
    datamodel: readFileSync(join(__dirname, 'fixtures', path), 'utf-8'),
  });

test('transform model name from snake_case to camelCase from simple schema', async () => {
  const dmmf = await readSchema('simple.prisma');
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = [
    dmmfModelsDeserializer(models),
    dmmfEnumsDeserializer(dmmf.datamodel.enums),
  ].join('\n\n\n');
  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});

test('transform model name from snake_case to camelCase from blog schema', async () => {
  const dmmf = await readSchema('blog.prisma');
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = [
    dmmfModelsDeserializer(models),
    dmmfEnumsDeserializer(dmmf.datamodel.enums),
  ].join('\n\n\n');

  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});

test('transform model name from snake_case to camelCase from schema', async () => {
  const dmmf = await readSchema('schema.prisma');
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = [
    dmmfModelsDeserializer(models),
    dmmfEnumsDeserializer(dmmf.datamodel.enums),
  ].join('\n\n\n');

  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});
