import {ClassDecoratorFactory} from '@loopback/metadata';
import type {GraphQLResolveInfo} from 'graphql';
import {InterfaceTypeClass} from './keys.js';

export function interfaceType(options?: InterfaceTypeDecoratorOptions): ClassDecorator {
  return function decorateClassAsGraphqlInterfaceType(target) {
    const typeName = options?.name ?? target.name;
    if (['query', 'mutation'].includes(typeName.toLowerCase())) {
      throw new Error(
        `Cannot name type "${typeName}" (class: ${target.name}) as it conflicts with a reserved GraphQL root type.`,
      );
    }
    return ClassDecoratorFactory.createDecorator<InterfaceTypeDecoratorMetadata>(
      InterfaceTypeClass,
      {
        typeName,
        description: options?.description,
        isTypeOf: options?.isTypeOf,
      },
      {
        decoratorName: '@graphql.interfaceType',
      },
    )(target);
  };
}

export interface InterfaceTypeDecoratorMetadata {
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

export interface InterfaceTypeDecoratorOptions {
  /**
   * Defaults to Class.name.
   */
  name?: string;
  description?: string;
  isTypeOf?: (value: any, info: GraphQLResolveInfo) => boolean;
}
