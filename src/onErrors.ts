import {addError} from './utils.js';

import type {MutableImportsExports, OnCommentError, OnGlobalError, OnParse} from './types';

/**
 * Adds error of parsing string literal started with backtick.
 */
export const onBacktickError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) =>
  addError(
    importsExports,
    'Cannot find end of string literal started with backtick',
    source,
    start,
    end,
  );

/**
 * Adds error of parsing string literal started with double quote.
 */
export const onDoubleQuoteError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) =>
  addError(
    importsExports,
    'Cannot find end of string literal started with double quote',
    source,
    start,
    end,
  );

/**
 * Adds global error of parsing source.
 */
export const onGlobalError: OnGlobalError<MutableImportsExports> = (
  importsExports,
  source,
  message,
  index,
) => addError(importsExports, message, source, index);

/**
 * Adds error of parsing multiline comment.
 */
export const onMultilineCommentError: OnCommentError<MutableImportsExports> = (
  importsExports,
  source,
  {start},
) => addError(importsExports, 'Cannot find end of multiline comment', source, start);

/**
 * Adds error of parsing single line comment.
 */
export const onSinglelineCommentError: OnCommentError<MutableImportsExports> = (
  importsExports,
  source,
  {start},
) => addError(importsExports, 'Cannot find end of single line comment', source, start);

/**
 * Adds error of parsing string literal started with single quote.
 */
export const onSingleQuoteError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) =>
  addError(
    importsExports,
    'Cannot find end of string literal started with single quote',
    source,
    start,
    end,
  );
