import {NameOrTypeThunk, OptionsOrThunk} from '../types';

export type OptOrThunkResult<T> = [T | undefined, NameOrTypeThunk | undefined];
export function getOptionsAndThunk<T>(opts?: OptionsOrThunk<T>, maybeThunk?: NameOrTypeThunk): OptOrThunkResult<T> {
  if (maybeThunk && typeof maybeThunk === 'function') {
    return [opts as T, maybeThunk];
  } else {
    return [undefined, opts as NameOrTypeThunk];
  }
}
