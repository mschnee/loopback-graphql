import {ClassDecoratorFactory, MetadataInspector} from '@loopback/metadata';
import {GraphQLTypeResolver} from 'graphql';
import {Maybe} from '../types.js';
import {ObjectTypeClass, UnionTypeClass} from './keys.js';
import {ObjectTypeDecoratorMetadata} from './objectType.decorator.js';

export function unionType<T extends Function>(name: string, ...types: T[]): ClassDecorator;
export function unionType<T extends Function>(name: string, options: UnionTypeOptions, ...types: T[]): ClassDecorator;
export function unionType<T extends Function>(name: string, options: UnionTypeOptions | T, ...types: T[]) {
  if (isOption(options)) {
    return ClassDecoratorFactory.createDecorator<UnionTypeDecoratorMetadata<T[]>>(
      UnionTypeClass,
      {name, types, ...options},
      {decoratorName: '@graphql.unionType'},
    );
  } else if (isObjectType(options)) {
    return ClassDecoratorFactory.createDecorator<UnionTypeDecoratorMetadata<T[]>>(
      UnionTypeClass,
      {name, types: [options, ...types]},
      {decoratorName: '@graphql.unionType'},
    );
  } else {
    throw new Error(
      'Second parameter `options` is neither a UnionTypeOptions nor a class decorated with `@objectType()`',
    );
  }
}

export interface UnionTypeDecoratorMetadata<T extends Function[]> {
  name: string;
  types: T;
  resolveType?: Maybe<GraphQLTypeResolver<T, unknown>>;
  description?: string;
}

export interface UnionTypeOptions {
  resolveType?: Maybe<GraphQLTypeResolver<unknown, unknown>>;
  description?: string;
}

export interface UnionTypeOptionsWithName extends UnionTypeOptions {
  name: string;
}

function isOption<T extends Function>(o: T | UnionTypeOptions): o is UnionTypeOptions {
  return (typeof o === 'object' && 'resolveType' in o) || 'description' in o;
}

function isObjectType<T extends Function>(decoratedClass: T | UnionTypeOptions): decoratedClass is T {
  const spec = MetadataInspector.getClassMetadata<ObjectTypeDecoratorMetadata>(
    ObjectTypeClass,
    decoratedClass as Function,
  );
  return !!spec;
}
