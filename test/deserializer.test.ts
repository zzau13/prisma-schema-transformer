import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

import { fixPrismaFile } from '../src/fixer';
import { join } from 'node:path';

const configPath = join(__dirname, '../../schema-trans.mjs');
test('deserialized simple', () =>
  expect(
    fixPrismaFile(
      readFileSync('./fixtures/simple.prisma', 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());

test('deserialized schema', () =>
  expect(
    fixPrismaFile(
      readFileSync('./fixtures/schema.prisma', 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());

test('deserialized blog', () =>
  expect(
    fixPrismaFile(
      readFileSync('./fixtures/blog.prisma', 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());
