import {onDeclarationExportError, onDeclarationExportParse} from './declarationExport';
import {onDynamicImportError, onDynamicImportParse} from './dynamicImport';
import {onImportError, onImportParse} from './import';
import {onNamedExportError, onNamedExportParse} from './namedExport';
import {onRequireError, onRequireParse} from './require';
import {
  createParseFunction,
  onBacktickError,
  onDoubleQuoteError,
  onGlobalError,
  onMultilineCommentError,
  onSinglelineCommentError,
  onSingleQuoteError,
} from './utils';

import type {
  ImportsExports,
  MutableImportsExports,
  OnParse,
  Options,
  Parse,
  ParseOptions,
  Statement,
} from './types';

/**
 * Base statements for parsing `import`/`export` declarations.
 */
const baseStatements: readonly Statement[] = [
  {
    canIncludeComments: true,
    onError: onImportError as OnParse,
    onParse: onImportParse as OnParse,
    tokens: ['^import ', '[\'"];?$'],
  },
  {
    canIncludeComments: true,
    onError: onNamedExportError as OnParse,
    onParse: onNamedExportParse as OnParse,
    tokens: ['^export (?<type>type )?\\{', '(\\};?$)|(?<quote>[\'"];?$)'],
  },
  {
    canIncludeComments: true,
    onError: onDeclarationExportError as OnParse,
    onParse: onDeclarationExportParse as OnParse,
    tokens: ['^export ', '$'],
  },
];

/**
 * Statement for parsing dynamic import call (`import(...)`).
 */
const dynamicImportStatement: Statement = {
  canIncludeComments: false,
  onError: onDynamicImportError as OnParse,
  onParse: onDynamicImportParse as OnParse,
  tokens: ['\\bimport\\([\'"]', '[\'"]\\)'],
};

/**
 * Cache of parse functions with different options.
 */
const parseCache = {__proto__: null} as unknown as Record<string, Parse<MutableImportsExports>>;

/**
 * Base options of parse function.
 */
const parseOptions: ParseOptions<MutableImportsExports> = {
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
};

/**
 * Statement for parsing require call (`require(...)`).
 */
const requireStatement: Statement = {
  canIncludeComments: false,
  onError: onRequireError as OnParse,
  onParse: onRequireParse as OnParse,
  tokens: ['\\brequire\\([\'"]', '[\'"]\\)'],
};

/**
 * Statements for parsing string literals.
 */
const stringLiteralStatements: readonly Statement[] = [
  {canIncludeComments: false, onError: onSingleQuoteError as OnParse, tokens: ["'", "'"]},
  {canIncludeComments: false, onError: onDoubleQuoteError as OnParse, tokens: ['"', '"']},
  {canIncludeComments: false, onError: onBacktickError as OnParse, tokens: ['`', '`']},
];

export type {ImportsExports, Options};

export type {Kind} from './types';

/**
 * Parses `import`/`export` in ECMAScript/TypeScript syntax.
 */
export const parseImportsExports = (source: string, options?: Options): ImportsExports => {
  const importsExports: MutableImportsExports = {};
  let cacheKey = '';

  if (options !== undefined) {
    if (options.ignoreDynamicImports === true) {
      cacheKey += 'ignoreDynamicImports';
    }

    if (options.ignoreRequires === true) {
      cacheKey += 'ignoreRequires';
    }

    if (options.ignoreStringLiterals === true) {
      cacheKey += 'ignoreStringLiterals';
    }
  }

  let parse = parseCache[cacheKey];

  if (parse === undefined) {
    const statements = [...baseStatements];

    if (!options?.ignoreDynamicImports) {
      statements.push(dynamicImportStatement);
    }

    if (!options?.ignoreRequires) {
      statements.push(requireStatement);
    }

    if (!options?.ignoreStringLiterals) {
      statements.unshift(...stringLiteralStatements);
    }

    parse = createParseFunction<MutableImportsExports>({...parseOptions, statements});

    parseCache[cacheKey] = parse;
  }

  parse(importsExports, source);

  let previousError: string | undefined;
  let previousIndex: string | undefined;

  // re-declarations when overloading functions are not an error, so we remove them
  for (const index in importsExports.errors) {
    const error = importsExports.errors[index as unknown as number]!;

    if (
      (error.startsWith('Duplicate exported declaration `function') ||
        error.startsWith('Duplicate exported declaration `async function') ||
        error.startsWith('Duplicate exported declaration `declare function')) &&
      error.split(':')[0] === previousError?.split(':')[0]
    ) {
      delete importsExports.errors[previousIndex as unknown as number];
      delete importsExports.errors[index as unknown as number];
    }

    previousError = error;
    previousIndex = index;
  }

  return importsExports;
};
