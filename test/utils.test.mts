import { test, expect } from 'vitest';
import {defConfig} from '../src/index.mjs';

test('should define config', () => {
    expect(defConfig({updatedAtByTrigger: true })).toStrictEqual({
        pluralFields: true,
        omitPluralFields: new Array<string>(),
        updatedAtByTrigger: true,
        deny: new Array<string>(),
    })
})
