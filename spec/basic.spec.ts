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
      "Cannot find start of path string literal of dynamic `import('...')` from `\"qux`" &&
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

  const withLineColumn = parseImportsExports('import {foo} from "bar"', {includeLineColumn: true});
  const positionWithLineColumn = withLineColumn.namedImports?.['bar' as Path]?.[0];

  assert(
    positionWithLineColumn?.startLineColumn === firstChar &&
      typeof positionWithLineColumn?.endLineColumn === 'string',
    'respects parse option `includeLineColumn`',
  );

  const importWithEmptyAttributes = parseImportsExports('import foo from "bar" with {};');

  assert(
    Object.keys(importWithEmptyAttributes.namedImports?.['bar' as Path]?.[0]?.with!).length === 0 &&
      importWithEmptyAttributes.errors === undefined,
    'parses empty import attributes',
  );

  const dynamicImportWithAttributes = parseImportsExports(
    'const foo = await import("qux",  { with: { type : "json" }})',
  );

  assert(
    dynamicImportWithAttributes.errors === undefined &&
      dynamicImportWithAttributes.dynamicImports?.['qux' as Path] !== undefined,
    'parses "import(...)" with import attributes without errors',
  );

  assertEqualExceptNumbers(
    dynamicImportWithAttributes,
    {dynamicImports: {qux: [{start, end, with: {type: 'json'}}]}},
    'parses import attributes in dynamic imports',
  );

  const dynamicImportWithAttributesWithError = parseImportsExports(
    'import("bar", {with: { type: "json");',
  );

  assert(
    getNumberOfKeysWithDefinedValues(dynamicImportWithAttributesWithError) === 1 &&
      dynamicImportWithAttributesWithError.errors![firstChar]!.startsWith(
        `Cannot find end of import attributes (\`with: {...}\`) in dynamic \`import("...")\` from \`bar\``,
      ),
    'returns correct error of finding end in import attributes for dynamic import',
  );

  const importWithAttributes = parseImportsExports('import qux from "bar" with { type: "json" }');

  assert(
    importWithAttributes.namedImports?.['bar' as Path]?.[0]?.with?.['type'] === 'json' &&
      importWithAttributes.errors === undefined,
    'parses one import attribute',
  );

  const importWithManyAttributes = parseImportsExports(
    `import {
  style
} from 'bar' with {"type":'css'  ,  'value' :  ' some ' }`,
  );

  assertEqualExceptNumbers(
    importWithManyAttributes,
    {namedImports: {bar: [{start, end, with: {type: 'css', value: ' some '}, names: {style: {}}}]}},
    'parses many import attributes',
  );

  const importWithAttributesWithError = parseImportsExports(
    'import qux from "bar" with { type: "json";',
  );

  assert(
    getNumberOfKeysWithDefinedValues(importWithAttributesWithError) === 1 &&
      importWithAttributesWithError.errors![firstChar]!.startsWith(
        `Cannot find end of import attributes (\`with {...}\`) in \`import\` statement for import from \`bar\``,
      ),
    'returns correct error of finding end in import attributes',
  );

  const namedReexportWithEmptyAttributes = parseImportsExports('export {foo} from "bar" with {}');

  assert(
    Object.keys(namedReexportWithEmptyAttributes.namedReexports?.['bar' as Path]?.[0]?.with!)
      .length === 0 && namedReexportWithEmptyAttributes.errors === undefined,
    'parses empty import attributes for named reexport',
  );

  const namedReexportWithAttributes = parseImportsExports(
    'export { qux } from "bar" with {type :  "json"};',
  );

  assert(
    namedReexportWithAttributes.namedReexports?.['bar' as Path]?.[0]?.with?.['type'] === 'json' &&
      namedReexportWithAttributes.errors === undefined,
    'parses one import attribute for named reexport',
  );

  const namedReexportWithManyAttributes = parseImportsExports(
    `export {
  style
} from 'bar' with { "type" :'css' ,  'value':  ' some '};`,
  );

  assertEqualExceptNumbers(
    namedReexportWithManyAttributes,
    {
      namedReexports: {
        bar: [{start, end, names: {style: {}}, with: {type: 'css', value: ' some '}}],
      },
    },
    'parses many import attributes for named reexport',
  );

  const namedReexportWithAttributesWithError = parseImportsExports(
    'export {qux} from "bar" with { type: "json";',
  );

  assert(
    getNumberOfKeysWithDefinedValues(namedReexportWithAttributesWithError) === 1 &&
      namedReexportWithAttributesWithError.errors![firstChar]!.startsWith(
        `Cannot find end of import attributes (\`with {...}\`) for reexport from \`bar\``,
      ),
    'returns correct error of finding end in import attributes for named reexport',
  );

  const declarationReexportWithEmptyAttributes = parseImportsExports('export * from "bar" with {}');

  assert(
    Object.keys(declarationReexportWithEmptyAttributes.starReexports?.['bar' as Path]?.[0]?.with!)
      .length === 0 && declarationReexportWithEmptyAttributes.errors === undefined,
    'parses empty import attributes for declaration reexport',
  );

  const declarationReexportWithAttributes = parseImportsExports(
    `export * as 'qux' from "bar" with {type :  "json"};`,
  );

  assert(
    declarationReexportWithAttributes.namespaceReexports?.['bar' as Path]?.[0]?.with?.['type'] ===
      'json' && declarationReexportWithAttributes.errors === undefined,
    'parses one import attribute for declaration reexport',
  );

  const declarationReexportWithManyAttributes = parseImportsExports(
    `export * as style from 'bar' with { "type" :'css' ,  'value':  ' some '};`,
  );

  assertEqualExceptNumbers(
    declarationReexportWithManyAttributes,
    {
      namespaceReexports: {
        bar: [{start, end, with: {type: 'css', value: ' some '}, namespace: 'style'}],
      },
    },
    'parses many import attributes for declaration reexport',
  );

  const declarationReexportWithAttributesWithError = parseImportsExports(
    'export * from "bar" with { type: "json";',
  );

  assert(
    getNumberOfKeysWithDefinedValues(declarationReexportWithAttributesWithError) === 1 &&
      declarationReexportWithAttributesWithError.errors![firstChar]!.startsWith(
        `Cannot find end of import attributes (\`with {...}\`) for star reexport from \`bar\``,
      ),
    'returns correct error of finding end in import attributes declaration reexport',
  );
};
