import { join, extname } from 'node:path';
import { stat } from 'node:fs/promises';

const config = {
  pluralFields: true,
  omitPluralFields: new Array<string>(),
  updatedAtByTrigger: false,
  deny: new Array<string>(),
};

export type Config = Readonly<typeof config>;
export const defConfig = (cfg: Partial<Config>): Config => ({
  ...config,
  ...cfg,
});

export const FILE = 'schema-trans.mjs';
const PATH =  join(process.cwd(), FILE);
export const getConfigFile = async (
  path = PATH,
): Promise<Config> =>
  (extname(path) === '.mjs' && await stat(path)
    .then((x) => x.isFile())
    .catch(() => {
      if (path !== PATH) throw new Error(
        `bad config path ${JSON.stringify(
          path,
        )} or not correct file. Using default config`,
      );
      return false;
    }))
    ? import(path)
    : config;
