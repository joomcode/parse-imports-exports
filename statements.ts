import {onCommonJsExportError, onCommonJsExportParse} from './commonJsExport';
import {onDeclarationExportError, onDeclarationExportParse} from './declarationExport';
import {onDynamicImportError, onDynamicImportParse} from './dynamicImport';
import {onImportError, onImportParse} from './import';
import {onNamedExportError, onNamedExportParse} from './namedExport';
import {
  onBacktickError,
  onDoubleQuoteError,
  onMultilineCommentError,
  onSinglelineCommentError,
  onSingleQuoteError,
} from './onErrors';
import {onRegexpError, onRegexpParse} from './regexp';
import {onRequireError, onRequireParse} from './require';

import type {Comment, OnParse, Options, Statement} from './types';

/**
 * Base options of parse function.
 */
export const comments: readonly Comment[] = [
  {
    onError: onSinglelineCommentError,
    tokens: ['\\/\\/', '$'],
  },
  {
    onError: onMultilineCommentError,
    tokens: ['\\/\\*', '\\*\\/'],
  },
];

/**
 * Get statements for parsing by options.
 */
export const getStatements = (options: Options | undefined): readonly Statement[] => {
  const statements: Statement[] = [...baseStatements];

  if (!options?.ignoreDynamicImports) {
    statements.push(dynamicImportStatement);
  }

  if (!options?.ignoreRequires) {
    statements.push(requireStatement);
  }

  if (!options?.ignoreCommonJsExports) {
    statements.push(commonJsExportStatement);
  }

  if (!options?.ignoreRegexpLiterals) {
    statements.push(regexpLiteralStatement);
  }

  if (!options?.ignoreStringLiterals) {
    statements.unshift(...stringLiteralStatements);
  }

  return statements;
};

/**
 * Base statements for parsing `import`/`export` declarations.
 */
const baseStatements: readonly Statement[] = [
  {
    canIncludeComments: true,
    onError: onImportError as OnParse,
    onParse: onImportParse as OnParse,
    tokens: ['^import ', '[\'"];?$'],
    shouldSearchBeforeComments: true,
  },
  {
    canIncludeComments: true,
    onError: onNamedExportError as OnParse,
    onParse: onNamedExportParse as OnParse,
    tokens: ['^export (?<type>type )?\\{', '(\\};?$)|(?<quote>[\'"];?$)'],
    shouldSearchBeforeComments: true,
  },
  {
    canIncludeComments: true,
    onError: onDeclarationExportError as OnParse,
    onParse: onDeclarationExportParse as OnParse,
    tokens: ['^export ', '$'],
    shouldSearchBeforeComments: true,
  },
];

/**
 * Statement for parsing CommonJS exports (`module.exports = ...`/`(module.)exports.foo = ...`).
 */
const commonJsExportStatement: Statement = {
  canIncludeComments: true,
  onError: onCommonJsExportError as OnParse,
  onParse: onCommonJsExportParse as OnParse,
  tokens: ['^(module\\.)?exports\\b', '='],
  shouldSearchBeforeComments: true,
};

/**
 * Statement for parsing dynamic import call (`import(...)`).
 */
const dynamicImportStatement: Statement = {
  canIncludeComments: false,
  onError: onDynamicImportError as OnParse,
  onParse: onDynamicImportParse as OnParse,
  tokens: ['\\bimport\\([\'"]', '[\'"]\\)'],
  shouldSearchBeforeComments: true,
};

/**
 * Statement for parsing regexp literal (`/.../`).
 */
const regexpLiteralStatement: Statement = {
  canIncludeComments: false,
  onError: onRegexpError as OnParse,
  onParse: onRegexpParse as OnParse,
  tokens: ['/', '((?<!\\\\)/)|($)'],
  shouldSearchBeforeComments: false,
};

/**
 * Statement for parsing require call (`require(...)`).
 */
const requireStatement: Statement = {
  canIncludeComments: false,
  onError: onRequireError as OnParse,
  onParse: onRequireParse as OnParse,
  tokens: ['\\brequire\\([\'"]', '[\'"]\\)'],
  shouldSearchBeforeComments: true,
};

/**
 * Statements for parsing string literals.
 */
const stringLiteralStatements: readonly Statement[] = [
  {
    canIncludeComments: false,
    onError: onSingleQuoteError as OnParse,
    tokens: ["'", "((?<!\\\\)')|($)"],
    shouldSearchBeforeComments: true,
  },
  {
    canIncludeComments: false,
    onError: onDoubleQuoteError as OnParse,
    tokens: ['"', '((?<!\\\\)")|($)'],
    shouldSearchBeforeComments: true,
  },
  {
    canIncludeComments: false,
    onError: onBacktickError as OnParse,
    tokens: ['`', '(?<!\\\\)`'],
    shouldSearchBeforeComments: true,
  },
];
