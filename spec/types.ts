declare module 'node:fs/promises' {
  export const readdir: (path: string) => Promise<string[]>;

  export const readFile: (path: string, options: {encoding: 'utf8'}) => Promise<string>;
}

declare module 'node:path' {
  export const join: (...paths: string[]) => string;
}
