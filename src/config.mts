import { join, extname } from 'path';
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
export const getConfigFile = async (
  path = join(process.cwd(), FILE),
): Promise<Config> =>
  (extname(path) === '.mjs' && await stat(path)
    .then((x) => x.isFile())
    .catch(() => {
      console.error(
        `bad config path ${JSON.stringify(
          path,
        )} or not correct file. Using default config`,
      );
      return false;
    }))
    ? import(path)
    : config;
