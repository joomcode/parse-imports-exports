import {addError, parseFrom, spacesRegexp, stripComments} from './utils';

import type {MutableImportsExports, Names, NamedImport, NamespaceImport, OnParse} from './types';

/**
 * Adds error of parsing `import` statement.
 */
export const onImportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start},
) => addError(importsExports, 'Cannot find end of `import` statement', start);

/**
 * Parses `import` statement.
 */
export const onImportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: importStart, end: unparsedStart, comments},
  {start: unparsedEnd, end: importEnd, token: endToken},
) => {
  let unparsed = stripComments(source, unparsedStart, unparsedEnd, comments);
  const quoteCharacter = endToken[0]!;

  const {from, index} = parseFrom(quoteCharacter, unparsed);

  if (index < 0) {
    addError(importsExports, 'Cannot find start of `from` string literal of import', importStart);

    return;
  }

  const parsedImport: NamedImport | NamespaceImport = {start: importStart, end: importEnd};

  unparsed = unparsed.slice(0, index).trim().replace(spacesRegexp, ' ');

  let isTypeImport = false;

  if (unparsed.startsWith('type ')) {
    isTypeImport = true;
    unparsed = unparsed.slice(5);
  }

  if (unparsed.endsWith(' from')) {
    unparsed = unparsed.slice(0, -5);
  }

  const namespaceIndex = unparsed.indexOf('* as ');
  let key: 'namedImports' | 'namespaceImports' | 'typeNamedImports' | 'typeNamespaceImports' =
    'namedImports';

  if (namespaceIndex < 0) {
    const braceIndex = unparsed.indexOf('{');

    if (braceIndex >= 0) {
      let namesString = unparsed.slice(braceIndex + 1);
      const braceCloseIndex = namesString.lastIndexOf('}');

      unparsed = unparsed.slice(0, braceIndex);

      if (braceCloseIndex < 0) {
        addError(
          importsExports,
          `Cannot find end of imports list (\`}\`) for import from \`${from}\``,
          importStart,
        );

        return;
      }

      namesString = namesString.slice(0, braceCloseIndex).trim();

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
          if (isTypeImport) {
            addError(
              importsExports,
              `Cannot use \`type\` modifier in \`import type\` statement for type \`${name.slice(
                5,
              )}\` for import from \`${from}\``,
              importStart,
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
              `Duplicate imported type \`${name}\` for import from \`${from}\``,
              importStart,
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
              `Duplicate imported name \`${name}\` for import from \`${from}\``,
              importStart,
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
        (parsedImport as NamedImport).names = names;
      }

      if (types !== undefined) {
        (parsedImport as NamedImport).types = types;
      }
    }
  } else {
    (parsedImport as NamespaceImport).namespace = unparsed.slice(namespaceIndex + 5);
    key = 'namespaceImports';

    unparsed = unparsed.slice(0, namespaceIndex);
  }

  const commaIndex = unparsed.indexOf(',');

  if (commaIndex >= 0) {
    unparsed = unparsed.slice(0, commaIndex).trim();
  } else {
    unparsed = unparsed.trim();
  }

  if (unparsed !== '') {
    if (isTypeImport && key === 'namespaceImports') {
      addError(
        importsExports,
        `Cannot use default \`${unparsed}\` and namespace \`${
          (parsedImport as NamespaceImport).namespace
        }\` together in \`import type\` statement for import from \`${from}\``,
        importStart,
      );

      return;
    }

    parsedImport.default = unparsed;
  }

  if (isTypeImport) {
    key = key === 'namedImports' ? 'typeNamedImports' : 'typeNamespaceImports';
  }

  let imports = importsExports[key];

  if (imports === undefined) {
    imports = importsExports[key] = {};
  }

  let importsList = imports[from];

  if (Array.isArray(importsList) === false) {
    importsList = [];

    if (from === '__proto__') {
      Object.defineProperty(imports, '__proto__', {
        configurable: true,
        enumerable: true,
        value: importsList,
        writable: true,
      });
    } else {
      imports[from] = importsList;
    }
  }

  (importsList as object[]).push(parsedImport);
};
