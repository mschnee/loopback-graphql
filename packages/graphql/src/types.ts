import {Constructor} from '@loopback/context';
import {GraphQLScalarType} from 'graphql';
export type NameOrType = string | Constructor<{}> | GraphQLScalarType;
export type NameOrTypeThunk = () => NameOrType | [NameOrType];
export type NameOrTypeThunkOrOptions<T> = NameOrTypeThunk | T;

export type OptionsOrThunk<T> = T | NameOrTypeThunk;
