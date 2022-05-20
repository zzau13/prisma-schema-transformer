"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dmmfEnumTransformer = exports.dmmfModelTransformer = void 0;
const camelcase = require("camelcase");
const pluralize = require("pluralize");
const immer_1 = require("immer");
function transformModelName(modelName) {
    return camelcase(pluralize(modelName, 1), { pascalCase: true });
}
function transformModel(model) {
    const { name, uniqueFields, primaryKey } = model;
    const fixModelName = (0, immer_1.produce)(model, (draftModel) => {
        if (name !== transformModelName(name)) {
            draftModel.name = transformModelName(name);
            draftModel.dbName = name;
        }
    });
    const fixFieldsName = (0, immer_1.produce)(fixModelName, (draftModel) => {
        const fields = draftModel.fields;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        draftModel.fields = fields.map((field) => (0, immer_1.produce)(field, (draftField) => {
            const { name, kind, type, relationFromFields, relationToFields, isList, } = draftField;
            // Transform field name
            draftField.name = isList
                ? camelcase(pluralize.plural(name))
                : camelcase(pluralize.singular(name));
            if (draftField.name !== name) {
                draftField.columnName = name;
            }
            // Posts posts[]
            if (kind === "object" && type !== transformModelName(type)) {
                draftField.type = transformModelName(type);
            }
            // Enum
            if (kind === "enum" && type !== transformModelName(type)) {
                draftField.type = transformModelName(type);
                if (draftField.default)
                    draftField.default = camelcase(draftField.default.toString());
            }
            // Object kind, with @relation attributes
            if (kind === "object") {
                draftField.relationFromFields = relationFromFields === null || relationFromFields === void 0 ? void 0 : relationFromFields.map((x) => camelcase(x));
                draftField.relationToFields = relationToFields === null || relationToFields === void 0 ? void 0 : relationToFields.map((x) => camelcase(x));
            }
            if (name === "updated_at") {
                draftField.isUpdatedAt = true;
            }
        })); // Force type conversion
    });
    const fixUniqueName = (0, immer_1.produce)(fixFieldsName, (draftModel) => {
        if (uniqueFields.length > 0) {
            draftModel.uniqueFields = uniqueFields.map((eachUniqueField) => eachUniqueField.map((each) => camelcase(each)));
        }
    });
    const fixIdFieldsName = (0, immer_1.produce)(fixUniqueName, (draftModel) => {
        if (primaryKey) {
            draftModel.primaryKey = { ...primaryKey, fields: primaryKey.fields.map((x) => camelcase(x)) };
        }
    });
    return fixIdFieldsName;
}
function transformEnum(enumm) {
    const { name } = enumm;
    const fixModelName = (0, immer_1.produce)(enumm, (draftModel) => {
        if (name !== transformModelName(name)) {
            draftModel.name = transformModelName(name);
            draftModel.dbName = name;
        }
    });
    const fixFieldsName = (0, immer_1.produce)(fixModelName, (draftModel) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        draftModel.values = draftModel.values.map((field) => (0, immer_1.produce)(field, (draftField) => {
            const { name, dbName } = draftField;
            // Transform field name
            draftField.name = camelcase(pluralize.singular(name));
            if (draftField.name !== name) {
                draftField.dbName = dbName || name;
            }
        }));
    });
    return fixFieldsName;
}
function dmmfModelTransformer(models) {
    return models.map((model) => transformModel(model));
}
exports.dmmfModelTransformer = dmmfModelTransformer;
function dmmfEnumTransformer(enums) {
    return enums.map((each) => transformEnum(each));
}
exports.dmmfEnumTransformer = dmmfEnumTransformer;
//# sourceMappingURL=transformer.js.map