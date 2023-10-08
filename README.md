# parse-imports-exports

[![NPM version][npm-image]][npm-url]
[![minzipped size][size-image]][size-url]
[![code style: prettier][prettier-image]][prettier-url]
[![Conventional Commits][conventional-commits-image]][conventional-commits-url]
[![License MIT][license-image]][license-url]

Fast and easy parser for declarations of [import](https://tc39.es/ecma262/#prod-ImportDeclaration)
and [export](https://tc39.es/ecma262/#prod-ExportDeclaration) from the ECMAScript standard,
with [TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html) syntax support.

`parse-imports-exports` works for syntactically correct, well-formatted code (for example, by [prettier][prettier-url]).
Single-line and multi-line ECMAScript comments in `import`/`export` statements are supported.

## Basic example

Imagine a module with the following content:

```ts
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
export interface I {
  foo: number;
}

// {N: [{start: 858, end: 891}]}
export namespace N {
  foo: number;
}
```

Let its content be stored as a string in the variable `source`.
Then it can be parsed like this:

```ts
import {parseImportsExports} from 'parse-imports-exports';

const importsExports = parseImportsExports(source);

// Now `importsExports` has the following shape (the `start` and `end` indices, which indicate
// the beginning and end of the corresponding statement in the source, may differ):
const importsExportsShape = {
  /**
   * Imports.
   */
  // import {foo as baz, type Bar} from 'Qux';
  namedImports: {Qux: [{start: 17, end: 58, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]},

  // import Foo, * as foo from 'Qux';
  namespaceImports: {Qux: [{start: 80, end: 112, namespace: 'foo', default: 'Foo'}]},

  // const foo = await import('Qux');
  dynamicImports: {Qux: [{start: 114, end: 127}]},

  // const foo = require('Qux');
  requires: {Qux: [{start: 128, end: 134}]},

  // type Foo = typeof import('Qux');
  typeDynamicImports: {Qux: [{start: 137, end: 141}]},

  // import type {Foo as Baz, Bar} from 'Qux';
  typeNamedImports: {Qux: [{start: 142, end: 175, names: {Baz: {by: 'Foo'}, Bar: {}}}]},

  // import type * as Foo from 'Qux';
  typeNamespaceImports: {Qux: [{start: 201, end: 233, namespace: 'Foo'}]},

  /**
   * Reexports.
   */
  // export {foo as baz, type Bar} from 'Qux';
  namedReexports: {Qux: [{start: 254, end: 295, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]},

  // export * as foo from 'Qux';
  namespaceReexports: {Qux: [{start: 319, end: 346, namespace: 'foo'}]},

  // export * from 'Qux';
  starReexports: {Qux: [{start: 365, end: 385}]},

  // export type {Foo as Baz, Bar} from 'Qux';
  typeNamedReexports: {Qux: [{start: 409, end: 450, names: {Baz: {by: 'Foo'}, Bar: {}}}]},

  // export type * as Foo from 'Qux';
  typeNamespaceReexports: {Qux: [{start: 478, end: 510, namespace: 'Foo'}]},

  // export type * from 'Qux';
  typeStarReexports: {Qux: [{start: 533, end: 558}]},

  /**
   * Exports.
   */
  // export default 42;
  defaultExport: {start: 578, end: 596},

  // export {foo as baz, type Bar};
  namedExports: [{start: 614, end: 644, names: {baz: {by: 'foo'}}, types: {Bar: {}}}],

  // export const foo = 2;
  declarationExports: {foo: {start: 668, end: 689, kind: 'const'}},

  // export type {Foo as Baz, Bar};
  typeNamedExports: [{start: 711, end: 741, names: {Baz: {by: 'Foo'}, Bar: {}}}],

  // export type T = number;
  typeExports: {T: {start: 758, end: 781}},

  // export interface I {foo: number};
  interfaceExports: {I: [{start: 803, end: 836}]},

  // export namespace N {foo: number};
  namespaceExports: {N: [{start: 858, end: 891}]},
};
```

## Install

Requires [node](https://nodejs.org/en/) version 10 or higher:

```sh
npm install parse-imports-exports
```

`parse-imports-exports` works in any environment that supports ES2018
(because package uses [RegExp Named Capture Groups](https://github.com/tc39/proposal-regexp-named-groups)).

## License

[MIT][license-url]

[conventional-commits-image]: https://img.shields.io/badge/Conventional_Commits-1.0.0-yellow.svg 'The Conventional Commits specification'
[conventional-commits-url]: https://www.conventionalcommits.org/en/v1.0.0/
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg 'The MIT License'
[license-url]: LICENSE
[npm-image]: https://img.shields.io/npm/v/parse-imports-exports.svg 'parse-imports-exports'
[npm-url]: https://www.npmjs.com/package/parse-imports-exports
[prettier-image]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg 'Prettier code formatter'
[prettier-url]: https://prettier.io/
[size-image]: https://img.shields.io/bundlephobia/minzip/parse-imports-exports 'parse-imports-exports'
[size-url]: https://bundlephobia.com/package/parse-imports-exports
