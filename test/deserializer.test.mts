import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from 'vitest';

import { fixSchema } from '../src/fixer.mjs';

const getFile = (path = './fixtures/blog.prisma') =>
  readFileSync(join(__dirname, path), 'utf-8');
const fix = (path: string, config = 'schema-config.mjs') =>
  fixSchema(getFile(path), config);

test('deserialized simple', () =>
  expect(fix('./fixtures/simple.prisma')).resolves.toMatchSnapshot());

test('deserialized schema', () =>
  expect(fix('./fixtures/schema.prisma')).resolves.toMatchSnapshot());

test('deserialized blog', () =>
  expect(fix('./fixtures/blog.prisma')).resolves.toMatchSnapshot());

test('deserialized blog default config', () =>
  expect(
    fix('./fixtures/blog.prisma', 'schema-trans.mjs'),
  ).resolves.toMatchSnapshot());

test('deserialized blog absolute path config', () =>
  expect(
    fix('./fixtures/blog.prisma', join(__dirname, '../schema-config.mjs')),
  ).resolves.toMatchSnapshot());

test('bad config path', () =>
  expect(fixSchema(getFile(), 'not-exist.mjs')).rejects.toMatchSnapshot());

test('bad config path extension', () =>
  expect(fixSchema(getFile(), 'not-exist.js')).rejects.toMatchSnapshot());
