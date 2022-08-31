import { join } from 'path';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
} as const;

export type Config = typeof config;

export const defConfig = (config: Partial<Config>) => config;

export const getConfigFile = (
  path = join(process.cwd(), 'schema-trans.js'),
): Promise<Config> =>
  import(path).then((x) => ({ ...config, ...x.default })).catch(() => config);
