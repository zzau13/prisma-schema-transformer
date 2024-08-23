import { getConfig, getDMMF, formatSchema } from '@prisma/internals';
import {
  createPrismaSchemaBuilder,
  Assignment,
  RelationArray,
  Func,
} from '@mrleebo/prisma-ast';

import { getConfigFile } from './config.mjs';
import {
  datasourceDeserializer,
  dmmfEnumsDeserializer,
  dmmfModelsDeserializer,
  generatorsDeserializer,
  Model,
} from './deserializer.mjs';
import { dmmfEnumTransformer, dmmfModelTransformer } from './transformer.mjs';
import { ConnectorType } from '@prisma/generator-helper';

export async function fixSchema(
  schemaPath: string,
  schema: string,
  configPath?: string,
) {
  const configFile = await getConfigFile(configPath);
  const builder = createPrismaSchemaBuilder(schema);
  const denyList = configFile.deny;
  const dmmf = await getDMMF({ datamodel: schema });
  const config = await getConfig({ datamodel: schema });
  const models = dmmf.datamodel.models as Model[];
  const datasources = config.datasources;
  const datasoruceProvider: (ConnectorType | 'db')[] = datasources.map(
    ({ provider }) => provider,
  );
  datasoruceProvider.push('db');
  const generators = config.generators;

  const filteredModels = models.filter((each) => !denyList.includes(each.name));
  const filteredEnums = dmmf.datamodel.enums.filter(
    (each) => !denyList.includes(each.name),
  );
  const transformedModels = dmmfModelTransformer(
    filteredModels,
    configFile,
    builder,
    datasoruceProvider,
  );
  const transformedEnums = dmmfEnumTransformer(filteredEnums);
  const relationalArrays = (
    builder
      .findByType('generator', {})
      ?.assignments.filter(
        (assig) =>
          assig.type === 'assignment' &&
          assig.key === 'binaryTargets' &&
          typeof assig.value === 'object' &&
          Object.hasOwn(assig.value, 'type') &&
          (assig.value as RelationArray | Func).type === 'array',
      ) as Assignment[]
  )?.map(({ value }) => value) as RelationArray[];
  const binaryTargets = relationalArrays?.map(({ args }) => args);

  const multi = await formatSchema({
    schemas: [
      [
        schemaPath,
        [
          generatorsDeserializer(generators, binaryTargets),
          datasourceDeserializer(datasources),
          dmmfModelsDeserializer(transformedModels),
          dmmfEnumsDeserializer(transformedEnums),
        ].join('\n'),
      ],
    ],
  });
  return multi[0][1];
}
