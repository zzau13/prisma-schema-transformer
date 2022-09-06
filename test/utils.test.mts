import { test, expect } from 'vitest';
import { defConfig } from '../src/index.mjs';
import { getConfigFile } from '../src/config.mjs';
import config from '../schema-config.mjs';

test('should define config', () => {
  expect(defConfig({ updatedAtByTrigger: true })).toStrictEqual({
    pluralFields: true,
    omitPluralFields: new Array<string>(),
    updatedAtByTrigger: true,
    deny: new Array<string>(),
  });
});

test('should get config file', () =>
  expect(getConfigFile('schema-config.mjs')).resolves.toStrictEqual(config));

test('should get default config if not exist default config file', () =>
  expect(getConfigFile()).resolves.toStrictEqual(defConfig({})));
