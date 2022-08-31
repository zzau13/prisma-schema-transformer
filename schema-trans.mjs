import { defConfig } from './dist/src/index.mjs';

export default defConfig({
  updatedAtByTrigger: true,
  omitPluralFields: ['initials'],
  pluralFields: false,
});
