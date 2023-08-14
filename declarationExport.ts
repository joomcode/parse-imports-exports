import {addError, parseFrom, parseIdentifier, stripComments} from './utils';

import type {Kind, MutableImportsExports, NamespaceReexport, OnParse, StarReexport} from './types';

/**
 * Adds error of parsing `export` statement with declaration.
 */
export const onDeclarationExportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start},
) => addError(importsExports, 'Cannot find end of export with declaration', start);

/**
 * Parses `export` statement with declaration.
 */
export const onDeclarationExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: exportStart, end: unparsedStart, comments},
  {start: unparsedEnd, end: exportEnd},
) => {
  let isType = false;
  let unparsed = stripComments(source, unparsedStart, unparsedEnd, comments).trim();

  if (unparsed.startsWith('type ')) {
    isType = true;
    unparsed = unparsed.slice(5).trim();
  }

  if (unparsed[0] === '*') {
    let namespace: string | undefined;

    if (unparsed.startsWith('* as ')) {
      unparsed = unparsed.slice(5).trim();

      const spaceIndex = unparsed.indexOf(' ');

      if (spaceIndex < 0) {
        addError(
          importsExports,
          `Cannot find namespace of \`export ${isType ? 'type ' : ''}* as ... from ...\` statement`,
          exportStart,
        );

        return;
      }

      namespace = unparsed.slice(0, spaceIndex);
      unparsed = unparsed.slice(spaceIndex + 1);
    }

    if (unparsed[unparsed.length - 1] === ';') {
      unparsed = unparsed.slice(0, -1).trim();
    }

    const quoteCharacter = unparsed[unparsed.length - 1];

    if (quoteCharacter !== "'" && quoteCharacter !== '"') {
      addError(importsExports, 'Cannot find end of `from` string literal of reexport', exportStart);

      return;
    }

    unparsed = unparsed.slice(0, -1);

    const {from, index} = parseFrom(quoteCharacter, unparsed);

    if (index < 0) {
      addError(
        importsExports,
        'Cannot find start of `from` string literal of reexport',
        exportStart,
      );

      return;
    }

    const parsedReexport: NamespaceReexport | StarReexport = {start: exportStart, end: exportEnd};

    let key:
      | 'namespaceReexports'
      | 'starReexports'
      | 'typeNamespaceReexports'
      | 'typeStarReexports' = 'starReexports';

    if (namespace !== undefined) {
      (parsedReexport as NamespaceReexport).namespace = namespace;
      key = 'namespaceReexports';
    }

    if (isType) {
      key = key === 'starReexports' ? 'typeStarReexports' : 'typeNamespaceReexports';
    }

    let reexports = importsExports[key];

    if (reexports === undefined) {
      reexports = importsExports[key] = {};
    }

    let reexportsList = reexports[from];

    if (Array.isArray(reexportsList) === false) {
      reexportsList = [];

      if (from === '__proto__') {
        Object.defineProperty(reexports, '__proto__', {
          configurable: true,
          enumerable: true,
          value: reexportsList,
          writable: true,
        });
      } else {
        reexports[from] = reexportsList;
      }
    }

    (reexportsList as object[]).push(parsedReexport);

    return;
  }

  const identifierIndex = parseIdentifier(unparsed);

  if (identifierIndex === 0) {
    addError(
      importsExports,
      `Cannot parse declaration identifier of \`export ${isType ? 'type ' : ''}...\` statement`,
      exportStart,
    );

    return;
  }

  const identifier = unparsed.slice(0, identifierIndex);

  if (isType) {
    let {typeExports} = importsExports;

    if (typeExports === undefined) {
      typeExports = importsExports.typeExports = {};
    } else if (
      typeof typeExports[identifier] === 'object' &&
      (identifier !== '__proto__' || Object.prototype.hasOwnProperty.call(typeExports, '__proto__'))
    ) {
      addError(importsExports, `Duplicate exported type \`${identifier}\``, exportStart);

      return;
    }

    if (identifier === '__proto__') {
      Object.defineProperty(typeExports, '__proto__', {
        configurable: true,
        enumerable: true,
        value: {start: exportStart, end: exportEnd},
        writable: true,
      });
    } else {
      typeExports[identifier] = {start: exportStart, end: exportEnd};
    }

    return;
  }

  if (identifier === 'default') {
    if (importsExports.defaultExport !== undefined) {
      addError(importsExports, 'Duplicate default export', exportStart);

      return;
    }

    importsExports.defaultExport = {start: exportStart, end: exportEnd};

    return;
  }

  unparsed = unparsed.slice(identifierIndex).trim();

  if (identifier === 'interface') {
    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      addError(
        importsExports,
        'Cannot parse interface identifier of `export interface ...` statement',
        exportStart,
      );

      return;
    }

    const name = unparsed.slice(0, nameIndex);

    let {interfaceExports} = importsExports;

    if (interfaceExports === undefined) {
      interfaceExports = importsExports.interfaceExports = {};
    }

    let exportsList = interfaceExports[name];

    if (Array.isArray(exportsList) === false) {
      exportsList = [];

      if (name === '__proto__') {
        Object.defineProperty(interfaceExports, '__proto__', {
          configurable: true,
          enumerable: true,
          value: exportsList,
          writable: true,
        });
      } else {
        interfaceExports[name] = exportsList;
      }
    }

    (exportsList as object[]).push({start: exportStart, end: exportEnd});

    return;
  }

  if (identifier === 'namespace') {
    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      addError(
        importsExports,
        'Cannot parse namespace identifier of `export namespace ...` statement',
        exportStart,
      );

      return;
    }

    const name = unparsed.slice(0, nameIndex);

    let {namespaceExports} = importsExports;

    if (namespaceExports === undefined) {
      namespaceExports = importsExports.namespaceExports = {};
    }

    let exportsList = namespaceExports[name];

    if (Array.isArray(exportsList) === false) {
      exportsList = [];

      if (name === '__proto__') {
        Object.defineProperty(namespaceExports, '__proto__', {
          configurable: true,
          enumerable: true,
          value: exportsList,
          writable: true,
        });
      } else {
        namespaceExports[name] = exportsList;
      }
    }

    (exportsList as object[]).push({start: exportStart, end: exportEnd});

    return;
  }

  let isAsync = false;
  let kind: Kind | undefined;
  let name: string | undefined;

  switch (identifier) {
    case 'const':
    case 'class':
    case 'let':
    case 'var':
      const nameIndex = parseIdentifier(unparsed);

      if (nameIndex === 0) {
        addError(
          importsExports,
          `Cannot parse \`${identifier}\` identifier of \`export ${identifier} ...\` statement`,
          exportStart,
        );

        return;
      }

      kind = identifier;
      name = unparsed.slice(0, nameIndex);
      break;

    // @ts-expect-error
    case 'async':
      if (unparsed.startsWith('function') === false) {
        addError(
          importsExports,
          'Cannot parse async function in `export async ...` statement',
          exportStart,
        );

        return;
      }

      isAsync = true;
      unparsed = unparsed.slice(8).trim();

    case 'function':
      if (unparsed[0] === '*') {
        unparsed = unparsed.slice(1).trim();
        kind = 'function*';
      } else {
        kind = 'function';
      }

      if (isAsync) {
        kind = `async ${kind}`;
      }

      const functionNameIndex = parseIdentifier(unparsed);

      if (functionNameIndex === 0) {
        addError(
          importsExports,
          `Cannot parse \`${kind}\` identifier of \`export ${kind} ...\` statement`,
          exportStart,
        );

        return;
      }

      name = unparsed.slice(0, functionNameIndex);
      break;

    default:
      addError(importsExports, `Cannot parse \`export ${identifier} ...\` statement`, exportStart);

      return;
  }

  let {declarationExports} = importsExports;

  if (declarationExports === undefined) {
    importsExports.declarationExports = declarationExports = {};
  } else if (
    typeof declarationExports[name!] === 'object' &&
    (name !== '__proto__' || Object.prototype.hasOwnProperty.call(declarationExports, '__proto__'))
  ) {
    addError(importsExports, `Duplicate exported declaration \`${kind} ${name}\``, exportStart);

    return;
  }

  if (name === '__proto__') {
    Object.defineProperty(declarationExports, '__proto__', {
      configurable: true,
      enumerable: true,
      value: {start: exportStart, end: exportEnd, kind: kind!},
      writable: true,
    });
  } else {
    declarationExports[name!] = {start: exportStart, end: exportEnd, kind: kind!};
  }
};
