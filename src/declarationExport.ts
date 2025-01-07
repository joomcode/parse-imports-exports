import {parseDestructuring, parseFrom, parseIdentifier} from './partParsers.js';
import {addError, stripComments} from './utils.js';

import type {
  ExcludeUndefined,
  Kind,
  MutableImportsExports,
  Name,
  NamespaceReexport,
  OnParse,
  StarReexport,
} from './types';

/**
 * Adds error of parsing `export` statement with declaration.
 */
export const onDeclarationExportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end},
) => addError(importsExports, 'Cannot find end of export with declaration', source, start, end);

/**
 * Parses `export` statement with declaration.
 */
export const onDeclarationExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: exportStart, end: unparsedStart, comments},
  {start: unparsedEnd, end: exportEnd},
) => {
  let isDeclare = false;
  let increasedExportEnd: number | undefined = undefined;
  let isType = false;
  let unparsed = stripComments(source, unparsedStart, unparsedEnd, comments).trim();

  if (unparsed.startsWith('declare ')) {
    isDeclare = true;
    unparsed = unparsed.slice(8).trim();
  }

  if (unparsed.startsWith('type ')) {
    isType = true;
    unparsed = unparsed.slice(5).trim();
  }

  const modifiers = `${isDeclare ? 'declare ' : ''}${isType ? 'type ' : ''}`;

  if (unparsed[0] === '*') {
    if (isDeclare) {
      return addError(
        importsExports,
        `Cannot declare star export (\`export ${modifiers}* ... from ...\`)`,
        source,
        exportStart,
        exportEnd,
      );
    }

    let namespace: Name | undefined;

    if (unparsed.startsWith('* as ')) {
      unparsed = unparsed.slice(5).trim();

      const spaceIndex = unparsed.indexOf(' ');

      if (spaceIndex < 0) {
        return addError(
          importsExports,
          `Cannot find namespace of \`export ${modifiers}* as ... from ...\` statement`,
          source,
          exportStart,
          exportEnd,
        );
      }

      namespace = unparsed.slice(0, spaceIndex) as Name;
      unparsed = unparsed.slice(spaceIndex + 1);
    }

    if (unparsed[unparsed.length - 1] === ';') {
      unparsed = unparsed.slice(0, -1).trim();
    }

    const quoteCharacter = unparsed[unparsed.length - 1];

    if (quoteCharacter !== "'" && quoteCharacter !== '"') {
      return addError(
        importsExports,
        'Cannot find end of `from` string literal of reexport',
        source,
        exportStart,
        exportEnd,
      );
    }

    unparsed = unparsed.slice(0, -1);

    const {from, index} = parseFrom(quoteCharacter, unparsed);

    if (index < 0) {
      return addError(
        importsExports,
        'Cannot find start of `from` string literal of reexport',
        source,
        exportStart,
        exportEnd,
      );
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

    reexports ??= importsExports[key] = {__proto__: null} as ExcludeUndefined<typeof reexports>;

    let reexportsList = reexports[from];

    reexportsList ??= reexports[from] = [];

    (reexportsList as object[]).push(parsedReexport);

    return;
  }

  const identifierIndex = parseIdentifier(unparsed);

  if (identifierIndex === 0) {
    return addError(
      importsExports,
      `Cannot parse declaration identifier of \`export ${modifiers}...\` statement`,
      source,
      exportStart,
      exportEnd,
    );
  }

  const identifier = unparsed.slice(0, identifierIndex);

  if (isType) {
    let {typeExports} = importsExports;

    if (typeExports === undefined) {
      importsExports.typeExports = typeExports = {__proto__: null} as ExcludeUndefined<
        typeof typeExports
      >;
    } else if (identifier in typeExports) {
      return addError(
        importsExports,
        `Duplicate exported type \`${identifier}\``,
        source,
        exportStart,
        exportEnd,
      );
    }

    typeExports[identifier as Name] = {start: exportStart, end: exportEnd};

    if (isDeclare) {
      typeExports[identifier as Name]!.isDeclare = true;
    }

    return;
  }

  if (identifier === 'default') {
    if (isDeclare) {
      return addError(
        importsExports,
        `Cannot export default with declare (\`export ${modifiers}default ...\`)`,
        source,
        exportStart,
        exportEnd,
      );
    }

    if (importsExports.defaultExport !== undefined) {
      return addError(importsExports, 'Duplicate default export', source, exportStart, exportEnd);
    }

    importsExports.defaultExport = {start: exportStart, end: exportEnd};

    return;
  }

  unparsed = unparsed.slice(identifierIndex).trim();

  if (identifier === 'interface') {
    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      return addError(
        importsExports,
        `Cannot parse interface identifier of \`export ${modifiers}interface ...\` statement`,
        source,
        exportStart,
        exportEnd,
      );
    }

    const name = unparsed.slice(0, nameIndex) as Name;

    let {interfaceExports} = importsExports;

    interfaceExports ??= importsExports.interfaceExports = {__proto__: null} as ExcludeUndefined<
      typeof interfaceExports
    >;

    let exportsList = interfaceExports[name];

    exportsList ??= interfaceExports[name] = [];

    const interfaceExport: ExcludeUndefined<typeof exportsList>[number] = {
      start: exportStart,
      end: exportEnd,
    };

    if (isDeclare) {
      interfaceExport.isDeclare = true;
    }

    (exportsList as object[]).push(interfaceExport);

    return;
  }

  if (identifier === 'namespace') {
    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      return addError(
        importsExports,
        `Cannot parse namespace identifier of \`export ${modifiers}namespace ...\` statement`,
        source,
        exportStart,
        exportEnd,
      );
    }

    const name = unparsed.slice(0, nameIndex) as Name;

    let {namespaceExports} = importsExports;

    namespaceExports ??= importsExports.namespaceExports = {__proto__: null} as ExcludeUndefined<
      typeof namespaceExports
    >;

    let exportsList = namespaceExports[name];

    exportsList ??= namespaceExports[name] = [];

    const namespaceExport: ExcludeUndefined<typeof exportsList>[number] = {
      start: exportStart,
      end: exportEnd,
    };

    if (isDeclare) {
      namespaceExport.isDeclare = true;
    }

    (exportsList as object[]).push(namespaceExport);

    return;
  }

  let isAsync = false;
  let kind: Kind | undefined;
  const names: Name[] = [];

  switch (identifier) {
    case 'const':
    case 'class':
    case 'enum':
    case 'let':
    case 'var':
      if (
        (identifier === 'const' || identifier === 'let' || identifier === 'var') &&
        (unparsed[0] === '{' || unparsed[0] === '[')
      ) {
        const destructuring = parseDestructuring(`${unparsed}${source.slice(exportEnd)}`);

        if (destructuring === undefined) {
          return addError(
            importsExports,
            `Cannot parse destructuring names in \`export ${modifiers}${identifier} ...\` statement`,
            source,
            exportStart,
            exportEnd,
          );
        }

        const exportEndDiff = destructuring.endIndex - unparsed.length;

        if (exportEndDiff > 0) {
          increasedExportEnd = exportEndDiff + exportEnd;
        }

        names.push(...destructuring.names);

        kind = `destructuring ${identifier}`;

        if (isDeclare) {
          kind = `declare ${kind}`;
        }

        break;
      }

      const nameIndex = parseIdentifier(unparsed);

      if (nameIndex === 0) {
        return addError(
          importsExports,
          `Cannot parse \`${identifier}\` identifier of \`export ${modifiers}${identifier} ...\` statement`,
          source,
          exportStart,
          exportEnd,
        );
      }

      kind = identifier;

      if (isDeclare) {
        kind = `declare ${kind}`;
      }

      names[0] = unparsed.slice(0, nameIndex) as Name;

      if (identifier === 'const' && names[0] === 'enum') {
        unparsed = unparsed.slice(4).trim();

        const constEnumNameIndex = parseIdentifier(unparsed);

        if (constEnumNameIndex === 0) {
          return addError(
            importsExports,
            `Cannot parse identifier of \`export ${modifiers}const enum ...\` statement`,
            source,
            exportStart,
            exportEnd,
          );
        }

        kind = 'const enum';

        if (isDeclare) {
          kind = `declare ${kind}`;
        }

        names[0] = unparsed.slice(0, constEnumNameIndex) as Name;
      }

      break;

    case 'abstract':
      if (!unparsed.startsWith('class ')) {
        return addError(
          importsExports,
          `Cannot parse declaration of abstract class of \`export ${modifiers}abstract ...\` statement`,
          source,
          exportStart,
          exportEnd,
        );
      }

      unparsed = unparsed.slice(5).trim();

      const abstractClassNameIndex = parseIdentifier(unparsed);

      if (abstractClassNameIndex === 0) {
        return addError(
          importsExports,
          `Cannot parse \`${identifier}\` identifier of \`export ${modifiers}abstract class ${identifier} ...\` statement`,
          source,
          exportStart,
          exportEnd,
        );
      }

      kind = 'abstract class';

      if (isDeclare) {
        kind = `declare ${kind}`;
      }

      names[0] = unparsed.slice(0, abstractClassNameIndex) as Name;
      break;

    // @ts-expect-error
    case 'async':
      if (isDeclare) {
        return addError(
          importsExports,
          `Cannot export async function with declare (\`export ${modifiers}async ...\`)`,
          source,
          exportStart,
          exportEnd,
        );
      }

      if (unparsed.startsWith('function') === false) {
        return addError(
          importsExports,
          'Cannot parse async function in `export async ...` statement',
          source,
          exportStart,
          exportEnd,
        );
      }

      isAsync = true;
      unparsed = unparsed.slice(8).trim();

    case 'function':
      if (unparsed[0] === '*') {
        if (isDeclare) {
          return addError(
            importsExports,
            `Cannot export generator function with declare (\`export ${modifiers}function* ...\`)`,
            source,
            exportStart,
            exportEnd,
          );
        }

        unparsed = unparsed.slice(1).trim();
        kind = 'function*';
      } else {
        kind = 'function';
      }

      if (isAsync) {
        kind = `async ${kind}`;
      } else if (isDeclare) {
        kind = 'declare function';
      }

      const functionNameIndex = parseIdentifier(unparsed);

      if (functionNameIndex === 0) {
        return addError(
          importsExports,
          `Cannot parse \`${kind}\` identifier of \`export ${modifiers}${kind} ...\` statement`,
          source,
          exportStart,
          exportEnd,
        );
      }

      names[0] = unparsed.slice(0, functionNameIndex) as Name;
      break;

    default:
      return addError(
        importsExports,
        `Cannot parse \`export ${modifiers}${identifier} ...\` statement`,
        source,
        exportStart,
        exportEnd,
      );
  }

  let {declarationExports} = importsExports;

  declarationExports ??= importsExports.declarationExports = {
    __proto__: null,
  } as ExcludeUndefined<typeof declarationExports>;

  for (const name of names) {
    if (name in declarationExports) {
      return addError(
        importsExports,
        `Duplicate exported declaration \`${kind} ${name}\``,
        source,
        exportStart,
        exportEnd,
      );
    }

    declarationExports[name!] = {start: exportStart, end: exportEnd, kind: kind!};
  }

  return increasedExportEnd;
};
