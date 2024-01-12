import {parseImportsExports} from '../src/index';

import {assertEqualExceptNumbers, end, start} from './utils';

export const testDocExamples = (): void => {
  const importsExportsDocExamples = parseImportsExports(`
/**
 * Imports.
 */
// {Qux: [{start: 17, end: 58, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]}
import {foo as baz, type Bar} from 'Qux';

// {Qux: [{start: 80, end: 112, namespace: 'foo', default: 'Foo'}]}
import Foo, * as foo from 'Qux';

// {Qux: [{start: 114, end: 127}]}
const foo = await import('Qux');

// {Qux: [{start: 128, end, 134}]}
const foo = require('Qux');

// {Qux: [{start: 137, end: 141}]}
type Foo = typeof import('Qux');

// {Qux: [{start: 142, end: 175, names: {Baz: {by: 'Foo'}, Bar: {}}}]}
import type {Foo as Baz, Bar} from 'Qux';

// {Qux: [{start: 201, end: 233, namespace: 'Foo'}]}
import type * as Foo from 'Qux';

/**
 * Reexports.
 */
// {Qux: [{start: 254, end: 295, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]}
export {foo as baz, type Bar} from 'Qux';

// {Qux: [{start: 319, end: 346, namespace: 'foo'}]}
export * as foo from 'Qux';

// {Qux: [{start: 365, end: 385}]}
export * from 'Qux';

// {Qux: [{start: 409, end: 450, names: {Baz: {by: 'Foo'}, Bar: {}}}]}
export type {Foo as Baz, Bar} from 'Qux';

// {Qux: [{start: 478, end: 510, namespace: 'Foo'}]}
export type * as Foo from 'Qux';

// {Qux: [{start: 533, end: 558}]}
export type * from 'Qux';

/**
 * Exports.
 */
// {start: 578, end: 596}
export default 42;

// [{start: 614, end: 644, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]
export {foo as baz, type Bar};

// {foo: {start: 668, end: 689, kind: 'const'}}
export const foo = 2;

// [{start: 711, end: 741, names: {Baz: {by: 'Foo'}, Bar: {}}}]
export type {Foo as Baz, Bar};

// {T: {start: 758, end: 781}}
export type T = number;

// {I: [{start: 803, end: 836}]}
export interface I {foo: number};

// {N: [{start: 858, end: 891}]}
export namespace N {foo: number};

// {start: 901, end: 915}
module.exports = 42;

// {foo: {start: 917, end: 931, startsWithModule: true}}
module.exports.foo = 2;
`);

  assertEqualExceptNumbers(
    importsExportsDocExamples,
    {
      /**
       * Imports.
       */
      // import {foo as baz, type Bar} from 'Qux';
      namedImports: {Qux: [{start, end, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]},

      // import Foo, * as foo from 'Qux';
      namespaceImports: {Qux: [{start, end, namespace: 'foo', default: 'Foo'}]},

      // const foo = await import('Qux');
      dynamicImports: {Qux: [{start, end}]},

      // const foo = require('Qux');
      requires: {Qux: [{start, end}]},

      // type Foo = typeof import('Qux');
      typeDynamicImports: {Qux: [{start, end}]},

      // import type {Foo as Baz, Bar} from 'Qux';
      typeNamedImports: {Qux: [{start, end, names: {Baz: {by: 'Foo'}, Bar: {}}}]},

      // import type * as Foo from 'Qux';
      typeNamespaceImports: {Qux: [{start, end, namespace: 'Foo'}]},

      /**
       * Reexports.
       */
      // export {foo as baz, type Bar} from 'Qux';
      namedReexports: {Qux: [{start, end, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]},

      // export * as foo from 'Qux';
      namespaceReexports: {Qux: [{start, end, namespace: 'foo'}]},

      // export * from 'Qux';
      starReexports: {Qux: [{start, end}]},

      // export type {Foo as Baz, Bar} from 'Qux';
      typeNamedReexports: {Qux: [{start, end, names: {Baz: {by: 'Foo'}, Bar: {}}}]},

      // export type * as Foo from 'Qux';
      typeNamespaceReexports: {Qux: [{start, end, namespace: 'Foo'}]},

      // export type * from 'Qux';
      typeStarReexports: {Qux: [{start, end}]},

      /**
       * Exports.
       */
      // export default 42;
      defaultExport: {start, end},

      // export {foo as baz, type Bar};
      namedExports: [{start, end, names: {baz: {by: 'foo'}}, types: {Bar: {}}}],

      // export const foo = 2;
      declarationExports: {foo: {start, end, kind: 'const'}},

      // export type {Foo as Baz, Bar};
      typeNamedExports: [{start, end, names: {Baz: {by: 'Foo'}, Bar: {}}}],

      // export type T = number;
      typeExports: {T: {start, end}},

      // export interface I {foo: number};
      interfaceExports: {I: [{start, end}]},

      // export namespace N {foo: number};
      namespaceExports: {N: [{start, end}]},

      // module.exports = 42;
      commonJsNamespaceExport: {start, end},

      // module.exports.foo = 2;
      commonJsExports: {foo: {start, end, startsWithModule: true}},
    },
    'returns expected results for all base statements',
  );
};
