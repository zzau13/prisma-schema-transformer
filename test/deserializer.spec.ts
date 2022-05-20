import { fixPrismaFile } from '../src';
import * as fs from 'fs';

test('deserialized simple', () =>
  expect(
    fixPrismaFile(fs.readFileSync('./fixtures/simple.prisma', 'utf-8')),
  ).resolves.toMatchSnapshot());

test('deserialized schema', () =>
  expect(
    fixPrismaFile(fs.readFileSync('./fixtures/schema.prisma', 'utf-8')),
  ).resolves.toMatchSnapshot());

test('deserialized blog', () =>
  expect(
    fixPrismaFile(fs.readFileSync('./fixtures/blog.prisma', 'utf-8')),
  ).resolves.toMatchSnapshot());
