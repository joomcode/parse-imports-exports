import {parseFrom, parseWith} from './partParsers.js';
import {addError, getPosition, spacesRegExp, stripComments} from './utils.js';

import type {
  ExcludeUndefined,
  MutableImportsExports,
  Name,
  Names,
  NamedImport,
  NamespaceImport,
  OnParse,
  With,
} from './types';

/**
 * Adds error of parsing `import` statement.
 */
export const onImportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  _source,
  {start, end},
) => addError(importsExports, 'Cannot find end of `import` statement', start, end);

/**
 * Parses `import` statement.
 */
export const onImportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start, end: unparsedStart, comments},
  {start: unparsedEnd, end: importEnd, match: endMatch, token: endToken},
) => {
  var end = importEnd;
  var unparsed = stripComments(source, unparsedStart, unparsedEnd, comments);
  const quoteCharacter = endToken[0]!;

  const {from, index} = parseFrom(quoteCharacter, unparsed);

  if (index === -1) {
    return addError(
      importsExports,
      'Cannot find start of `from` string literal of import',
      start,
      end,
    );
  }

  unparsed = unparsed.slice(0, index).trim().replace(spacesRegExp, ' ');

  var isType = false;

  if (unparsed.startsWith('type ')) {
    isType = true;
    unparsed = unparsed.slice(5);
  }

  if (unparsed.endsWith(' from')) {
    unparsed = unparsed.slice(0, -5);
  }

  var withAttributes: With | undefined;

  if (endMatch.groups!['with'] !== undefined) {
    if (isType) {
      return addError(
        importsExports,
        `Cannot use import attributes (\`with {...}\`) in \`import type\` statement for import from \`${from}\``,
        start,
        end,
      );
    }

    const attributes = parseWith(importEnd, source);

    if (attributes === undefined) {
      return addError(
        importsExports,
        `Cannot find end of import attributes (\`with {...}\`) in \`import\` statement for import from \`${from}\``,
        start,
        end,
      );
    }

    end = attributes.endIndex;
    withAttributes = attributes.with;

    if (withAttributes === undefined) {
      return addError(
        importsExports,
        `Cannot parse import attributes (\`with {...}\`) in \`import\` statement for import from \`${from}\``,
        start,
        end,
      );
    }
  }

  const position = getPosition(importsExports, start, end);

  const parsedImport: NamedImport | NamespaceImport =
    withAttributes === undefined ? position : {...position, with: withAttributes};

  const namespaceIndex = unparsed.indexOf('* as ');
  var key: 'namedImports' | 'namespaceImports' | 'typeNamedImports' | 'typeNamespaceImports' =
    'namedImports';

  if (namespaceIndex === -1) {
    const braceIndex = unparsed.indexOf('{');

    if (braceIndex !== -1) {
      let namesString = unparsed.slice(braceIndex + 1);
      const braceCloseIndex = namesString.lastIndexOf('}');

      unparsed = unparsed.slice(0, braceIndex);

      if (braceCloseIndex === -1) {
        return addError(
          importsExports,
          `Cannot find end of imports list (\`}\`) for import from \`${from}\``,
          start,
          end,
        );
      }

      namesString = namesString.slice(0, braceCloseIndex).trim();

      const namesList = namesString.split(',') as Name[];

      let names: Names | undefined;
      let types: Names | undefined;

      for (let name of namesList) {
        let isTypeName = false;

        name = name.trim() as Name;

        if (name === '') {
          continue;
        }

        const nameObject: Names[Name] = {};

        if (name.startsWith('type ')) {
          if (isType) {
            return addError(
              importsExports,
              `Cannot use \`type\` modifier in \`import type\` statement for type \`${name.slice(
                5,
              )}\` for import from \`${from}\``,
              start,
              end,
            );
          }

          isTypeName = true;
          name = name.slice(5) as Name;
        }

        const asIndex = name.indexOf(' as ');

        if (asIndex !== -1) {
          nameObject.by = name.slice(0, asIndex) as Name;

          name = name.slice(asIndex + 4) as Name;
        }

        if (isTypeName) {
          if (types === undefined) {
            types = {__proto__: null} as Names;
          } else if (name in types) {
            return addError(
              importsExports,
              `Duplicate imported type \`${name}\` for import from \`${from}\``,
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
              `Duplicate imported name \`${name}\` for import from \`${from}\``,
              start,
              end,
            );
          }

          names[name] = nameObject;
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
    (parsedImport as NamespaceImport).namespace = unparsed.slice(namespaceIndex + 5) as Name;
    key = 'namespaceImports';

    unparsed = unparsed.slice(0, namespaceIndex);
  }

  const commaIndex = unparsed.indexOf(',');

  if (commaIndex !== -1) {
    unparsed = unparsed.slice(0, commaIndex).trim();
  } else {
    unparsed = unparsed.trim();
  }

  if (unparsed !== '') {
    if (isType && key === 'namespaceImports') {
      return addError(
        importsExports,
        `Cannot use default \`${unparsed}\` and namespace \`${
          (parsedImport as NamespaceImport).namespace
        }\` together in \`import type\` statement for import from \`${from}\``,
        start,
        end,
      );
    }

    parsedImport.default = unparsed as Name;
  }

  if (isType) {
    key = key === 'namedImports' ? 'typeNamedImports' : 'typeNamespaceImports';
  }

  var imports = importsExports[key];

  imports ??= importsExports[key] = {__proto__: null} as ExcludeUndefined<typeof imports>;

  var importsList = imports[from];

  if (importsList === undefined) {
    imports[from] = [parsedImport];
  } else {
    (importsList as [NamedImport]).push(parsedImport);
  }

  return end;
};
