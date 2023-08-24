import {onDeclarationExportError, onDeclarationExportParse} from './declarationExport';
import {onNamedExportError, onNamedExportParse} from './namedExport';
import {onImportError, onImportParse} from './import';
import {
  createParseFunction,
  onGlobalError,
  onMultilineCommentError,
  onSinglelineCommentError,
} from './utils';

import type {ImportsExports, MutableImportsExports, OnParse} from './types';

/**
 * Internal parser of `import`/`export` in ECMAScript/TypeScript syntax.
 */
const parse = createParseFunction<MutableImportsExports>({
  comments: [
    {
      onError: onSinglelineCommentError,
      tokens: ['\\/\\/', '$'],
    },
    {
      onError: onMultilineCommentError,
      tokens: ['\\/\\*', '\\*\\/'],
    },
  ],
  onError: onGlobalError,
  statements: [
    {
      onError: onImportError as OnParse,
      onParse: onImportParse as OnParse,
      tokens: ['^import ', '[\'"];?$'],
    },
    {
      onError: onNamedExportError as OnParse,
      onParse: onNamedExportParse as OnParse,
      tokens: ['^export (?<type>type )?\\{', '(\\};?$)|(?<quote>[\'"];?$)'],
    },
    {
      onError: onDeclarationExportError as OnParse,
      onParse: onDeclarationExportParse as OnParse,
      tokens: ['^export ', '$'],
    },
  ],
});

export type {ImportsExports};

export type {Kind} from './types';

/**
 * Parses `import`/`export` in ECMAScript/TypeScript syntax.
 */
export const parseImportsExports = (source: string): ImportsExports => {
  const importsExports: MutableImportsExports = {};

  parse(importsExports, source);

  return importsExports;
};
