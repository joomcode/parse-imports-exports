import {addError, parseFrom, spacesRegexp, stripComments} from './utils';

import type {MutableImportsExports, Names, NamedExport, OnParse, TypeNamedExport} from './types';

/**
 * Adds error of parsing named `export` statement.
 */
export const onNamedExportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start, match: {groups}},
) =>
  addError(
    importsExports,
    `Cannot find end of \`export ${
      groups!['type'] === undefined ? '' : 'type '
    }{...} ...\` statement`,
    start,
  );

/**
 * Parses named `export` statement.
 */
export const onNamedExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: exportStart, end: unparsedStart, comments, match: startMatch},
  {start: unparsedEnd, end: exportEnd, match: endMatch},
) => {
  let maybeFrom: string | undefined;
  let unparsed = stripComments(source, unparsedStart, unparsedEnd, comments);
  const {quote} = endMatch.groups as {quote?: string};

  if (quote !== undefined) {
    const {from, index} = parseFrom(quote[0]!, unparsed);

    if (index < 0) {
      addError(
        importsExports,
        'Cannot find start of `from` string literal of reexport',
        exportStart,
      );

      return;
    }

    maybeFrom = from;
    unparsed = unparsed.slice(0, index);

    const braceCloseIndex = unparsed.lastIndexOf('}');

    if (braceCloseIndex < 0) {
      addError(
        importsExports,
        `Cannot find end of reexports list (\`}\`) for reexport from \`${maybeFrom}\``,
        exportStart,
      );

      return;
    }

    unparsed = unparsed.slice(0, braceCloseIndex);
  }

  const namedExport: NamedExport | TypeNamedExport = {start: exportStart, end: exportEnd};
  let isTypeExport = false;

  if (startMatch.groups!['type'] !== undefined) {
    isTypeExport = true;
  }

  const namesString = unparsed.trim().replace(spacesRegexp, ' ');
  const namesList = namesString.split(',');

  let names: Names | undefined;
  let types: Names | undefined;

  for (let name of namesList) {
    let isType = false;

    name = name.trim();

    if (name === '') {
      continue;
    }

    const nameObject: Names[string] = {};

    if (name.startsWith('type ')) {
      if (isTypeExport) {
        addError(
          importsExports,
          `Cannot use \`type\` modifier in \`export type {...}\` statement for type \`${name.slice(
            5,
          )}\`${maybeFrom === undefined ? '' : ` for reexport from \`${maybeFrom}\``}`,
          exportStart,
        );

        return;
      }

      isType = true;
      name = name.slice(5);
    }

    const asIndex = name.indexOf(' as ');

    if (asIndex >= 0) {
      nameObject.by = name.slice(0, asIndex);

      name = name.slice(asIndex + 4);
    }

    if (isType) {
      if (types === undefined) {
        types = {};
      } else if (
        typeof types[name] === 'object' &&
        (name !== '__proto__' || Object.prototype.hasOwnProperty.call(types, '__proto__'))
      ) {
        addError(
          importsExports,
          `Duplicate exported type \`${name}\` ${
            maybeFrom === undefined ? 'in named export' : `for reexport from \`${maybeFrom}\``
          }`,
          exportStart,
        );

        return;
      }

      if (name === '__proto__') {
        Object.defineProperty(types, '__proto__', {
          configurable: true,
          enumerable: true,
          value: nameObject,
          writable: true,
        });
      } else {
        types[name] = nameObject;
      }
    } else {
      if (names === undefined) {
        names = {};
      } else if (
        typeof names[name] === 'object' &&
        (name !== '__proto__' || Object.prototype.hasOwnProperty.call(names, '__proto__'))
      ) {
        addError(
          importsExports,
          `Duplicate exported name \`${name}\` ${
            maybeFrom === undefined ? 'in named export' : `for reexport from \`${maybeFrom}\``
          }`,
          exportStart,
        );

        return;
      }

      if (name === '__proto__') {
        Object.defineProperty(names, '__proto__', {
          configurable: true,
          enumerable: true,
          value: nameObject,
          writable: true,
        });
      } else {
        names[name] = nameObject;
      }
    }
  }

  if (names !== undefined) {
    namedExport.names = names;
  }

  if (types !== undefined) {
    (namedExport as NamedExport).types = types;
  }

  if (maybeFrom === undefined) {
    const key = isTypeExport ? 'typeNamedExports' : 'namedExports';
    let exports = importsExports[key];

    if (exports === undefined) {
      exports = importsExports[key] = [];
    }

    (exports as NamedExport[]).push(namedExport);
  } else {
    const key = isTypeExport ? 'typeNamedReexports' : 'namedReexports';
    let reexports = importsExports[key];

    if (reexports === undefined) {
      reexports = importsExports[key] = {};
    }

    let reexportsList = reexports[maybeFrom];

    if (Array.isArray(reexportsList) === false) {
      reexportsList = [];

      if (maybeFrom === '__proto__') {
        Object.defineProperty(reexports, '__proto__', {
          configurable: true,
          enumerable: true,
          value: reexportsList,
          writable: true,
        });
      } else {
        reexports[maybeFrom] = reexportsList;
      }
    }

    (reexportsList as object[]).push(namedExport);
  }
};
