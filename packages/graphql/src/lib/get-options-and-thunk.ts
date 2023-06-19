import {NameOrClassOrTypeThunk, OptionsOrThunk} from '../types';

export type OptOrThunkResult<T> = [T | undefined, NameOrClassOrTypeThunk | undefined];
export function getOptionsAndThunk<T>(
  opts?: OptionsOrThunk<T>,
  maybeThunk?: NameOrClassOrTypeThunk,
): OptOrThunkResult<T> {
  if (maybeThunk && typeof maybeThunk === 'function') {
    return [opts as T, maybeThunk];
  } else {
    return [undefined, opts as NameOrClassOrTypeThunk];
  }
}
