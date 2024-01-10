import {onGlobalError} from './onErrors';
import {comments, getStatements} from './statements';
import {createParseFunction, getCacheKey, removeErrorsCausedByOverloading} from './utils';

import type {ImportsExports, MutableImportsExports, Options, Parse, ParseOptions} from './types';

/**
 * Parses `import`/`export` in ECMAScript/TypeScript syntax.
 */
export const parseImportsExports = (source: string, options?: Options): ImportsExports => {
  const cacheKey = getCacheKey(options);
  const importsExports: MutableImportsExports = {};

  let parse = parseCache[cacheKey];

  if (parse === undefined) {
    const statements = getStatements(options);

    parse = createParseFunction<MutableImportsExports>({...baseParseOptions, statements});

    parseCache[cacheKey] = parse;
  }

  parse(importsExports, source);

  removeErrorsCausedByOverloading(importsExports);

  return importsExports;
};

export type {ImportsExports, Options};

export type {Kind} from './types';

/**
 * Base options of parse function.
 */
const baseParseOptions: ParseOptions<MutableImportsExports> = {comments, onError: onGlobalError};

/**
 * Cache of parse functions with different options.
 */
const parseCache = {__proto__: null} as unknown as Record<string, Parse<MutableImportsExports>>;
