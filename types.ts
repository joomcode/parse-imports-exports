import type {
  Comment as BaseComment,
  Options as ParseOptions,
  Statement as BaseStatement,
} from 'parse-statements';

export type {CommentPair, OnCommentError, OnGlobalError, OnParse, Parse} from 'parse-statements';

/**
 * Type of comment for parse options.
 */
export type Comment = BaseComment<MutableImportsExports>;

/**
 * Parsed JSON presentation of `import(...)` statement.
 */
export type DynamicImport = Position;

/**
 * Excludes `undefined` from some `Type`.
 */
export type ExcludeUndefined<Type> = Exclude<Type, undefined>;

/**
 * Parsed JSON presentation of imports, exports and reexports of ECMAScript/TypeScript module.
 */
export type ImportsExports = DeepReadonly<MutableImportsExports>;

/**
 * Kind of exported declaration.
 */
export type Kind =
  | 'abstract class'
  | 'async function'
  | 'async function*'
  | 'class'
  | 'const'
  | 'const enum'
  | 'declare abstract class'
  | 'declare class'
  | 'declare const'
  | 'declare const enum'
  | 'declare destructuring const'
  | 'declare destructuring let'
  | 'declare destructuring var'
  | 'declare enum'
  | 'declare function'
  | 'declare let'
  | 'declare var'
  | 'destructuring const'
  | 'destructuring let'
  | 'destructuring var'
  | 'enum'
  | 'function'
  | 'function*'
  | 'let'
  | 'var';

/**
 * Mutable parsed JSON presentation of imports, exports and reexports of module.
 */
export type MutableImportsExports = {
  /**
   * `(module.)exports.foo = ...`.
   */
  commonJsExports?: Record<Name, CommonJsExport>;
  /**
   * `module.exports = ...`.
   */
  commonJsNamespaceExport?: CommonJsNamespaceExport;
  /**
   * `export (class|const|function|var...) ...`.
   */
  declarationExports?: Record<Name, DeclarationExport>;
  /**
   * `export default ...`.
   */
  defaultExport?: DefaultExport;
  /**
   * `import(...)`.
   */
  dynamicImports?: Record<Path, readonly DynamicImport[]>;
  /**
   * Syntax errors of module.
   */
  errors?: Record<number, string>;
  /**
   * `export interface ...`.
   */
  interfaceExports?: Record<Name, readonly InterfaceExport[]>;
  /**
   * `export {...}`.
   */
  namedExports?: readonly NamedExport[];
  /**
   * `import {...} from ...`.
   */
  namedImports?: Record<Path, readonly NamedImport[]>;
  /**
   * `export {...} from ...`.
   */
  namedReexports?: Record<Name, readonly NamedReexport[]>;
  /**
   * `export namespace ...`.
   */
  namespaceExports?: Record<Name, readonly NamespaceExport[]>;
  /**
   * `import * as ...`.
   */
  namespaceImports?: Record<Path, readonly NamespaceImport[]>;
  /**
   * `export * as ... from ...`.
   */
  namespaceReexports?: Record<Path, readonly NamespaceReexport[]>;
  /**
   * `require(...)`.
   */
  requires?: Record<Path, readonly Require[]>;
  /**
   * `export * from ...`.
   */
  starReexports?: Record<Path, readonly StarReexport[]>;
  /**
   * `typeof import(...)`.
   */
  typeDynamicImports?: Record<Path, readonly DynamicImport[]>;
  /**
   * `export type ...`.
   */
  typeExports?: Record<Name, TypeExport>;
  /**
   * `export type {...}`.
   */
  typeNamedExports?: readonly TypeNamedExport[];
  /**
   * `import type {...} from ...`.
   */
  typeNamedImports?: Record<Path, readonly TypeNamedImport[]>;
  /**
   * `export type {...} from ...`.
   */
  typeNamedReexports?: Record<Path, readonly TypeNamedReexport[]>;
  /**
   * `import type * as ...`.
   */
  typeNamespaceImports?: Record<Path, readonly TypeNamespaceImport[]>;
  /**
   * `export type * as ... from ...`.
   */
  typeNamespaceReexports?: Record<Path, readonly TypeNamespaceReexport[]>;
  /**
   * `export type * from ...`.
   */
  typeStarReexports?: Record<Path, readonly TypeStarReexport[]>;
};

/**
 * Imported or exported name (identifier).
 */
export type Name = string;

/**
 * Parsed JSON presentation of `export {...}` statement.
 */
export type NamedExport = Position & {names?: Names; types?: Names};

/**
 * Parsed JSON presentation of `import {...} from ...` statement.
 */
