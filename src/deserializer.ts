import {
  ConnectorType,
  DataSource,
  DMMF,
  EnvValue,
  GeneratorConfig,
} from '@prisma/generator-helper/dist';
import { printGeneratorConfig } from '@prisma/engine-core';

export type Attribute = Pick<
  DMMF.Field,
  | 'isUnique'
  | 'isId'
  | 'dbNames'
  | 'relationFromFields'
  | 'relationToFields'
  | 'relationOnDelete'
  | 'relationName'
  | 'isReadOnly'
  | 'default'
  | 'isGenerated'
  | 'isUpdatedAt'
>;

export interface Model extends DMMF.Model {
  uniqueFields: string[][];
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = () => {};

const handlers = (type, kind) => {
  return {
    default: (value) => {
      if (kind === 'enum') {
        return `@default(${value})`;
      }

      if (type === 'Boolean') {
        return `@default(${value})`;
      }

      if (!value) {
        return '';
      }

      if (typeof value === 'object') {
        return `@default(${value.name}(${value.args}))`;
      }

      if (typeof value === 'number') {
        return `@default(${value})`;
      }

      if (typeof value === 'string') {
        return `@default("${value}")`;
      }

      throw new Error(`Unsupported field attribute ${value}`);
    },
    isId: (value) => (value ? '@id' : ''),
    isUnique: (value) => (value ? '@unique' : ''),
    dbNames: empty,
    relationToFields: empty,
    relationOnDelete: empty,
    hasDefaultValue: empty,
    relationName: empty,
    documentation: empty,
    isReadOnly: empty,
    isGenerated: empty,
    isUpdatedAt: (value) => (value ? '@updatedAt' : ''),
    columnName: (value) => (value ? `@map("${value}")` : ''),
  };
};

// Handler for Attributes
// https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#attributes
function handleAttributes(
  attributes: Attribute,
  kind: DMMF.FieldKind,
  type: string,
) {
  const {
    relationFromFields,
    relationToFields,
    relationOnDelete,
    relationName,
  } = attributes;
  if (kind === 'scalar') {
    return `${Object.keys(attributes)
      .map((each) => handlers(type, kind)[each](attributes[each]))
      .join(' ')}`;
  }

  if (kind === 'object') {
    return relationFromFields?.length && relationToFields?.length
      ? `@relation("${relationName}", fields: [${relationFromFields.join(
          ',',
        )}], references: [${relationToFields.join(',')}]${
          relationOnDelete ? `, onDelete: ${relationOnDelete}` : ''
        })`
      : relationName
      ? `@relation("${relationName}"${
          relationOnDelete ? `, onDelete: ${relationOnDelete}` : ''
        })`
      : '';
  }

  if (kind === 'enum')
    return `${Object.keys(attributes)
      .map((each) => handlers(type, kind)[each](attributes[each]))
      .join(' ')}`;

  return '';
}

const handleFields = (fields: DMMF.Field[]) =>
  fields
    .map(({ name, kind, type, isRequired, isList, ...attributes }) => {
      if (kind === 'scalar') {
        return `  ${name} ${type}${isRequired ? '' : '?'} ${handleAttributes(
          attributes,
          kind,
          type,
        )}`;
      }

      if (kind === 'object') {
        return `  ${name} ${type}${
          isList ? '[]' : isRequired ? '' : '?'
        } ${handleAttributes(attributes, kind, type)}`;
      }

      if (kind === 'enum') {
        return `  ${name} ${type}${
          isList ? '[]' : isRequired ? '' : '?'
        } ${handleAttributes(attributes, kind, type)}`;
      }

      throw new Error(`Unsupported field kind "${kind}"`);
    })
    .join('\n');

const handleIdFields = (idFields?: string[]) =>
  idFields?.length ? `@@id([${idFields.join(', ')}])` : '';

const handleUniqueFields = (uniqueFields: string[][]) =>
  uniqueFields?.length
    ? uniqueFields
        .map((eachUniqueField) => `@@unique([${eachUniqueField.join(', ')}])`)
        .join('\n')
    : '';

const handleDbName = (dbName: string | null) =>
  dbName ? `@@map("${dbName}")` : '';

const handleUrl = (envValue: EnvValue) =>
  `url = ${
    envValue.fromEnvVar ? `env("${envValue.fromEnvVar}")` : envValue.value
  }`;

const handleProvider = (provider: ConnectorType | string) =>
  `provider = "${provider}"`;

const deserializeModel = ({
  name,
  uniqueFields,
  dbName,
  primaryKey,
  fields,
}: Model) => `
model ${name} {
  ${handleFields(fields)}
  ${handleDbName(dbName)}
  ${handleUniqueFields(uniqueFields)}
  ${handleIdFields(primaryKey?.fields)}
}`;

const deserializeDatasource = ({ activeProvider, name, url }: DataSource) => `
datasource ${name} {
	${handleProvider(activeProvider)}
	${handleUrl(url)}
}`;

function deserializeEnum({ name, values, dbName }: DMMF.DatamodelEnum) {
  const outputValues = values.map(({ name, dbName }) => {
    let result = name;
    if (name !== dbName && dbName) result += `@map("${dbName}")`;
    return result;
  });
  return `
enum ${name} {
	${outputValues.join('\n\t')}
	${handleDbName(dbName || null)}
}`;
}

/**
 * Deserialize DMMF.Model[] into prisma schema file
 */
export async function dmmfModelsDeserializer(models: Model[]) {
  return models.map((model) => deserializeModel(model)).join('\n');
}

export async function datasourceDeserializer(datasource: DataSource[]) {
  return datasource
    .map((datasource) => deserializeDatasource(datasource))
    .join('\n');
}

export async function generatorsDeserializer(generators: GeneratorConfig[]) {
  return generators
    .map((generator) => printGeneratorConfig(generator))
    .join('\n');
}

export async function dmmfEnumsDeserializer(enums: DMMF.DatamodelEnum[]) {
  return enums.map((each) => deserializeEnum(each)).join('\n');
}
