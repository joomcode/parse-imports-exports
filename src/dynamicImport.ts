import {parseFrom, parseWith} from './partParsers.js';
import {addError, getPosition} from './utils.js';

import type {DynamicImport, ExcludeUndefined, MutableImportsExports, OnParse, With} from './types';

/**
 * Adds error of parsing `import('...')`/`import("...")` statement.
 */
export const onDynamicImportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start, end},
) => addError(importsExports, 'Cannot find end of `import(...)` statement', start, end);

/**
 * Parses `import('...')`/`import("...")` statement.
 */
export const onDynamicImportParse: OnParse<MutableImportsExports, 3> = (
  importsExports,
  source,
  {start},
  {start: unparsedStart},
  {start: unparsedEnd, end: importEnd, token: endToken},
) => {
  var end = importEnd;
  const unparsed = source.slice(unparsedStart, unparsedEnd);
  const isType = source.slice(start - 7, start) === 'typeof ';
  const quoteCharacter = endToken[0];

  if (quoteCharacter === undefined) {
    return addError(
      importsExports,
      `Cannot find end of path string literal of dynamic \`import(...)\`${isType ? ' of type' : ''}`,
      start,
      end,
    );
  }

  const {from, index} = parseFrom(quoteCharacter, unparsed);

  const importKind = `dynamic \`import(${quoteCharacter}...${quoteCharacter})\`${isType ? ' of type' : ''} from \`${from}\``;

  if (index !== 0) {
    return addError(
      importsExports,
      `Cannot find start of path string literal of ${importKind}`,
      start,
      end,
    );
  }

  var withAttributes: With | undefined;

  if (source[end] === ',') {
    const withIndex = source.indexOf('with: {', end + 1);

    if (withIndex !== -1 && source.slice(end + 1, withIndex).trim() === '{') {
      const attributes = parseWith(withIndex + 7, source);

      if (attributes === undefined) {
        return addError(
          importsExports,
          `Cannot find end of import attributes (\`with: {...}\`) in ${importKind}`,
          start,
          end,
        );
      }

      end = attributes.endIndex;
      withAttributes = attributes.with;

      if (withAttributes === undefined) {
        return addError(
          importsExports,
          `Cannot parse import attributes (\`with: {...}\`) for ${importKind}`,
          start,
          end,
        );
      }
    }
  }

  const position = getPosition(importsExports, start, end);

  const parsedImport: DynamicImport =
    withAttributes === undefined ? position : {...position, with: withAttributes};

  var key: 'dynamicImports' | 'typeDynamicImports' = 'dynamicImports';

  if (isType) {
    key = 'typeDynamicImports';
  }

  var imports = importsExports[key];

  imports ??= importsExports[key] = {__proto__: null} as ExcludeUndefined<typeof imports>;

  var importsList = imports[from];

  if (importsList === undefined) {
    imports[from] = [parsedImport];
  } else {
    (importsList as [DynamicImport]).push(parsedImport);
  }
};
