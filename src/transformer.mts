import { produce, WritableDraft } from 'immer';
import { DMMF } from '@prisma/generator-helper';
import pluralize from 'pluralize';
import camelcase from 'camelcase';
import { createPrismaSchemaBuilder } from '@mrleebo/prisma-ast';

import { Config } from './config.mjs';
import { Field, Model } from './deserializer.mjs';
import { Writable } from 'stream';

type Builder = ReturnType<typeof createPrismaSchemaBuilder>;

const transformModelName = (modelName: string) =>
  camelcase(pluralize(modelName, 1), { pascalCase: true });

function transformModel(
  model: Model,
  { omitPluralFields, pluralFields, updatedAtByTrigger }: Config,
  builder: Builder,
  datasourceProvider: string[],
) {
  const { name: modelName, uniqueFields, primaryKey } = model;
  const schemaModel = builder.findByType('model', { name: modelName });
  if (!schemaModel) {
    throw new Error(`Not found model ${modelName} in builder`);
  }

  const fixModelName = produce(model, (draftModel) => {
    if (modelName !== transformModelName(modelName)) {
      draftModel.name = transformModelName(modelName);
      draftModel.dbName = modelName;
    }
  });

  const fixFieldsName = produce(fixModelName, (draftModel) => {
    const fields = draftModel.fields;
    draftModel.fields = fields.map((field) => {
      const { name, kind, type, relationFromFields, relationToFields, isList } =
        field;
      // Fix excesive deep on type
      type Writable<T> = { -readonly [K in keyof T]: T[K] };
      const draftField = {} as Writable<Field>;
      const fieldBuilder = builder.findByType('field', {
        name,
        within: schemaModel.properties,
      });
      if (!fieldBuilder) {
        throw new Error(`Not found field ${name} in model ${modelName}`);
      }

      draftField.dbAttributes = fieldBuilder.attributes?.filter(
        (attr) => attr.group && datasourceProvider.includes(attr.group),
      );
      let trans: string;
      if (
        (!pluralFields || !omitPluralFields.includes(name)) &&
        (!relationToFields || !relationFromFields)
      )
        trans = name;
      else trans = isList ? pluralize.plural(name) : pluralize.singular(name);

      // Transform field name
      draftField.name = camelcase(trans);

      if (draftField.name !== name) {
        draftField.columnName = name;
      }

      // Posts posts[]
      if (kind === 'object' && type !== transformModelName(type)) {
        draftField.type = transformModelName(type);
      }

      // Enum
      if (kind === 'enum' && type !== transformModelName(type)) {
        draftField.type = transformModelName(type);
        if (draftField.default)
          draftField.default = camelcase(draftField.default.toString());
      }

      // Object kind, with @relation attributes
      if (kind === 'object') {
        draftField.relationFromFields = relationFromFields?.map((x) =>
          camelcase(x),
        );
        draftField.relationToFields = relationToFields?.map((x) =>
          camelcase(x),
        );
      }

      if (
        !updatedAtByTrigger &&
        (draftField.name === 'updatedAt' || draftField.name === 'updateAt')
      )
        draftField.isUpdatedAt = true;

      // Fix excesive deep on type
      return Object.assign({}, field, draftField) as WritableDraft<Field>;
    });
  });

  const fixUniqueName = produce(fixFieldsName, (draftModel) => {
    if (uniqueFields.length > 0) {
      draftModel.uniqueFields = uniqueFields.map((eachUniqueField) =>
        eachUniqueField.map((each) => camelcase(each)),
      );
    }
  });

  return produce(fixUniqueName, (draftModel) => {
    if (primaryKey) {
      draftModel.primaryKey = {
        ...primaryKey,
        fields: primaryKey.fields.map((x) => camelcase(x)),
      };
    }
  });
}

function transformEnum(enums: DMMF.DatamodelEnum) {
  const { name } = enums;

  const fixModelName = produce(enums, (draftModel) => {
    if (name !== transformModelName(name)) {
      draftModel.name = transformModelName(name);
      draftModel.dbName = name;
    }
  });

  return produce(fixModelName, (draftModel) => {
    draftModel.values = draftModel.values.map((field) =>
      produce(field, (draftField) => {
        const { name, dbName } = draftField;

        // Transform field name
        draftField.name = camelcase(pluralize.singular(name));

        if (draftField.name !== name) {
          draftField.dbName = dbName || name;
        }
      }),
    );
  });
}

export const dmmfModelTransformer = (
  models: Model[],
  config: Config,
  builder: Builder,
  datasourceProvider: string[],
): Model[] =>
  models.map((model) =>
    transformModel(model, config, builder, datasourceProvider),
  );

export const dmmfEnumTransformer = (
  enums: DMMF.DatamodelEnum[],
): DMMF.DatamodelEnum[] => enums.map((each) => transformEnum(each));
