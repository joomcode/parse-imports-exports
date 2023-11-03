import type {
  CommentPair,
  MutableImportsExports,
  Name,
  OnCommentError,
  OnGlobalError,
  OnParse,
} from './types';

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
    importsExports.errors = errors = {__proto__: null} as unknown as Exclude<
      typeof errors,
      undefined
    >;
  }

  const fullMessage =
    endIndex === undefined
      ? message
      : `${message}:\n${source.slice(startIndex, Math.min(endIndex, startIndex + 200))}`;

  errors[startIndex] =
    errors[startIndex] === undefined ? fullMessage : `${errors[startIndex]}\n${fullMessage}`;
};

/**
 * Regexp that find all backslashes.
 */
const backslashesRegExp = /\\+/g;

/**
 * Hash with start characters of identifiers.
 */
const identifierStartCharacters = {__proto__: null} as unknown as Record<string, true>;

for (const character of 'abcdefghijklmnopqrstuvwxyz_$') {
  identifierStartCharacters[character] = true;
  identifierStartCharacters[character.toUpperCase()] = true;
}

/**
 * Hash with characters of identifiers.
 */
const identifierCharacters = {__proto__: null, ...identifierStartCharacters} as unknown as Record<
  string,
  true
>;

for (const character of '0123456789') {
  identifierCharacters[character] = true;
}

/**
 * Strips first character from string.
 */
const stripFirstCharacter = (someString: string) => someString.slice(1);

export {createParseFunction} from 'parse-statements';

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

type Destructuring =
  | Readonly<{
      endIndex: number;
      names: readonly Name[];
    }>
  | undefined;

/**
 * Parses destructuring assignment.
 */
export const parseDestructuring = (sourceStartsWithDestructuring: string): Destructuring => {
  const openBracket = sourceStartsWithDestructuring[0];
  const closeBracket = openBracket === '{' ? '}' : ']';

  const names: Name[] = [];

  let bracketsDepth = 1;
  let isInsideSinglelineComment = false;
  let isInsideMultilineComment = false;

  for (let index = 1; index < sourceStartsWithDestructuring.length; index += 1) {
    const char = sourceStartsWithDestructuring[index]!;

    if (isInsideSinglelineComment) {
      if (char === '\n') {
        isInsideSinglelineComment = false;
      }

      continue;
    } else if (isInsideMultilineComment) {
      if (char === '*' && sourceStartsWithDestructuring[index + 1] === '/') {
        isInsideMultilineComment = false;
        index += 1;
      }

      continue;
    }

    if (char === openBracket) {
      bracketsDepth += 1;
    } else if (char === closeBracket) {
      bracketsDepth -= 1;

      if (bracketsDepth === 0) {
        return {endIndex: index, names};
      }
    } else if (char === ':') {
      names.pop();
    } else if (char === '/') {
      const nextChar = sourceStartsWithDestructuring[index + 1];

      if (nextChar === '/') {
        isInsideSinglelineComment = true;
        index += 1;
      } else if (nextChar === '*') {
        isInsideMultilineComment = true;
        index += 1;
      }
    } else if (char in identifierStartCharacters) {
      const nameIndex = parseIdentifier(sourceStartsWithDestructuring.slice(index));

      if (nameIndex === 0) {
        return;
      }

      names.push(sourceStartsWithDestructuring.slice(index, index + nameIndex));

      index += nameIndex - 1;
    }
  }

  return;
};

/**
 * Parses string literal after `from` at the end of the source string.
 */
export const parseFrom = (
  quoteCharacter: string,
  sourceWithString: string,
): Readonly<{from: string; index: number}> => {
  let hasBackslash = false;
  let index = sourceWithString.length - 1;

  for (; index >= 0; index -= 1) {
    const character = sourceWithString[index];

    if (character === '\\') {
      hasBackslash = true;
    }

    if (character === quoteCharacter && sourceWithString[index - 1] !== '\\') {
      break;
    }
  }

  let from = sourceWithString.slice(index + 1);

  if (hasBackslash) {
    from = from.replace(backslashesRegExp, stripFirstCharacter);
  }

  return {from, index};
};

/**
 * Parses identifier from the start of the source string.
 */
export const parseIdentifier = (sourceStartsWithIdentifier: string): number => {
  if (!identifierStartCharacters[sourceStartsWithIdentifier[0]!]) {
    return 0;
  }

  for (let index = 1; index < sourceStartsWithIdentifier.length; index += 1) {
    if (!identifierCharacters[sourceStartsWithIdentifier[index]!]) {
      return index;
    }
  }

  return 0;
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
