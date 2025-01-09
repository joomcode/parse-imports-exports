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
 * Internal context in `MutableImportsExports`.
 */
export type Context = {
  lineColumnCache: Record<number, LineColumn> | undefined;
  linesIndexes: readonly number[] | undefined;
  readonly source: string;
};

/**
 * Type of `Context` key.
 */
export type ContextKey = typeof CONTEXT_KEY;

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
export type ImportsExports = DeepReadonly<MutableImportsExportsWithoutContext>;

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
 * String with position of symbol in source, like `3:12` -- line 3, column 12.
 */
export type LineColumn = Brand<string, 'LineColumn'>;

/**
 * Internal presentation of imports, exports and reexports of module.
 */
export type MutableImportsExports = MutableImportsExportsWithoutContext &
  Readonly<{[CONTEXT_KEY]: Context}>;

/**
 * Imported or exported name (identifier).
 */
export type Name = Brand<string, 'Name'>;

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
 * Path to a module or package after the `from` keyword.
 */
export type Path = Brand<string, 'Path'>;

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
 * Inner key for brand types.
 */
declare const BRAND: unique symbol;

/**
 * Creates brand (nominal) type from regular type.
 */
type Brand<Type, Key extends string> = Type & {readonly [BRAND]: Key};

/**
 * Parsed JSON presentation of `module.exports = ...` statement.
 */
type CommonJsNamespaceExport = Position;

/**
 * Symbol for generation type of `Context` key.
 */
declare const CONTEXT_KEY: unique symbol;

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
 * Mutable parsed JSON presentation of imports, exports and reexports of module.
 */
type MutableImportsExportsWithoutContext = {
  /**
   * Imports.
   */

  /**
   * `import {...} from ...`.
   */
  namedImports: Record<Path, readonly NamedImport[]> | undefined;

  /**
   * `import * as ...`.
   */
  namespaceImports: Record<Path, readonly NamespaceImport[]> | undefined;

  /**
   * `import(...)`.
   */
  dynamicImports: Record<Path, readonly DynamicImport[]> | undefined;

  /**
   * `require(...)`.
   */
  requires: Record<Path, readonly Require[]> | undefined;

  /**
   * `import type {...} from ...`.
   */
  typeNamedImports: Record<Path, readonly TypeNamedImport[]> | undefined;

  /**
   * `import type * as ...`.
   */
  typeNamespaceImports: Record<Path, readonly TypeNamespaceImport[]> | undefined;

  /**
   * `typeof import(...)`.
   */
  typeDynamicImports: Record<Path, readonly DynamicImport[]> | undefined;

  /**
   * Reexports.
   */

  /**
   * `export {...} from ...`.
   */
  namedReexports: Record<Path, readonly NamedReexport[]> | undefined;

  /**
   * `export * as ... from ...`.
   */
  namespaceReexports: Record<Path, readonly NamespaceReexport[]> | undefined;

  /**
   * `export * from ...`.
   */
  starReexports: Record<Path, readonly StarReexport[]> | undefined;

  /**
   * `export type {...} from ...`.
   */
  typeNamedReexports: Record<Path, readonly TypeNamedReexport[]> | undefined;

  /**
   * `export type * as ... from ...`.
   */
  typeNamespaceReexports: Record<Path, readonly TypeNamespaceReexport[]> | undefined;

  /**
   * `export type * from ...`.
   */
  typeStarReexports: Record<Path, readonly TypeStarReexport[]> | undefined;

  /**
   * Exports.
   */

  /**
   * `export default ...`.
   */
  defaultExport: DefaultExport | undefined;

  /**
   * `export {...}`.
   */
  namedExports: readonly NamedExport[] | undefined;

  /**
   * `export (class|const|function|var...) ...`.
   */
  declarationExports: Record<Name, DeclarationExport> | undefined;

  /**
   * `export type {...}`.
   */
  typeNamedExports: readonly TypeNamedExport[] | undefined;

  /**
   * `export type ...`.
   */
  typeExports: Record<Name, TypeExport> | undefined;

  /**
   * `export interface ...`.
   */
  interfaceExports: Record<Name, readonly InterfaceExport[]> | undefined;

  /**
   * `export namespace ...`.
   */
  namespaceExports: Record<Name, readonly NamespaceExport[]> | undefined;

  /**
   * `module.exports = ...`.
   */
  commonJsNamespaceExport: CommonJsNamespaceExport | undefined;

  /**
   * `(module.)exports.foo = ...`.
   */
  commonJsExports: Record<Name, CommonJsExport> | undefined;

  /**
   * Syntax errors of module.
   */
  errors: Record<LineColumn, string> | undefined;
};

/**
 * Parsed JSON presentation of `export {...} from ...` statement.
 */
type NamedReexport = Position & {names?: Names; types?: Names};

/**
 * Parsed JSON presentation of `export namespace ...` statement.
 */
type NamespaceExport = Position & {isDeclare?: true};

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
