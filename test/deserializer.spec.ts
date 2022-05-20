import {fixPrismaFile} from '../src';
import * as fs from 'fs';

test('deserialized model is identical with the input from simple schema', async () => {
	const schemaPath = './fixtures/simple.prisma';
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await expect(fixPrismaFile(schema)).resolves.toMatchSnapshot()
});

test('deserialized model is identical with the input from blog schema', async () => {
	const schemaPath = './fixtures/blog.prisma';
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await expect(fixPrismaFile(schema)).resolves.toMatchSnapshot()
});

test('deserialized model', async () => {
	const schemaPath = './fixtures/schema.prisma';
  const schema = fs.readFileSync(schemaPath, "utf-8");

  await expect(fixPrismaFile(schema)).resolves.toMatchSnapshot()
});
