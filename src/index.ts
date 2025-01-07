import {onGlobalError} from './onErrors.js';
import {comments, getStatements} from './statements.js';
import {createParseFunction, getCacheKey, removeErrorsCausedByOverloading} from './utils.js';

import type {ImportsExports, MutableImportsExports, Options, Parse, ParseOptions} from './types';

/**
 * Parses `import`/`export` in ECMAScript/TypeScript syntax.
 */
export const parseImportsExports = (source: string, options?: Options): ImportsExports => {
  const cacheKey = getCacheKey(options);
  const importsExports: MutableImportsExports = {
    namedImports: undefined,
    namespaceImports: undefined,
    dynamicImports: undefined,
    requires: undefined,
    typeNamedImports: undefined,
    typeNamespaceImports: undefined,
    typeDynamicImports: undefined,
    namedReexports: undefined,
    namespaceReexports: undefined,
    starReexports: undefined,
    typeNamedReexports: undefined,
    typeNamespaceReexports: undefined,
    typeStarReexports: undefined,
    defaultExport: undefined,
    namedExports: undefined,
    declarationExports: undefined,
    typeNamedExports: undefined,
    typeExports: undefined,
    interfaceExports: undefined,
    namespaceExports: undefined,
    commonJsNamespaceExport: undefined,
    commonJsExports: undefined,
    errors: undefined,
  };

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

export type {Kind, Name, Path} from './types';

/**
 * Base options of parse function.
 */
const baseParseOptions: ParseOptions<MutableImportsExports> = {comments, onError: onGlobalError};

/**
 * Cache of parse functions with different options.
 */
const parseCache = {__proto__: null} as unknown as Record<string, Parse<MutableImportsExports>>;
