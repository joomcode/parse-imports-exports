import {parseIdentifier} from './partParsers';
import {addError, stripComments} from './utils';

import type {ExcludeUndefined, MutableImportsExports, OnParse} from './types';

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
    source,
    start,
    end,
  );

/**
 * Parses `module.exports = ...`/`(module.)exports.foo = ...` statement.
 */
export const onCommonJsExportParse: OnParse<MutableImportsExports, 2> = (
  importsExports,
  source,
  {start: exportStart, end: unparsedStart, comments, token},
  {start: unparsedEnd, end: exportEnd},
) => {
  let unparsed = stripComments(source, unparsedStart, unparsedEnd, comments).trim();
  const startsWithModule = token[0] === 'm';

  if (unparsed[0] === '.') {
    unparsed = unparsed.slice(1).trim();

    const nameIndex = parseIdentifier(unparsed);

    if (nameIndex === 0) {
      return addError(
        importsExports,
        `Cannot parse identifier of \`${token}.... = ...\` statement`,
        source,
        exportStart,
        exportEnd,
      );
    }

    const name = unparsed.slice(0, nameIndex);

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
          source,
          exportStart,
          exportEnd,
        );
      }
    }

    commonJsExports[name] = startsWithModule
      ? {start: exportStart, end: exportEnd, startsWithModule}
      : {start: exportStart, end: exportEnd};

    return;
  }

  if (startsWithModule === false) {
    return addError(
      importsExports,
      `\`${token} = ...\` is not valid CommonJS namespace export (use \`module.exports = ...\` instead)`,
      source,
      exportStart,
      exportEnd,
    );
  }

  if (importsExports.commonJsNamespaceExport !== undefined) {
    return addError(
      importsExports,
      `Duplicate CommonJS namespace export (\`${token} = ...\`)`,
      source,
      exportStart,
      exportEnd,
    );
  }

  importsExports.commonJsNamespaceExport = {start: exportStart, end: exportEnd};
};
