import {unionType} from '../decorators/unionType.decorator.js';

/**
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
export function Union<T extends Function[]>(name: string, ...types: T): T[number] {
  @unionType(name, ...types)
  class _unionOf {
    constructor() {
      throw new Error(`Union Type Objects are not constructable: ${name} = ${types.map(t => t.name).join('|')}`);
    }
  }

  return _unionOf;
}
