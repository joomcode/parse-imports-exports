import {parseImportsExports} from './index';

declare const process: {env: {_START: string}};

let testsCount = 0;

function assert(value: boolean, message: string): asserts value is true {
  if (value !== true) {
    throw new TypeError(`❌ Assert "${message}" fails`);
  }

  testsCount += 1;

  console.log(' ✅', message);
}

const assertEqualExceptNumbers = (a: object, b: object, message: string) => {
  const aJson = JSON.stringify(a)
    .replace(/\d+/g, '0')
    .replace(/__proto__/g, 'PROTO');
  const bJson = JSON.stringify(b)
    .replace(/\d+/g, '0')
    .replace(/__proto__/g, 'PROTO');

  for (let index = 0; index < aJson.length; index += 1) {
    if (aJson[index] !== bJson[index]) {
      assert(
        false,
        `${message}:\n${aJson.slice(index - 30, index + 70)}\n${bJson.slice(
          index - 30,
          index + 70,
        )}`,
      );
    }
  }

  assert(true, message);
};

const ok = (message: string) => console.log(`\x1B[32m[OK]\x1B[39m ${message}`);
const startTestsTime = Date.now();

ok(`Build passed in ${startTestsTime - Number(process.env._START)}ms!`);

const start = 0;
const end = 0;

assert(typeof parseImportsExports('') === 'object', 'returns an object for empty source');

assert(
  Object.keys(parseImportsExports('foo')).length === 0,
  'returns an empty object for source without imports/exports',
);

const withImportError = parseImportsExports('import something;');

assert(
  Object.keys(withImportError).length === 1 &&
    Object.keys(withImportError.errors!).length === 1 &&
    withImportError.errors![0] === 'Cannot find end of `import` statement',
  'returns correct error of parsing import statement',
);

const withExportError = parseImportsExports('export type {something;');

