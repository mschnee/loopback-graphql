import {Constructor} from '@loopback/context';
export type NameOrType = string | Constructor<{}>;
export type NameOrTypeThunk = () => NameOrType | [NameOrType];
export type NameOrTypeThunkOrOptions<T> = NameOrTypeThunk | T;
