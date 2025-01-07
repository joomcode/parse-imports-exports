import {join} from 'node:path';

import {
  assert,
  assertObjectWithParsedContentHasNoErrors,
  getContentOfFilesInDirectory,
  parseContentInObjectValues,
} from './utils.js';

import type {Name, Path} from '../src';

export const testRealworldExamples = async (): Promise<void> => {
  const typescriptDirectory = join('node_modules', 'typescript', 'lib');

  const typescriptFiles = await getContentOfFilesInDirectory(
    typescriptDirectory,
    (fileName) => fileName.endsWith('.js') && !fileName.startsWith('tsserverlibrary'),
  );

  const typescriptParsedContent = parseContentInObjectValues(typescriptFiles);

  assertObjectWithParsedContentHasNoErrors(typescriptParsedContent, 'typescript');

  for (const key of Object.keys(typescriptParsedContent)) {
    const parsedContent = typescriptParsedContent[key]!;

    if (key === 'tsc.js' || key === 'tsserver.js' || key === 'typingsInstaller.js') {
      continue;
    }

    if (Array.isArray(parsedContent.requires!['fs' as Path]) === false) {
      assert(false, `\`${key}\` has require \`fs\``);
    }
  }

  const parseStatementsDirectory = join('node_modules', 'parse-statements');

  const parseStatementsFiles = await getContentOfFilesInDirectory(
    parseStatementsDirectory,
    (fileName) => fileName.endsWith('.js') || fileName.endsWith('.ts'),
  );

  const parseStatementsContent = parseContentInObjectValues(parseStatementsFiles);

  assertObjectWithParsedContentHasNoErrors(parseStatementsContent, 'parse-statements');

  assert(
    parseStatementsContent['index.js']?.declarationExports?.[
      'createParseFunction' as Name
    ] instanceof Object,
    'correctly parses `createParseFunction` from `parse-statements`',
  );

  const prettierDirectory = join('node_modules', 'prettier');

  const prettierFiles = await getContentOfFilesInDirectory(
    prettierDirectory,
    (fileName) =>
      fileName.endsWith('.cjs') ||
      fileName.endsWith('.ts') ||
      (fileName.endsWith('.mjs') && !fileName.startsWith('standalone')),
  );

  const prettierContent = parseContentInObjectValues(prettierFiles);

  assertObjectWithParsedContentHasNoErrors(prettierContent, 'prettier');

  assert(
    typeof prettierContent['index.mjs']!.dynamicImports === 'object' &&
      typeof prettierContent['index.mjs']!.namedExports === 'object' &&
      prettierContent['index.cjs']!.commonJsNamespaceExport instanceof Object,
    'correctly parses `prettier` source files',
  );

  const prettierInternalDirectory = join(prettierDirectory, 'internal');

  const prettierInternalFiles = await getContentOfFilesInDirectory(
    prettierInternalDirectory,
    () => true,
  );

  const prettierInternalContent = parseContentInObjectValues(prettierInternalFiles);

  assertObjectWithParsedContentHasNoErrors(prettierInternalContent, 'prettier/internal');

  assert(
    typeof prettierInternalContent['cli.mjs']!.namedImports === 'object' &&
      typeof prettierInternalContent['cli.mjs']!.namedExports === 'object',
    'correctly parses `prettier/internal` source files',
  );
};
