import type {Constructor} from '@loopback/context';
import type {GraphQLEnumType, GraphQLInputType, GraphQLObjectType, GraphQLScalarType, GraphQLUnionType} from 'graphql';

export type NameOrClassOrType = string | Constructor<{}> | GraphQLScalarType;
export type NameOrClassOrTypeThunk = string | (() => NameOrClassOrType);
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
export declare type NamedUnionMap = ObjMapLike<GraphQLUnionType>;
export declare type NamedEnumMap = ObjMapLike<GraphQLEnumType>;

/**
 * Resolvers
 * In graphQL:
 * - named types have field definitions, and those fields can have `{resolve: () => {}, ...field}}`
 * which defines a `resolver`, e.g. a function that will be called to resolve the field.
 *
 * For the purpose of `@loopback/graphql`, we have a number of options for defining field resolvers:
 * - A class decorated with `@resolver(() => string | Class) // this is the string name of the type` with methods decorated with `@resolverField(string) // this is the field name`
 * -- A field resolver definition for a named type that does not describe that field will throw an exception (will not auto-magic the type for you, enforcing good DTO design)
 * - A function decorated with `@fieldResolver(string | Class, string) // this is the field name`
 * - A class decorated with `@fieldResolver(string | Class, string)` that implements FieldResolver, providing the method `resolve(): T | PromiseLike<T>`
 * - note two different decorators, @resolverField and @fieldResolver
 */
type TypeName = string;
type FieldName = string;
export declare type NamedFieldResolverMap = Map<TypeName, Map<FieldName, Function>>;

/**
 * A type object can be spread across multiple classes.  In the final SDL,
 * each type is unique-by-name.  This cache ensures that we don't duplicate anything.
 */
export declare type TypeCache = {
  input: NamedInputMap;
  object: NamedTypeMap;
};
