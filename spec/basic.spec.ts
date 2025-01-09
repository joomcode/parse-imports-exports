import {parseImportsExports} from '../src/index.js';

import {
  assert,
  assertEqualExceptNumbers,
  end,
  getNumberOfKeysWithDefinedValues,
  start,
} from './utils.js';

import type {LineColumn, Name, Path} from '../src';

const firstChar = '1:1' as LineColumn;

export const testBasic = (): void => {
  assert(typeof parseImportsExports('') === 'object', 'returns an object for empty source');

  assert(
    getNumberOfKeysWithDefinedValues(parseImportsExports('foo')) === 0,
    'returns an empty object for source without imports/exports',
  );

  const withImportError = parseImportsExports('import something;');

  assert(
    getNumberOfKeysWithDefinedValues(withImportError) === 1 &&
      Object.keys(withImportError.errors!).length === 1 &&
      withImportError.errors![firstChar]!.startsWith('Cannot find end of `import` statement:'),
    'returns correct error of parsing import statement',
  );

  const withExportError = parseImportsExports('export type {something;');

  assert(
    getNumberOfKeysWithDefinedValues(withExportError) === 1 &&
      Object.keys(withExportError.errors!).length === 1 &&
      withExportError.errors![firstChar]!.startsWith(
        'Cannot find end of `export type {...} ...` statement:',
      ),
    'returns correct error of parsing named export statement',
  );

  const singleImport = parseImportsExports('qux\nimport {foo} from "bar"');

  assertEqualExceptNumbers(
    singleImport,
    {namedImports: {bar: [{start, end, names: {foo: {}}}]}},
    'returns expected single import',
  );

  const singleNamedExport = parseImportsExports('qux\nexport {foo, type bar as qux};');

  assertEqualExceptNumbers(
    singleNamedExport,
    {namedExports: [{start, end, names: {foo: {}}, types: {qux: {by: 'bar'}}}]},
    'returns expected single export',
  );

  const withoutRequire = parseImportsExports(
    `
const foo = require('foo');

const bar = await import('bar');
`,
    {ignoreRequires: true},
  );

  assert(withoutRequire.requires === undefined, 'respects parse option `ignoreRequires`');

  const withoutCommonJsExports = parseImportsExports(
    `
module.exports = 1;

export default 2;
`,
    {ignoreCommonJsExports: true},
  );

  assert(
    withoutCommonJsExports.commonJsNamespaceExport === undefined,
    'respects parse option `ignoreCommonJsExports`',
  );

  assert(
    Array.isArray(withoutRequire.dynamicImports?.['bar' as Path]) &&
      withoutRequire.errors === undefined &&
      withoutCommonJsExports.defaultExport !== undefined &&
      withoutCommonJsExports.errors === undefined,
    'parses unignored statements',
  );

  const withCommonJs = parseImportsExports(`
exports.foo = void 0;

exports.bar = 3;
exports.foo = 8;

exports.baz = exports.qux = void 0;

exports.baz = 12
`);

  assert(
    withCommonJs.errors === undefined &&
      withCommonJs.commonJsExports?.['foo' as Name]?.start! > 0 &&
      withCommonJs.commonJsExports?.['baz' as Name]?.start! > 0,
    'respects transpiler-generated CommonJS scripts',
  );

  const withCommonJsErrors = parseImportsExports(`
exports.foo = void 0;

exports.bar = 3;
module.exports.foo = 8;

module.exports.baz = exports.qux = void 0;

exports.baz = 12
`);

  assert(
    Object.keys(withCommonJsErrors.errors || {}).length === 2,
    'returns errors in transpiler-generated CommonJS scripts',
  );

  const requireWithComments = parseImportsExports(`
const foo = require( /* some 'comment' */ 'bar'/* also "comment" */);
`);

  assert(
    requireWithComments.errors === undefined &&
      requireWithComments.requires?.['bar' as Path] !== undefined,
    'parses "require" with comments inside',
  );

  const importWithComments = parseImportsExports(`
const foo = import( 'bar' /* 'comment" */)
`);

  assert(
    importWithComments.errors === undefined &&
      importWithComments.dynamicImports?.['bar' as Path] !== undefined,
    'parses "import(...)" with comments inside',
  );

  const typeImportWithComments = parseImportsExports(`
type Foo = typeof import(/* some
 "comment' */"baz" /* also 'comment" */)
`);

  assert(
    typeImportWithComments.errors === undefined &&
      typeImportWithComments.typeDynamicImports?.['baz' as Path] !== undefined,
    'parses "typeof import" with comments inside',
  );

  const importWithError = parseImportsExports(`
const foo = import( /* 'comment"
 */"qux' /* 'comment" */);
`);

  const errorKey = Object.keys(importWithError.errors ?? {})[0] as LineColumn;

  assert(
    importWithError.errors?.[errorKey]?.split(':')[0] ===
      "Cannot find start of path string literal of dynamic `import('...')`" &&
      importWithComments.dynamicImports?.['qux' as Path] === undefined,
    'find error in "import(...)" with comments inside',
  );

  const backtickString = parseImportsExports(
    "const path = createPath(`${lang ? `/${lang}` : '}'}/products\\`/require('foo')`)",
  );

  assert(
    backtickString.errors === undefined && backtickString.requires === undefined,
    'parsed nested string literal started with backtick',
  );
};
