import camelcase from 'camelcase';
import { produce } from 'immer';
import { DMMF } from '@prisma/generator-helper';

import { Model } from '.';
import pluralize = require('pluralize');

function transformModelName(modelName: string) {
  return camelcase(pluralize(modelName, 1), { pascalCase: true });
}

function transformModel(model: Model) {
  const { name, uniqueFields, primaryKey } = model;

  const fixModelName = produce(model, (draftModel) => {
    if (name !== transformModelName(name)) {
      draftModel.name = transformModelName(name);
      draftModel.dbName = name;
    }
  });

  const fixFieldsName = produce(fixModelName, (draftModel) => {
    const fields = draftModel.fields as unknown as DMMF.Field[];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    draftModel.fields = fields.map((field) =>
      produce(field, (draftField) => {
        const {
          name,
          kind,
          type,
          relationFromFields,
          relationToFields,
          isList,
        } = draftField;

        // Transform field name
        draftField.name = isList
          ? camelcase(pluralize.plural(name))
          : camelcase(pluralize.singular(name));

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

        if (name === 'updated_at') {
          draftField.isUpdatedAt = true;
        }
      }),
    ) as unknown as DMMF.Field[]; // Force type conversion
  });

  const fixUniqueName = produce(fixFieldsName, (draftModel) => {
    if (uniqueFields.length > 0) {
      draftModel.uniqueFields = uniqueFields.map((eachUniqueField) =>
        eachUniqueField.map((each) => camelcase(each)),
      );
    }
  });

  const fixIdFieldsName = produce(fixUniqueName, (draftModel) => {
    if (primaryKey) {
      draftModel.primaryKey = {
        ...primaryKey,
        fields: primaryKey.fields.map((x) => camelcase(x)),
      };
    }
  });

  return fixIdFieldsName;
}

function transformEnum(enumm: DMMF.DatamodelEnum) {
  const { name } = enumm;

  const fixModelName = produce(enumm, (draftModel) => {
    if (name !== transformModelName(name)) {
      draftModel.name = transformModelName(name);
      draftModel.dbName = name;
    }
  });

  const fixFieldsName = produce(fixModelName, (draftModel) => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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

  return fixFieldsName;
}

export function dmmfModelTransformer(models: Model[]): Model[] {
  return models.map((model) => transformModel(model));
}

export function dmmfEnumTransformer(
  enums: DMMF.DatamodelEnum[],
): DMMF.DatamodelEnum[] {
  return enums.map((each) => transformEnum(each));
}
