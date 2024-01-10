import type {CommentPair, ExcludeUndefined, MutableImportsExports, Options} from './types';

/**
 * Adds some parse error to parse results.
 */
export const addError = (
  importsExports: MutableImportsExports,
  message: string,
  source: string,
  startIndex: number,
  endIndex?: number,
): void => {
  let {errors} = importsExports;

  if (errors === undefined) {
    importsExports.errors = errors = {__proto__: null} as unknown as ExcludeUndefined<
      typeof errors
    >;
  }

  const additionalOffset = endIndex !== undefined && endIndex < startIndex + 2 ? 100 : 0;

  const fullMessage =
    endIndex === undefined
      ? message
      : `${message}:\n${source.slice(
          startIndex,
          Math.min(endIndex + additionalOffset, startIndex + 200),
        )}`;

  errors[startIndex] =
    errors[startIndex] === undefined ? fullMessage : `${errors[startIndex]}\n${fullMessage}`;
};

export {createParseFunction} from 'parse-statements';

/**
 * Get key for cache of parse functions by options.
 */
export const getCacheKey = (options: Options | undefined): string => {
  if (options === undefined) {
    return '';
  }

  let cacheKey = '';

  if (options.ignoreCommonJsExports === true) {
    cacheKey += 'ignoreCommonJsExports';
  }

  if (options.ignoreDynamicImports === true) {
    cacheKey += 'ignoreDynamicImports';
  }

  if (options.ignoreRegexpLiterals === true) {
    cacheKey += 'ignoreRegexpLiterals';
  }

  if (options.ignoreRequires === true) {
    cacheKey += 'ignoreRequires';
  }

  if (options.ignoreStringLiterals === true) {
    cacheKey += 'ignoreStringLiterals';
  }

  return cacheKey;
};

/**
 * Removes errors, caused by function overloading.
 * Re-declarations when overloading functions are not an error, so we remove them.
 */
export const removeErrorsCausedByOverloading = (importsExports: MutableImportsExports): void => {
  let previousError: string | undefined;
  let previousIndex: string | undefined;

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

  if (importsExports.errors !== undefined && Object.keys(importsExports.errors).length === 0) {
    delete importsExports.errors;
  }
};

/**
 * Regexp that find all spaces.
 */
export const spacesRegExp = /\s+/g;

/**
 * Strips comments from string interval from source.
 */
export const stripComments = (
  source: string,
  intervalStart: number,
  intervalEnd: number,
  comments: readonly CommentPair[] | undefined,
): string => {
  if (comments === undefined) {
    return source.slice(intervalStart, intervalEnd);
  }

  let currentStart = intervalStart;
  const parts: string[] = [];

  for (const [{start}, {end}] of comments) {
    parts.push(source.slice(currentStart, start));

    currentStart = end;
  }

  parts.push(source.slice(currentStart, intervalEnd));

  return parts.join('');
};
