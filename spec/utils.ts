import {readdir, readFile} from 'node:fs/promises';
import {join} from 'node:path';

import {type ImportsExports, parseImportsExports} from '../src/index.js';

import './types.js';

/**
 * Asserts that value is `true`.
 */
export function assert(value: boolean, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  testsCount += 1;

  console.log(' ✅', message);
}

type AssertEqualExceptNumbers = (actual: object, expected: object, message: string) => void;

/**
 * Asserts that two objects are equivalent, except perhaps for numeric values.
 */
export const assertEqualExceptNumbers: AssertEqualExceptNumbers = (actual, expected, message) => {
  let originalErrors: Record<string, string> | undefined;

  if ('errors' in actual && actual.errors != null) {
    originalErrors = actual.errors as Record<string, string>;

    const errors = {__proto__: null} as unknown as Record<string, string>;

    for (const key in originalErrors) {
      errors[key] = originalErrors[key]!.split(':\n')[0]!;
    }

    actual.errors = errors;
  }

  const actualJson = JSON.stringify(actual)
    .replace(/\d+/g, '0')
    .replace(/__proto__/g, 'PROTO');

  if (originalErrors !== undefined) {
    // @ts-expect-error
    actual.errors = originalErrors;
  }

  const expectedJson = JSON.stringify(expected)
    .replace(/\d+/g, '0')
    .replace(/__proto__/g, 'PROTO');

  for (let index = 0; index < actualJson.length; index += 1) {
    if (actualJson[index] !== expectedJson[index]) {
      assert(
        false,
        `${message}.\nactual:\n${actualJson.slice(
          index - 50,
          index + 500,
        )}\nexpected:\n${expectedJson.slice(index - 50, index + 500)}`,
      );
    }
  }

  assert(true, message);
};

/**
 * Asserts that the object with the parsed content in fields has no errors.
 */
export const assertObjectWithParsedContentHasNoErrors = (
  objectWithParsedContent: Readonly<Record<string, ImportsExports>>,
  objectName: string,
): void => {
  for (const key of Object.keys(objectWithParsedContent)) {
    const parsedContent = objectWithParsedContent[key]!;

    if (parsedContent.errors !== undefined) {
      assert(false, `\`${objectName}\` has no parse errors`);
    }
  }

  assert(true, `\`${objectName}\` has no parse errors`);
};

export const end = 0;

/**
 * Get object with content of files in directory.
 * Object keys are file names, and values are file contents.
 * Files filtered by names by `filterFilesbynames` function.
 */
export const getContentOfFilesInDirectory = async (
  pathToDirectory: string,
  filterFilesByNames: (fileName: string) => boolean,
): Promise<Readonly<Record<string, string>>> => {
  const fileNames = await readdir(pathToDirectory);

  const filteredFileNames = fileNames.filter(filterFilesByNames);

  const contentOfFiles: Record<string, string> = {};

  for (const fileName of filteredFileNames) {
    const pathToFile = join(pathToDirectory, fileName);

    const content = await readFile(pathToFile, READ_FILE_OPTIONS);

    contentOfFiles[fileName] = content;
  }

  return contentOfFiles;
};

/**
 * Get number of object keys with defined values.
 */
export const getNumberOfKeysWithDefinedValues = (someObject: object): number => {
  let numberOfKeys = 0;

  for (const value of Object.values(someObject)) {
    if (value !== undefined) {
      numberOfKeys += 1;
    }
  }

  return numberOfKeys;
};

type Ok = (message: string) => void;

/**
 * Print development `ok` message.
 */
export const ok: Ok = (message) => console.log(`\x1B[32m[OK]\x1B[39m ${message}`);

/**
 * Parses values of object properties, and returns object with same shape.
 */
export const parseContentInObjectValues = (
  objectWithContents: Readonly<Record<string, string>>,
): Readonly<Record<string, ImportsExports>> => {
  const objectWithParsedContent: Record<string, ImportsExports> = {};

  for (const key of Object.keys(objectWithContents)) {
    const content = objectWithContents[key]!;
    const parsedContent = parseImportsExports(content);

    objectWithParsedContent[key] = parsedContent;
  }

  return objectWithParsedContent;
};

export const start = 0;

export let testsCount = 0;

const READ_FILE_OPTIONS = {encoding: 'utf8'} as const;
