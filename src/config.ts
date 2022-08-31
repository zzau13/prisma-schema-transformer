import { join } from 'path';
import { stat } from 'node:fs/promises';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
};

export type Config = Readonly<typeof config>;
export const defConfig = (cfg: Partial<Config>) => ({ ...config, ...cfg });

export const getConfigFile = async (
  path = join(process.cwd(), 'schema-trans.mjs'),
): Promise<Config> =>
  (await stat(path).catch(() => false))
    ? (Function(`return import(${JSON.stringify(path)})`)() as Promise<Config>)
    : config;
