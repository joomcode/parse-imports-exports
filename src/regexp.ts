import {addError} from './utils.js';

import type {MutableImportsExports, OnParse} from './types';

/**
 * Adds error of parsing regexp literal.
 */
export const onRegexpError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start, end},
) => addError(importsExports, 'Cannot find end of regexp literal', start, end);

/**
 * Parses `/.../` statement (regular expression literal).
 */
export const onRegexpParse: OnParse<MutableImportsExports, 2> = (
  _importsExports,
  source,
  parsedToken,
  {end, token},
) => {
  if (token !== '/') {
    return parsedToken.end;
  }

  if (source[end] === '*') {
    return end - 1;
  }

  return;
};