export type NamedImport = Position & {default?: Name; names?: Names; types?: Names};

/**
 * Parsed JSON presentation of names in `import`/`export` statements.
 */
export type Names = Record<Name, {by?: Name}>;

/**
 * Parsed JSON presentation of `import * as ...` statement.
 */
export type NamespaceImport = Position & {default?: Name; namespace: Name};

/**
 * Parsed JSON presentation of `export * as ... from ...` statement.
 */
export type NamespaceReexport = Position & {namespace: Name};

/**
 * Options of `parseImportsExports` function.
 */
export type Options = Readonly<{
  /**
   * If `true`, then we ignore `module.exports = ...`/`(module.)exports.foo = ...` expressions
   * during parsing (maybe a little faster).
   * By default (if `false` or skipped option), `module.exports = ...`/`(module.)exports.foo = ...`
   * expressions are parsed.
   */
  ignoreCommonJsExports?: boolean;
  /**
   * If `true`, then we ignore `import(...)` expressions during parsing (maybe a little faster).
   * By default (if `false` or skipped option), `import(...)` expressions are parsed.
   */
  ignoreDynamicImports?: boolean;
  /**
   * If `true`, then we ignore regular expression literals (`/.../`)
   * during parsing (maybe a little faster).
   * By default (if `false` or skipped option), regular expression literals are parsed.
   */
  ignoreRegexpLiterals?: boolean;
  /**
   * If `true`, then we ignore `require(...)` expressions during parsing (maybe a little faster).
   * By default (if `false` or skipped option), `require(...)` expressions are parsed.
   */
  ignoreRequires?: boolean;
  /**
   * If `true`, then we ignore string literals during parsing (maybe a little faster).
   * By default (if `false` or skipped option), string literals are parsed, that is,
   * the text inside them cannot be interpreted as another expression.
   */
  ignoreStringLiterals?: boolean;
}>;

export type {ParseOptions};

/**
 * Parsed JSON presentation of `require(...)` statement.
 */
export type Require = Position;

/**
 * Parsed JSON presentation of `export * from ...` statement.
 */
export type StarReexport = Position;

/**
 * Type of statement for parse options.
 */
export type Statement = BaseStatement<MutableImportsExports>;

/**
 * Parsed JSON presentation of `export type {...}` statement.
 */
export type TypeNamedExport = Position & {names?: Names};

/**
 * Parsed JSON presentation of `(module.)exports.foo = ...` statement.
 */
type CommonJsExport = Position & {startsWithModule?: true};

/**
 * Parsed JSON presentation of `module.exports = ...` statement.
 */
type CommonJsNamespaceExport = Position;

/**
 * Parsed JSON presentation of `export (class|const|function|var...) ...` statement.
 */
type DeclarationExport = Position & {kind: Kind};

/**
 * Parsed JSON presentation of `export default ...` statement.
 */
type DefaultExport = Position;

/**
 * Readonly type with recursive applying.
 * `DeepReadonly<{foo: {bar: 0}}>` = `{readonly foo: {readonly bar: 0}}`.
 */
type DeepReadonly<Type> = {readonly [Key in keyof Type]: DeepReadonly<Type[Key]>};

/**
 * Parsed JSON presentation of `export interface ...` statement.
 */
type InterfaceExport = Position & {isDeclare?: true};

/**
 * Parsed JSON presentation of `export {...} from ...` statement.
 */
type NamedReexport = Position & {names?: Names; types?: Names};

/**
 * Parsed JSON presentation of `export namespace ...` statement.
 */
type NamespaceExport = Position & {isDeclare?: true};

/**
 * Path to a module or package after the `from` keyword.
 */
type Path = string;

/**
 * Position of import, export or reexport statement in source file.
 */
type Position = {start: number; end: number};

/**
 * Parsed JSON presentation of `export type ...` statement.
 */
type TypeExport = Position & {isDeclare?: true};

/**
 * Parsed JSON presentation of `import type {...} from ...` statement.
 */
type TypeNamedImport = Position & {default?: Name; names?: Names};

/**
 * Parsed JSON presentation of `export type {...} from ...` statement.
 */
type TypeNamedReexport = Position & {names?: Names};

/**
 * Parsed JSON presentation of `import type * as ...` statement.
 */
type TypeNamespaceImport = Position & {namespace: Name};

/**
 * Parsed JSON presentation of `export type * as ... from ...` statement.
 */
type TypeNamespaceReexport = Position & {namespace: Name};

/**
 * Parsed JSON presentation of `export type * from ...` statement.
 */
type TypeStarReexport = Position;
