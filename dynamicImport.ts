import {addError, parseFrom} from './utils';

import type {DynamicImport, MutableImportsExports, OnParse} from './types';

/**
 * Adds error of parsing `import('...')`/`import("...")` statement.
 */
export const onDynamicImportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) => addError(importsExports, 'Cannot find end of `import(...)` statement', source, start, end);

/**
 * Parses `import('...')`/`import("...")` statement.
 */
export const onDynamicImportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: importStart, end: unparsedStart},
  {start: unparsedEnd, end: importEnd, token: endToken},
) => {
  const unparsed = source.slice(unparsedStart - 1, unparsedEnd);
  const quoteCharacter = endToken[0]!;

  const {from, index} = parseFrom(quoteCharacter, unparsed);
  const isTypeImport = source.slice(importStart - 7, importStart) === 'typeof ';

  if (index !== 0) {
    return addError(
      importsExports,
      `Cannot find start of path string literal of dynamic import${isTypeImport ? ' of type' : ''}`,
      source,
      importStart,
      importEnd,
    );
  }

  const parsedImport: DynamicImport = {start: importStart, end: importEnd};

  let key: 'dynamicImports' | 'typeDynamicImports' = 'dynamicImports';

  if (isTypeImport) {
    key = 'typeDynamicImports';
  }

  let imports = importsExports[key];

  if (imports === undefined) {
    importsExports[key] = imports = {__proto__: null} as Exclude<typeof imports, undefined>;
  }

  let importsList = imports[from];

  if (Array.isArray(importsList) === false) {
    imports[from] = importsList = [];
  }

  (importsList as DynamicImport[]).push(parsedImport);
};
