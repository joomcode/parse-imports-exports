import {parseFrom} from './partParsers';
import {addError} from './utils';

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
export const onRequireParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: requireStart, end: unparsedStart},
  {start: unparsedEnd, end: requireEnd, token: endToken},
) => {
  const unparsed = source.slice(unparsedStart - 1, unparsedEnd);
  const quoteCharacter = endToken[0]!;

  const {from, index} = parseFrom(quoteCharacter, unparsed);

  if (index !== 0) {
    return addError(
      importsExports,
      'Cannot find start of path string literal in `require(...)`',
      source,
      requireStart,
      requireEnd,
    );
  }

  const parsedRequire: Require = {start: requireStart, end: requireEnd};

  let {requires} = importsExports;

  if (requires === undefined) {
    importsExports.requires = requires = {__proto__: null} as ExcludeUndefined<typeof requires>;
  }

  let requiresList = requires[from];

  if (requiresList === undefined) {
    requires[from] = requiresList = [];
  }

  (requiresList as Require[]).push(parsedRequire);
};
