import { join } from 'path';
import { stat } from 'node:fs/promises';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
};

export type Config = Readonly<typeof config>;
export const defConfig = (cfg: Partial<Config>) => ({ ...config, ...cfg });

export const FILE = 'schema-trans.mjs';
export const getConfigFile = async (
  path = join(process.cwd(), FILE),
): Promise<Config> =>
  (await stat(path).catch(() => false))
    ? (Function(`return import(${JSON.stringify(path)})`)() as Promise<Config>)
    : config;
