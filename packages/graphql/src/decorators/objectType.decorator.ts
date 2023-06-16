import {ClassDecoratorFactory} from '@loopback/metadata';
import {GraphQLResolveInfo} from 'graphql';
import {ObjectTypeClass as key} from './keys';

export function objectType(options?: TypeDecoratorOptions): ClassDecorator {
  return function decorateClassAsGraphqlobjectType(target) {
    const typeName = options?.explicitTypeName ?? target.name;
    if (['query', 'mutation'].includes(typeName.toLowerCase())) {
      throw new Error(`Cannot name input type "${typeName}" as it conflicts with a reserved GraphQL Keyword.`);
    }
    return ClassDecoratorFactory.createDecorator<TypeDecoratorSpec>(
      key,
      {
        typeName,
        description: options?.description,
        isTypeOf: options?.isTypeOf,
      },
      {
        decoratorName: '@graphql.objectType',
      },
    )(target);
  };
}

export interface TypeDecoratorSpec {
  /**
   * For the SDL, we need an explicit, concrete, unique type name.
   * If we encounter a duplicate, we intentionally merge objects together.
   *
   * If multiple classes of type "SomeType" implement the same FieldResolver, throw.
   */
  typeName: string;
  description?: string;
  isTypeOf?: (value: any, info: GraphQLResolveInfo) => boolean;
}

export interface TypeDecoratorOptions {
  /**
   * Defaults to Class.name.
   */
  explicitTypeName?: string;
  description?: string;
  isTypeOf?: (value: any, info: GraphQLResolveInfo) => boolean;
}
