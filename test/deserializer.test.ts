import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

import { fixPrismaFile } from '../src/fixer';
import { join } from 'node:path';

// TODO: ESModule dynamic import crash all
const configPath = 'no-exist.mjs';
test('deserialized simple', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/simple.prisma'), 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());

test('deserialized schema', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/schema.prisma'), 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());

test('deserialized blog', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/blog.prisma'), 'utf-8'),
      [],
      configPath,
    ),
  ).resolves.toMatchSnapshot());
