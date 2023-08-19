import type {CommentPair, MutableImportsExports, OnCommentError, OnGlobalError} from './types';

/**
 * Adds some parse error to parse results.
 */
export const addError = (
  importsExports: MutableImportsExports,
  message: string,
  index: number,
): void => {
  let {errors} = importsExports;

  if (errors === undefined) {
    errors = {};
    importsExports.errors = errors;
  }

  errors[index] = errors[index] === undefined ? message : `${errors[index]}\n${message}`;
};

/**
 * Regexp that find all backslashes.
 */
const backslashesRegExp = /\\+/g;

/**
 * Hash with start characters of identifiers.
 */
const identifierStartCharacters: Record<string, true> = {};

for (const character of 'abcdefghijklmnopqrstuvwxyz_$') {
  identifierStartCharacters[character] = true;
  identifierStartCharacters[character.toUpperCase()] = true;
}

/**
 * Hash with characters of identifiers.
 */
const identifierCharacters: Record<string, true> = {...identifierStartCharacters};

for (const character of '0123456789') {
  identifierCharacters[character] = true;
}

/**
 * Strips first character from string.
 */
const stripFirstCharacter = (someString: string) => someString.slice(1);

export {createParseFunction} from 'parse-statements';

/**
 * Adds global error of parsing source.
 */
export const onGlobalError: OnGlobalError<MutableImportsExports> = (
  importsExports,
  _source,
  message,
  index,
) => addError(importsExports, message, index);

/**
 * Adds error of parsing multiline comment.
 */
export const onMultilineCommentError: OnCommentError<MutableImportsExports> = (
  importsExports,
  _source,
  {start},
) => addError(importsExports, 'Cannot find end of multiline comment', start);

/**
 * Adds error of parsing singleline comment.
 */
export const onSinglelineCommentError: OnCommentError<MutableImportsExports> = (
  importsExports,
  _source,
  {start},
) => addError(importsExports, 'Cannot find end of singleline comment', start);

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
