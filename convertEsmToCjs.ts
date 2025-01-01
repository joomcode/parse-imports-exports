/**
 * @file Creates CJS files from each JS file in the directories.
 */

// @ts-expect-error
import * as nodeFs from 'node:fs';
import * as nodePath from 'node:path';

// @ts-expect-error
const nodeJsProcess = process as {argv: string[]};

const {readFileSync, readdirSync, writeFileSync} = nodeFs as {
  readdirSync: (
    path: string,
    options?: {encoding: 'utf8'; recursive?: boolean},
  ) => readonly string[];
  readFileSync: (path: string, options: {encoding: 'utf8'}) => string;
  writeFileSync: (path: string, data: string) => void;
};

const {join} = nodePath as {join: (...paths: readonly string[]) => string};

const paths = nodeJsProcess.argv.slice(2);

if (paths.length === 0) {
  paths.push('.');
}

/**
 * Replaces `.js` file extension to `.cjs`.
 */
const replaceExtension = (fileName: string): string => fileName.replace('.js', '.cjs');

for (const path of paths) {
  const fileNames = readdirSync(path, {encoding: 'utf8', recursive: true});

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.js')) {
      continue;
    }

    const filePath = join(path, fileName);
    let fileContent = readFileSync(filePath, {encoding: 'utf8'});

    fileContent = fileContent.replace(
      /^import {([^}]+)} from ([^;]*);/gim,
      (_match, names, modulePath) =>
        `const {${names.replaceAll(' as ', ': ')}} = require(${replaceExtension(modulePath)});`,
    );

    fileContent = fileContent.replace(
      /^export {([^}]+)} from ([^;]*);/gim,
      (_match, names, modulePath) =>
        `{\nconst {${names}} = require(${replaceExtension(modulePath)});\nObject.assign(exports, {${names}});\n};`,
    );

    fileContent = fileContent.replace(
      /^export const ([^ ]+) /gim,
      (_match, name) => `const ${name} = exports.${name} `,
    );

    fileContent = `'use strict';\n${fileContent}`;

    const newFilePath = replaceExtension(filePath);

    writeFileSync(newFilePath, fileContent);
  }
}
