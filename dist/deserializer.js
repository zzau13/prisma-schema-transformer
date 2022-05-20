"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dmmfEnumsDeserializer = exports.generatorsDeserializer = exports.datasourceDeserializer = exports.dmmfModelsDeserializer = void 0;
const engine_core_1 = require("@prisma/engine-core");
// eslint-disable-next-line @typescript-eslint/no-empty-function
const empty = () => { };
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
function handleAttributes(attributes, kind, type) {
    const { relationFromFields, relationToFields, relationOnDelete, relationName, } = attributes;
    if (kind === 'scalar') {
        return `${Object.keys(attributes)
            .map((each) => handlers(type, kind)[each](attributes[each]))
            .join(' ')}`;
    }
    if (kind === 'object') {
        return (relationFromFields === null || relationFromFields === void 0 ? void 0 : relationFromFields.length) && (relationToFields === null || relationToFields === void 0 ? void 0 : relationToFields.length)
            ? `@relation("${relationName}", fields: [${relationFromFields.join(',')}], references: [${relationToFields.join(',')}]${relationOnDelete ? `, onDelete: ${relationOnDelete}` : ''})`
            : relationName
                ? `@relation("${relationName}"${relationOnDelete ? `, onDelete: ${relationOnDelete}` : ''})`
                : '';
    }
    if (kind === 'enum')
        return `${Object.keys(attributes)
            .map((each) => handlers(type, kind)[each](attributes[each]))
            .join(' ')}`;
    return '';
}
const handleFields = (fields) => fields
    .map(({ name, kind, type, isRequired, isList, ...attributes }) => {
    if (kind === 'scalar') {
        return `  ${name} ${type}${isRequired ? '' : '?'} ${handleAttributes(attributes, kind, type)}`;
    }
    if (kind === 'object') {
        return `  ${name} ${type}${isList ? '[]' : isRequired ? '' : '?'} ${handleAttributes(attributes, kind, type)}`;
    }
    if (kind === 'enum') {
        return `  ${name} ${type}${isList ? '[]' : isRequired ? '' : '?'} ${handleAttributes(attributes, kind, type)}`;
    }
    throw new Error(`Unsupported field kind "${kind}"`);
})
    .join('\n');
const handleIdFields = (idFields) => (idFields === null || idFields === void 0 ? void 0 : idFields.length) ? `@@id([${idFields.join(', ')}])` : '';
const handleUniqueFields = (uniqueFields) => (uniqueFields === null || uniqueFields === void 0 ? void 0 : uniqueFields.length)
    ? uniqueFields
        .map((eachUniqueField) => `@@unique([${eachUniqueField.join(', ')}])`)
        .join('\n')
    : '';
const handleDbName = (dbName) => dbName ? `@@map("${dbName}")` : '';
const handleUrl = (envValue) => `url = ${envValue.fromEnvVar ? `env("${envValue.fromEnvVar}")` : envValue.value}`;
const handleProvider = (provider) => `provider = "${provider}"`;
const deserializeModel = ({ name, uniqueFields, dbName, primaryKey, fields, }) => `
model ${name} {
  ${handleFields(fields)}
  ${handleDbName(dbName)}
  ${handleUniqueFields(uniqueFields)}
  ${handleIdFields(primaryKey === null || primaryKey === void 0 ? void 0 : primaryKey.fields)}
}`;
const deserializeDatasource = ({ activeProvider, name, url }) => `
datasource ${name} {
	${handleProvider(activeProvider)}
	${handleUrl(url)}
}`;
function deserializeEnum({ name, values, dbName }) {
    const outputValues = values.map(({ name, dbName }) => {
        let result = name;
        if (name !== dbName && dbName)
            result += `@map("${dbName}")`;
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
async function dmmfModelsDeserializer(models) {
    return models.map((model) => deserializeModel(model)).join('\n');
}
exports.dmmfModelsDeserializer = dmmfModelsDeserializer;
async function datasourceDeserializer(datasource) {
    return datasource
        .map((datasource) => deserializeDatasource(datasource))
        .join('\n');
}
exports.datasourceDeserializer = datasourceDeserializer;
async function generatorsDeserializer(generators) {
    return generators
        .map((generator) => (0, engine_core_1.printGeneratorConfig)(generator))
        .join('\n');
}
exports.generatorsDeserializer = generatorsDeserializer;
async function dmmfEnumsDeserializer(enums) {
    return enums.map((each) => deserializeEnum(each)).join('\n');
}
exports.dmmfEnumsDeserializer = dmmfEnumsDeserializer;
//# sourceMappingURL=deserializer.js.map