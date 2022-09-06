import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from 'vitest';
import p from '@prisma/internals';
const { getDMMF } = p;

import {
  dmmfModelsDeserializer,
  Model,
  dmmfEnumsDeserializer,
} from '../src/deserializer.mjs';
import { console } from 'fp-ts';

test('transform model name from snake_case to camelCase from simple schema', async () => {
  const schemaPath = join(__dirname, './fixtures/simple.prisma');

  const schema = readFileSync(schemaPath, 'utf-8');
  console.error('######################');
  const dmmf = await getDMMF({ datamodel: schema });
  console.log('hola');
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = await dmmfModelsDeserializer(models);
  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});

test('transform model name from snake_case to camelCase from blog schema', async () => {
  const schemaPath = join(__dirname, './fixtures/blog.prisma');

  const schema = readFileSync(schemaPath, 'utf-8');
  const dmmf = await getDMMF({ datamodel: schema });
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = [
    await dmmfModelsDeserializer(models),
    await dmmfEnumsDeserializer(dmmf.datamodel.enums),
  ].join('\n\n\n');

  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});

test('transform model name from snake_case to camelCase from schema', async () => {
  const schemaPath = join(__dirname, './fixtures/schema.prisma');

  const datamodel = readFileSync(schemaPath, 'utf-8');
  const dmmf = await getDMMF({ datamodel });
  const models = dmmf.datamodel.models as Model[];

  const outputSchema = [
    await dmmfModelsDeserializer(models),
    await dmmfEnumsDeserializer(dmmf.datamodel.enums),
  ].join('\n\n\n');

  const outputDmf = await getDMMF({ datamodel: outputSchema });

  expect(outputDmf.datamodel).toEqual(dmmf.datamodel);
});
