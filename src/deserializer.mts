import {
  ConnectorType,
  DataSource,
  DMMF,
  EnvValue,
  GeneratorConfig,
} from '@prisma/generator-helper';

export type Field = DMMF.Field & { columnName?: string; dbName?: string };

export interface Model extends DMMF.Model {
  fields: Field[];
}

const printDefault = (kind: DMMF.FieldKind, value: unknown) => {
  if (kind === 'enum') {
    return `@default(${value})`;
  }
  switch (typeof value) {
    case 'object':
      // Prisma does not support default values for arrays yet
      // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-scalar-lists-arrays
      if (value instanceof Array) {
        return ``;
      }
      const { name, args } = value as { name: string; args: unknown[] };
      return `@default(${name}(${
        args.length ? args.map((x) => JSON.stringify(x)).join(',') : ''
      }))`;
    case 'boolean':
    case 'number':
    case 'string':
      return `@default(${JSON.stringify(value)})`;
    default:
      throw new Error(`Unsupported field attribute ${value}`);
  }
};

const printAttr = ({
  isId,
  isUpdatedAt,
  isUnique,
  default: def,
  hasDefaultValue,
  columnName,
  kind,
  dbName,
}: Field) =>
  (isId ? '@id' : '') +
  (isUnique ? ' @unique' : '') +
  (isUpdatedAt ? ' @updatedAt' : '') +
  (columnName ? ` @map(${JSON.stringify(columnName)})` : '') +
  (!columnName && dbName ? ` @map(${JSON.stringify(dbName)})` : '') +
  (hasDefaultValue ? ' ' + printDefault(kind, def) : '');

// Handler for Attributes
// https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-schema/data-model#attributes
function handleAttributes(field: Field) {
  const {
    relationFromFields,
    relationToFields,
    relationOnDelete,
    relationName,
    kind,
  } = field;
  switch (kind) {
    case 'scalar':
    case 'enum':
      return printAttr(field);
    case 'object':
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
    default:
      return '';
  }
}

const handleFields = (fields: Field[]) =>
  fields
    .map((attributes) => {
      const { documentation, kind, name, type, isRequired, isList } =
        attributes;
      const doc = documentation
        ? `/// ${documentation.replaceAll('\n', '\n/// ')}\n`
        : '';
      if (kind === 'unsupported') throw new Error(`Unsupported field kind`);
      return `${doc}  ${name} ${type}${
        isList ? '[]' : isRequired ? '' : '?'
      } ${handleAttributes(attributes)}`;
    })
    .join('\n');

const handleIdFields = (idFields?: readonly string[]) =>
  idFields?.length ? `@@id([${idFields.join(', ')}])` : '';

const handleUniqueFields = (uniqueFields: (readonly (readonly string[])[])) =>
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
}: Model) => {
  let ret = `model ${name} {
  ${handleFields(fields)}`;
  const dbName1 = handleDbName(dbName);
  if (dbName1) ret += `\n${dbName1}`;
  const unique = handleUniqueFields(uniqueFields);
  if (unique) ret += `\n${unique}`;
  const ids = handleIdFields(primaryKey?.fields);
  if (ids) ret += `\n${ids}`;

  return ret + '\n}';
};

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
export function dmmfModelsDeserializer(models: Model[]) {
  return models.map((model) => deserializeModel(model)).join('\n');
}

export function datasourceDeserializer(datasource: DataSource[]) {
  return datasource
    .map((datasource) => deserializeDatasource(datasource))
    .join('\n');
}

const printEnvVar = ({ fromEnvVar, value }: EnvValue) =>
  fromEnvVar ? `env(${JSON.stringify(fromEnvVar)})` : JSON.stringify(value);

const printGenerator = ({
  name,
  config,
  provider,
  output,
  binaryTargets,
  previewFeatures,
}: GeneratorConfig) => {
  let ret = `generator ${name} {
  provider = ${printEnvVar(provider)}`;
  if (output) ret += `\n  output = ${printEnvVar(output)}`;
  if (binaryTargets && binaryTargets.length > 0)
    ret += `\n  binaryTargets = ${JSON.stringify(binaryTargets)}`;
  if (previewFeatures && previewFeatures.length > 0)
    ret += `\n  previewFeatures = ${JSON.stringify(previewFeatures)}`;
  const conf = Object.entries(config).sort(([a], [b]) => a.localeCompare(b));
  if (conf.length)
    ret += `\n  ${conf
      .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
      .join('\n  ')}`;
  ret += '\n}';

  return ret;
};

export const generatorsDeserializer = (generators: GeneratorConfig[]) =>
  generators.map(printGenerator).join('\n');

export function dmmfEnumsDeserializer(enums: readonly DMMF.DatamodelEnum[]) {
  return enums.map((each) => deserializeEnum(each)).join('\n');
}
