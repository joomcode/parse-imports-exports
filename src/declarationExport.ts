import {parseDestructuring, parseFrom, parseIdentifier} from './partParsers.js';
import {addError, getPosition, stripComments} from './utils.js';

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
  _source,
  {start, end},
) => addError(importsExports, 'Cannot find end of export with declaration', start, end);

/**
 * Parses `export` statement with declaration.
 */
export const onDeclarationExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start, end: unparsedStart, comments},
  {start: unparsedEnd, end},
) => {
  var isDeclare = false;
  var increasedExportEnd: number | undefined = undefined;
  var isType = false;
  var unparsed = stripComments(source, unparsedStart, unparsedEnd, comments).trim();

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
        start,
        end,
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
          start,
          end,
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
        start,
        end,
      );
    }

    unparsed = unparsed.slice(0, -1);

    const {from, index} = parseFrom(quoteCharacter, unparsed);

    if (index < 0) {
      return addError(
        importsExports,
        'Cannot find start of `from` string literal of reexport',
        start,
        end,
      );
    }

    const parsedReexport: NamespaceReexport | StarReexport = getPosition(
      importsExports,
      start,
      end,
    );

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
      start,
      end,
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
      return addError(importsExports, `Duplicate exported type \`${identifier}\``, start, end);
    }

    typeExports[identifier as Name] = getPosition(importsExports, start, end);

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
        start,
        end,
      );
    }

    if (importsExports.defaultExport !== undefined) {
      return addError(importsExports, 'Duplicate default export', start, end);
    }

    importsExports.defaultExport = getPosition(importsExports, start, end);

    return;
  }

  unparsed = unparsed.slice(identifierIndex).trim();

  if (identifier === 'interface') {
    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      return addError(
        importsExports,
        `Cannot parse interface identifier of \`export ${modifiers}interface ...\` statement`,
        start,
        end,
      );
    }

    const name = unparsed.slice(0, nameIndex) as Name;

    let {interfaceExports} = importsExports;

    interfaceExports ??= importsExports.interfaceExports = {__proto__: null} as ExcludeUndefined<
      typeof interfaceExports
    >;

    let exportsList = interfaceExports[name];

    exportsList ??= interfaceExports[name] = [];

    const interfaceExport: ExcludeUndefined<typeof exportsList>[number] = getPosition(
      importsExports,
      start,
      end,
    );

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
        start,
        end,
      );
    }

    const name = unparsed.slice(0, nameIndex) as Name;

    let {namespaceExports} = importsExports;

    namespaceExports ??= importsExports.namespaceExports = {__proto__: null} as ExcludeUndefined<
      typeof namespaceExports
    >;

    let exportsList = namespaceExports[name];

    exportsList ??= namespaceExports[name] = [];

    const namespaceExport: ExcludeUndefined<typeof exportsList>[number] = getPosition(
      importsExports,
      start,
      end,
    );

    if (isDeclare) {
      namespaceExport.isDeclare = true;
    }

    (exportsList as object[]).push(namespaceExport);

    return;
  }

  var isAsync = false;
  var kind: Kind | undefined;
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
        const destructuring = parseDestructuring(unparsed + source.slice(end));

        if (destructuring === undefined) {
          return addError(
            importsExports,
            `Cannot parse destructuring names in \`export ${modifiers}${identifier} ...\` statement`,
            start,
            end,
          );
        }

        const endDiff = destructuring.endIndex - unparsed.length;

        if (endDiff > 0) {
          increasedExportEnd = endDiff + end;
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
          start,
          end,
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
            start,
            end,
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
          start,
          end,
        );
      }

      unparsed = unparsed.slice(5).trim();

      const abstractClassNameIndex = parseIdentifier(unparsed);

      if (abstractClassNameIndex === 0) {
        return addError(
          importsExports,
          `Cannot parse \`${identifier}\` identifier of \`export ${modifiers}abstract class ${identifier} ...\` statement`,
          start,
          end,
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
          start,
          end,
        );
      }

      if (unparsed.startsWith('function') === false) {
        return addError(
          importsExports,
          'Cannot parse async function in `export async ...` statement',
          start,
          end,
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
            start,
            end,
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
          start,
          end,
        );
      }

      names[0] = unparsed.slice(0, functionNameIndex) as Name;
      break;

    default:
      return addError(
        importsExports,
        `Cannot parse \`export ${modifiers}${identifier} ...\` statement`,
        start,
        end,
      );
  }

  var {declarationExports} = importsExports;

  declarationExports ??= importsExports.declarationExports = {
    __proto__: null,
  } as ExcludeUndefined<typeof declarationExports>;

  for (const name of names) {
    if (name in declarationExports) {
      return addError(
        importsExports,
        `Duplicate exported declaration \`${kind} ${name}\``,
        start,
        increasedExportEnd ?? end,
      );
    }

    declarationExports[name!] = {
      ...getPosition(importsExports, start, increasedExportEnd ?? end),
      kind: kind!,
    };
  }

  return increasedExportEnd;
};
