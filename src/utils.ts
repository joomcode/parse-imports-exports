import type {
  CommentPair,
  ContextKey,
  ExcludeUndefined,
  LineColumn,
  MutableImportsExports,
  Options,
  Position,
} from './types';

/**
 * Adds some parse error to parse results.
 */
export const addError = (
  importsExports: MutableImportsExports,
  message: string,
  start: number,
  end?: number,
): void => {
  const {source} = importsExports[CONTEXT_KEY];
  var {errors} = importsExports;

  errors ??= importsExports.errors = {__proto__: null} as unknown as ExcludeUndefined<
    typeof errors
  >;

  const additionalOffset = end !== undefined && end < start + 2 ? 100 : 0;

  const fullMessage =
    end === undefined
      ? message
      : `${message}:\n${source.slice(start, Math.min(end + additionalOffset, start + 200))}`;

  const lineColumn = getLineColumnByIndex(importsExports, start);
  const currentError = errors[lineColumn];

  errors[lineColumn] = currentError === undefined ? fullMessage : `${currentError}\n${fullMessage}`;
};

/**
 * Internal key for `Context` in `MutableImportsExports`.
 */
export const CONTEXT_KEY: ContextKey = Symbol.for(
  'parse-imports-exports:context-key',
) as ContextKey;

export {createParseFunction} from 'parse-statements';

/**
 * Get key for cache of parse functions by options.
 */
export const getCacheKey = (options: Options | undefined): string => {
  if (options === undefined) {
    return '';
  }

  var cacheKey = '';

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
 * Get position object by start and end indexes.
 */
export const getPosition = (
  importsExports: MutableImportsExports,
  start: number,
  end: number,
): Position =>
  importsExports[CONTEXT_KEY].options?.includeLineColumn
    ? {
        start,
        startLineColumn: getLineColumnByIndex(importsExports, start),
        end,
        endLineColumn: getLineColumnByIndex(importsExports, end),
      }
    : {start, end};

/**
 * Removes errors, caused by function overloading.
 * Re-declarations when overloading functions are not an error, so we remove them.
 */
export const removeErrorsCausedByOverloading = (importsExports: MutableImportsExports): void => {
  const {errors} = importsExports;

  if (errors === undefined) {
    return;
  }

  var previousError: string | undefined;
  var previousLineColumn: LineColumn | undefined;

  for (const lineColumn of Object.keys(errors) as LineColumn[]) {
    const error = errors[lineColumn]!;

    if (
      (error.startsWith('Duplicate exported declaration `function') ||
        error.startsWith('Duplicate exported declaration `async function') ||
        error.startsWith('Duplicate exported declaration `declare function')) &&
      error.split(':')[0] === previousError?.split(':')[0]
    ) {
      delete errors[previousLineColumn!];
      delete errors[lineColumn];
    }

    previousError = error;
    previousLineColumn = lineColumn;
  }

  if (Object.keys(errors).length === 0) {
    importsExports.errors = undefined;
  }
};

/**
 * Regexp that find all spaces.
 */
export const spacesRegExp: RegExp = /\s+/g;

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

  var currentStart = intervalStart;
  const parts: string[] = [];

  for (const [{start}, {end}] of comments) {
    parts.push(source.slice(currentStart, start));

    currentStart = end;
  }

  parts.push(source.slice(currentStart, intervalEnd));

  return parts.join('');
};

/**
 * Get `LineColumn` string by index in source.
 */
const getLineColumnByIndex = (
  {[CONTEXT_KEY]: context}: MutableImportsExports,
  index: number,
): LineColumn => {
  var {lineColumnCache, linesIndexes} = context;

  lineColumnCache ??= context.lineColumnCache = {__proto__: null} as ExcludeUndefined<
    typeof context.lineColumnCache
  >;

  var lineColumn = lineColumnCache[index];

  if (lineColumn !== undefined) {
    return lineColumn;
  }

  linesIndexes ??= context.linesIndexes = getLinesIndexes(context.source);

  const numberOfLine = getNumberOfLine(index, linesIndexes);
  const line = numberOfLine + 1;
  const column = index - linesIndexes[numberOfLine]! + 1;

  lineColumn = `${line}:${column}` as LineColumn;
  lineColumnCache[index] = lineColumn;

  return lineColumn;
};

/**
 * Get number of line where in which the character with the specified index is located.
 */
const getNumberOfLine = (index: number, linesIndexes: readonly number[]): number => {
  const {length} = linesIndexes;

  if (index >= linesIndexes[length - 1]!) {
    return length - 1;
  }

  var min = 0;
  var max = length - 2;

  while (min < max) {
    var middle = min + ((max - min) >> 1);

    if (index < linesIndexes[middle]!) {
      max = middle - 1;
    } else if (index >= linesIndexes[middle + 1]!) {
      min = middle + 1;
    } else {
      min = middle;
      break;
    }
  }

  return min;
};

/**
 * Get array of indexes of lines first symbols in source.
 */
const getLinesIndexes = (source: string): readonly number[] => {
  var index = 0;
  const lines = source.split('\n');
  const indexes: number[] = new Array(lines.length);

  for (var lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    indexes[lineNumber] = index;
    index += lines[lineNumber]!.length + 1;
  }

  return indexes;
};
