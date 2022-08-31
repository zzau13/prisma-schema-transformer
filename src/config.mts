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

enum Stat {
    File,
    NotFile,
    NotDefined
}

export const FILE = 'schema-trans.mjs';
const PATH =  join(process.cwd(), FILE);
export async function getConfigFile (
  path = PATH,
): Promise<Config> {
    if (extname(path) !== '.mjs')
        throw new Error('config file extension should be ".mjs"');

    const throwBad = () => {
        throw new Error(
            `bad config path ${JSON.stringify(
                path,
            )}`,
        );
    }
    switch (await stat(path)
    .then((x) => x.isFile()? Stat.File: Stat.NotFile)
    .catch(() => {
      if (path !== PATH) throwBad();
      return Stat.NotDefined;
    })) {
        case Stat.File:
            return import(path);
        case Stat.NotFile:
            return throwBad();
        case Stat.NotDefined:
            return config;
    }
}
