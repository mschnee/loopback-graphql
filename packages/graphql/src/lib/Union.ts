import {UnionTypeOptions, UnionTypeOptionsWithName, unionType} from '../decorators/unionType.decorator.js';

/**
 * Convenience function for creating a Union Type.
 * Usage:
 * ```ts
 * @objectType()
 * class T1 {
 *   @field(() => GraphQLInt)
 *   intField: number
 * }
 *
 * @objectType()
 * class T2 {
 *   @field(() => GraphQLID)
 *   idField: string;
 * }
 *
 * export const Union('MyUnionOf', T1, T2)
 * ```
 * @param name
 * @param types
 * @returns
 */
/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/unified-signatures */
export function Union<T extends Function[]>(opts: UnionTypeOptionsWithName, ...types: T): T[number];
export function Union<T extends Function[]>(name: string, ...types: T): T[number];
export function Union<T extends Function[]>(nameOrOpts: string | UnionTypeOptionsWithName, ...types: T): T[number] {
  let name: string;
  let opts: UnionTypeOptionsWithName | undefined;
  if (typeof nameOrOpts === 'string') {
    name = nameOrOpts;
  } else {
    name = nameOrOpts.name;
    opts = nameOrOpts;
  }

  const decorator = isOpts(opts) ? unionType(name, opts, ...types) : unionType(name, ...types);

  @decorator
  class _unionOf {
    constructor() {
      throw new Error(
        `Union Type created with 'Union()' are not constructable: ${name} = ${types.map(t => t.name).join('|')}`,
      );
    }
  }

  return _unionOf;
}
/* eslint-enable @typescript-eslint/naming-convention, @typescript-eslint/unified-signatures */

function isOpts(o?: unknown): o is UnionTypeOptions {
  return typeof o === 'object';
}
