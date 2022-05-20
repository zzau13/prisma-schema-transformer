"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixPrismaFile = void 0;
const sdk_1 = require("@prisma/sdk");
const _1 = require(".");
/**
 *
 * @param schema
 * @param denyList
 */
async function fixPrismaFile(schema, denyList = []) {
    const dmmf = await (0, sdk_1.getDMMF)({ datamodel: schema });
    const config = await (0, sdk_1.getConfig)({ datamodel: schema });
    const models = dmmf.datamodel.models;
    const datasources = config.datasources;
    const generators = config.generators;
    const filteredModels = models.filter((each) => !denyList.includes(each.name));
    const filteredEnums = dmmf.datamodel.enums.filter((each) => !denyList.includes(each.name));
    const transformedModels = (0, _1.dmmfModelTransformer)(filteredModels);
    const transformedEnums = (0, _1.dmmfEnumTransformer)(filteredEnums);
    const outputSchema = [
        await (0, _1.datasourceDeserializer)(datasources),
        await (0, _1.generatorsDeserializer)(generators),
        await (0, _1.dmmfModelsDeserializer)(transformedModels),
        await (0, _1.dmmfEnumsDeserializer)(transformedEnums),
    ]
        .filter((e) => e)
        .join("\n\n\n");
    return outputSchema;
}
exports.fixPrismaFile = fixPrismaFile;
__exportStar(require("./deserializer"), exports);
__exportStar(require("./transformer"), exports);
//# sourceMappingURL=index.js.map