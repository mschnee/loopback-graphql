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
import {Reflector} from '@loopback/metadata';
import {type GraphQLEnumTypeConfig, type GraphQLEnumValueConfig, type GraphQLEnumValueConfigMap} from 'graphql';
import {DecoratorKeys} from '../keys.js';

type EnumConfig<K extends string, V = any> = Omit<GraphQLEnumValueConfig, 'value'> & {name: K; value?: V};
type EnumValue<K extends string, V = any> = EnumConfig<K, V> | K;
type EnumResult<T extends EnumValue<string, any>[]> = {
  [K in T[number] as K extends EnumConfig<infer Name, infer Value> ? Name : K]: K extends EnumConfig<any, infer Value>
    ? Value
    : K;
};

type NameOrTypeConfig = string | GraphQLEnumTypeConfig;

export function Enum<K extends string, T extends EnumValue<K, any>[]>(
  nameOrConfig: NameOrTypeConfig,
  ...inputArray: T
): EnumResult<T> {
  const result: any = {};

  const attrs: GraphQLEnumValueConfigMap = {};
  for (const item of inputArray) {
    if (typeof item === 'string') {
      result[item] = item;
      attrs[item] = {
        value: item,
      };
    } else {
      const {name, ...rest} = item;
      result[name] = rest.value !== undefined ? rest.value : name;
      attrs[item.name] = rest;
    }
  }

  const [name, config] = getNameAndConfig(nameOrConfig);
  const spec: GraphQLEnumTypeConfig = {
    name,
    ...config,
    values: attrs,
  };
  Reflector.defineMetadata(DecoratorKeys.EnumObjectClass, spec, result);
  Object.freeze(result);
  return result as EnumResult<T>;
}

function getNameAndConfig(nameOrConfig: NameOrTypeConfig): [string, GraphQLEnumTypeConfig | undefined] {
  if (isName(nameOrConfig)) {
    return [nameOrConfig, undefined];
  } else if (isConfig(nameOrConfig)) {
    return [nameOrConfig.name, nameOrConfig];
  } else {
    throw new Error('invalid name or config');
  }
}
function isName(nameOrConfig: NameOrTypeConfig): nameOrConfig is string {
  return typeof nameOrConfig === 'string';
}

function isConfig(nameOrConfig: NameOrTypeConfig): nameOrConfig is GraphQLEnumTypeConfig {
  return typeof nameOrConfig !== 'string';
}
