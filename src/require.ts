import {parseFrom} from './partParsers.js';
import {addError} from './utils.js';

import type {ExcludeUndefined, MutableImportsExports, OnParse, Require} from './types';

/**
 * Adds error of parsing `require('...')`/`require("...")` statement.
 */
export const onRequireError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) => addError(importsExports, 'Cannot find end of `require(...)` statement', source, start, end);

/**
 * Parses `require('...')`/`require("...")` statement.
 */
export const onRequireParse: OnParse<MutableImportsExports, 3> = (
  importsExports,
  source,
  {start: requireStart},
  {start: unparsedStart},
  {start: unparsedEnd, end: requireEnd, token: endToken},
) => {
  const unparsed = source.slice(unparsedStart, unparsedEnd);
  const quoteCharacter = endToken[0];

  if (quoteCharacter === undefined) {
    return addError(
      importsExports,
      'Cannot find end of path string literal in `require(...)`',
      source,
      requireStart,
      requireEnd,
    );
  }

  const {from, index} = parseFrom(quoteCharacter, unparsed);

  if (index !== 0) {
    return addError(
      importsExports,
      `Cannot find start of path string literal in \`require(${quoteCharacter}...${quoteCharacter})\``,
      source,
      requireStart,
      requireEnd,
    );
  }

  const parsedRequire: Require = {start: requireStart, end: requireEnd};

  let {requires} = importsExports;

  requires ??= importsExports.requires = {__proto__: null} as ExcludeUndefined<typeof requires>;

  let requiresList = requires[from];

  requiresList ??= requires[from] = [];

  (requiresList as Require[]).push(parsedRequire);
};
