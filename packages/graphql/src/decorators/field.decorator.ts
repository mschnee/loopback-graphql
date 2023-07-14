import {ClassDecoratorFactory, MethodDecoratorFactory, PropertyDecoratorFactory} from '@loopback/metadata';
import debug from 'debug';
import {getOptionsAndThunk} from '../lib/get-options-and-thunk.js';
import type {Maybe, NameOrClassOrTypeThunk, OptionsOrThunk} from '../types.js';
import {FieldResolverClass, FieldResolverMethod, TypeFieldProperty} from './keys.js';
const debugLog = debug('loopback:graphql:metadata:type:field');

/**
 * This convenience decorator has two uses:
 * - on an ObjectType, InputType, or InterfaceType to describe a field on a GraphQL Type.
 * - on a class or class method to provide the `resolve()` implementation of a GraphQL type field:
 *   - on a class that implements a resolve() method
 *   - on a method for a class decorated with `@resolver()`
 *
 * @param typeThunk
 * @returns
 */
export function field(
  nameOrTypeThunk: NameOrClassOrTypeThunk,
  optionsOrThunk?: OptionsOrThunk<
    TypeFieldDecoratorOptions | FieldResolverMethodDecoratorOptions | FieldResolverClassDecoratorOptions
  >,
) {
  const [options, nameThunk] = getOptionsAndThunk<TypeFieldDecoratorOptions>(nameOrTypeThunk, optionsOrThunk);
  return function graphQlFieldWrapper(
    target: any,
    property?: string,
    propertyDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (property && propertyDescriptor) {
      /**
       * This is a method descriptor, for a resolver class object.  We'll decorate it now, but
       * later we need to determine if the `target` is decorated with `@resolver()`
       */
      return MethodDecoratorFactory.createDecorator<FieldResolverMethodDecoratorMetadata>(
        FieldResolverMethod,
        {
          fieldName: options?.name ?? property?.toString(),
        },
        {decoratorName: '@graphql.field'},
      )(target, property, propertyDescriptor);
    } else if (typeof target === 'function' && !property && !propertyDescriptor) {
      /**
       * This is a class being decorated with `@field()`, which means the class needs to provide a `resolve()` method, which
       * will be determined later.  Here we just add the metadata.
       */
      if (!options?.name) {
        throw new Error('Decorating a class with `@field(Type, {name})` requires a field name.');
      }
      if (!Object.hasOwn(target.prototype, 'resolve')) {
        throw new Error('Decorating a class with `@field(Type, {name})` requires a `resolve()` method on the class.');
      }
      return ClassDecoratorFactory.createDecorator<FieldResolverClassDecoratorMetadata>(
        FieldResolverClass,
        {
          nameOrTypeThunk: nameThunk,
          fieldName: options.name,
        },
        {
          decoratorName: '@graphql.field',
        },
      )(target);
    } else if (target && property) {
      return PropertyDecoratorFactory.createDecorator<TypeFieldDecoratorMetadata>(
        TypeFieldProperty,
        {
          nameOrTypeThunk: nameThunk,
          fieldName: options?.name ?? property?.toString(),
          nullable: options?.nullable ?? false,
          description: options?.description,
          defaultValue: options?.defaultValue,
          deprecated: options?.deprecated ?? false,
          deprecationReason: options?.deprecationReason,
        },
        {
          decoratorName: '@graphql.field',
        },
      )(target, property);
    }
  };
}

export interface TypeFieldDecoratorMetadata {
  nameOrTypeThunk: NameOrClassOrTypeThunk;
  fieldName: string;
  nullable: boolean;
  description?: Maybe<string>;
  defaultValue?: unknown;
  deprecated: boolean;
  deprecationReason?: Maybe<string>;
}

export interface TypeFieldDecoratorOptions {
  name?: string; // optional fieldName
  nullable?: boolean;
  description?: string;
  defaultValue?: unknown;
  deprecated?: boolean;
  deprecationReason?: Maybe<string>;
}

export interface FieldResolverMethodDecoratorMetadata {
  fieldName: string;
}

export interface FieldResolverMethodDecoratorOptions {
  name?: string;
}

export interface FieldResolverClassDecoratorMetadata {
  nameOrTypeThunk: NameOrClassOrTypeThunk;
  fieldName: string;
}
export interface FieldResolverClassDecoratorOptions {
  name: string;
}