assert(
  Object.keys(withExportError).length === 1 &&
    Object.keys(withExportError.errors!).length === 1 &&
    withExportError.errors![0] === 'Cannot find end of `export type {...} ...` statement',
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

const importsExports = parseImportsExports(`
import {foo, bar} from 'ba\\'z';
import type /* comment! */ qux from "quux"
import "jquery"

import  * as math from "./maths.js";
import type  *   as  React from 'react';

import '__proto__';
import "constructor"

import  foo, * as bar from 'quux';
import bar , { baz as asBaz, type qux, /* also comment */// and more comments
// some comment
,grault//comment!
,type waldo as asWaldo,
type quux as asQuux,corge ,
} from 'garply';
import Garply from "garply"

export {foo, bar, type baz};
export { ModuleKind, type ScriptTarget as Target} from 'typescript'
export type {Compiler as CPL} from 'prettier';

export  const  garply: string = 'some string';
export interface I {
  foo: string;
}

export type  T = boolean;
export namespace N {}

export  type  SomeType = string

import "";

export  namespace __proto__ {foo: string;};
export namespace  __defineGetter__ {}
export   interface __proto__ {bar: number};
export interface  __defineSetter__  {baz: number}

export {};

export  type * as ;
export  * as   ;

import  type  corge , {} from "waldo"
import name, {,} from 'waldo'

export class  SomeClass {
  method() {}
}

export let callback = () => {}
export  namespace N {};

export  function f<Type>(arg: Type): Type {
  return arg;
}

export function*   numbersGenerator() {
  return Math.random()
}

import {__proto__ as __proto__} from 'prototype'
import { hasOwnProperty  as   __lookupGetter__ } from 'prototype'


export  async  function asyncCallback () {}
export async function  * asyncGenerator () {}

export * from 'quux'
export type * as Qux from "qux";
export type * from 'bar';
export * as FullQux from 'qux'

export type * as __proto__ from "bar"
export  type  * as  __lookupSetter__  from  'bar';

export default{ foo: 3 }

import {foo from 'foo'

import type {type Bar} from 'Bar';

import  { type Foo , type Foo} from "Bar"
import {type __proto__, type  PROTO  as  __proto__ } from "Baz";

import type  { Bar, Bar }  from'Bar';
import  { __proto__, __proto__ as  prototype} from 'prototype';
import {toLocaleString as valueOf , valueOf } from"prototype"

export   type * as AlsoQux from 'qux'
export  type * from "bar"

import  type Foo , * as  Bar  from'typescript';

export type {}

export type { /* comment! */ garply as corge}
export {type foo as bar, baz as waldo};
export  interface I {
  foo: string;
}

export {type  Foo,  type Bar  as  Foo };
export { type  Baz as  Foo,  type Bar, Qux , type Foo } from 'Foo'

import  type  { __proto__ } from '@types/prototype';
import type { isPrototypeOf}from "@types/prototype"

import __proto__, *  as  __proto__  from "prototype";
import  propertyIsEnumerable , *  as  toString  from'prototype'

export const __proto__ = 42
export   var  valueOf =  'corge' ; 

export type {type Foo};
export type { type Bar as Baz } from 'Baz';

import baz from baz";

export  default 42;

export type { hasOwnProperty , valueOf,$ as hasOwnProperty};
export {toString  as __proto__, type valueOf, _ as __proto__} from "parser";

export {bar from "./bar";

export function * __proto__ () {}
export  async  function toLocaleString() { return '' }

export type  * from "module
export  * as Foo from 'module;

export * from ./module';
export type * as bar from module"

export type ;
export 

export  type  T = void

export interface {}
export  namespace {foo: number;};

export  const;

export declare * from "quux";

export async fnction f () {}
export function * () {};
export  async  function(arg) { return arg; }

export sconst x = 3;
export  var y  = 1;
export let  y = 1

export {type __proto__};
export { type propertyIsEnumerable } from 'properties'

export declare default 3;

export declare type D = void;

export declare interface DI {}

export declare namespace DN {foo: string};

export declare const   corge: string;
export declare  class DC {}
export declare let dl: number
export  declare var dv: bigint

export declare async function adf(): Promise<void>;

export declare function* gdf(): void;

export declare function df(): void;

export abstract class AC {}
export  declare  abstract  class  DAC  {};

export declare abstractclass Quux {}
export abstract EAC {}
export declare abstract DEAC {}

export enum En {}
export  declare  enum  Den {};
export  const enum Cen {A = 3}
export  declare const enum  Dcen  {}

export enum {}
export declare enum {};
export const enum {}
export declare const enum {};
export constenum EC {}
export declare constenum DEC {}

import {foo};

export { toString };

export {__proto__}`);

assertEqualExceptNumbers(
  importsExports,
  {
    namedImports: {
      "ba'z": [{start, end, names: {foo: {}, bar: {}}}],
      jquery: [{start, end}],
      PROTO: [{start, end}],
      constructor: [{start, end}],
      garply: [
        {
          start,
          end,
          names: {
            asBaz: {by: 'baz'},
            grault: {},
            corge: {},
          },
          types: {qux: {}, asWaldo: {by: 'waldo'}, asQuux: {by: 'quux'}},
          default: 'bar',
        },
        {start, end, default: 'Garply'},
      ],
      '': [{start, end}],
      waldo: [{start, end, default: 'name'}],
      prototype: [
        {start, end, names: {PROTO: {by: 'PROTO'}}},
        {start, end, names: {__lookupGetter__: {by: 'hasOwnProperty'}}},
        {start, end, names: {PROTO: {}, prototype: {by: 'PROTO'}}},
      ],
    },
    typeNamedImports: {
      quux: [{start, end, default: 'qux'}],
      waldo: [{start, end, default: 'corge'}],
      '@types/prototype': [
        {start, end, names: {PROTO: {}}},
        {start, end, names: {isPrototypeOf: {}}},
      ],
    },
    namespaceImports: {
      './maths.js': [{start, end, namespace: 'math'}],
      quux: [{start, end, namespace: 'bar', default: 'foo'}],
      prototype: [
        {start, end, namespace: 'PROTO', default: 'PROTO'},
        {start, end, namespace: 'toString', default: 'propertyIsEnumerable'},
      ],
    },
    typeNamespaceImports: {
      react: [{start, end, namespace: 'React'}],
    },
    namedExports: [
      {start, end, names: {foo: {}, bar: {}}, types: {baz: {}}},
      {start, end},
      {start, end, names: {waldo: {by: 'baz'}}, types: {bar: {by: 'foo'}}},
      {start, end, types: {PROTO: {}}},
      {start, end, names: {toString: {}}},
      {start, end, names: {PROTO: {}}},
    ],
    namedReexports: {
      typescript: [{start, end, names: {ModuleKind: {}}, types: {Target: {by: 'ScriptTarget'}}}],
      properties: [{start, end, types: {propertyIsEnumerable: {}}}],
    },
    typeNamedReexports: {
      prettier: [{start, end, names: {CPL: {by: 'Compiler'}}}],
    },
    declarationExports: {
      garply: {start, end, kind: 'const'},
      SomeClass: {start, end, kind: 'class'},
      callback: {start, end, kind: 'let'},
      f: {start, end, kind: 'function'},
      numbersGenerator: {start, end, kind: 'function*'},
      asyncCallback: {start, end, kind: 'async function'},
      asyncGenerator: {start, end, kind: 'async function*'},
      PROTO: {start, end, kind: 'const'},
      valueOf: {start, end, kind: 'var' as const},
      toLocaleString: {start, end, kind: 'async function' as const},
      y: {start, end, kind: 'var'},
      corge: {start, end, kind: 'declare const'},
      DC: {start, end, kind: 'declare class'},
      dl: {start, end, kind: 'declare let'},
      dv: {start, end, kind: 'declare var'},
      df: {start, end, kind: 'declare function'},
      AC: {start, end, kind: 'abstract class'},
      DAC: {start, end, kind: 'declare abstract class'},
      En: {start, end, kind: 'enum'},
      Den: {start, end, kind: 'declare enum'},
      Cen: {start, end, kind: 'const enum'},
      Dcen: {start, end, kind: 'declare const enum'},
    },
    interfaceExports: {
      I: [
        {start, end},
        {start, end},
      ],
      PROTO: [{start, end}],
      __defineSetter__: [{start, end}],
      DI: [{start, end, isDeclare: true}],
    },
    typeExports: {
      T: {start, end},
      SomeType: {start, end},
      D: {start, end, isDeclare: true},
    },
    namespaceExports: {
      N: [
        {start, end},
        {start, end},
      ],
      PROTO: [{start, end}],
      __defineGetter__: [{start, end}],
      DN: [{start, end, isDeclare: true}],
    },
    errors: {
      0: 'Cannot find namespace of `export type * as ... from ...` statement',
      1: 'Cannot find namespace of `export * as ... from ...` statement',
      2: 'Cannot find end of imports list (`}`) for import from `foo`',
      3: 'Cannot use `type` modifier in `import type` statement for type `Bar` for import from `Bar`',
      4: 'Duplicate imported type `Foo` for import from `Bar`',
      5: 'Duplicate imported type `__proto__` for import from `Baz`',
      6: 'Duplicate imported name `Bar` for import from `Bar`',
      7: 'Duplicate imported name `valueOf` for import from `prototype`',
      8: 'Cannot use default `Foo` and namespace `Bar` together in `import type` statement for import from `typescript`',
      9: 'Duplicate exported type `Foo` in named export',
      10: 'Duplicate exported type `Foo` for reexport from `Foo`',
      11: 'Cannot use `type` modifier in `export type {...}` statement for type `Foo`',
      12: 'Cannot use `type` modifier in `export type {...}` statement for type `Bar as Baz` for reexport from `Baz`',
      13: 'Cannot find start of `from` string literal of import',
      14: 'Duplicate default export',
      15: 'Duplicate exported name `hasOwnProperty` in named export',
      16: 'Duplicate exported name `__proto__` for reexport from `parser`',
      17: 'Cannot find end of reexports list (`}`) for reexport from `./bar`',
      18: 'Duplicate exported declaration `function* __proto__`',
      19: 'Cannot find end of `from` string literal of reexport',
      20: 'Cannot find end of `from` string literal of reexport',
      21: 'Cannot find start of `from` string literal of reexport',
      22: 'Cannot find start of `from` string literal of reexport',
      23: 'Cannot parse declaration identifier of `export type ...` statement',
      24: 'Cannot parse declaration identifier of `export ...` statement',
      25: 'Duplicate exported type `T`',
      26: 'Cannot parse interface identifier of `export interface ...` statement',
      27: 'Cannot parse namespace identifier of `export namespace ...` statement',
      28: 'Cannot parse `const` identifier of `export const ...` statement',
      29: 'Cannot declare star export (`export declare * ... from ...`)',
      30: 'Cannot parse async function in `export async ...` statement',
      31: 'Cannot parse `function*` identifier of `export function* ...` statement',
      32: 'Cannot parse `async function` identifier of `export async function ...` statement',
      33: 'Cannot parse `export sconst ...` statement',
      34: 'Duplicate exported declaration `let y`',
      35: 'Cannot export default with declare (`export declare default ...`)',
      36: 'Cannot export async function with declare (`export declare async ...`)',
      37: 'Cannot export generator function with declare (`export declare function* ...`)',
      38: 'Cannot parse `export declare abstractclass ...` statement',
      39: 'Cannot parse declaration of abstract class of `export abstract ...` statement',
      40: 'Cannot parse declaration of abstract class of `export declare abstract ...` statement',
      41: 'Cannot parse `enum` identifier of `export enum ...` statement',
      42: 'Cannot parse `enum` identifier of `export declare enum ...` statement',
      43: 'Cannot parse identifier of `export const enum ...` statement',
      44: 'Cannot parse identifier of `export declare const enum ...` statement',
      45: 'Cannot parse `export constenum ...` statement',
      46: 'Cannot parse `export declare constenum ...` statement',
      47: 'Cannot find end of `import` statement',
    },
    starReexports: {quux: [{start, end}]},
    typeNamespaceReexports: {
      qux: [
        {start, end, namespace: 'Qux'},
        {start, end, namespace: 'AlsoQux'},
      ],
      bar: [
        {start, end, namespace: 'PROTO'},
        {start, end, namespace: '__lookupSetter__'},
      ],
    },
    typeStarReexports: {
      bar: [
        {start, end},
        {start, end},
      ],
    },
    namespaceReexports: {qux: [{start, end, namespace: 'FullQux'}]},
    defaultExport: {start, end},
    typeNamedExports: [
      {start, end},
      {start, end, names: {corge: {by: 'garply'}}},
    ],
  } satisfies typeof importsExports,
  'returns expected results and errors for all sort of statements',
);

const {namedExports} = importsExports;

assert(
  Object.prototype.hasOwnProperty.call(namedExports![namedExports!.length - 1]!.names, '__proto__'),
  'parses named export "__proto__"',
);

const importsExportsWithoutErrors = parseImportsExports(`
/**
 * Imports.
 */
// {Qux: [{start: 17, end: 58, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]}
import {foo as baz, type Bar} from 'Qux';

// {Qux: [{start: 80, end: 112, namespace: 'foo', default: 'Foo'}]}
import Foo, * as foo from 'Qux';

// {Qux: [{start: 134, end: 175, names: {Baz: {by: 'Foo'}, Bar: {}}}]}
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
`);

assertEqualExceptNumbers(
  importsExportsWithoutErrors,
  {
    /**
     * Imports.
     */
    // import {foo as baz, type Bar} from 'Qux';
    namedImports: {Qux: [{start: 17, end: 58, names: {baz: {by: 'foo'}}, types: {Bar: {}}}]},

    // import Foo, * as foo from 'Qux';
    namespaceImports: {Qux: [{start: 80, end: 112, namespace: 'foo', default: 'Foo'}]},

    // import type {Foo as Baz, Bar} from 'Qux';
    typeNamedImports: {Qux: [{start: 134, end: 175, names: {Baz: {by: 'Foo'}, Bar: {}}}]},

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
  },
  'returns expected results for all base statements',
);

ok(`All ${testsCount} tests passed in ${Date.now() - startTestsTime}ms!`);
