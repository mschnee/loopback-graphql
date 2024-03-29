import {ClassDecoratorFactory} from '@loopback/metadata';
import {InputTypeClass as key} from './keys.js';

export function inputType(options?: InputTypeDecoratorOptions): ClassDecorator {
  return function decorateClassAsGraphqlInputType(target) {
    const typeName = options?.explicitTypeName ?? target.name;
    if (['query', 'mutation'].includes(typeName.toLowerCase())) {
      throw new Error(`Cannot name input type "${typeName}" as it conflicts with a reserved root GraphQL Keyword.`);
    }
    return ClassDecoratorFactory.createDecorator<InputTypeDecoratorMetadata>(
      key,
      {
        typeName,
        description: options?.description,
      },
      {
        decoratorName: '@graphql.inputType',
      },
    )(target);
  };
}

export interface InputTypeDecoratorMetadata {
  /**
   * For the SDL, we need an explicit, concrete, unique type name.
   * If we encounter a duplicate, we intentionally merge objects together.
   *
   * If multiple classes of type "SomeType" implement the same FieldResolver, throw.
   */
  typeName: string;
  description?: string;
}

export interface InputTypeDecoratorOptions {
  /**
   * Defaults to Class.name.
   */
  explicitTypeName?: string;
  description?: string;
}
