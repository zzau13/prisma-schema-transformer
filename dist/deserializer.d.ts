import { DataSource, DMMF, GeneratorConfig } from '@prisma/generator-helper/dist';
export declare type Attribute = Pick<DMMF.Field, 'isUnique' | 'isId' | 'dbNames' | 'relationFromFields' | 'relationToFields' | 'relationOnDelete' | 'relationName' | 'isReadOnly' | 'default' | 'isGenerated' | 'isUpdatedAt'>;
export interface Model extends DMMF.Model {
    uniqueFields: string[][];
}
/**
 * Deserialize DMMF.Model[] into prisma schema file
 */
export declare function dmmfModelsDeserializer(models: Model[]): Promise<string>;
export declare function datasourceDeserializer(datasource: DataSource[]): Promise<string>;
export declare function generatorsDeserializer(generators: GeneratorConfig[]): Promise<string>;
export declare function dmmfEnumsDeserializer(enums: DMMF.DatamodelEnum[]): Promise<string>;
