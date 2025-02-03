import {parseImportsExports} from '../src/index.js';

import {assert, assertEqualExceptNumbers, end, start} from './utils.js';

import type {LineColumn, Name, Path} from '../src';

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

import styles from './styles.css' with {type: 'css'};

import type * as css from './fooStyles.css' with {type: 'css'};
import css from './barStyles.css' with {type: css};
import asloCss from './bazStyles.css' with { type: "css'};

const foo = await import(
  './static/styles.css',
  {with: {type: 'css'}},
);

type T = typeof import('./static/fooStyles.css', { with: { type : 'css'}});

import('./static/barStyles.css', {with: {type: css}});
import("./static/bazStyles.css", {with: {type: "css'}});

export { styles } from './style.css' with {type: 'css'};

export type {css} from './fooStyle.css' with {type: 'css'};
export {css} from './barStyle.css' with {type: css};
export { asloCss } from './bazStyle.css' with { type: "css'};

export * as styles from './css/style.css' with {type :'css'};

export type * from './css/fooStyle.css' with {type: 'css'};
export *  from  './css/barStyle.css' with {type: css};
export * as asloCss from "./css/bazStyle.css" with { type: "css'};

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
        ['./styles.css' as Path]: [{start, end, with: {type: 'css'}, default: 'styles' as Name}],
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
        ['./static/styles.css' as Path]: [{start, end, with: {type: 'css'}}],
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
        ['./static/fooStyles.css' as Path]: [{start, end, with: {type: 'css'}}],
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
        ['./style.css' as Path]: [
          {start, end, names: {['styles' as Name]: {}}, with: {type: 'css'}},
        ],
        ['properties' as Path]: [{start, end, types: {['propertyIsEnumerable' as Name]: {}}}],
      },

      namespaceReexports: {
        ['qux' as Path]: [{start, end, namespace: 'FullQux' as Name}],
        ['./css/style.css' as Path]: [
          {start, end, with: {type: 'css'}, namespace: 'styles' as Name},
        ],
      },

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

      errors: [
        'Cannot find namespace of `export type * as ... from ...` statement',
        'Cannot find namespace of `export * as ... from ...` statement',
        'Cannot find end of imports list (`}`) for import from `foo`',
        'Cannot use `type` modifier in `import type` statement for type `Bar` for import from `Bar`',
        'Duplicate imported type `Foo` for import from `Bar`',
        'Duplicate imported type `__proto__` for import from `Baz`',
        'Duplicate imported name `Bar` for import from `Bar`',
        'Duplicate imported name `valueOf` for import from `prototype`',
        'Cannot use default `Foo` and namespace `Bar` together in `import type` statement for import from `typescript`',
        'Duplicate exported type `Foo` in named export',
        'Duplicate exported type `Foo` for reexport from `Foo`',
        'Cannot use import attributes (`with {...}`) in `import type` statement for import from `./fooStyles.css`',
        'Cannot parse import attributes (`with {...}`) in `import` statement for import from `./barStyles.css`',
        'Cannot parse import attributes (`with {...}`) in `import` statement for import from `./bazStyles.css`',
        "Cannot parse import attributes (`with: {...}`) for dynamic `import('...')` from `./static/barStyles.css`",
        'Cannot parse import attributes (`with: {...}`) for dynamic `import(\"...\")` from `./static/bazStyles.css`',
        'Cannot use import attributes (`with {...}`) in `export type` statement for reexport from `./fooStyle.css`',
        'Cannot parse import attributes (`with {...}`) for reexport from `./barStyle.css`',
        'Cannot parse import attributes (`with {...}`) for reexport from `./bazStyle.css`',
        'Cannot use import attributes (`with {...}`) in `export type ` statement for star reexport from `./css/fooStyle.css`',
        'Cannot parse import attributes (`with {...}`) for star reexport from `./css/barStyle.css`',
        'Cannot parse import attributes (`with {...}`) for namespace reexport from `./css/bazStyle.css`',
        'Cannot use `type` modifier in `export type {...}` statement for type `Foo`',
        'Cannot use `type` modifier in `export type {...}` statement for type `Bar as Baz` for reexport from `Baz`',
        'Cannot find start of `from` string literal of import',
        'Duplicate default export',
        'Duplicate exported name `hasOwnProperty` in named export',
        'Duplicate exported name `__proto__` for reexport from `parser`',
        'Cannot find end of reexports list (`}`) for reexport from `./bar`',
        'Duplicate exported declaration `function* __proto__`',
        'Cannot find end of `from` string literal of star reexport',
        'Cannot find end of `from` string literal of namespace reexport',
        'Cannot find start of `from` string literal of star reexport',
        'Cannot find start of `from` string literal of namespace reexport',
        'Cannot parse declaration identifier of `export type ...` statement',
        'Cannot parse declaration identifier of `export ...` statement',
        'Duplicate exported type `T`',
        'Cannot parse interface identifier of `export interface ...` statement',
        'Cannot parse namespace identifier of `export namespace ...` statement',
        'Cannot parse `const` identifier of `export const ...` statement',
        'Cannot declare star export (`export declare * ... from ...`)',
        'Cannot parse async function in `export async ...` statement',
        'Cannot parse `function*` identifier of `export function* ...` statement',
        'Cannot parse `async function` identifier of `export async function ...` statement',
        'Cannot parse `export sconst ...` statement',
        'Duplicate exported declaration `let y`',
        'Cannot export default with declare (`export declare default ...`)',
        'Cannot export async function with declare (`export declare async ...`)',
        'Cannot export generator function with declare (`export declare function* ...`)',
        'Cannot parse `export declare abstractclass ...` statement',
        'Cannot parse declaration of abstract class of `export abstract ...` statement',
        'Cannot parse declaration of abstract class of `export declare abstract ...` statement',
        'Cannot parse `enum` identifier of `export enum ...` statement',
        'Cannot parse `enum` identifier of `export declare enum ...` statement',
        'Cannot parse identifier of `export const enum ...` statement',
        'Cannot parse identifier of `export declare const enum ...` statement',
        'Cannot parse `export constenum ...` statement',
        'Cannot parse `export declare constenum ...` statement',
        'Duplicate exported declaration `const A`',
        'Duplicate exported declaration `const A`',
        'Duplicate exported declaration `function doubleF`',
        'Duplicate exported declaration `async function quadrupleF`',
        'Cannot parse destructuring names in `export const ...` statement',
        'Cannot find end of `import` statement',
        'Cannot find start of path string literal of dynamic `import("...")` from `\'qux`',
        "Cannot find start of path string literal of dynamic `import('...')` of type from `\"qux`",
        'Duplicate exported name `baz` in `module.exports.... = ...` statement',
        'Cannot parse identifier of `exports.... = ...` statement',
        '`exports = ...` is not valid CommonJS namespace export (use `module.exports = ...` instead)',
        'Duplicate CommonJS namespace export (`module.exports = ...`)',
        'Cannot find end (equal sign) of `exports.... = ...` statement',
        "Cannot find start of path string literal in `require('...')`",
        'Cannot find end of path string literal of dynamic `import(...)`',
        'Cannot find end of path string literal of dynamic `import(...)` of type',
        'Cannot find end of path string literal in `require(...)`',
      ].reduce(
        (errors, error) => Object.assign(errors, {[`0:${Object.keys(errors).length}`]: error}),
        {} as Record<LineColumn, string>,
      ),
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
