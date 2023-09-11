export type {CommentPair, OnCommentError, OnGlobalError, OnParse} from 'parse-statements';

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
type TypeNamedImport = Position & {default?: string; names?: Names};

/**
 * Parsed JSON presentation of `export type {...} from ...` statement.
 */
type TypeNamedReexport = Position & {names?: Names};

/**
 * Parsed JSON presentation of `import type * as ...` statement.
 */
type TypeNamespaceImport = Position & {namespace: string};

/**
 * Parsed JSON presentation of `export type * as ... from ...` statement.
 */
type TypeNamespaceReexport = Position & {namespace: string};

/**
 * Parsed JSON presentation of `export type * from ...` statement.
 */
type TypeStarReexport = Position;

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
  | 'declare enum'
  | 'declare function'
  | 'declare let'
  | 'declare var'
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
   * `export (class|const|function|var...) ...`.
   */
  declarationExports?: Record<string, DeclarationExport>;
  /**
   * `export default ...`.
   */
  defaultExport?: DefaultExport;
  errors?: Record<number, string>;
  /**
   * `export interface ...`.
   */
  interfaceExports?: Record<string, readonly InterfaceExport[]>;
  /**
   * `export {...}`.
   */
  namedExports?: readonly NamedExport[];
  /**
   * `import {...} from ...`.
   */
  namedImports?: Record<string, readonly NamedImport[]>;
  /**
   * `export {...} from ...`.
   */
  namedReexports?: Record<string, readonly NamedReexport[]>;
  /**
   * `export namespace ...`.
   */
  namespaceExports?: Record<string, readonly NamespaceExport[]>;
  /**
   * `import * as ...`.
   */
  namespaceImports?: Record<string, readonly NamespaceImport[]>;
  /**
   * `export * as ... from ...`.
   */
  namespaceReexports?: Record<string, readonly NamespaceReexport[]>;
  /**
   * `export * from ...`.
   */
  starReexports?: Record<string, readonly StarReexport[]>;
  /**
   * `export type ...`.
   */
  typeExports?: Record<string, TypeExport>;
  /**
   * `export type {...}`.
   */
  typeNamedExports?: readonly TypeNamedExport[];
  /**
   * `import type {...} from ...`.
   */
  typeNamedImports?: Record<string, readonly TypeNamedImport[]>;
  /**
   * `export type {...} from ...`.
   */
  typeNamedReexports?: Record<string, readonly TypeNamedReexport[]>;
  /**
   * `import type * as ...`.
   */
  typeNamespaceImports?: Record<string, readonly TypeNamespaceImport[]>;
  /**
   * `export type * as ... from ...`.
   */
  typeNamespaceReexports?: Record<string, readonly TypeNamespaceReexport[]>;
  /**
   * `export type * from ...`.
   */
  typeStarReexports?: Record<string, readonly TypeStarReexport[]>;
};

/**
 * Parsed JSON presentation of `export {...}` statement.
 */
export type NamedExport = Position & {names?: Names; types?: Names};

/**
 * Parsed JSON presentation of `import {...} from ...` statement.
 */
export type NamedImport = Position & {default?: string; names?: Names; types?: Names};

/**
 * Parsed JSON presentation of names in `import`/`export` statements.
 */
export type Names = Record<string, {by?: string}>;

/**
 * Parsed JSON presentation of `import * as ...` statement.
 */
export type NamespaceImport = Position & {default?: string; namespace: string};

/**
 * Parsed JSON presentation of `export * as ... from ...` statement.
 */
export type NamespaceReexport = Position & {namespace: string};

/**
 * Parsed JSON presentation of `export * from ...` statement.
 */
export type StarReexport = Position;

/**
 * Parsed JSON presentation of `export type {...}` statement.
 */
export type TypeNamedExport = Position & {names?: Names};
