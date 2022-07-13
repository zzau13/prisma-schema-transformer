import { getConfig, getDMMF } from '@prisma/sdk';
import {
  datasourceDeserializer,
  dmmfEnumsDeserializer,
  dmmfEnumTransformer,
  dmmfModelsDeserializer,
  dmmfModelTransformer,
  generatorsDeserializer,
  Model,
} from '.';
import { getConfigFile } from './config';

/**
 *
 * @param schema
 * @param denyList
 */
export async function fixPrismaFile(
  schema: string,
  denyList: readonly string[] = [],
) {
  const configFile = await getConfigFile();
  const dmmf = await getDMMF({ datamodel: schema });
  const config = await getConfig({ datamodel: schema });

  const models = dmmf.datamodel.models as Model[];
  const datasources = config.datasources;
  const generators = config.generators;

  const filteredModels = models.filter((each) => !denyList.includes(each.name));
  const filteredEnums = dmmf.datamodel.enums.filter(
    (each) => !denyList.includes(each.name),
  );
  const transformedModels = dmmfModelTransformer(filteredModels, configFile);
  const transformedEnums = dmmfEnumTransformer(filteredEnums);

  return (
    await Promise.all([
      datasourceDeserializer(datasources),
      generatorsDeserializer(generators),
      dmmfModelsDeserializer(transformedModels),
      dmmfEnumsDeserializer(transformedEnums),
    ])
  )
    .filter((e) => e)
    .join('\n\n\n');
}

export * from './deserializer';
export * from './transformer';
export { Config } from './config';
