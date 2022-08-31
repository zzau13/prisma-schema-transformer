import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

import { fixPrismaFile } from '../src/fixer.mjs';
import { join } from 'node:path';

test('deserialized simple', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/simple.prisma'), 'utf-8'),
    ),
  ).resolves.toMatchSnapshot());

test('deserialized schema', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/schema.prisma'), 'utf-8'),
    ),
  ).resolves.toMatchSnapshot());

test('deserialized blog', () =>
  expect(
    fixPrismaFile(
      readFileSync(join(__dirname, './fixtures/blog.prisma'), 'utf-8'),
      [],
        'not-exist.mjs'
    ),
  ).resolves.toMatchSnapshot());
