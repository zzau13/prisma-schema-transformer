import p from '@prisma/internals';
const { getConfig, getDMMF } = p;
import { getConfigFile } from './config.mjs';
import {
  datasourceDeserializer,
  dmmfEnumsDeserializer,
  dmmfModelsDeserializer,
  generatorsDeserializer,
  Model,
} from './deserializer.mjs';
import { dmmfEnumTransformer, dmmfModelTransformer } from './transformer.mjs';

export async function fixPrismaFile(
  schema: string,
  deny: readonly string[] = [],
  configPath?: string,
) {
  const configFile = await getConfigFile(configPath);
  const denyList = [...new Set(deny.concat(configFile.deny))];

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
