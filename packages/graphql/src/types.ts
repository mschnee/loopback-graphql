import {Constructor} from '@loopback/context';
import {GraphQLInputType, GraphQLObjectType, GraphQLScalarType} from 'graphql';
export type NameOrClassOrType = string | Constructor<{}> | GraphQLScalarType;
export type NameOrClassOrTypeThunk = () => NameOrClassOrType;
export type NameOrClassOrTypeThunkOrOptions<T> = NameOrClassOrTypeThunk | T;

export type OptionsOrThunk<T> = T | NameOrClassOrTypeThunk;

// from the graphql-js internal types
export declare type Maybe<T> = null | undefined | T;
export interface ObjMap<T> {
  [key: string]: T;
}
export declare type ObjMapLike<T> =
  | ObjMap<T>
  | {
      [key: string]: T;
    };
export interface ReadOnlyObjMap<T> {
  readonly [key: string]: T;
}
export declare type ReadOnlyObjMapLike<T> =
  | ReadOnlyObjMap<T>
  | {
      readonly [key: string]: T;
    };

export declare type NamedInputMap = ObjMapLike<GraphQLInputType>;
export declare type NamedTypeMap = ObjMapLike<GraphQLObjectType>;

/**
 * A type object can be spread across multiple classes.  In the final SDL,
 * each type is unique-by-name.  This cache ensures that we don't duplicate anything.
 */
export declare type TypeCache = {
  input: NamedInputMap;
  object: NamedTypeMap;
};
