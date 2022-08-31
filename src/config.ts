import { join } from 'path';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
} as const;

export type Config = typeof config;

export const defConfig = (config: Partial<Config>) => config;

export const getConfigFile = (path = 'schema-trans.js'): Promise<Config> =>
  import(join(process.cwd(), path))
    .then((x) => ({ ...config, ...x.default }))
    .catch(() => config);
