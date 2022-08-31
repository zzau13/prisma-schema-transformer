import { join } from 'path';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
} as const;

export type Config = typeof config;

export const defConfig = (cfg: Partial<Config>) => ({ ...config, ...cfg });

export const getConfigFile = (
  path = join(process.cwd(), 'schema-trans.mjs'),
): Promise<Config> => import(path).catch(() => config);
