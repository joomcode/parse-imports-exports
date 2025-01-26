import {parseFrom} from './partParsers.js';
import {addError, getPosition, spacesRegExp, stripComments} from './utils.js';

import type {
  ExcludeUndefined,
  MutableImportsExports,
  Name,
  Names,
  NamedExport,
  OnParse,
  Path,
  TypeNamedExport,
} from './types';

/**
 * Adds error of parsing named `export` statement.
 */
export const onNamedExportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start, end, match: {groups}},
) =>
  addError(
    importsExports,
    `Cannot find end of \`export ${
      groups!['type'] === undefined ? '' : 'type '
    }{...} ...\` statement`,
    start,
    end,
  );

/**
 * Parses named `export` statement.
 */
export const onNamedExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start, end: unparsedStart, comments, match: startMatch},
  {start: unparsedEnd, end, match: endMatch},
) => {
  var maybeFrom: Path | undefined;
  var unparsed = stripComments(source, unparsedStart, unparsedEnd, comments);
  const {quote} = endMatch.groups as {quote?: string};

  if (quote !== undefined) {
    const {from, index} = parseFrom(quote[0]!, unparsed);

    if (index < 0) {
      return addError(
        importsExports,
        'Cannot find start of `from` string literal of reexport',
        start,
        end,
      );
    }

    maybeFrom = from;
    unparsed = unparsed.slice(0, index);

    const braceCloseIndex = unparsed.lastIndexOf('}');

    if (braceCloseIndex < 0) {
      return addError(
        importsExports,
        `Cannot find end of reexports list (\`}\`) for reexport from \`${maybeFrom}\``,
        start,
        end,
      );
    }

    unparsed = unparsed.slice(0, braceCloseIndex);
  }

  const namedExport: NamedExport | TypeNamedExport = getPosition(importsExports, start, end);
  var isTypeExport = false;

  if (startMatch.groups!['type'] !== undefined) {
    isTypeExport = true;
  }

  const namesString = unparsed.trim().replace(spacesRegExp, ' ');
  const namesList = namesString.split(',') as Name[];

  var names: Names | undefined;
  var types: Names | undefined;

  for (let name of namesList) {
    let isType = false;

    name = name.trim() as Name;

    if (name === '') {
      continue;
    }

    const nameObject: Names[Name] = {};

    if (name.startsWith('type ')) {
      if (isTypeExport) {
        return addError(
          importsExports,
          `Cannot use \`type\` modifier in \`export type {...}\` statement for type \`${name.slice(
            5,
          )}\`${maybeFrom === undefined ? '' : ` for reexport from \`${maybeFrom}\``}`,
          start,
          end,
        );
      }

      isType = true;
      name = name.slice(5) as Name;
    }

    const asIndex = name.indexOf(' as ');

    if (asIndex >= 0) {
      nameObject.by = name.slice(0, asIndex) as Name;

      name = name.slice(asIndex + 4) as Name;
    }

    if (isType) {
      if (types === undefined) {
        types = {__proto__: null} as Names;
      } else if (name in types) {
        return addError(
          importsExports,
          `Duplicate exported type \`${name}\` ${
            maybeFrom === undefined ? 'in named export' : `for reexport from \`${maybeFrom}\``
          }`,
          start,
          end,
        );
      }

      types[name] = nameObject;
    } else {
      if (names === undefined) {
        names = {__proto__: null} as Names;
      } else if (name in names) {
        return addError(
          importsExports,
          `Duplicate exported name \`${name}\` ${
            maybeFrom === undefined ? 'in named export' : `for reexport from \`${maybeFrom}\``
          }`,
          start,
          end,
        );
      }

      names[name] = nameObject;
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

    exports ??= importsExports[key] = [];

    (exports as NamedExport[]).push(namedExport);
  } else {
    const key = isTypeExport ? 'typeNamedReexports' : 'namedReexports';
    let reexports = importsExports[key];

    reexports ??= importsExports[key] = {__proto__: null} as ExcludeUndefined<typeof reexports>;

    let reexportsList = reexports[maybeFrom];

    reexportsList ??= reexports[maybeFrom] = [];

    (reexportsList as object[]).push(namedExport);
  }
};
