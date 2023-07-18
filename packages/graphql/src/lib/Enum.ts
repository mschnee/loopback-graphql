/**
 * ref: https://graphql.org/graphql-js/type/#graphqlenumtype
 * The SDL represents enums as a simplified string scalar:
 * ```
 * enum RGB {
 *   RED
 *   GREEN
 *   BLUE
 * }
 * ```
 *
 * and the API itself uses these as serialized values.
 *
 * The simplest way is to use this Enum helper function:
 * export Enum('RED', 'GREEN', 'BLUE')
 *
 * or
 *
 * enum Rgb {
 *  RED = 'RED',
 *  GREEN = 'GREEN',
 *  BLUE = 'BLUE',
 * }
 * export Enum(Rgb.RED, Rgb.GREEN, Rgb.BLUE)
 */
import {GraphQLEnumValueConfig} from 'graphql';

type EnumValue<T extends string> = (GraphQLEnumValueConfig & {name: T}) | T;

export function Enum<T extends string>(...vals: EnumValue<T>[]): T {
  const v = vals[0];

  if (typeof v === 'string') {
    return v;
  } else if (isEnumDef(v)) {
    return v.name;
  } else {
    throw new Error('bad definitions');
  }
}

function isEnumDef(v: any): v is EnumValue<string> {
  return typeof v === 'object' && 'name' in v && typeof v.name === 'string';
}
