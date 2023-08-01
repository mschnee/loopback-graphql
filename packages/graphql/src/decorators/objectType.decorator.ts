import {ClassDecoratorFactory} from '@loopback/metadata';
import type {GraphQLResolveInfo} from 'graphql';
import {ObjectTypeClass as key} from './keys.js';

export function objectType(options?: TypeDecoratorOptions): ClassDecorator {
  return function decorateClassAsGraphqlobjectType(target) {
    const typeName = options?.name ?? target.name;
    if (['query', 'mutation'].includes(typeName.toLowerCase())) {
      throw new Error(`Cannot name input type "${typeName}" as it conflicts with a reserved GraphQL Keyword.`);
    }
    return ClassDecoratorFactory.createDecorator<ObjectTypeDecoratorMetadata>(
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

export interface ObjectTypeDecoratorMetadata {
  /**
   * For the SDL, we need an explicit, concrete, unique type name.
   * If we encounter a duplicate, we intentionally merge objects together.
   *
   * If multiple classes of type "SomeType" implement the same FieldResolver, throw.
   */
  typeName: string;
  description?: string;
  isTypeOf?: (value: unknown, info: GraphQLResolveInfo) => boolean;
}

export interface TypeDecoratorOptions {
  /**
   * Defaults to Class.name.
   */
  name?: string;
  description?: string;
  isTypeOf?: (value: unknown, info: GraphQLResolveInfo) => boolean;
}
