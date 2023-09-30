import {onDeclarationExportError, onDeclarationExportParse} from './declarationExport';
import {onNamedExportError, onNamedExportParse} from './namedExport';
import {onImportError, onImportParse} from './import';
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
} from './types';

let parse: Parse<MutableImportsExports> | undefined;
let parseWithoutStringLiterals: Parse<MutableImportsExports> | undefined;

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
  statements: [
    {canIncludeComments: false, onError: onSingleQuoteError as OnParse, tokens: ["'", "'"]},
    {canIncludeComments: false, onError: onDoubleQuoteError as OnParse, tokens: ['"', '"']},
    {canIncludeComments: false, onError: onBacktickError as OnParse, tokens: ['`', '`']},
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
  ],
};

export type {ImportsExports};

export type {Kind} from './types';

/**
 * Parses `import`/`export` in ECMAScript/TypeScript syntax.
 */
export const parseImportsExports = (source: string, options: Options = {}): ImportsExports => {
  const importsExports: MutableImportsExports = {};
  const {ignoreStringLiterals = false} = options;

  if (ignoreStringLiterals === false) {
    if (parse === undefined) {
      parse = createParseFunction<MutableImportsExports>(parseOptions);
    }

    parse(importsExports, source);
  } else {
    if (parseWithoutStringLiterals === undefined) {
      parseWithoutStringLiterals = createParseFunction<MutableImportsExports>({
        ...parseOptions,
        statements: parseOptions.statements!.slice(3),
      });
    }

    parseWithoutStringLiterals(importsExports, source);
  }

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
