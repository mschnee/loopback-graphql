import {ClassDecoratorFactory} from '@loopback/metadata';
import {InputTypeClass as key} from './keys';

export function inputType(options?: TypeDecoratorOptions): ClassDecorator {
  return function decorateClassAsGraphqlInputType(target) {
    const typeName = options?.explicitTypeName ?? target.name;
    if (['query', 'mutation'].includes(typeName.toLowerCase())) {
      throw new Error(`Cannot name input type "${typeName}" as it conflicts with a reserved GraphQL Keyword.`);
    }
    return ClassDecoratorFactory.createDecorator<TypeDecoratorSpec>(
      key,
      {
        typeName,
      },
      {
        decoratorName: '@graphql.inputType',
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
}

export interface TypeDecoratorOptions {
  /**
   * Defaults to Class.name.
   */
  explicitTypeName?: string;
}
