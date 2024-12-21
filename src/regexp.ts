import {addError} from './utils.js';

import type {MutableImportsExports, OnParse} from './types';

/**
 * Adds error of parsing regexp literal.
 */
export const onRegexpError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) => addError(importsExports, 'Cannot find end of regexp literal', source, start, end);

/**
 * Parses `/.../` statement (regular expression literal).
 */
export const onRegexpParse: OnParse<MutableImportsExports, 2> = (
  _importsExports,
  source,
  {end: regexpBodyStart},
  {end: regexpEnd, token},
) => {
  if (token !== '/') {
    return regexpBodyStart;
  }

  if (source[regexpEnd] === '*') {
    return regexpEnd - 1;
  }

  return;
};
