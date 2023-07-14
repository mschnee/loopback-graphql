import {ClassDecoratorFactory, MetadataInspector} from '@loopback/metadata';
import {GraphQLObjectType, GraphQLResolveInfo} from 'graphql';
import {ObjectTypeClass, UnionTypeClass} from './keys.js';

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
  resolveType?: (value: any, info?: GraphQLResolveInfo) => GraphQLObjectType | null | undefined;
  description?: string;
}

export interface UnionTypeOptions {
  resolveType?: (value: any, info?: GraphQLResolveInfo) => GraphQLObjectType | null | undefined;
  description?: string;
}

function isOption<T extends Function>(o: T | UnionTypeOptions): o is UnionTypeOptions {
  return (typeof o === 'object' && 'resolveType' in o) || 'description' in o;
}

function isObjectType<T extends Function>(o: T | UnionTypeOptions): o is T {
  const spec = typeof o === 'object' && MetadataInspector.getClassMetadata(ObjectTypeClass, o as any);
  return !!spec;
}
