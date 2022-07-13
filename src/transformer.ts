import { produce } from 'immer';
import { DMMF } from '@prisma/generator-helper';

import { Config, Model } from '.';
import pluralize = require('pluralize');
import camelcase = require('camelcase');

function transformModelName(modelName: string) {
  return camelcase(pluralize(modelName, 1), { pascalCase: true });
}

function transformModel(
  model: Model,
  { omitPluralFields, pluralFields, updatedAtByTrigger }: Config,
) {
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

        let trans;
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
          (name === 'updated_at' || name === 'update_at')
        )
          draftField.isUpdatedAt = true;
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
}

export function dmmfModelTransformer(models: Model[], config: Config): Model[] {
  return models.map((model) => transformModel(model, config));
}

export function dmmfEnumTransformer(
  enums: DMMF.DatamodelEnum[],
): DMMF.DatamodelEnum[] {
  return enums.map((each) => transformEnum(each));
}
