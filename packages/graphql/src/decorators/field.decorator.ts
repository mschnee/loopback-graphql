import {ClassDecoratorFactory, MethodDecoratorFactory, PropertyDecoratorFactory} from '@loopback/metadata';
import debug from 'debug';
import {getOptionsAndThunk} from '../lib/get-options-and-thunk.js';
import type {Maybe, NameOrClassOrTypeThunk, OptionsOrThunk} from '../types.js';
import {FieldResolverClass, FieldResolverMethod, TypeFieldProperty} from './keys.js';
const debugLog = debug('loopback:graphql:metadata:type:field');

/**
 * Class Decorator, for a field resolver class providing a `resolve()` method
 * @param nameOrTypeThunk
 * @param optionsOrThunk
 */
export function field(
  nameOrTypeThunk: NameOrClassOrTypeThunk,
  optionsOrThunk?: OptionsOrThunk<FieldResolverClassDecoratorOptions>,
): ClassDecorator;

/**
 * Method Decorator for a class decorated with `@resolver((of)=> Type)`
 * @param nameOrTypeThunk
 * @param optionsOrThunk
 */
export function field(
  nameOrTypeThunk: NameOrClassOrTypeThunk,
  optionsOrThunk?: OptionsOrThunk<FieldResolverMethodDecoratorOptions>,
): MethodDecorator;

/**
 * Property decorator for classes decorated with `@inputType`, `@objectType`, or `@interfaceType`
 * @param nameOrTypeThunk
 * @param optionsOrThunk
 */
export function field(name: string, optionsOrThunk?: OptionsOrThunk<TypeFieldDecoratorOptions>): PropertyDecorator;
export function field(optionsOrThunk: TypeFieldDecoratorOptions): PropertyDecorator;

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
  nameOrTypeThunk: TypeFieldDecoratorOptions | NameOrClassOrTypeThunk,
  optionsOrThunk?:
    | TypeFieldDecoratorOptions
    | OptionsOrThunk<FieldResolverMethodDecoratorOptions | FieldResolverClassDecoratorOptions>,
): ClassDecorator | MethodDecorator | PropertyDecorator {
  return function graphQlFieldWrapper(
    target: any,
    property?: string | symbol,
    propertyDescriptor?: TypedPropertyDescriptor<any>,
  ) {
    if (property && propertyDescriptor) {
      const [options, nameThunk] = getOptionsAndThunk<FieldResolverMethodDecoratorOptions>(
        nameOrTypeThunk as NameOrClassOrTypeThunk,
        optionsOrThunk as OptionsOrThunk<FieldResolverMethodDecoratorOptions>,
      );
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
      const [options, nameThunk] = getOptionsAndThunk<FieldResolverClassDecoratorOptions>(
        nameOrTypeThunk as NameOrClassOrTypeThunk,
        optionsOrThunk as OptionsOrThunk<FieldResolverClassDecoratorOptions>,
      );
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
      const [maybeName, maybeOpts] = nameOrOptions<TypeFieldDecoratorOptions>(
        nameOrTypeThunk as string | TypeFieldDecoratorOptions,
        optionsOrThunk as TypeFieldDecoratorOptions | undefined,
      );
      return PropertyDecoratorFactory.createDecorator<TypeFieldDecoratorMetadata>(
        TypeFieldProperty,
        {
          typeThunk: maybeOpts.type,
          fieldName: maybeName ?? property?.toString(),
          nullable: maybeOpts.nullable ?? false,
          description: maybeOpts.description,
          defaultValue: maybeOpts.defaultValue,
          deprecated: maybeOpts.deprecated ?? false,
          deprecationReason: maybeOpts.deprecationReason,
        },
        {
          decoratorName: '@graphql.field',
        },
      )(target, property);
    }
  };
}

function nameOrOptions<T>(nameOrOpts: string | T, maybeOpts?: T): [string | undefined, T] {
  if ('string' === typeof nameOrOpts) {
    return [nameOrOpts, maybeOpts!];
  } else {
    return [undefined, nameOrOpts];
  }
}
export interface TypeFieldDecoratorMetadata {
  typeThunk: NameOrClassOrTypeThunk;
  fieldName: string;
  nullable: boolean;
  description?: Maybe<string>;
  defaultValue?: unknown;
  deprecated: boolean;
  deprecationReason?: Maybe<string>;
}

export interface TypeFieldDecoratorOptions {
  type: NameOrClassOrTypeThunk;
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
