import {parseImportsExports} from '../src/index.js';

import {assert, assertEqualExceptNumbers, end, start} from './utils.js';

import type {Name, Path} from '../src';

export const testFeaturesAndErrors = (): void => {
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

export const A = 1;
export const A = 1;
export const A = 1;

export function doubleF(): void
export function doubleF() {}

export function tripleF(): void
export function tripleF(arg: string): void
export  function  tripleF (arg?: string): void {}

export async function quadrupleF(): Promise<void>
export async function quadrupleF(arg: number): Promise<void>
export async function quadrupleF(arg: string): Promise<void>
export async function quadrupleF(arg?: number | string): Promise<void> {}

export declare function tripleDF(): void
export  declare function tripleDF(arg: string): void
export  declare  function  tripleDF (arg?: string): void {}

export async function quadrupleF(arg?: number | string): Promise<void> {}

export async function doubleAF(arg: number): Promise<void>;
export async function doubleAF(arg: string): Promise<void>;
export async function doubleAF(arg: number | string): Promise<void> {}

export const [
  destructuringFoo, // some comment /* inner comment */
/* also comment // inner comment */  {bar: destructuringBar},
 /*commentAgain*/ destructuringCorge] = useFoobar();

export declare var {name: destructuringBaz} = useName();
export  let  [{names: [{destructuringQux}, {foo: destructuringQuux}]} ] = useNames()

'/* export const A = 4; "';

"/** import 'jquery';"

\`
import 'typescript';
${1 + 1}
/**
 \`;

'can\\'t parse this';
"can\\"t parse this";
\`can\\\`t parse this\`;

\`
import "react";
\${\`\${'react'}\`}
import "react";
\`

export const {foo = useFoo();
export let [] = []; // correct code in ECMAScript/TypeScript

import {foo};

const di = await import('foo');
let dip =  import("bar")

import("foo")

// import('baz')

import('qux");

type JQuery = typeof import("jquery");

type JQ = typeof import('jquery')

// typeof import('typescript')

type Qux = typeof import("qux")

type Quux = typeof import("qux')

module.exports = () => {};
module.exports.foo = 3;
exports.bar = 2

exports.baz=8
exports . /* comment= */ qux /*also comment*/ = 4;

module.exports .baz = 9;
exports.0 = 10;

exports = {};
module.exports = () => {};

const foo = require('foo');
const bar = require("bar")
let baz =  2/1 && require('bar')

const x = 3 / 2 /* 1;/
require('Bar');
*/

/ups...
'require("Bar")
"require('Bar')

const regexp = /require('Bar')foo'"\\//gmu;

exports.corge;

/* require('jquery') */
// require("foo");

'require("baz")';;

require("foo');

import(");

typeof import("foo)

require("foo);

export { toString };

export {__proto__}`);

  assertEqualExceptNumbers(
    importsExports,
    {
      /**
       * Imports.
       */

      namedImports: {
        ["ba'z" as Path]: [{start, end, names: {['foo' as Name]: {}, ['bar' as Name]: {}}}],
        ['jquery' as Path]: [{start, end}],
        ['PROTO' as Path]: [{start, end}],
        ['constructor' as Path]: [{start, end}],
        ['garply' as Path]: [
          {
            start,
            end,
            names: {
              ['asBaz' as Name]: {by: 'baz' as Name},
              ['grault' as Name]: {},
              ['corge' as Name]: {},
            },
            types: {
              ['qux' as Name]: {},
              ['asWaldo' as Name]: {by: 'waldo' as Name},
              ['asQuux' as Name]: {by: 'quux' as Name},
            },
            default: 'bar' as Name,
          },
          {start, end, default: 'Garply' as Name},
        ],
        ['' as Path]: [{start, end}],
        ['waldo' as Path]: [{start, end, default: 'name' as Name}],
        ['prototype' as Path]: [
          {start, end, names: {['PROTO' as Name]: {by: 'PROTO' as Name}}},
          {start, end, names: {['__lookupGetter__' as Name]: {by: 'hasOwnProperty' as Name}}},
          {
            start,
            end,
            names: {['PROTO' as Name]: {}, ['prototype' as Name]: {by: 'PROTO' as Name}},
          },
        ],
      },

      namespaceImports: {
        ['./maths.js' as Path]: [{start, end, namespace: 'math' as Name}],
        ['quux' as Path]: [{start, end, namespace: 'bar' as Name, default: 'foo' as Name}],
        ['prototype' as Path]: [
          {start, end, namespace: 'PROTO' as Name, default: 'PROTO' as Name},
          {start, end, namespace: 'toString' as Name, default: 'propertyIsEnumerable' as Name},
        ],
      },

      dynamicImports: {
        ['foo' as Path]: [
          {start, end},
          {start, end},
        ],
        ['bar' as Path]: [{start, end}],
      },

      requires: {
        ['foo' as Path]: [{start, end}],
        ['bar' as Path]: [
          {start, end},
          {start, end},
        ],
      },

      typeNamedImports: {
        ['quux' as Path]: [{start, end, default: 'qux' as Name}],
        ['waldo' as Path]: [{start, end, default: 'corge' as Name}],
        ['@types/prototype' as Path]: [
          {start, end, names: {['PROTO' as Name]: {}}},
          {start, end, names: {['isPrototypeOf' as Name]: {}}},
        ],
      },

      typeNamespaceImports: {
        ['react' as Path]: [{start, end, namespace: 'React' as Name}],
      },

      typeDynamicImports: {
        ['jquery' as Path]: [
          {start, end},
          {start, end},
        ],
        ['qux' as Path]: [{start, end}],
      },

      /**
       * Reexports.
       */

      namedReexports: {
        ['typescript' as Path]: [
          {
            start,
            end,
            names: {['ModuleKind' as Name]: {}},
            types: {['Target' as Name]: {by: 'ScriptTarget' as Name}},
          },
        ],
        ['properties' as Path]: [{start, end, types: {['propertyIsEnumerable' as Name]: {}}}],
      },

      namespaceReexports: {['qux' as Path]: [{start, end, namespace: 'FullQux' as Name}]},

      starReexports: {['quux' as Path]: [{start, end}]},

      typeNamedReexports: {
        ['prettier' as Path]: [{start, end, names: {['CPL' as Name]: {by: 'Compiler' as Name}}}],
      },

      typeNamespaceReexports: {
        ['qux' as Path]: [
          {start, end, namespace: 'Qux' as Name},
          {start, end, namespace: 'AlsoQux' as Name},
        ],
        ['bar' as Path]: [
          {start, end, namespace: 'PROTO' as Name},
          {start, end, namespace: '__lookupSetter__' as Name},
        ],
      },

      typeStarReexports: {
        ['bar' as Path]: [
          {start, end},
          {start, end},
        ],
      },

      /**
       * Exports.
       */

      defaultExport: {start, end},

      namedExports: [
        {
          start,
          end,
          names: {['foo' as Name]: {}, ['bar' as Name]: {}},
          types: {['baz' as Name]: {}},
        },
        {start, end},
        {
          start,
          end,
          names: {['waldo' as Name]: {by: 'baz' as Name}},
          types: {['bar' as Name]: {by: 'foo' as Name}},
        },
        {start, end, types: {['PROTO' as Name]: {}}},
        {start, end, names: {['toString' as Name]: {}}},
        {start, end, names: {['PROTO' as Name]: {}}},
      ],

      declarationExports: {
        ['garply' as Name]: {start, end, kind: 'const'},
        ['SomeClass' as Name]: {start, end, kind: 'class'},
        ['callback' as Name]: {start, end, kind: 'let'},
        ['f' as Name]: {start, end, kind: 'function'},
        ['numbersGenerator' as Name]: {start, end, kind: 'function*'},
        ['asyncCallback' as Name]: {start, end, kind: 'async function'},
        ['asyncGenerator' as Name]: {start, end, kind: 'async function*'},
        ['PROTO' as Name]: {start, end, kind: 'const'},
        ['valueOf' as Name]: {start, end, kind: 'var' as const},
        ['toLocaleString' as Name]: {start, end, kind: 'async function' as const},
        ['y' as Name]: {start, end, kind: 'var'},
        ['corge' as Name]: {start, end, kind: 'declare const'},
        ['DC' as Name]: {start, end, kind: 'declare class'},
        ['dl' as Name]: {start, end, kind: 'declare let'},
        ['dv' as Name]: {start, end, kind: 'declare var'},
        ['df' as Name]: {start, end, kind: 'declare function'},
        ['AC' as Name]: {start, end, kind: 'abstract class'},
        ['DAC' as Name]: {start, end, kind: 'declare abstract class'},
        ['En' as Name]: {start, end, kind: 'enum'},
        ['Den' as Name]: {start, end, kind: 'declare enum'},
        ['Cen' as Name]: {start, end, kind: 'const enum'},
        ['Dcen' as Name]: {start, end, kind: 'declare const enum'},
        ['A' as Name]: {start, end, kind: 'const'},
        ['doubleF' as Name]: {start, end, kind: 'function'},
        ['tripleF' as Name]: {start, end, kind: 'function'},
        ['quadrupleF' as Name]: {start, end, kind: 'async function'},
        ['tripleDF' as Name]: {start, end, kind: 'declare function'},
        ['doubleAF' as Name]: {start, end, kind: 'async function'},
        ['destructuringFoo' as Name]: {start, end, kind: 'destructuring const'},
        ['destructuringBar' as Name]: {start, end, kind: 'destructuring const'},
        ['destructuringCorge' as Name]: {start, end, kind: 'destructuring const'},
        ['destructuringBaz' as Name]: {start, end, kind: 'declare destructuring var'},
        ['destructuringQux' as Name]: {start, end, kind: 'destructuring let'},
        ['destructuringQuux' as Name]: {start, end, kind: 'destructuring let'},
      },

      typeNamedExports: [
        {start, end},
        {start, end, names: {['corge' as Name]: {by: 'garply' as Name}}},
      ],

      typeExports: {
        ['T' as Name]: {start, end},
        ['SomeType' as Name]: {start, end},
        ['D' as Name]: {start, end, isDeclare: true},
      },

      interfaceExports: {
        ['I' as Name]: [
          {start, end},
          {start, end},
        ],
        ['PROTO' as Name]: [{start, end}],
        ['__defineSetter__' as Name]: [{start, end}],
        ['DI' as Name]: [{start, end, isDeclare: true}],
      },

      namespaceExports: {
        ['N' as Name]: [
          {start, end},
          {start, end},
        ],
        ['PROTO' as Name]: [{start, end}],
        ['__defineGetter__' as Name]: [{start, end}],
        ['DN' as Name]: [{start, end, isDeclare: true}],
      },

      commonJsNamespaceExport: {start, end},

      commonJsExports: {
        ['foo' as Name]: {start, end, startsWithModule: true},
        ['bar' as Name]: {start, end},
        ['baz' as Name]: {start, end},
        ['qux' as Name]: {start, end},
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
        47: 'Duplicate exported declaration `const A`',
        48: 'Duplicate exported declaration `const A`',
        49: 'Duplicate exported declaration `function doubleF`',
        50: 'Duplicate exported declaration `async function quadrupleF`',
        51: 'Cannot parse destructuring names in `export const ...` statement',
        52: 'Cannot find end of `import` statement',
        53: 'Cannot find start of path string literal of dynamic `import("...")`',
        54: "Cannot find start of path string literal of dynamic `import('...')` of type",
        55: 'Duplicate exported name `baz` in `module.exports.... = ...` statement',
        56: 'Cannot parse identifier of `exports.... = ...` statement',
        57: '`exports = ...` is not valid CommonJS namespace export (use `module.exports = ...` instead)',
        58: 'Duplicate CommonJS namespace export (`module.exports = ...`)',
        59: 'Cannot find end (equal sign) of `exports.... = ...` statement',
        60: "Cannot find start of path string literal in `require('...')`",
        61: 'Cannot find end of path string literal of dynamic `import(...)`',
        62: 'Cannot find end of path string literal of dynamic `import(...)` of type',
        63: 'Cannot find end of path string literal in `require(...)`',
      },
    } satisfies typeof importsExports,
    'returns expected results and errors for all sort of statements',
  );

  const {namedExports} = importsExports;

  assert(
    Object.prototype.hasOwnProperty.call(
      namedExports![namedExports!.length - 1]!.names,
      '__proto__',
    ),
    'parses named export "__proto__"',
  );
};
