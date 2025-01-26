import {parseIdentifier} from './partParsers.js';
import {addError, getPosition, stripComments} from './utils.js';

import type {ExcludeUndefined, MutableImportsExports, Name, OnParse} from './types';

/**
 * Adds error of parsing `module.exports = ...`/`(module.)exports.foo = ...` statement.
 */
export const onCommonJsExportError: OnParse<MutableImportsExports, 1> = (
  importsExports,
  source,
  {start, end, token},
) =>
  addError(
    importsExports,
    `Cannot find end (equal sign) of \`${token[0] === 'm' ? 'module.' : ''}exports${
      source[end] === '.' ? '.' : ''
    }... = ...\` statement`,
    start,
    end,
  );

/**
 * Parses `module.exports = ...`/`(module.)exports.foo = ...` statement.
 */
export const onCommonJsExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start, end: unparsedStart, comments, token},
  {start: unparsedEnd, end},
) => {
  var unparsed = stripComments(source, unparsedStart, unparsedEnd, comments).trim();
  const startsWithModule = token[0] === 'm';

  if (unparsed[0] === '.') {
    unparsed = unparsed.slice(1).trim();

    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      return addError(
        importsExports,
        `Cannot parse identifier of \`${token}.... = ...\` statement`,
        start,
        end,
      );
    }

    const name = unparsed.slice(0, nameIndex) as Name;

    let {commonJsExports} = importsExports;

    if (commonJsExports === undefined) {
      importsExports.commonJsExports = commonJsExports = {__proto__: null} as ExcludeUndefined<
        typeof commonJsExports
      >;
    } else if (name in commonJsExports) {
      const firstExport = commonJsExports[name]!;
      let isTranspilerExport = false;

      if (startsWithModule === false && firstExport.startsWithModule === undefined) {
        const firstExportEnd = firstExport.end;
        const afterFirstExport = source.slice(firstExportEnd, firstExportEnd + 9);

        isTranspilerExport = afterFirstExport === ' exports.' || afterFirstExport === ' void 0;\n';
      }

      if (isTranspilerExport === false) {
        return addError(
          importsExports,
          `Duplicate exported name \`${name}\` in \`${token}.... = ...\` statement`,
          start,
          end,
        );
      }
    }

    const position = getPosition(importsExports, start, end);

    commonJsExports[name] = startsWithModule ? {...position, startsWithModule} : position;

    return;
  }

  if (startsWithModule === false) {
    return addError(
      importsExports,
      `\`${token} = ...\` is not valid CommonJS namespace export (use \`module.exports = ...\` instead)`,
      start,
      end,
    );
  }

  if (importsExports.commonJsNamespaceExport !== undefined) {
    return addError(
      importsExports,
      `Duplicate CommonJS namespace export (\`${token} = ...\`)`,
      start,
      end,
    );
  }

  importsExports.commonJsNamespaceExport = getPosition(importsExports, start, end);
};
