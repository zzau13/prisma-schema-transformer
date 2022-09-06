import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

import { fixPrismaFile } from '../src/fixer.mjs';
import { join } from 'node:path';

const getFile = (path: string = './fixtures/blog.prisma') => readFileSync(join(__dirname, path), 'utf-8');
const fix = (path: string) => fixPrismaFile(getFile(path)) ;
test('deserialized simple', () =>
  expect(fix('./fixtures/simple.prisma')).resolves.toMatchSnapshot());

test('deserialized schema', () =>
    expect(fix('./fixtures/schema.prisma')).resolves.toMatchSnapshot());


test('deserialized blog', () =>
    expect(fix('./fixtures/blog.prisma')).resolves.toMatchSnapshot());


test('bad config path', () =>
  expect(
    fixPrismaFile(getFile(),
      [],
        'not-exist.mjs'
    ),
  ).rejects.toMatchSnapshot());

test('bad config path extension', () =>
  expect(
    fixPrismaFile(getFile(),
      [],
        'not-exist.js'
    ),
  ).rejects.toMatchSnapshot());
